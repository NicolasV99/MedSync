import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { hashPassword, verifyPassword } from "@/lib/auth";
import { saveGoogleCalendarTokens } from "@/lib/google-calendar";
import { getPool } from "@/lib/db";

const authSecret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV !== "production"
    ? "dev-only-auth-secret-change-me"
    : undefined);

if (!authSecret && process.env.NODE_ENV === "production") {
  throw new Error(
    "Missing AUTH_SECRET (or NEXTAUTH_SECRET) in production environment.",
  );
}

const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.client_id;
const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET || process.env.client_secret;
const baseGoogleScope = "openid email profile";
const calendarGoogleScope = "https://www.googleapis.com/auth/calendar.events";
const includeCalendarScopeOnLogin =
  process.env.GOOGLE_INCLUDE_CALENDAR_SCOPE_ON_LOGIN === "true";
const googleAuthScope = includeCalendarScopeOnLogin
  ? `${baseGoogleScope} ${calendarGoogleScope}`
  : baseGoogleScope;

type UserAuthRow = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  password_hash: string;
};

// Split a full name into the first and last name fields required by the current DB schema.
function splitFullName(fullName: string) {
  const trimmed = fullName.trim();
  const [firstName, ...rest] = trimmed.split(/\s+/);
  const lastName = rest.join(" ");

  return {
    firstName: firstName || "Google",
    lastName: lastName || "User",
  };
}

// Load a user by email so we can authenticate credentials logins and link Google accounts.
async function getUserByEmail(email: string) {
  const result = await getPool().query<UserAuthRow>(
    `SELECT id, first_name, last_name, email, role, password_hash
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email],
  );

  return result.rows[0] ?? null;
}

// Create a local user record when someone signs in with Google for the first time.
async function ensureGoogleUser(email: string, name?: string | null) {
  const existing = await getUserByEmail(email);

  if (existing) {
    return existing;
  }

  // Google users still need a value for password_hash due to current DB schema.
  const passwordHash = await hashPassword(`${email}-${Date.now()}`);
  const { firstName, lastName } = splitFullName(name || "Google User");

  const created = await getPool().query<UserAuthRow>(
    `INSERT INTO users (first_name, last_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, first_name, last_name, email, role, password_hash`,
    [firstName, lastName, email, passwordHash, "staff"],
  );

  return created.rows[0];
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    // Google provider is configured for calendar permissions and offline access.
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: googleAuthScope,
        },
      },
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password || "");

        if (!email || !password) {
          return null;
        }

        const user = await getUserByEmail(email);

        if (!user) {
          return null;
        }

        const isValid = await verifyPassword(password, user.password_hash);

        if (!isValid) {
          return null;
        }

        return {
          id: String(user.id),
          name: `${user.first_name} ${user.last_name}`.trim(),
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    // After Google login, ensure the local user exists and persist the OAuth tokens.
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const dbUser = await ensureGoogleUser(user.email, user.name);

        if (account.access_token) {
          await saveGoogleCalendarTokens({
            userId: dbUser.id,
            googleEmail: user.email,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            tokenType: account.token_type,
            scope: account.scope,
            expiresAt: account.expires_at,
          });
        }
      }

      return true;
    },
    // Copy the DB-backed role and user ID into the JWT so the session can read them later.
    async jwt({ token, user }) {
      if (token.email) {
        const dbUser = await getUserByEmail(token.email);

        if (dbUser) {
          token.role = dbUser.role;
          token.userId = String(dbUser.id);
          token.name = `${dbUser.first_name} ${dbUser.last_name}`.trim();
        }
      }

      if (user) {
        token.role = user.role ?? token.role;
        token.userId = user.id ?? token.userId;
      }

      return token;
    },
    // Expose the internal user id and role on the client session object.
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.userId || "");
        session.user.role = String(token.role || "staff");
      }

      return session;
    },
  },
});

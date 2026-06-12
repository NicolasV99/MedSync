import crypto from "node:crypto";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function getResetSecret() {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV !== "production"
      ? "dev-only-auth-secret-change-me"
      : undefined);

  if (!secret) {
    throw new Error("Missing AUTH_SECRET or NEXTAUTH_SECRET.");
  }

  return secret;
}

function base64UrlEncode(input: string) {
  return Buffer.from(input, "utf8").toString("base64url");
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

export function createResetToken(email: string) {
  const payload = {
    email,
    exp: Date.now() + RESET_TOKEN_TTL_MS,
  };

  const payloadPart = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", getResetSecret())
    .update(payloadPart)
    .digest("base64url");

  return `${payloadPart}.${signature}`;
}

export function verifyResetToken(token: string) {
  const [payloadPart, signature] = token.split(".");

  if (!payloadPart || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", getResetSecret())
    .update(payloadPart)
    .digest("base64url");

  if (
    signature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    )
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(payloadPart)) as {
      email?: string;
      exp?: number;
    };

    if (!payload.email || !payload.exp || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

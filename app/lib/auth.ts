import bcrypt from "bcryptjs";

// 12 rounds is a common security/performance balance for bcrypt hashing.
const SALT_ROUNDS = 12;
// Server-side password rule: 8+ chars, uppercase, number, special char.
const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function isStrongPassword(password: string) {
  return PASSWORD_PATTERN.test(password);
}

export async function hashPassword(password: string) {
  // Hash plain-text password before storing it in the database.
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string) {
  // Compare plain-text input with stored bcrypt hash at login time.
  return bcrypt.compare(password, hash);
}

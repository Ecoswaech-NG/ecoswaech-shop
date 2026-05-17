// PLACE AT: lib/tokens.ts
import crypto from "crypto";

/** Generates a cryptographically secure URL-safe token */
export function generateToken(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString("hex");
}

export const EMAIL_VERIFY_EXPIRY_MS  = 24 * 60 * 60 * 1000; // 24 hours
export const PASSWORD_RESET_EXPIRY_MS =      60 * 60 * 1000; //  1 hour
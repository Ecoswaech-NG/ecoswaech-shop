import { SignJWT, jwtVerify, JWTPayload } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);

const EXPIRES_IN = "7d";

export interface JwtPayload extends JWTPayload {
  userId: string;
  email: string;
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("ecoswaech")
    .setAudience("ecoswaech-users")
    .setExpirationTime(EXPIRES_IN)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      issuer: "ecoswaech",
      audience: "ecoswaech-users",
    });

    if (!payload.userId || !payload.email) return null;

    return payload as JwtPayload;
  } catch {
    return null;
  }
}

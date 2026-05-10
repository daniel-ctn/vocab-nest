import { SignJWT, jwtVerify } from "jose";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not configured.");
  }
  return new TextEncoder().encode(secret);
};

export const signJwt = (payload: { sub: string; email: string }) =>
  new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

export const verifyJwt = (token: string) =>
  jwtVerify(token, getSecret());

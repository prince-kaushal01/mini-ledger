import jwt from "jsonwebtoken";
import { env } from "../env.js";

interface TokenPayload {
  userId: string;
}

export function createToken(userId: string): string {
  return jwt.sign({ userId } satisfies TokenPayload, env.JWT_SECRET, { expiresIn: "7d" });
}

export function readToken(token: string): TokenPayload {
  const payload = jwt.verify(token, env.JWT_SECRET);

  if (typeof payload === "string" || typeof payload.userId !== "string") {
    throw new Error("Invalid token payload");
  }

  return { userId: payload.userId };
}

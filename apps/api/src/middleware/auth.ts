import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../types/auth.js";
import { readToken } from "../utils/jwt.js";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.header("authorization");

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication is required" } });
    return;
  }

  try {
    const { userId } = readToken(header.slice(7));
    (req as AuthenticatedRequest).userId = userId;
    next();
  } catch {
    res.status(401).json({ error: { code: "INVALID_TOKEN", message: "Your session is invalid or expired" } });
  }
}

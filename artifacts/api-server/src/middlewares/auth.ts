import type { Request, Response, NextFunction } from "express";
import { admin } from "../lib/firebase-admin";

export interface AuthRequest extends Request {
  uid?: string;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.uid = decoded.uid;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export async function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      req.uid = decoded.uid;
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
}

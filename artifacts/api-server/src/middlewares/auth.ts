import type { Request, Response, NextFunction } from "express";
import { verifyIdToken } from "../lib/firebase-admin";

export interface AuthenticatedRequest extends Request {
  uid?: string;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = auth.slice(7);
  const decoded = await verifyIdToken(token);

  if (!decoded) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  req.uid = decoded.uid;
  next();
}

export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice(7);
    const decoded = await verifyIdToken(token);
    if (decoded) req.uid = decoded.uid;
  }
  next();
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;

  if (!adminUser || !adminPass) {
    res.status(503).json({ error: "Admin credentials not configured on server" });
    return;
  }

  const username = req.headers["x-admin-username"] as string | undefined;
  const password = req.headers["x-admin-password"] as string | undefined;

  if (username !== adminUser || password !== adminPass) {
    res.status(401).json({ error: "Admin unauthorized" });
    return;
  }

  next();
}

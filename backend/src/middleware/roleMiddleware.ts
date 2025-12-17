
import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied: Admins only" });
  }
  next();
}

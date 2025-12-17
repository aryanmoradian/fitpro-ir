
import { Response, NextFunction } from "express";
import { pool } from "../db";
import { AuthRequest } from "./authMiddleware";

export async function setRLSContext(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  // Ensure user is authenticated before setting RLS context
  if (!req.user) {
      return res.status(401).json({ error: "User context required for RLS" });
  }

  const { userId, role } = req.user;
  
  try {
    // Checkout a dedicated client for this request to ensure session variables stick
    const client = await pool.connect();
    
    // Set session variables for RLS policies in PostgreSQL
    // These correspond to current_setting('app.current_user_id') and current_setting('app.current_user_role')
    await client.query("SELECT set_config('app.current_user_id', $1, false)", [userId]);
    await client.query("SELECT set_config('app.current_user_role', $1, false)", [role || 'athlete']);

    // Attach the configured client to the request object
    (req as any).dbClient = client;

    next();
  } catch (err) {
    console.error("Failed to set RLS context:", err);
    return res.status(500).json({ error: "Database connection error" });
  }
}

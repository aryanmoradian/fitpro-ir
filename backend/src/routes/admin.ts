
import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { requireAdmin } from "../middleware/roleMiddleware";
import { setRLSContext } from "../middleware/setRLSContext";

const router = Router();

// GET /api/admin/users
// Protected by: Auth Token + Admin Role + RLS Context
router.get(
  "/users",
  authenticateToken,
  requireAdmin,
  setRLSContext,
  async (req: any, res) => {
    const client = req.dbClient;
    try {
        // Because RLS is enabled and role is set to 'admin', 
        // the Policy "Admins can view all users" will allow this query to return data.
        const result = await client.query("SELECT id, email, first_name, last_name, role, created_at, is_verified, subscription_status FROM users ORDER BY created_at DESC");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    } finally {
        if (client) client.release();
    }
  }
);

export default router;


import { Router, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { pool } from "../db";
import { generateVerificationCode } from "../utils/generateCode";
import { transporter } from "../utils/mailer";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";
import { setRLSContext } from "../middleware/setRLSContext";

const router = Router();

// Strict Rate Limiter for Login: Max 5 attempts per 15 minutes
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: "Too many login attempts, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});

// REGISTER
router.post("/register", async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  try {
    // Check if user exists
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userResult = await pool.query(
      `INSERT INTO users (first_name, last_name, email, username, password_hash, role, is_verified)
       VALUES ($1,$2,$3,$4,$5,'athlete', false) RETURNING id`,
      [first_name, last_name, email, email, hashedPassword]
    );

    const userId = userResult.rows[0].id;
    const code = generateVerificationCode();

    await pool.query(
      `INSERT INTO email_verification_codes (user_id, code, expires_at)
       VALUES ($1,$2,NOW() + INTERVAL '10 minutes')`,
      [userId, code]
    );

    // Send email (Log error but don't fail request if mailer not configured)
    try {
        await transporter.sendMail({
        to: email,
        subject: "Verify your email",
        text: `Your verification code: ${code}`,
        });
    } catch (mailError) {
        console.error("Mailer Error:", mailError);
    }

    res.json({ message: "Verification code sent" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Registration failed" });
  }
});

// VERIFY EMAIL
router.post("/verify-email", async (req, res) => {
    const { email, code } = req.body;
  
    try {
      const userResult = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );
  
      if (userResult.rowCount === 0) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const userId = userResult.rows[0].id;
  
      const codeResult = await pool.query(
        `SELECT * FROM email_verification_codes
         WHERE user_id = $1 AND code = $2 AND expires_at > NOW()`,
        [userId, code]
      );
  
      if (codeResult.rowCount === 0) {
        return res.status(400).json({ error: "Invalid or expired code" });
      }
  
      await pool.query(
        "UPDATE users SET is_verified = true WHERE id = $1",
        [userId]
      );
  
      await pool.query(
        "DELETE FROM email_verification_codes WHERE user_id = $1",
        [userId]
      );
  
      const token = jwt.sign(
        { userId, role: "athlete" }, // Using 'athlete' as default role based on register
        process.env.JWT_SECRET || "secret",
        { expiresIn: "7d" }
      );
  
      res.json({ message: "Email verified", token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Verification failed" });
    }
});

// LOGIN - Protected by Rate Limiter
router.post("/login", loginLimiter, async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const userResult = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
  
      if (userResult.rowCount === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
  
      const user = userResult.rows[0];
  
      if (!user.is_verified) {
        return res.status(403).json({ error: "Email not verified" });
      }
  
      const validPassword = await bcrypt.compare(
        password,
        user.password_hash
      );
  
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
  
      const token = jwt.sign(
        { userId: user.id, role: user.role || 'athlete' },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "7d" }
      );
  
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role || 'athlete',
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim()
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Login failed" });
    }
});

// GET CURRENT USER (ME) - Protected with RLS Context
router.get("/me", authenticateToken, setRLSContext, async (req: AuthRequest, res: Response) => {
    // Retrieve the RLS-configured client from the request
    const client = (req as any).dbClient;
    
    if (!client) {
        return res.status(500).json({ error: "Database client not available" });
    }

    try {
      // Using the RLS-aware client. 
      // If RLS policies are set up correctly in DB, 'SELECT * FROM users' 
      // would only return the row matching 'app.current_user_id'.
      // We still use WHERE id=$1 for performance index usage.
      const result = await client.query("SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = $1", [req.user.userId]);
      
      if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
      
      const user = result.rows[0];
      res.json({
          id: user.id,
          email: user.email,
          role: user.role || 'athlete',
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          created_at: user.created_at
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    } finally {
        // CRITICAL: Release the client back to the pool
        client.release();
    }
});

export default router;

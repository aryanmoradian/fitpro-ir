import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import db from "./utils/db"; // فرض می‌کنیم db یک Pool از pg است

dotenv.config();

const app = express();

// --- Middleware --- //

// Security headers
app.use(helmet());

// Logging
app.use(morgan("combined"));

// Global rate limiter (DDoS protection)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقیقه
  max: 100,                  // هر IP حداکثر 100 درخواست در هر پنجره
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// CORS
app.use(cors({
  origin: ["https://fit-pro.ir", "https://www.fit-pro.ir", "https://fit-pro.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// Body parser
app.use(express.json());

// --- Routes --- //
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// --- Health Check --- //
app.get("/api/health", async (_req: Request, res: Response) => {
  try {
    await db.query("SELECT 1");
    res.status(200).json({ status: "ok", db: "connected" });
  } catch (error) {
    console.error("HealthCheck DB error:", error);
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});

// --- Start Server --- //
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Auth backend running on port ${PORT}`);
});

export default app;

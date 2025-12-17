import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";

dotenv.config();

const app = express();

// Security Headers
app.use(helmet());

// Logging
app.use(morgan("combined"));

// Global Rate Limiter (Basic DDoS protection)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

app.use(
  cors({
    origin: [
      "https://fit-pro.ir",
      "https://www.fit-pro.ir",
      "https://fit-pro.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Auth backend running on port ${PORT}`);
});
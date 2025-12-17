
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");

// Load env vars
dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true })); // Enable credentials for cookies
app.use(bodyParser.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/membership", require("./routes/membershipRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Health Check
app.get("/api/health", async (req, res) => {
    // Optional: Check DB connection
    try {
        const db = require("./utils/db");
        await db.query('SELECT 1');
        res.json({ status: 'ok', db: 'connected' });
    } catch (e) {
        res.status(500).json({ status: 'error', db: 'disconnected' });
    }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on port ${port}`));

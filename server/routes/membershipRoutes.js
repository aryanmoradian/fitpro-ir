const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const MembershipRequest = require("../models/MembershipRequest");
const { notifyUser } = require("../utils/notify");

// POST /api/membership/request
router.post("/request", auth, async (req, res) => {
  try {
    const { planId, planTitle, durationDays, txid } = req.body;
    if (!planId || !durationDays || !txid) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newReq = await MembershipRequest.create({
      userId: req.user._id,
      userEmail: req.user.email,
      planId,
      planTitle,
      durationDays,
      txid,
      status: "pending_review",
      isActive: false,
    });

    console.log("New membership request created:", newReq._id);
    await notifyUser(req.user._id, "Your membership request is received and pending admin review.");

    return res.json({ success: true, request: newReq });
  } catch (err) {
    console.error("Error creating membership request:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/membership/my-requests
router.get("/my-requests", auth, async (req, res) => {
  try {
    const requests = await MembershipRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, requests });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
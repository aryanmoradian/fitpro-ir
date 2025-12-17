const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");
const MembershipRequest = require("../models/MembershipRequest");
const Membership = require("../models/Membership");
const { notifyUser } = require("../utils/notify");

// GET /api/admin/membership/requests
router.get("/membership/requests", auth, requireAdmin, async (req, res) => {
  try {
    const requests = await MembershipRequest.find().populate("userId", "email name role").sort({ createdAt: -1 });
    return res.json({ success: true, requests });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/admin/membership/approve
router.post("/membership/approve", auth, requireAdmin, async (req, res) => {
  try {
    const { requestId } = req.body;
    if (!requestId) return res.status(400).json({ message: "requestId is required" });

    const reqDoc = await MembershipRequest.findById(requestId);
    if (!reqDoc) return res.status(404).json({ message: "Request not found" });
    if (reqDoc.status !== "pending_review") return res.status(400).json({ message: "Request is not pending" });

    // Calculate expiry
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + reqDoc.durationDays * 24 * 60 * 60 * 1000);

    // Update Request
    reqDoc.status = "approved";
    reqDoc.isActive = true;
    reqDoc.startDate = startDate;
    reqDoc.endDate = endDate;
    await reqDoc.save();

    // Create Active Membership Record
    const membership = await Membership.create({
      userId: reqDoc.userId,
      planId: reqDoc.planId,
      planTitle: reqDoc.planTitle,
      startDate,
      endDate,
      active: true,
    });

    await notifyUser(reqDoc.userId, `Your membership has been approved. Active until ${endDate.toISOString()}`);

    return res.json({ success: true, message: "Approved and activated", request: reqDoc, membership });
  } catch (err) {
    console.error("Approve error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/admin/membership/reject
router.post("/membership/reject", auth, requireAdmin, async (req, res) => {
  try {
    const { requestId, reason } = req.body;
    if (!requestId) return res.status(400).json({ message: "requestId is required" });

    const reqDoc = await MembershipRequest.findById(requestId);
    if (!reqDoc) return res.status(404).json({ message: "Request not found" });
    if (reqDoc.status !== "pending_review") return res.status(400).json({ message: "Request is not pending" });

    reqDoc.status = "rejected";
    reqDoc.rejectReason = reason || "Rejected by admin";
    reqDoc.isActive = false;
    await reqDoc.save();

    await notifyUser(reqDoc.userId, `Your membership request was rejected. Reason: ${reqDoc.rejectReason}`);

    return res.json({ success: true, message: "Request rejected", request: reqDoc });
  } catch (err) {
    console.error("Reject error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
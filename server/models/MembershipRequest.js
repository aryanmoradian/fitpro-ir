const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const membershipRequestSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  userEmail: { type: String },
  planId: { type: String, required: true },
  planTitle: { type: String },
  durationDays: { type: Number, required: true },
  txid: { type: String, required: true },
  status: { type: String, enum: ["pending_review", "approved", "rejected"], default: "pending_review" },
  isActive: { type: Boolean, default: false },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  rejectReason: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model("MembershipRequest", membershipRequestSchema);
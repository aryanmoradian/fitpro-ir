const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const membershipSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  planId: { type: String, required: true },
  planTitle: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Membership", membershipSchema);
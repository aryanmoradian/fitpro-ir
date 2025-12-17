const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  name: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "" },
    role: {
      type: String,
      enum: ["needHelp", "canHelp", "both"],
      default: "both",
    },
    skills: [{ type: String, trim: true }],
    interests: [{ type: String, trim: true }],
    location: { type: String, default: "" },
    onboardingComplete: { type: Boolean, default: false },
    trustScore: { type: Number, default: 10 },
    helpedCount: { type: Number, default: 0 },
    requestsSolvedAsAuthor: { type: Number, default: 0 },
    badges: [{ type: String }],
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);

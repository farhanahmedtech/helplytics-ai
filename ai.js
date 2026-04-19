import mongoose from "mongoose";

const helperOfferSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    offeredAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const helpRequestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    tags: [{ type: String, trim: true }],
    category: { type: String, default: "general" },
    urgency: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["open", "in_progress", "solved"],
      default: "open",
    },
    helpers: [helperOfferSchema],
    aiSummary: { type: String, default: "" },
    moderated: { type: Boolean, default: false },
    moderationNote: { type: String, default: "" },
  },
  { timestamps: true }
);

helpRequestSchema.index({ category: 1, urgency: 1, status: 1, createdAt: -1 });
helpRequestSchema.index({ tags: 1 });
helpRequestSchema.index({ "helpers.user": 1 });

export const HelpRequest = mongoose.model("HelpRequest", helpRequestSchema);

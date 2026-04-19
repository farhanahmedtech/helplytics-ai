import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
    conversationKey: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

messageSchema.index({ createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);

export function makeConversationKey(userIdA, userIdB) {
  const [a, b] = [String(userIdA), String(userIdB)].sort();
  return `${a}__${b}`;
}

import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import { authRequired, attachUser } from "../middleware/auth.js";
import { adminRequired } from "../middleware/admin.js";
import { HelpRequest } from "../models/HelpRequest.js";
import { User } from "../models/User.js";

export const adminRouter = Router();
adminRouter.use(authRequired, attachUser, adminRequired);

adminRouter.get("/analytics", async (req, res) => {
  const [users, requests, open, solved] = await Promise.all([
    User.countDocuments(),
    HelpRequest.countDocuments(),
    HelpRequest.countDocuments({ status: { $ne: "solved" } }),
    HelpRequest.countDocuments({ status: "solved" }),
  ]);

  const byCategory = await HelpRequest.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 12 },
  ]);

  res.json({
    totals: { users, requests, open, solved },
    byCategory: byCategory.map((r) => ({ category: r._id, count: r.count })),
  });
});

adminRouter.get("/requests", async (req, res) => {
  const rows = await HelpRequest.find({})
    .sort({ createdAt: -1 })
    .limit(200)
    .populate("author", "name email")
    .lean();
  res.json({ requests: rows });
});

adminRouter.patch(
  "/requests/:id",
  param("id").isMongoId(),
  body("moderated").optional().isBoolean(),
  body("moderationNote").optional().isString().trim(),
  body("status").optional().isIn(["open", "in_progress", "solved"]),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const doc = await HelpRequest.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    if (req.body.moderated !== undefined) doc.moderated = req.body.moderated;
    if (req.body.moderationNote !== undefined) doc.moderationNote = req.body.moderationNote;
    if (req.body.status !== undefined) doc.status = req.body.status;
    await doc.save();

    const populated = await HelpRequest.findById(doc._id).populate("author", "name email").lean();
    res.json({ request: populated });
  }
);

adminRouter.get("/users", async (req, res) => {
  const rows = await User.find({})
    .sort({ createdAt: -1 })
    .limit(200)
    .select("-passwordHash")
    .lean();
  res.json({ users: rows });
});

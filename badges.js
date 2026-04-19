import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import { authRequired, attachUser } from "../middleware/auth.js";
import { Message, makeConversationKey } from "../models/Message.js";
import { User } from "../models/User.js";
import { Notification } from "../models/Notification.js";

export const messagesRouter = Router();
messagesRouter.use(authRequired, attachUser);

messagesRouter.get("/conversations", async (req, res) => {
  const mine = req.user._id;

  const rows = await Message.aggregate([
    {
      $match: {
        $or: [{ from: mine }, { to: mine }],
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$conversationKey",
        lastMessage: { $first: "$$ROOT" },
        unread: {
          $sum: {
            $cond: [{ $and: [{ $eq: ["$to", mine] }, { $eq: ["$read", false] }] }, 1, 0],
          },
        },
      },
    },
    { $limit: 50 },
  ]);

  const peerIds = rows
    .map((r) => {
      const m = r.lastMessage;
      return String(m.from) === String(mine) ? m.to : m.from;
    })
    .filter(Boolean);

  const peers = await User.find({ _id: { $in: peerIds } })
    .select("name skills trustScore badges")
    .lean();
  const peerMap = Object.fromEntries(peers.map((p) => [String(p._id), p]));

  const conversations = rows.map((r) => {
    const m = r.lastMessage;
    const peerId = String(m.from) === String(mine) ? m.to : m.from;
    return {
      conversationKey: r._id,
      peer: peerMap[String(peerId)] || { _id: peerId },
      lastMessage: {
        body: m.body,
        createdAt: m.createdAt,
        from: m.from,
        to: m.to,
      },
      unread: r.unread,
    };
  });

  res.json({ conversations });
});

messagesRouter.get(
  "/with/:userId",
  param("userId").isMongoId(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const peerId = req.params.userId;
    const key = makeConversationKey(req.user._id, peerId);

    const msgs = await Message.find({ conversationKey: key })
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();

    await Message.updateMany({ conversationKey: key, to: req.user._id, read: false }, { $set: { read: true } });

    const peer = await User.findById(peerId).select("name skills trustScore badges").lean();
    res.json({ peer, messages: msgs });
  }
);

messagesRouter.post(
  "/",
  body("to").isMongoId(),
  body("body").isString().trim().isLength({ min: 1, max: 4000 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const to = req.body.to;
    if (String(to) === String(req.user._id)) return res.status(400).json({ message: "Cannot message yourself" });

    const peer = await User.findById(to);
    if (!peer) return res.status(404).json({ message: "Recipient not found" });

    const key = makeConversationKey(req.user._id, to);
    const msg = await Message.create({
      from: req.user._id,
      to,
      body: req.body.body,
      conversationKey: key,
    });

    await Notification.create({
      user: to,
      type: "message",
      title: `New message from ${req.user.name || "Helplytics member"}`,
      body: req.body.body.slice(0, 140),
      meta: { from: req.user._id },
    });

    res.status(201).json({ message: msg });
  }
);

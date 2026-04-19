import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { User } from "../models/User.js";
import { authRequired, attachUser } from "../middleware/auth.js";
import { computeBadges } from "../utils/badges.js";

export const authRouter = Router();

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: "14d" });
}

authRouter.post(
  "/register",
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  body("name").optional().isString().trim(),
  body("role").isIn(["needHelp", "canHelp", "both"]),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const email = req.body.email;
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();
    const isAdmin = adminEmail && email.toLowerCase() === adminEmail;

    const user = await User.create({
      email,
      passwordHash,
      name: req.body.name || "",
      role: req.body.role,
      isAdmin,
      badges: computeBadges({ helpedCount: 0, trustScore: 10, requestsSolvedAsAuthor: 0 }),
    });

    const token = signToken(user._id);
    const safe = user.toObject();
    delete safe.passwordHash;
    res.status(201).json({ token, user: safe });
  }
);

authRouter.post(
  "/login",
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(req.body.password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user._id);
    const safe = user.toObject();
    delete safe.passwordHash;
    res.json({ token, user: safe });
  }
);

authRouter.get("/me", authRequired, attachUser, (req, res) => {
  res.json({ user: req.user });
});

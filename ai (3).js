import { Router } from "express";
import { User } from "../models/User.js";

export const leaderboardRouter = Router();

leaderboardRouter.get("/", async (req, res) => {
  const users = await User.find({ onboardingComplete: true })
    .sort({ helpedCount: -1, trustScore: -1, updatedAt: -1 })
    .limit(50)
    .select("name skills trustScore helpedCount badges location")
    .lean();

  const ranked = users.map((u, idx) => ({
    rank: idx + 1,
    user: u,
  }));

  res.json({ leaderboard: ranked });
});

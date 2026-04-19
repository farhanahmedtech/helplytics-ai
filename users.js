import { Router } from "express";
import { body, validationResult } from "express-validator";
import { authRequired, attachUser } from "../middleware/auth.js";
import { HelpRequest } from "../models/HelpRequest.js";
import {
  categorizeText,
  detectUrgency,
  suggestTags,
  rewriteSuggestions,
  summarizeRequest,
  onboardingSuggestions,
  trendInsightsFromRequests,
  personalDashboardInsights,
  suggestHelperResponses,
  communitySuggestionsFromTrends,
} from "../utils/ai.js";

export const aiRouter = Router();
aiRouter.use(authRequired, attachUser);

aiRouter.post("/categorize", body("text").isString(), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  res.json({ category: categorizeText(req.body.text) });
});

aiRouter.post("/urgency", body("text").isString(), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  res.json({ urgency: detectUrgency(req.body.text) });
});

aiRouter.post("/tags", body("text").isString(), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  res.json({ tags: suggestTags(req.body.text) });
});

aiRouter.post("/rewrite", body("text").isString(), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  res.json(rewriteSuggestions(req.body.text));
});

aiRouter.post(
  "/summary",
  body("title").optional().isString(),
  body("description").isString(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    res.json({ summary: summarizeRequest(req.body.title || "", req.body.description) });
  }
);

aiRouter.post("/onboarding-suggestions", body("skills").optional().isArray(), body("interests").optional().isArray(), body("location").optional().isString(), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  res.json(
    onboardingSuggestions({
      skills: req.body.skills || [],
      interests: req.body.interests || [],
      location: req.body.location || "",
    })
  );
});

aiRouter.get("/trends", async (req, res) => {
  const recent = await HelpRequest.find({}).sort({ createdAt: -1 }).limit(200).lean();
  const trends = trendInsightsFromRequests(recent);
  res.json({
    trends,
    communitySuggestions: communitySuggestionsFromTrends(trends),
  });
});

aiRouter.post(
  "/response-suggestions",
  body("title").optional().isString(),
  body("description").isString(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const suggestions = suggestHelperResponses(req.body.title || "", req.body.description);
    res.json({ suggestions });
  }
);

aiRouter.get("/personal-insights", async (req, res) => {
  const userId = req.user._id;
  const [openMine, helpingOn] = await Promise.all([
    HelpRequest.countDocuments({ author: userId, status: { $ne: "solved" } }),
    HelpRequest.countDocuments({ "helpers.user": userId, status: { $ne: "solved" } }),
  ]);
  res.json({
    insights: personalDashboardInsights({
      openCount: openMine,
      helpingCount: helpingOn,
      trustScore: req.user.trustScore,
    }),
  });
});

import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDb } from "./config/db.js";
import { authRouter } from "./routes/auth.js";
import { usersRouter } from "./routes/users.js";
import { requestsRouter } from "./routes/requests.js";
import { messagesRouter } from "./routes/messages.js";
import { notificationsRouter } from "./routes/notifications.js";
import { aiRouter } from "./routes/ai.js";
import { leaderboardRouter } from "./routes/leaderboard.js";
import { adminRouter } from "./routes/admin.js";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.get("/api/health", (req, res) => res.json({ ok: true, service: "helplytics-api" }));

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/requests", requestsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/admin", adminRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const port = Number(process.env.PORT || 5000);
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/helplytics";

await connectDb(mongoUri);
app.listen(port, () => {
  console.log(`Helplytics API listening on http://localhost:${port}`);
});

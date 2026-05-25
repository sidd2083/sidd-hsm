import { Router } from "express";
import { admin } from "../lib/firebase-admin";

const router = Router();
const db = () => admin.firestore();

router.post("/seed/markets", async (_req, res) => {
  if (process.env["NODE_ENV"] === "production") {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const existing = await db().collection("markets").limit(1).get();
  if (!existing.empty) {
    res.json({ message: `Markets already seeded (${existing.size}+ exist)` });
    return;
  }

  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  const markets = [
    { question: "Will the college football team win their next match?", category: "sports", lockTimestamp: now + 2 * oneDay, status: "active", yesPool: 45000, noPool: 12000, winningOutcome: null, createdAt: now - oneDay },
    { question: "Will the annual college fest be organized this semester?", category: "college", lockTimestamp: now + 5 * oneDay, status: "active", yesPool: 28000, noPool: 35000, winningOutcome: null, createdAt: now - 2 * oneDay },
    { question: "Will Instagram go down for more than 2 hours this week?", category: "social", lockTimestamp: now + 3 * oneDay, status: "active", yesPool: 8000, noPool: 62000, winningOutcome: null, createdAt: now - 3 * oneDay },
    { question: "Will the national cricket team win the upcoming test series?", category: "national", lockTimestamp: now + 10 * oneDay, status: "active", yesPool: 71000, noPool: 22000, winningOutcome: null, createdAt: now - oneDay },
    { question: "Will the canteen introduce a new menu before exams?", category: "college", lockTimestamp: now + oneDay, status: "active", yesPool: 5500, noPool: 4200, winningOutcome: null, createdAt: now - 4 * oneDay },
    { question: "Will YouTube Shorts surpass TikTok in monthly active users by year end?", category: "social", lockTimestamp: now + 20 * oneDay, status: "active", yesPool: 31000, noPool: 48000, winningOutcome: null, createdAt: now - 2 * oneDay },
    { question: "Will class 12 final exams be postponed this year?", category: "college", lockTimestamp: now + 30 * oneDay, status: "active", yesPool: 22000, noPool: 58000, winningOutcome: null, createdAt: now - 5 * oneDay },
    { question: "Will India qualify for the FIFA World Cup 2026?", category: "sports", lockTimestamp: now - oneDay, status: "locked", yesPool: 12000, noPool: 88000, winningOutcome: null, createdAt: now - 10 * oneDay },
    { question: "Did our school top the district in board exams?", category: "college", lockTimestamp: now - 2 * oneDay, status: "resolved", yesPool: 45000, noPool: 15000, winningOutcome: "YES", createdAt: now - 15 * oneDay },
  ];

  const ids: string[] = [];
  for (const m of markets) {
    const ref = await db().collection("markets").add(m);
    ids.push(ref.id);
  }

  res.json({ message: `Seeded ${ids.length} markets`, ids });
});

export default router;

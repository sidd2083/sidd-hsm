import { Router } from "express";
import { getFirestore } from "../lib/firebase-admin";
import { GetLeaderboardQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/leaderboard", async (req, res) => {
  try {
    const parsed = GetLeaderboardQueryParams.safeParse(req.query);
    const sort = parsed.success ? (parsed.data.sort ?? "richest") : "richest";

    const db = getFirestore();

    let field = "walletBalance";
    if (sort === "most-bets") field = "totalBets";
    if (sort === "most-won") field = "totalWon";

    const snap = await db
      .collection("users")
      .orderBy(field, "desc")
      .limit(100)
      .get();

    const entries = snap.docs.map((d, idx) => {
      const data = d.data();
      return {
        uid: d.id,
        displayName: data.displayName ?? "",
        username: data.username ?? null,
        walletBalance: data.walletBalance ?? 0,
        totalWon: data.totalWon ?? 0,
        totalBets: data.totalBets ?? 0,
        rank: idx + 1,
      };
    });

    res.json(entries);
  } catch (err) {
    req.log.error({ err }, "getLeaderboard error");
    res.status(503).json({ error: "Service unavailable" });
  }
});

export default router;

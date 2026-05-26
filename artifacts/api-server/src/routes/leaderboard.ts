import { Router } from "express";
import { admin, isFirebaseReady } from "../lib/firebase-admin";

const router = Router();
const db = () => {
  if (!isFirebaseReady()) throw Object.assign(new Error("Firebase not initialized"), { status: 503 });
  return admin.firestore();
};

router.get("/leaderboard", async (req, res) => {
  const { period = "all-time", sort = "richest" } = req.query as {
    period?: string;
    sort?: string;
  };

  let usersSnap: FirebaseFirestore.QuerySnapshot;
  let betsSnap: FirebaseFirestore.QuerySnapshot;
  let marketsSnap: FirebaseFirestore.QuerySnapshot;

  try {
    [usersSnap, betsSnap, marketsSnap] = await Promise.all([
      db().collection("users").get(),
      db().collection("bets").get(),
      db().collection("markets").get(),
    ]);
  } catch (err: unknown) {
    const e = err as { code?: number; status?: number };
    if (e.code === 16 || e.status === 503) {
      res.status(503).json({ error: "Database unavailable." });
      return;
    }
    throw err;
  }

  // Build market lookup for outcome + status (source of truth)
  const marketLookup: Record<string, { status: string; winningOutcome: string | null }> = {};
  marketsSnap.docs.forEach((d) => {
    const data = d.data();
    marketLookup[d.id] = {
      status:         data["status"]         as string,
      winningOutcome: (data["winningOutcome"] as string | null) ?? null,
    };
  });

  const now = Date.now();
  let cutoff = 0;
  if (period === "daily")  cutoff = now - 24 * 60 * 60 * 1000;
  if (period === "weekly") cutoff = now - 7 * 24 * 60 * 60 * 1000;

  // Aggregate per-user bet stats — source of truth is the market document
  const userStats: Record<string, { totalProfit: number; totalLoss: number; stakedValue: number }> = {};

  for (const betDoc of betsSnap.docs) {
    const bet = betDoc.data();
    const uid        = bet["userId"]    as string;
    const marketId   = bet["marketId"]  as string;
    const createdAt  = (bet["createdAt"]  as number) || 0;
    const amountPaid = (bet["amountPaid"] as number) || 0;
    const betType    = bet["type"]      as string;

    if (!userStats[uid]) userStats[uid] = { totalProfit: 0, totalLoss: 0, stakedValue: 0 };
    if (cutoff && createdAt < cutoff) continue;

    const market = marketLookup[marketId];
    if (!market) continue;

    if (market.status === "resolved") {
      if (betType === market.winningOutcome) {
        // Use stored payout if available; otherwise fall back to amountPaid as proxy
        const payout = (bet["payout"] as number) || amountPaid;
        userStats[uid].totalProfit += payout - amountPaid; // net gain
      } else {
        userStats[uid].totalLoss += amountPaid;
      }
    } else {
      userStats[uid].stakedValue += amountPaid; // still in play
    }
  }

  const entries = usersSnap.docs.map((doc) => {
    const data          = doc.data();
    const uid           = doc.id;
    const walletBalance = (data["walletBalance"] as number) || 0;
    const stats         = userStats[uid] || { totalProfit: 0, totalLoss: 0, stakedValue: 0 };
    const netWorth      = walletBalance + stats.stakedValue;

    return {
      uid,
      displayName:   data["displayName"]   as string,
      academicStream: data["academicStream"] as string,
      section:       data["section"]       as string,
      walletBalance,
      netWorth,
      totalProfit: stats.totalProfit,
      totalLoss:   stats.totalLoss,
      rank: 0,
    };
  });

  let sorted: typeof entries;
  if (sort === "profit") {
    sorted = entries.sort((a, b) => b.totalProfit - a.totalProfit);
  } else if (sort === "loss") {
    sorted = entries.sort((a, b) => b.totalLoss - a.totalLoss);
  } else {
    sorted = entries.sort((a, b) => b.netWorth - a.netWorth);
  }

  sorted.forEach((e, i) => { e.rank = i + 1; });

  res.json(sorted);
});

export default router;

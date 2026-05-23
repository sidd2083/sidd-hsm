import { Router } from "express";
import { admin } from "../lib/firebase-admin";

const router = Router();
const db = () => admin.firestore();

router.get("/leaderboard", async (req, res) => {
  const { period = "all-time", sort = "richest" } = req.query as {
    period?: string;
    sort?: string;
  };

  const usersSnap = await db().collection("users").get();
  const betsSnap = await db().collection("bets").get();

  const now = Date.now();
  let cutoff = 0;
  if (period === "daily") {
    cutoff = now - 24 * 60 * 60 * 1000;
  } else if (period === "weekly") {
    cutoff = now - 7 * 24 * 60 * 60 * 1000;
  }

  const userBetStats: Record<
    string,
    { totalProfit: number; totalLoss: number; stakedValue: number }
  > = {};

  for (const betDoc of betsSnap.docs) {
    const bet = betDoc.data();
    const uid = bet["userId"] as string;
    const createdAt = (bet["createdAt"] as number) || 0;
    const amountPaid = (bet["amountPaid"] as number) || 0;
    const type = bet["type"] as string;
    const winningOutcome = bet["winningOutcome"] as string | null;
    const marketStatus = bet["marketStatus"] as string | null;

    if (!userBetStats[uid]) {
      userBetStats[uid] = { totalProfit: 0, totalLoss: 0, stakedValue: 0 };
    }

    if (cutoff && createdAt < cutoff) continue;

    if (marketStatus === "resolved") {
      if (type === winningOutcome) {
        userBetStats[uid].totalProfit += amountPaid;
      } else {
        userBetStats[uid].totalLoss += amountPaid;
      }
    } else {
      userBetStats[uid].stakedValue += amountPaid;
    }
  }

  const entries = usersSnap.docs.map((doc) => {
    const data = doc.data();
    const uid = doc.id;
    const walletBalance = (data["walletBalance"] as number) || 0;
    const stats = userBetStats[uid] || { totalProfit: 0, totalLoss: 0, stakedValue: 0 };
    const netWorth = walletBalance + stats.stakedValue;

    return {
      uid,
      displayName: data["displayName"] as string,
      academicStream: data["academicStream"] as string,
      section: data["section"] as string,
      walletBalance,
      netWorth,
      totalProfit: stats.totalProfit,
      totalLoss: stats.totalLoss,
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

  sorted.forEach((e, i) => {
    e.rank = i + 1;
  });

  res.json(sorted);
});

export default router;

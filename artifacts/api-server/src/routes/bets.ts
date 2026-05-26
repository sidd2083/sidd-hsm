import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { getFirestore } from "../lib/firebase-admin";

const router = Router();

router.get("/bets/my", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const db = getFirestore();
    const snap = await db
      .collection("bets")
      .where("userId", "==", req.uid)
      .orderBy("placedAt", "desc")
      .limit(200)
      .get();

    const bets = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        marketId: data.marketId ?? "",
        marketTitle: data.marketTitle ?? "",
        userId: data.userId ?? "",
        side: data.side ?? "YES",
        amountPaid: data.amountPaid ?? 0,
        sharesOwned: data.sharesOwned ?? 0,
        status: data.status ?? "active",
        payout: data.payout ?? null,
        placedAt: data.placedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      };
    });

    res.json(bets);
  } catch (err) {
    req.log.error({ err }, "listMyBets error");
    res.status(503).json({ error: "Service unavailable" });
  }
});

export default router;

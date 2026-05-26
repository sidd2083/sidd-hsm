import { Router } from "express";
import { requireAuth, optionalAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { getFirestore } from "../lib/firebase-admin";
import {
  ListMarketsQueryParams,
  PlaceBetBody,
} from "@workspace/api-zod";

const router = Router();

function marketFromDoc(id: string, data: FirebaseFirestore.DocumentData) {
  return {
    id,
    title: data.title ?? "",
    description: data.description ?? "",
    category: data.category ?? "general",
    status: data.status ?? "open",
    outcome: data.outcome ?? null,
    yesPool: data.yesPool ?? 0,
    noPool: data.noPool ?? 0,
    closesAt: data.closesAt?.toDate?.()?.toISOString() ?? null,
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    resolvedAt: data.resolvedAt?.toDate?.()?.toISOString() ?? null,
    imageUrl: data.imageUrl ?? null,
    tags: data.tags ?? [],
  };
}

router.get("/markets", optionalAuth, async (req, res) => {
  try {
    const parsed = ListMarketsQueryParams.safeParse(req.query);
    const db = getFirestore();

    let query: FirebaseFirestore.Query = db.collection("markets").orderBy("createdAt", "desc");

    if (parsed.success && parsed.data.category && parsed.data.category !== "all") {
      query = query.where("category", "==", parsed.data.category);
    }
    if (parsed.success && parsed.data.status) {
      query = query.where("status", "==", parsed.data.status);
    }

    const snap = await query.limit(100).get();
    const markets = snap.docs.map((d) => marketFromDoc(d.id, d.data()));
    res.json(markets);
  } catch (err) {
    req.log.error({ err }, "listMarkets error");
    res.status(503).json({ error: "Service unavailable" });
  }
});

router.get("/markets/:id", optionalAuth, async (req, res) => {
  try {
    const db = getFirestore();
    const doc = await db.collection("markets").doc(String(req.params.id)).get();

    if (!doc.exists) {
      res.status(404).json({ error: "Market not found" });
      return;
    }

    res.json(marketFromDoc(doc.id, doc.data()!));
  } catch (err) {
    req.log.error({ err }, "getMarket error");
    res.status(503).json({ error: "Service unavailable" });
  }
});

router.get("/markets/:id/bets", optionalAuth, async (req, res) => {
  try {
    const db = getFirestore();
    const snap = await db
      .collection("bets")
      .where("marketId", "==", req.params.id)
      .orderBy("placedAt", "desc")
      .limit(200)
      .get();

    const bets = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        marketId: data.marketId,
        marketTitle: data.marketTitle ?? "",
        userId: data.userId,
        side: data.side,
        amountPaid: data.amountPaid ?? 0,
        sharesOwned: data.sharesOwned ?? 0,
        status: data.status ?? "active",
        payout: data.payout ?? null,
        placedAt: data.placedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      };
    });

    res.json(bets);
  } catch (err) {
    req.log.error({ err }, "getMarketBets error");
    res.status(503).json({ error: "Service unavailable" });
  }
});

router.post("/markets/:id/bets", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const parsed = PlaceBetBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { side, amount } = parsed.data;
    if (amount <= 0) {
      res.status(400).json({ error: "Amount must be positive" });
      return;
    }

    const db = getFirestore();
    const marketRef = db.collection("markets").doc(String(req.params.id));
    const userRef = db.collection("users").doc(req.uid!);

    const result = await db.runTransaction(async (tx) => {
      const [marketDoc, userDoc] = await Promise.all([tx.get(marketRef), tx.get(userRef)]);

      if (!marketDoc.exists) throw new Error("Market not found");
      const market = marketDoc.data()!;

      if (market.status !== "open") throw new Error("Market is not open for betting");
      if (!userDoc.exists) throw new Error("User profile not found");

      const user = userDoc.data()!;
      if ((user.walletBalance ?? 0) < amount) throw new Error("Insufficient balance");

      const yesPool = market.yesPool ?? 0;
      const noPool = market.noPool ?? 0;
      const sidePool = side === "YES" ? yesPool : noPool;
      const sharesOwned = amount / (sidePool > 0 ? sidePool / (sidePool + amount) * amount / amount : 1);

      const betRef = db.collection("bets").doc();
      const now = new Date();

      tx.set(betRef, {
        marketId: req.params.id,
        marketTitle: market.title,
        userId: req.uid,
        side,
        amountPaid: amount,
        sharesOwned: amount,
        status: "active",
        payout: null,
        placedAt: now,
      });

      tx.update(marketRef, {
        yesPool: side === "YES" ? yesPool + amount : yesPool,
        noPool: side === "NO" ? noPool + amount : noPool,
      });

      tx.update(userRef, {
        walletBalance: (user.walletBalance ?? 0) - amount,
        totalBets: (user.totalBets ?? 0) + 1,
      });

      return {
        id: betRef.id,
        marketId: req.params.id,
        marketTitle: market.title,
        userId: req.uid!,
        side,
        amountPaid: amount,
        sharesOwned: amount,
        status: "active" as const,
        payout: null,
        placedAt: now.toISOString(),
      };
    });

    res.status(201).json(result);
  } catch (err: unknown) {
    req.log.error({ err }, "placeBet error");
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "Market not found") {
      res.status(404).json({ error: message });
    } else if (message === "Market is not open for betting" || message === "Insufficient balance" || message === "User profile not found") {
      res.status(400).json({ error: message });
    } else {
      res.status(503).json({ error: "Service unavailable" });
    }
  }
});

export default router;

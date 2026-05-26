import { Router } from "express";
import { requireAdmin } from "../middlewares/auth";
import { getFirestore } from "../lib/firebase-admin";
import {
  AdminCreateMarketBody,
  AdminResolveMarketBody,
  AdminAdjustWalletBody,
} from "@workspace/api-zod";

const router = Router();

router.post("/admin/markets", requireAdmin, async (req, res) => {
  try {
    const parsed = AdminCreateMarketBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const db = getFirestore();
    const now = new Date();

    const marketData = {
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      status: "open",
      outcome: null,
      yesPool: 0,
      noPool: 0,
      closesAt: parsed.data.closesAt ? new Date(parsed.data.closesAt) : null,
      createdAt: now,
      resolvedAt: null,
      imageUrl: parsed.data.imageUrl ?? null,
      tags: parsed.data.tags ?? [],
    };

    const ref = await db.collection("markets").add(marketData);

    res.status(201).json({
      id: ref.id,
      ...marketData,
      closesAt: marketData.closesAt?.toISOString() ?? null,
      createdAt: now.toISOString(),
      resolvedAt: null,
    });
  } catch (err) {
    req.log.error({ err }, "adminCreateMarket error");
    res.status(503).json({ error: "Service unavailable" });
  }
});

router.post("/admin/markets/:id/resolve", requireAdmin, async (req, res) => {
  try {
    const parsed = AdminResolveMarketBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const outcome = parsed.data.outcome;
    const db = getFirestore();
    const marketRef = db.collection("markets").doc(req.params.id);
    const marketDoc = await marketRef.get();

    if (!marketDoc.exists) {
      res.status(404).json({ error: "Market not found" });
      return;
    }

    const market = marketDoc.data()!;
    const totalPool = (market.yesPool ?? 0) + (market.noPool ?? 0);
    const winPool = outcome === "YES" ? (market.yesPool ?? 0) : (market.noPool ?? 0);
    const now = new Date();

    await marketRef.update({ status: "resolved", outcome, resolvedAt: now });

    if (winPool > 0) {
      const betsSnap = await db
        .collection("bets")
        .where("marketId", "==", req.params.id)
        .where("side", "==", outcome)
        .get();

      const batch = db.batch();
      for (const betDoc of betsSnap.docs) {
        const bet = betDoc.data();
        const payout = Math.floor(((bet.amountPaid ?? 0) / winPool) * totalPool);
        batch.update(betDoc.ref, { status: "won", payout });

        const userRef = db.collection("users").doc(bet.userId);
        batch.update(userRef, {
          walletBalance: (bet.walletBalance ?? 0) + payout,
          totalWon: (bet.totalWon ?? 0) + 1,
        });
      }

      const lostSnap = await db
        .collection("bets")
        .where("marketId", "==", req.params.id)
        .where("side", "==", outcome === "YES" ? "NO" : "YES")
        .get();

      for (const betDoc of lostSnap.docs) {
        batch.update(betDoc.ref, { status: "lost", payout: 0 });
      }

      await batch.commit();
    }

    const updated = await marketRef.get();
    const data = updated.data()!;

    res.json({
      id: updated.id,
      title: data.title,
      description: data.description,
      category: data.category,
      status: data.status,
      outcome: data.outcome ?? null,
      yesPool: data.yesPool ?? 0,
      noPool: data.noPool ?? 0,
      closesAt: data.closesAt?.toDate?.()?.toISOString() ?? null,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? now.toISOString(),
      resolvedAt: data.resolvedAt?.toDate?.()?.toISOString() ?? null,
      imageUrl: data.imageUrl ?? null,
      tags: data.tags ?? [],
    });
  } catch (err) {
    req.log.error({ err }, "adminResolveMarket error");
    res.status(503).json({ error: "Service unavailable" });
  }
});

router.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const db = getFirestore();
    const snap = await db.collection("users").orderBy("walletBalance", "desc").limit(500).get();

    const users = snap.docs.map((d) => {
      const data = d.data();
      return {
        uid: d.id,
        displayName: data.displayName ?? "",
        email: data.email ?? "",
        photoURL: data.photoURL ?? null,
        walletBalance: data.walletBalance ?? 0,
        stream: data.stream ?? null,
        username: data.username ?? null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
        lastDailyBonus: data.lastDailyBonus?.toDate?.()?.toISOString() ?? null,
        totalBets: data.totalBets ?? 0,
        totalWon: data.totalWon ?? 0,
      };
    });

    res.json(users);
  } catch (err) {
    req.log.error({ err }, "adminListUsers error");
    res.status(503).json({ error: "Service unavailable" });
  }
});

router.post("/admin/users/:id/wallet", requireAdmin, async (req, res) => {
  try {
    const parsed = AdminAdjustWalletBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const db = getFirestore();
    const ref = db.collection("users").doc(req.params.id);
    const doc = await ref.get();

    if (!doc.exists) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const current = doc.data()!;
    const newBalance = (current.walletBalance ?? 0) + parsed.data.amount;
    await ref.update({ walletBalance: newBalance });

    const updated = await ref.get();
    const data = updated.data()!;

    res.json({
      uid: updated.id,
      displayName: data.displayName ?? "",
      email: data.email ?? "",
      photoURL: data.photoURL ?? null,
      walletBalance: data.walletBalance ?? 0,
      stream: data.stream ?? null,
      username: data.username ?? null,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      lastDailyBonus: data.lastDailyBonus?.toDate?.()?.toISOString() ?? null,
      totalBets: data.totalBets ?? 0,
      totalWon: data.totalWon ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "adminAdjustWallet error");
    res.status(503).json({ error: "Service unavailable" });
  }
});

export default router;

import { Router } from "express";
import { admin } from "../lib/firebase-admin";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();
const db = () => admin.firestore();

const ADMIN_PASSWORD_HEADER = "x-admin-password";
const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] || "campus123";

function requireAdminPassword(req: AuthRequest, res: import("express").Response, next: import("express").NextFunction): void {
  const pw = req.headers[ADMIN_PASSWORD_HEADER];
  if (pw !== ADMIN_PASSWORD) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}

router.post(
  "/admin/markets",
  requireAuth,
  requireAdminPassword,
  async (req: AuthRequest, res) => {
    const { question, category, lockTimestamp } = req.body as {
      question: string;
      category: string;
      lockTimestamp: number;
    };

    if (!question || !category || !lockTimestamp) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const marketData = {
      question,
      category,
      lockTimestamp,
      status: "active",
      yesPool: 0,
      noPool: 0,
      winningOutcome: null,
      createdAt: Date.now(),
    };

    const ref = await db().collection("markets").add(marketData);
    res.status(201).json({ id: ref.id, ...marketData });
  },
);

router.post(
  "/admin/markets/:id/resolve",
  requireAuth,
  requireAdminPassword,
  async (req: AuthRequest, res) => {
    const marketId = req.params["id"]!;
    const { outcome } = req.body as { outcome: "YES" | "NO" };

    if (outcome !== "YES" && outcome !== "NO") {
      res.status(400).json({ error: "outcome must be YES or NO" });
      return;
    }

    const marketRef = db().collection("markets").doc(marketId);
    const marketDoc = await marketRef.get();

    if (!marketDoc.exists) {
      res.status(404).json({ error: "Market not found" });
      return;
    }

    const market = marketDoc.data()!;
    if (market["status"] === "resolved") {
      res.status(409).json({ error: "Market already resolved" });
      return;
    }

    const yesPool = (market["yesPool"] as number) || 0;
    const noPool = (market["noPool"] as number) || 0;
    const totalPool = yesPool + noPool;

    await marketRef.update({
      status: "resolved",
      winningOutcome: outcome,
    });

    if (totalPool === 0) {
      res.json({ id: marketId, ...market, status: "resolved", winningOutcome: outcome });
      return;
    }

    const betsSnap = await db()
      .collection("bets")
      .where("marketId", "==", marketId)
      .where("type", "==", outcome)
      .get();

    const winningPool = outcome === "YES" ? yesPool : noPool;

    const batch = db().batch();

    for (const betDoc of betsSnap.docs) {
      const bet = betDoc.data();
      const amountPaid = (bet["amountPaid"] as number) || 0;
      const payout = (amountPaid / winningPool) * totalPool;
      const userRef = db().collection("users").doc(bet["userId"] as string);
      batch.update(userRef, {
        walletBalance: admin.firestore.FieldValue.increment(Math.floor(payout)),
      });
    }

    await batch.commit();

    const updated = await marketRef.get();
    res.json({ id: marketId, ...updated.data() });
  },
);

router.patch(
  "/admin/users/:uid/wallet",
  requireAuth,
  requireAdminPassword,
  async (req: AuthRequest, res) => {
    const { uid } = req.params as { uid: string };
    const { amount } = req.body as { amount: number; reason: string };

    const userRef = db().collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    await userRef.update({
      walletBalance: admin.firestore.FieldValue.increment(amount),
    });

    const updated = await userRef.get();
    res.json({ uid, ...updated.data() });
  },
);

router.get(
  "/admin/users",
  requireAuth,
  requireAdminPassword,
  async (_req, res) => {
    const snap = await db().collection("users").get();
    const users = snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
    res.json(users);
  },
);

export default router;

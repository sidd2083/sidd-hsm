import { Router } from "express";
import { admin } from "../lib/firebase-admin";
import type { Request, Response, NextFunction } from "express";

const router = Router();
const db = () => admin.firestore();

const ADMIN_USERNAME = process.env["ADMIN_USERNAME"] || "siddhant";
const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] || "siddhant2078";

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const username = req.headers["x-admin-username"];
  const password = req.headers["x-admin-password"];
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}

// Create market
router.post("/admin/markets", requireAdmin, async (req: Request, res: Response) => {
  const { question, category, lockTimestamp, description } = req.body as {
    question: string;
    category: string;
    lockTimestamp: number;
    description?: string;
  };

  if (!question || !category || !lockTimestamp) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const marketData = {
    question,
    category,
    lockTimestamp,
    description: description ?? "",
    status: "active",
    yesPool: 0,
    noPool: 0,
    winningOutcome: null,
    createdAt: Date.now(),
  };

  const ref = await db().collection("markets").add(marketData);
  res.status(201).json({ id: ref.id, ...marketData });
});

// Update market (lock manually, update details)
router.patch("/admin/markets/:id", requireAdmin, async (req: Request, res: Response) => {
  const marketId = req.params["id"]!;
  const { lockTimestamp, status, question, category } = req.body as {
    lockTimestamp?: number;
    status?: string;
    question?: string;
    category?: string;
  };

  const marketRef = db().collection("markets").doc(marketId);
  const marketDoc = await marketRef.get();
  if (!marketDoc.exists) {
    res.status(404).json({ error: "Market not found" });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (lockTimestamp !== undefined) updates["lockTimestamp"] = lockTimestamp;
  if (status !== undefined) updates["status"] = status;
  if (question !== undefined) updates["question"] = question;
  if (category !== undefined) updates["category"] = category;

  await marketRef.update(updates);
  const updated = await marketRef.get();
  res.json({ id: marketId, ...updated.data() });
});

// Delete market
router.delete("/admin/markets/:id", requireAdmin, async (req: Request, res: Response) => {
  const marketId = req.params["id"]!;
  const marketRef = db().collection("markets").doc(marketId);
  const marketDoc = await marketRef.get();
  if (!marketDoc.exists) {
    res.status(404).json({ error: "Market not found" });
    return;
  }

  await marketRef.delete();
  res.json({ deleted: true, id: marketId });
});

// Resolve market
router.post("/admin/markets/:id/resolve", requireAdmin, async (req: Request, res: Response) => {
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

  await marketRef.update({ status: "resolved", winningOutcome: outcome });

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
    batch.update(betDoc.ref, { status: "won", payout: Math.floor(payout) });
  }

  const losingBetsSnap = await db()
    .collection("bets")
    .where("marketId", "==", marketId)
    .where("type", "==", outcome === "YES" ? "NO" : "YES")
    .get();

  for (const betDoc of losingBetsSnap.docs) {
    batch.update(betDoc.ref, { status: "lost", payout: 0 });
  }

  await batch.commit();
  const updated = await marketRef.get();
  res.json({ id: marketId, ...updated.data() });
});

// Adjust user wallet
router.patch("/admin/users/:uid/wallet", requireAdmin, async (req: Request, res: Response) => {
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
});

// List all users
router.get("/admin/users", requireAdmin, async (_req: Request, res: Response) => {
  const snap = await db().collection("users").orderBy("walletBalance", "desc").get();
  const users = snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
  res.json(users);
});

// Get platform stats
router.get("/admin/stats", requireAdmin, async (_req: Request, res: Response) => {
  const [marketsSnap, betsSnap, usersSnap] = await Promise.all([
    db().collection("markets").get(),
    db().collection("bets").get(),
    db().collection("users").get(),
  ]);

  const markets = marketsSnap.docs.map(d => d.data());
  const activeMarkets = markets.filter(m => m["status"] === "active").length;
  const resolvedMarkets = markets.filter(m => m["status"] === "resolved").length;
  const totalVolume = betsSnap.docs.reduce((sum, d) => sum + ((d.data()["amountPaid"] as number) || 0), 0);

  res.json({
    totalMarkets: marketsSnap.size,
    activeMarkets,
    resolvedMarkets,
    totalBets: betsSnap.size,
    totalUsers: usersSnap.size,
    totalVolume,
  });
});

// Get/manage categories
router.get("/admin/categories", requireAdmin, async (_req: Request, res: Response) => {
  const doc = await db().collection("config").doc("categories").get();
  const custom = doc.exists ? ((doc.data()?.["list"] as string[]) ?? []) : [];
  res.json({ categories: custom });
});

router.post("/admin/categories", requireAdmin, async (req: Request, res: Response) => {
  const { name } = req.body as { name: string };
  if (!name || name.trim().length === 0) {
    res.status(400).json({ error: "Category name required" });
    return;
  }
  const slug = name.trim().toLowerCase().replace(/\s+/g, "-");
  await db().collection("config").doc("categories").set(
    { list: admin.firestore.FieldValue.arrayUnion(slug) },
    { merge: true }
  );
  res.json({ added: slug });
});

router.delete("/admin/categories/:name", requireAdmin, async (req: Request, res: Response) => {
  const { name } = req.params as { name: string };
  await db().collection("config").doc("categories").update({
    list: admin.firestore.FieldValue.arrayRemove(name),
  });
  res.json({ removed: name });
});

export default router;

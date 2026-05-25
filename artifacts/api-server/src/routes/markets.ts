import { Router } from "express";
import { admin } from "../lib/firebase-admin";
import { optionalAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();
const db = () => admin.firestore();

router.get("/markets", optionalAuth, async (req: AuthRequest, res) => {
  const { category, status } = req.query as {
    category?: string;
    status?: string;
  };

  let query: FirebaseFirestore.Query = db().collection("markets");

  if (category) {
    query = query.where("category", "==", category);
  } else if (status) {
    query = query.where("status", "==", status);
  }

  // Only apply server-side orderBy when no where clause is used (avoids composite index requirement)
  const needsClientSort = !!(category || status);
  if (!needsClientSort) {
    query = query.orderBy("createdAt", "desc");
  }

  const snapshot = await query.get();
  let markets = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Array<Record<string, unknown>>;

  // Client-side sort when filters are applied
  if (needsClientSort) {
    markets = markets.sort((a, b) => ((b["createdAt"] as number) ?? 0) - ((a["createdAt"] as number) ?? 0));
  }

  res.json(markets);
});

router.get("/markets/:id", optionalAuth, async (req: AuthRequest, res) => {
  const doc = await db().collection("markets").doc(req.params["id"] as string).get();
  if (!doc.exists) {
    res.status(404).json({ error: "Market not found" });
    return;
  }
  res.json({ id: doc.id, ...doc.data() });
});

router.get("/markets/:id/bets", optionalAuth, async (req, res) => {
  const snapshot = await db()
    .collection("bets")
    .where("marketId", "==", req.params["id"] as string)
    .orderBy("createdAt", "desc")
    .get();

  const bets = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  res.json(bets);
});

export default router;

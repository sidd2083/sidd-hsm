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
  }
  if (status) {
    query = query.where("status", "==", status);
  }

  const snapshot = await query.orderBy("createdAt", "desc").get();
  const markets = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  res.json(markets);
});

router.get("/markets/:id", optionalAuth, async (req: AuthRequest, res) => {
  const doc = await db().collection("markets").doc(req.params["id"]!).get();
  if (!doc.exists) {
    res.status(404).json({ error: "Market not found" });
    return;
  }
  res.json({ id: doc.id, ...doc.data() });
});

router.get("/markets/:id/bets", optionalAuth, async (req, res) => {
  const snapshot = await db()
    .collection("bets")
    .where("marketId", "==", req.params["id"]!)
    .orderBy("createdAt", "desc")
    .get();

  const bets = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  res.json(bets);
});

export default router;

import { Router } from "express";
import { admin, isFirebaseReady } from "../lib/firebase-admin";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();
const db = () => {
  if (!isFirebaseReady()) throw Object.assign(new Error("Firebase not initialized"), { status: 503 });
  return admin.firestore();
};

router.post("/bets", requireAuth, async (req: AuthRequest, res) => {
  const uid = req.uid!;
  const { marketId, type, amountPaid } = req.body as {
    marketId: string;
    type: "YES" | "NO";
    amountPaid: number;
  };

  if (!marketId || !type || !amountPaid || amountPaid < 100) {
    res.status(400).json({ error: "Minimum bet is ₹100" });
    return;
  }

  if (type !== "YES" && type !== "NO") {
    res.status(400).json({ error: "type must be YES or NO" });
    return;
  }

  const marketRef = db().collection("markets").doc(marketId);
  const userRef = db().collection("users").doc(uid);

  try {
    const bet = await db().runTransaction(async (txn) => {
      const [marketDoc, userDoc] = await Promise.all([
        txn.get(marketRef),
        txn.get(userRef),
      ]);

      if (!marketDoc.exists) {
        throw Object.assign(new Error("Market not found"), { status: 404 });
      }

      const market = marketDoc.data()!;

      if (market["status"] !== "active") {
        throw Object.assign(new Error("Market is locked or resolved"), { status: 409 });
      }

      const lockTimestamp = market["lockTimestamp"] as number;
      if (Date.now() >= lockTimestamp) {
        txn.update(marketRef, { status: "locked" });
        throw Object.assign(new Error("Market is locked"), { status: 409 });
      }

      if (!userDoc.exists) {
        throw Object.assign(new Error("User not found"), { status: 404 });
      }

      const user = userDoc.data()!;
      const currentBalance = user["walletBalance"] as number;

      if (currentBalance < amountPaid) {
        throw Object.assign(new Error("Insufficient balance"), { status: 400 });
      }

      const yesPool = (market["yesPool"] as number) || 0;
      const noPool  = (market["noPool"]  as number) || 0;

      const poolField       = type === "YES" ? "yesPool" : "noPool";
      const currentSidePool = type === "YES" ? yesPool : noPool;
      const poolShareAtBet  = amountPaid / (currentSidePool + amountPaid);

      // Compute expected payout at time of bet so portfolio can show it
      const newSidePool  = currentSidePool + amountPaid;
      const newTotalPool = yesPool + noPool + amountPaid;
      const expectedPayout = Math.floor((amountPaid / newSidePool) * newTotalPool);

      const betData = {
        userId: uid,
        marketId,
        type,
        amountPaid,
        poolShareAtBet,
        expectedPayout,
        status: "active",      // "active" | "won" | "lost" — updated on market resolution
        payout: 0,             // actual payout filled in by resolve route
        createdAt: Date.now(),
      };

      const betRef = db().collection("bets").doc();
      txn.set(betRef, betData);
      txn.update(marketRef, { [poolField]: admin.firestore.FieldValue.increment(amountPaid) });
      txn.update(userRef,   { walletBalance: admin.firestore.FieldValue.increment(-amountPaid) });

      return { id: betRef.id, ...betData };
    });

    res.status(201).json(bet);
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    const status = e.status ?? 500;
    const message = e.message ?? "Unexpected error";
    if (status < 500) {
      res.status(status).json({ error: message });
    } else {
      throw err; // let express error handler deal with unexpected errors
    }
  }
});

router.get("/bets/my", requireAuth, async (req: AuthRequest, res) => {
  const uid = req.uid!;
  const snapshot = await db()
    .collection("bets")
    .where("userId", "==", uid)
    .orderBy("createdAt", "desc")
    .get();

  // Collect unique market IDs and fetch them in chunks
  const marketIds = [...new Set(snapshot.docs.map((d) => d.data()["marketId"] as string))];

  const marketMap: Record<string, { question: string; status: string; winningOutcome: string | null }> = {};

  if (marketIds.length > 0) {
    for (let i = 0; i < marketIds.length; i += 10) {
      const chunk = marketIds.slice(i, i + 10);
      const mSnap = await db()
        .collection("markets")
        .where(admin.firestore.FieldPath.documentId(), "in", chunk)
        .get();
      mSnap.docs.forEach((d) => {
        const data = d.data();
        marketMap[d.id] = {
          question:       data["question"]       as string,
          status:         data["status"]         as string,
          winningOutcome: (data["winningOutcome"] as string | null) ?? null,
        };
      });
    }
  }

  const bets = snapshot.docs.map((doc) => {
    const data = doc.data();
    const mid  = data["marketId"] as string;
    const mInfo = marketMap[mid];
    return {
      id: doc.id,
      ...data,
      marketQuestion:  mInfo?.question       ?? null,
      marketStatus:    mInfo?.status         ?? null,
      winningOutcome:  mInfo?.winningOutcome ?? null,
    };
  });

  res.json(bets);
});

export default router;

import { Router } from "express";
import { admin } from "../lib/firebase-admin";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();
const db = () => admin.firestore();

const STARTING_BALANCE = 100000;
const DAILY_BONUS = 100;

router.get("/users/me", requireAuth, async (req: AuthRequest, res) => {
  const uid = req.uid!;
  const doc = await db().collection("users").doc(uid).get();
  if (!doc.exists) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  res.json({ uid, ...doc.data() });
});

router.post("/users/me", requireAuth, async (req: AuthRequest, res) => {
  const uid = req.uid!;
  const { displayName, academicStream, section } = req.body as {
    displayName: string;
    academicStream: string;
    section: string;
  };

  if (!displayName || !academicStream) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const userRecord = await admin.auth().getUser(uid);

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const userData = {
    email: userRecord.email ?? "",
    displayName,
    academicStream,
    section: section ?? "",
    walletBalance: STARTING_BALANCE,
    lastDailyClaimDate: todayStr,
  };

  await db().collection("users").doc(uid).set(userData);

  res.status(201).json({ uid, ...userData });
});

router.patch("/users/me", requireAuth, async (req: AuthRequest, res) => {
  const uid = req.uid!;
  const { displayName, academicStream, section } = req.body as {
    displayName?: string;
    academicStream?: string;
    section?: string;
  };

  const updates: Record<string, string> = {};
  if (displayName) updates["displayName"] = displayName;
  if (academicStream) updates["academicStream"] = academicStream;
  if (section) updates["section"] = section;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }

  const userRef = db().collection("users").doc(uid);
  const doc = await userRef.get();
  if (!doc.exists) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }

  await userRef.update(updates);
  const updated = await userRef.get();
  res.json({ uid, ...updated.data() });
});

router.post(
  "/users/me/daily-claim",
  requireAuth,
  async (req: AuthRequest, res) => {
    const uid = req.uid!;
    const userRef = db().collection("users").doc(uid);

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const result = await db().runTransaction(async (txn) => {
      const doc = await txn.get(userRef);
      if (!doc.exists) {
        throw new Error("User not found");
      }
      const data = doc.data()!;
      const lastClaim = data["lastDailyClaimDate"];

      if (lastClaim === todayStr) {
        return { claimed: false, walletBalance: data["walletBalance"] as number };
      }

      const nowHour = now.getHours();
      if (nowHour < 6) {
        return { claimed: false, walletBalance: data["walletBalance"] as number };
      }

      const newBalance = (data["walletBalance"] as number) + DAILY_BONUS;
      txn.update(userRef, {
        walletBalance: newBalance,
        lastDailyClaimDate: todayStr,
      });

      return { claimed: true, walletBalance: newBalance };
    });

    res.json(result);
  },
);

export default router;

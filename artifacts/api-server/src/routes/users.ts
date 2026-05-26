import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";
import { getFirestore } from "../lib/firebase-admin";
import {
  GetMeResponse,
  UpdateProfileBody,
  UpdateProfileResponse,
  CreateProfileBody,
  ClaimDailyBonusResponse,
} from "@workspace/api-zod";

const router = Router();

const INITIAL_BALANCE = 10000;
const DAILY_BONUS = 500;

router.get("/users/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const db = getFirestore();
    const doc = await db.collection("users").doc(req.uid!).get();

    if (!doc.exists) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    const data = doc.data()!;
    res.json(GetMeResponse.parse({
      uid: req.uid,
      displayName: data.displayName ?? "",
      email: data.email ?? "",
      photoURL: data.photoURL ?? null,
      walletBalance: data.walletBalance ?? INITIAL_BALANCE,
      stream: data.stream ?? null,
      username: data.username ?? null,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      lastDailyBonus: data.lastDailyBonus?.toDate?.()?.toISOString() ?? null,
      totalBets: data.totalBets ?? 0,
      totalWon: data.totalWon ?? 0,
    }));
  } catch (err) {
    req.log.error({ err }, "getMe error");
    res.status(503).json({ error: "Service unavailable" });
  }
});

router.patch("/users/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const parsed = UpdateProfileBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const db = getFirestore();
    const ref = db.collection("users").doc(req.uid!);
    const update: Record<string, unknown> = {};

    if (parsed.data.displayName !== undefined) update.displayName = parsed.data.displayName;
    if (parsed.data.stream !== undefined) update.stream = parsed.data.stream;
    if (parsed.data.username !== undefined) update.username = parsed.data.username;

    await ref.update(update);
    const doc = await ref.get();
    const data = doc.data()!;

    res.json(UpdateProfileResponse.parse({
      uid: req.uid,
      displayName: data.displayName ?? "",
      email: data.email ?? "",
      photoURL: data.photoURL ?? null,
      walletBalance: data.walletBalance ?? INITIAL_BALANCE,
      stream: data.stream ?? null,
      username: data.username ?? null,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      lastDailyBonus: data.lastDailyBonus?.toDate?.()?.toISOString() ?? null,
      totalBets: data.totalBets ?? 0,
      totalWon: data.totalWon ?? 0,
    }));
  } catch (err) {
    req.log.error({ err }, "updateProfile error");
    res.status(503).json({ error: "Service unavailable" });
  }
});

router.post("/users/me/profile", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const parsed = CreateProfileBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const db = getFirestore();
    const ref = db.collection("users").doc(req.uid!);
    const existing = await ref.get();

    if (existing.exists) {
      res.status(409).json({ error: "Profile already exists" });
      return;
    }

    const now = new Date();
    const userData = {
      uid: req.uid,
      displayName: parsed.data.displayName,
      email: "",
      photoURL: null,
      walletBalance: INITIAL_BALANCE,
      stream: parsed.data.stream ?? null,
      username: parsed.data.username ?? null,
      createdAt: now,
      lastDailyBonus: null,
      totalBets: 0,
      totalWon: 0,
    };

    await ref.set(userData);

    res.status(201).json(GetMeResponse.parse({
      ...userData,
      createdAt: now.toISOString(),
      lastDailyBonus: null,
    }));
  } catch (err) {
    req.log.error({ err }, "createProfile error");
    res.status(503).json({ error: "Service unavailable" });
  }
});

router.post("/users/me/daily-bonus", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const db = getFirestore();
    const ref = db.collection("users").doc(req.uid!);
    const doc = await ref.get();

    if (!doc.exists) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    const data = doc.data()!;
    const lastBonus = data.lastDailyBonus?.toDate?.() ?? null;
    const now = new Date();

    if (lastBonus) {
      const hoursSince = (now.getTime() - lastBonus.getTime()) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        const nextClaim = new Date(lastBonus.getTime() + 24 * 60 * 60 * 1000);
        res.json(ClaimDailyBonusResponse.parse({
          claimed: false,
          bonus: null,
          nextClaimAt: nextClaim.toISOString(),
          message: "Already claimed today",
        }));
        return;
      }
    }

    await ref.update({
      walletBalance: (data.walletBalance ?? 0) + DAILY_BONUS,
      lastDailyBonus: now,
    });

    res.json(ClaimDailyBonusResponse.parse({
      claimed: true,
      bonus: DAILY_BONUS,
      nextClaimAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      message: `Claimed ${DAILY_BONUS} daily bonus!`,
    }));
  } catch (err) {
    req.log.error({ err }, "claimDailyBonus error");
    res.status(503).json({ error: "Service unavailable" });
  }
});

export default router;

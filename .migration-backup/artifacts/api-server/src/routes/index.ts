import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import marketsRouter from "./markets";
import betsRouter from "./bets";
import leaderboardRouter from "./leaderboard";
import adminRouter from "./admin";
import seedRouter from "./seed";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(marketsRouter);
router.use(betsRouter);
router.use(leaderboardRouter);
router.use(adminRouter);
router.use(seedRouter);

export default router;

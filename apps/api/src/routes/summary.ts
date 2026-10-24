import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../types/auth.js";
import { paiseToRupees } from "../utils/money.js";
import { calculateSummary } from "../utils/summary.js";

export const summaryRouter = Router();
summaryRouter.use(requireAuth);

summaryRouter.get("/", async (req, res) => {
  const { userId } = req as AuthenticatedRequest;
  const loans = await prisma.loan.findMany({
    where: { userId },
    select: { amountPaise: true, isRepaid: true, dueDate: true },
  });
  const summary = calculateSummary(loans);

  res.json({
    summary: {
      totalLent: paiseToRupees(summary.totalLentPaise),
      totalRepaid: paiseToRupees(summary.totalRepaidPaise),
      outstanding: paiseToRupees(summary.outstandingPaise),
      overdueAmount: paiseToRupees(summary.overduePaise),
    },
  });
});

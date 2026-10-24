import { Router } from "express";
import type { AuthenticatedRequest } from "../types/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import { toDateOnly, todayDateOnly } from "../utils/date.js";
import { paiseToRupees, rupeesToPaise } from "../utils/money.js";
import { createLoanSchema } from "../validation.js";

export const loansRouter = Router();
loansRouter.use(requireAuth);

function loanResponse(loan: {
  id: string;
  friendName: string;
  amountPaise: number;
  dueDate: Date;
  isRepaid: boolean;
  repaidAt: Date | null;
  createdAt: Date;
}) {
  const dueDate = toDateOnly(loan.dueDate);
  return {
    id: loan.id,
    friendName: loan.friendName,
    amount: paiseToRupees(loan.amountPaise),
    dueDate,
    isRepaid: loan.isRepaid,
    isOverdue: !loan.isRepaid && dueDate < todayDateOnly(),
    repaidAt: loan.repaidAt?.toISOString() ?? null,
    createdAt: loan.createdAt.toISOString(),
  };
}

loansRouter.get("/", async (req, res) => {
  const { userId } = req as AuthenticatedRequest;
  const loans = await prisma.loan.findMany({
    where: { userId },
    orderBy: [{ isRepaid: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
  });

  res.json({ loans: loans.map(loanResponse) });
});

loansRouter.post("/", async (req, res) => {
  const { userId } = req as AuthenticatedRequest;
  const parsed = createLoanSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Invalid loan details" },
    });
    return;
  }

  const loan = await prisma.loan.create({
    data: {
      userId,
      friendName: parsed.data.friendName,
      amountPaise: rupeesToPaise(parsed.data.amount),
      dueDate: new Date(`${parsed.data.dueDate}T00:00:00.000Z`),
    },
  });

  res.status(201).json({ loan: loanResponse(loan) });
});

loansRouter.patch("/:id/repaid", async (req, res) => {
  const { userId } = req as unknown as AuthenticatedRequest;
  const loan = await prisma.loan.findFirst({ where: { id: req.params.id, userId } });

  if (!loan) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Loan entry was not found" } });
    return;
  }

  const updated = loan.isRepaid
    ? loan
    : await prisma.loan.update({
        where: { id: loan.id },
        data: { isRepaid: true, repaidAt: new Date() },
      });

  res.json({ loan: loanResponse(updated) });
});


import { todayDateOnly, toDateOnly } from "./date.js";

export interface SummaryLoan {
  amountPaise: number;
  isRepaid: boolean;
  dueDate: Date;
}

export interface LoanSummary {
  totalLentPaise: number;
  totalRepaidPaise: number;
  outstandingPaise: number;
  overduePaise: number;
}

export function calculateSummary(
  loans: SummaryLoan[],
  today = todayDateOnly(),
): LoanSummary {
  return loans.reduce<LoanSummary>(
    (summary, loan) => {
      summary.totalLentPaise += loan.amountPaise;

      if (loan.isRepaid) {
        summary.totalRepaidPaise += loan.amountPaise;
      } else {
        summary.outstandingPaise += loan.amountPaise;
        if (toDateOnly(loan.dueDate) < today) {
          summary.overduePaise += loan.amountPaise;
        }
      }

      return summary;
    },
    {
      totalLentPaise: 0,
      totalRepaidPaise: 0,
      outstandingPaise: 0,
      overduePaise: 0,
    },
  );
}

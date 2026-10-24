import { describe, expect, it } from "vitest";
import { isValidDateOnly } from "../src/utils/date.js";
import { paiseToRupees, rupeesToPaise } from "../src/utils/money.js";
import { isValidPhone, normalizePhone } from "../src/utils/phone.js";
import { calculateSummary } from "../src/utils/summary.js";
import { createLoanSchema } from "../src/validation.js";

describe("phone helpers", () => {
  it("normalizes a ten-digit Indian number", () => {
    expect(normalizePhone("98765 43210")).toBe("+919876543210");
  });

  it("accepts E.164 numbers and rejects short numbers", () => {
    expect(isValidPhone("+919876543210")).toBe(true);
    expect(isValidPhone("+123")).toBe(false);
  });
});

describe("date and money helpers", () => {
  it("rejects impossible dates", () => {
    expect(isValidDateOnly("2026-02-30")).toBe(false);
  });

  it("converts rupees without floating-point drift", () => {
    expect(rupeesToPaise(1250.75)).toBe(125075);
    expect(paiseToRupees(125075)).toBe(1250.75);
  });

  it("rejects amounts with more than two decimal places", () => {
    expect(createLoanSchema.safeParse({ friendName: "Asha", amount: 10.123, dueDate: "2026-11-01" }).success).toBe(false);
  });
});

describe("summary calculation", () => {
  it("separates repaid, outstanding, and overdue totals", () => {
    const summary = calculateSummary(
      [
        { amountPaise: 10000, isRepaid: false, dueDate: new Date("2026-10-20T00:00:00.000Z") },
        { amountPaise: 25000, isRepaid: false, dueDate: new Date("2026-10-24T00:00:00.000Z") },
        { amountPaise: 5000, isRepaid: true, dueDate: new Date("2026-10-10T00:00:00.000Z") },
      ],
      "2026-10-24",
    );

    expect(summary).toEqual({
      totalLentPaise: 40000,
      totalRepaidPaise: 5000,
      outstandingPaise: 35000,
      overduePaise: 10000,
    });
  });
});

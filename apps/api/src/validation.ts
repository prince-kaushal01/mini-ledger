import { z } from "zod";
import { isValidDateOnly } from "./utils/date.js";
import { isValidPhone, normalizePhone } from "./utils/phone.js";

const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .transform(normalizePhone)
  .refine(isValidPhone, "Enter a valid phone number with country code");

export const requestOtpSchema = z.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: z.string().regex(/^\d{6}$/, "OTP must contain six digits"),
});

export const createLoanSchema = z.object({
  friendName: z.string().trim().min(2, "Friend name must contain at least 2 characters").max(80),
  amount: z
    .coerce.number()
    .positive("Amount must be greater than zero")
    .max(20_000_000, "Amount is too large")
    .refine((value) => Number.isInteger(value * 100), "Use at most two decimal places"),
  dueDate: z.string().refine(isValidDateOnly, "Due date must be a valid YYYY-MM-DD date"),
});

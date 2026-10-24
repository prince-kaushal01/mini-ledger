import { randomInt } from "node:crypto";
import { Router } from "express";
import { env } from "../env.js";
import { prisma } from "../prisma.js";
import { createToken } from "../utils/jwt.js";
import { requestOtpSchema, verifyOtpSchema } from "../validation.js";

interface OtpChallenge {
  code: string;
  expiresAt: number;
}

const challenges = new Map<string, OtpChallenge>();

export const authRouter = Router();

authRouter.post("/request-otp", (req, res) => {
  const parsed = requestOtpSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Invalid phone number" },
    });
    return;
  }

  const code = randomInt(100000, 1_000_000).toString();
  const expiresAt = Date.now() + env.OTP_TTL_MINUTES * 60_000;
  challenges.set(parsed.data.phone, { code, expiresAt });

  console.info(`[MiniLedger OTP] ${parsed.data.phone} -> ${code} (valid for ${env.OTP_TTL_MINUTES} minutes)`);
  res.json({ message: "OTP generated. Check the API terminal." });
});

authRouter.post("/verify-otp", async (req, res) => {
  const parsed = verifyOtpSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Invalid OTP" },
    });
    return;
  }

  const challenge = challenges.get(parsed.data.phone);
  if (!challenge || challenge.expiresAt < Date.now() || challenge.code !== parsed.data.otp) {
    res.status(401).json({ error: { code: "INVALID_OTP", message: "The OTP is incorrect or has expired" } });
    return;
  }

  challenges.delete(parsed.data.phone);
  const user = await prisma.user.upsert({
    where: { phone: parsed.data.phone },
    update: {},
    create: { phone: parsed.data.phone },
    select: { id: true, phone: true },
  });

  res.json({ token: createToken(user.id), user });
});

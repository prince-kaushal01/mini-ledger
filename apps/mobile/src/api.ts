import { Platform } from "react-native";

export interface User {
  id: string;
  phone: string;
}

export interface Loan {
  id: string;
  friendName: string;
  amount: number;
  dueDate: string;
  isRepaid: boolean;
  isOverdue: boolean;
  repaidAt: string | null;
  createdAt: string;
}

export interface Summary {
  totalLent: number;
  totalRepaid: number;
  outstanding: number;
  overdueAmount: number;
}

const fallbackUrl = Platform.OS === "android"
  ? "http://10.0.2.2:4000/api"
  : "http://localhost:4000/api";

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? fallbackUrl;

class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(body.error?.message ?? "Unable to complete the request", response.status);
  }
  return body as T;
}

export const api = {
  requestOtp: (phone: string) =>
    request<{ message: string }>("/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ phone }),
    }),

  verifyOtp: (phone: string, otp: string) =>
    request<{ token: string; user: User }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, otp }),
    }),

  getLoans: (token: string) => request<{ loans: Loan[] }>("/loans", {}, token),

  getSummary: (token: string) => request<{ summary: Summary }>("/summary", {}, token),

  createLoan: (token: string, input: { friendName: string; amount: number; dueDate: string }) =>
    request<{ loan: Loan }>("/loans", { method: "POST", body: JSON.stringify(input) }, token),

  markRepaid: (token: string, id: string) =>
    request<{ loan: Loan }>(`/loans/${id}/repaid`, { method: "PATCH" }, token),
};

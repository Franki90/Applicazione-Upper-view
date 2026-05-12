import { AdminAnalytics, AdminAuthResponse, PendingOffer } from "./types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH";
  token?: string;
  body?: unknown;
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message ?? "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

export const adminLogin = (email: string, password: string) =>
  request<AdminAuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password }
  });

export const fetchAnalytics = (token: string) =>
  request<AdminAnalytics>("/admin/analytics", { token });

export const fetchPendingOffers = (token: string) =>
  request<PendingOffer[]>("/admin/offers/pending", { token });

export const moderateOffer = (token: string, offerId: string, status: "APPROVED" | "REJECTED") =>
  request<{ notifications: number }>(`/admin/offers/${offerId}/moderate`, {
    method: "PATCH",
    token,
    body: { status }
  });

export const runReminderJobs = (token: string) =>
  request<{ offers: { offers: number; notifications: number }; subscriptions: { subscriptions: number; notifications: number } }>(
    "/notifications/run-reminders",
    {
      method: "POST",
      token
    }
  );

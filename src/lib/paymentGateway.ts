const getBackendBaseUrl = () => {
  const value = (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000").trim();
  return value.replace(/\/$/, "");
};

export type CheckoutType = "course" | "video" | "booking" | "subscription";
export type SubscriptionPlan = "monthly" | "yearly";

export type CheckoutInitPayload = {
  email: string;
  user_id: string;
  type: CheckoutType;
  amount?: number;
  content_id?: string;
  content_title?: string;
  plan?: SubscriptionPlan;
};

export const initializeCheckout = async (payload: CheckoutInitPayload) => {
  const response = await fetch(`${getBackendBaseUrl()}/api/checkout/initialize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "Unable to start secure checkout");
  }
  return data as {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

export const verifyCheckout = async (reference: string) => {
  const response = await fetch(`${getBackendBaseUrl()}/api/checkout/verify?reference=${encodeURIComponent(reference)}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "Unable to verify payment");
  }
  return data as {
    success: boolean;
    purpose: CheckoutType;
    reference: string;
    redirectTo?: string;
    message?: string;
  };
};

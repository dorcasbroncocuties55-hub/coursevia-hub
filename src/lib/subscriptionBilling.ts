const getBackendBaseUrl = () => {
  const value = (import.meta.env.VITE_BACKEND_URL || "http://localhost:5000").trim();
  return value.replace(/\/$/, "");
};

export const initializeLearnerSubscription = async (email: string, userId: string, plan: "monthly" | "yearly" = "monthly") => {
  const response = await fetch(`${getBackendBaseUrl()}/api/subscriptions/initialize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      user_id: userId,
      plan,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Unable to start subscription checkout");
  }

  return data as {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

export const verifyLearnerSubscription = async (reference: string) => {
  const response = await fetch(
    `${getBackendBaseUrl()}/api/subscriptions/verify?reference=${encodeURIComponent(reference)}`
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Unable to verify subscription");
  }

  return data as {
    success: boolean;
    reference: string;
    purpose: string;
    redirectTo?: string;
    message?: string;
  };
};

export const cancelLearnerSubscription = async (userId: string) => {
  const response = await fetch(`${getBackendBaseUrl()}/api/subscriptions/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Unable to cancel subscription");
  }

  return data as { success: boolean };
};

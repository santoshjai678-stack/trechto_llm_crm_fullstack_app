import api from "./api";

// 📋 Get subscriptions list with params (search, sort, pagination)
export const getSubscriptionList = async (params = {}) => {
  try {
    const res = await api.get("/get_subscription_list", { params });
    return res.data; // { status, data, pagination, ... }
  } catch (error) {
    console.error("Subscription list API Error:", error);
    return null;
  }
};

// ➕ Add subscription
export const addSubscription = (data) => {
  return api.post("/add_subscription", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// ✏️ Update subscription
export const updateSubscription = (data) => {
  return api.post("/update_subscription", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// 🔁 View subscription
export const viewSubscriptionStatus = (data) => {
  return api.post("/show_subscription", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// 🔁 Update subscription status
export const updateSubscriptionStatus = (data) => {
  return api.post("/update_subscription_status", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// 🗑 Delete subscription
export const deleteSubscription = (data) => {
  return api.post("/delete_subscription", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};


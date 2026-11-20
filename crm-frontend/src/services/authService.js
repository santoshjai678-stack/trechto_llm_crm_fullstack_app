import api from "./api";

export const loginApi = (data) => api.post("/login", data);
export const profileApi = () => api.get("/profile");
export const forgotPasswordApi = (data) => api.post("/forgot-password", data);
export const resetPasswordApi = (data) => api.post("/reset-password-by-token", data);
export const logout = () => api.get("/logout");

export const profileUpdateApi = (data) => {
  return api.post("/update-profile", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const ChangePasswordApi = (data) => {
  return api.post("/change-password", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

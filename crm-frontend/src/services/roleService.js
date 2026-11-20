import api from "./api";
import { extractData } from "../utils/apiHelper";

// 👥 Get all roles for dropdown
export const getRoles = async () => {
  try {
    const res = await api.get("/get_role");
    return extractData(res);
  } catch (error) {
    return [];
  }
};

// 👥 Get roles list with params
export const getRolesList = async (params = {}) => {
  try {
    const res = await api.get("/get_role_list", { params });
    return res.data; // return full response (data + pagination)
  } catch (error) {
    console.error("Role API Error:", error);
    return null;
  }
};

export const updateRoleStatus = (data) => {
  return api.post("/update_role_status", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const addRole = (data) => {
  return api.post("/add_role", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const updateRole = (data) => {
  return api.post("/update_role", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const deleteRole = (data) => {
  return api.post("/delete_role", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
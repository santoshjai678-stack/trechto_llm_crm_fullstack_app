import api from "./api";

// 📋 Get branch dropdown (useful for selecting parent branch)
// Defaults to fetching only main branches (is_this_main_branch=1).
export const getBranchDropdown = async (params = { is_this_main_branch: 1 }) => {
  try {
    const res = await api.get("/get_branch", { params });
    return res.data;
  } catch (error) {
    return [];
  }
};

export const getBranchSubbranchDropdown = async () => {
  try {
    const res = await api.get("/get_branch_subbranch");
    return res.data;
  } catch (error) {
    return [];
  }
};

// 📋 Get subscriptions list with params (search, sort, pagination)
export const getBranchList = async (params = {}, signal = null) => {
  try {
    const config = { params };
    if (signal) config.signal = signal;

    const res = await api.get("/get_branch_list", config);
    return res.data; // { status, data, pagination, ... }
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") return null;
    console.error("Branch list API Error:", error);
    return null;
  }
};

// ➕ Add branch
export const addBranch = (data) => {
  return api.post("/add_branch", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// ✏️ Update branch
export const updateBranch = (data) => {
  return api.post("/update_branch", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 🔁 View branch
export const viewBranch = (data) => {
  return api.post("/show_branch", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// 🔁 Update branch status
export const updateBranchStatus = (data) => {
  return api.post("/update_branch_status", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// 🗑 Delete branch
export const deleteBranch = (data) => {
  return api.post("/delete_branch", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};


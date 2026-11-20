import api from "./api";
import { extractData } from "../utils/apiHelper";

// 👥 Get all roles for dropdown
export const getEmployeeDropdown = async () => {
  try {
    const res = await api.get("/get_employee");
    return extractData(res);
  } catch (error) {
    return [];
  }
};

export const getEmployeeList = (params, signal = null) => {
  return api.get("/get_employee_list", { params, signal });
};

export const addEmployee = (data) => {
  return api.post("/add_employee", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateEmployee = (data) => {
  return api.post("/update_employee", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const viewEmployee = (data) => {
  return api.post("/view_employee", data);
};

export const updateEmployeeStatus = (data) => {
  return api.post("/update_employee_status", data);
};

export const deleteEmployee = (data) => {
  return api.post("/delete_employee", data);
};

export const getBranchDropdown = async () => {
  try {
    const res = await api.get("/get_branch");
    return res.data;
  } catch (error) {
    return [];
  }
};

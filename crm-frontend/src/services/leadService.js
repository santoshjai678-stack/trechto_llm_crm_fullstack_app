import api from "./api";

export const getLeads = (params = {}, signal = null) => {
  const config = { params };
  if (signal) config.signal = signal;
  return api.get("/get_leads", config);
};

export const addLead = (data) => {
  return api.post("/add_lead", data);
};

export const updateLead = (data) => {
  return api.post("/update_lead", data);
};

export const viewLead = (id) => {
  return api.get(`/view_lead/${id}`);
};

export const updateLeadStatus = (data) => {
  return api.post("/update_lead_status", data);
};

export const deleteLead = (id) => {
  return api.delete(`/delete_lead/${id}`);
};

export const getSalesExecutives = (params = {}, signal = null) => {
  const config = { params };
  if (signal) config.signal = signal;
  return api.get("/get_sales_executives", config);
};
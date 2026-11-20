import api from "./api";

export const getDynamicLeadFields = (params = {}, signal = null) => {
  const config = { params };
  if (signal) config.signal = signal;
  return api.get("/get_dynamic_lead_fields", config);
};

export const addDynamicLeadField = (data) => {
  return api.post("/add_dynamic_lead_field", data);
};

export const updateDynamicLeadField = (data) => {
  return api.post("/update_dynamic_lead_field", data);
};

export const viewDynamicLeadField = (id) => {
  return api.get(`/view_dynamic_lead_field/${id}`);
};

export const updateDynamicLeadFieldStatus = (data) => {
  return api.post("/update_dynamic_lead_field_status", data);
};

export const deleteDynamicLeadField = (id) => {
  return api.delete(`/delete_dynamic_lead_field/${id}`);
};

export const getDynamicFieldOptions = (params = {}, signal = null) => {
  const config = { params };
  if (signal) config.signal = signal;
  return api.get("/get_dynamic_field_options", config);
};

export const getDynamicLeadFieldsDropdown = (params = {}, signal = null) => {
  const config = { params };
  if (signal) config.signal = signal;
  return api.get("/get_dynamic_lead_fields_dropdown", config);
};
export const getDynamicLeadFieldsForFilter = (params = {}, signal = null) => {
  const config = { params };
  if (signal) config.signal = signal;
  return api.get("/get_dynamic_lead_fields_for_filter", config);
};

export const getDynamicLeadFieldsForDatatableList = (params = {}, signal = null) => {
  const config = { params };
  if (signal) config.signal = signal;
  return api.get("/get_dynamic_lead_fields_for_datatable_list", config);
};
export const getDynamicFieldOptionsDropdown = (params = {}, signal = null) => {
  const config = { params };
  if (signal) config.signal = signal;
  return api.get("/get_dynamic_field_options_dropdown", config);
};

export const addUpdateDynamicFieldOption = (data) => {
  return api.post("/add_update_dynamic_field_option", data);
};

export const viewDynamicFieldOption = (id) => {
  return api.get(`/view_dynamic_field_option/${id}`);
};

export const updateDynamicFieldOptionStatus = (data) => {
  return api.post("/update_dynamic_field_option_status", data);
};

export const deleteDynamicFieldOption = (id) => {
  return api.delete(`/delete_dynamic_field_option/${id}`);
};

import api from "./api";

export const getFormSections = (params, signal = null) => {
  return api.get("/get_form_sections", { params, signal });
};

export const getFormSectionsDropdown = (params, signal = null) => {
  return api.get("/get_form_sections_dropdown", { params, signal });
};

export const addFormSection = (data) => {
  return api.post("/add_form_section", data);
};

export const updateFormSection = (data) => {
  return api.post("/update_form_section", data);
};

export const viewFormSection = (id) => {
  return api.get(`/view_form_section/${id}`);
};

export const updateFormSectionStatus = (data) => {
  return api.post("/update_form_section_status", data);
};

export const deleteFormSection = (id) => {
  return api.delete(`/delete_form_section/${id}`);
};

export const getFormSectionsWithFields = (params, signal = null) => {
  return api.get("/get_form_sections_with_fields", { params, signal });
};

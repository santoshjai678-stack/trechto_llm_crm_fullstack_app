import api from "./api";

export const getCommentDropdown = (params, signal = null) => {
  return api.get("/get_comment_dropdown", { params, signal });
};

export const getComments = (params, signal = null) => {
  return api.get("/get_comments", { params, signal });
};

export const addComment = (data) => {
  return api.post("/add_comment", data);
};

export const updateComment = (data) => {
  return api.post("/update_comment", data);
};

export const viewComment = (id) => {
  return api.get(`/view_comment/${id}`);
};

export const updateCommentStatus = (data) => {
  return api.post("/update_comment_status", data);
};

export const deleteComment = (id) => {
  return api.delete(`/delete_comment/${id}`);
};

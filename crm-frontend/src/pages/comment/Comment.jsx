import React, { useEffect, useState, useCallback, useContext } from "react";
import DataTable from "react-data-table-component";
import debounce from "lodash.debounce";
import Swal from "sweetalert2";
import { getComments, addComment, updateComment, viewComment, updateCommentStatus, deleteComment } from "../../services/commentService";
import { getBranchSubbranchDropdown } from "../../services/branchService";
import { UserContext } from "../../context/UserContext";

const Comment = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [search, setSearch] = useState("");
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");

  const [branchOptions, setBranchOptions] = useState([]);
  const [viewData, setViewData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [modalMode, setModalMode] = useState("add");
  const [formData, setFormData] = useState({
    id: null,
    branch_id: "",
    comment: "",
    is_comment_for_crm: 1,
    status: 1,
  });

  const { user } = useContext(UserContext);
  const isAdminOrOwner = user?.role_id === 1 || user?.role_id === 2;

  const loadBranches = async () => {
    if (!isAdminOrOwner) return;
    const res = await getBranchSubbranchDropdown();
    const list = res?.data?.data ?? res?.data ?? res;
    setBranchOptions(list || []);
  };

  const fetchComments = useCallback(async (signal = null) => {
    setLoading(true);
    try {
      const res = await getComments(
        {
          search,
          sort_by: sortColumn,
          sort_order: sortDirection,
          per_page: perPage,
          page,
        },
        signal
      );

      if (signal?.aborted) return;

      const payload = res?.data;
      if (payload?.status === "true") {
        setComments(payload.data || []);
        setTotalRows(payload.pagination?.total || 0);
      } else {
        setComments([]);
        setTotalRows(0);
      }
    } catch (err) {
      if (!signal?.aborted) {
        setComments([]);
        setTotalRows(0);
      }
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, sortColumn, sortDirection]);

  useEffect(() => { loadBranches(); }, [isAdminOrOwner]);

  useEffect(() => {
    const controller = new AbortController();
    fetchComments(controller.signal);
    return () => controller.abort();
  }, [fetchComments]);

  const debouncedSearch = useCallback(debounce((value) => { setPage(1); setSearch(value); }, 500), []);

  const handleSearch = (e) => { debouncedSearch(e.target.value); };

  const resetForm = () => {
    setFormData({ id: null, branch_id: isAdminOrOwner ? "" : user?.branch_id || "", comment: "", is_comment_for_crm: 1, status: 1 });
    setErrors({});
    setModalMode("add");
  };

  const handleEdit = (row) => {
    setModalMode("edit");
    setFormData({ id: row.id, branch_id: isAdminOrOwner ? (row.branch_id || "") : (user?.branch_id || ""), comment: row.comment || "", is_comment_for_crm: row.is_comment_for_crm || 1, status: row.status || 0 });
    setErrors({});
    const offcanvasEl = document.getElementById("offcanvas_comment");
    const offcanvas = new window.bootstrap.Offcanvas(offcanvasEl);
    offcanvas.show();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const payload = {
        branch_id: isAdminOrOwner ? formData.branch_id : user?.branch_id,
        comment: formData.comment,
        is_comment_for_crm: formData.is_comment_for_crm,
        status: formData.status,
      };

      if (modalMode === "edit") {
        payload.comment_id = formData.id;
        await updateComment(payload);
      } else {
        await addComment(payload);
      }

      Swal.fire({ icon: "success", title: modalMode === "edit" ? "Updated" : "Created", text: `Comment ${modalMode === "edit" ? "updated" : "created"} successfully.`, confirmButtonColor: "#3085d6", timer: 2500, timerProgressBar: true, showConfirmButton: false });

      const offcanvasEl = document.getElementById("offcanvas_comment");
      const offcanvas = window.bootstrap.Offcanvas.getInstance(offcanvasEl);
      offcanvas?.hide();

      resetForm();
      fetchComments();
    } catch (err) {
      if (err.response?.status === 422) {
        const apiErrors = err.response?.data?.errors;
        const formatted = {};
        Object.keys(apiErrors || {}).forEach((key) => {
          formatted[key] = Array.isArray(apiErrors[key]) ? apiErrors[key].join(", ") : apiErrors[key];
        });
        setErrors(formatted);
      } else {
        Swal.fire({ icon: "error", title: "Error", text: "Something went wrong", timer: 3000, timerProgressBar: true, showConfirmButton: false });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (row) => {
    const newStatus = row.status === 1 ? 0 : 1;
    await updateCommentStatus({ comment_id: row.id, status: newStatus });
    fetchComments();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await deleteComment(deleteId);
      if (res?.data?.status === "true") {
        Swal.fire({ icon: "success", title: "Deleted", text: "Comment deleted successfully", timer: 2500, timerProgressBar: true, showConfirmButton: false });
        setDeleteId(null);
        const modalEl = document.getElementById("delete_comment");
        const modal = window.bootstrap.Modal.getInstance(modalEl);
        modal?.hide();
        fetchComments();
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || "Failed to delete comment", timer: 3000, timerProgressBar: true, showConfirmButton: false });
    }
  };

  const handleView = async (id) => {
    try {
      const res = await viewComment(id);
      if (res?.data?.status === "true") {
        setViewData(res.data.data);
        const modalEl = document.getElementById("view_comment");
        const modal = new window.bootstrap.Modal(modalEl);
        modal.show();
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "Unable to load record" });
    }
  };

  const columns = [
    { name: "Comment", selector: (row) => row.comment, sortField: "comment", sortable: true },
    ...(isAdminOrOwner ? [{ name: "Branch", selector: (row) => row.branch?.name || "-", sortable: false }] : []),
    { name: "Type", selector: (row) => (row.is_comment_for_crm === 1 ? "CRM" : "LMS"), sortable: true },
    { name: "Status", cell: (row) => (<div className="form-check form-switch"><input type="checkbox" className="form-check-input" checked={row.status === 1} onChange={() => handleStatusChange(row)} /></div>), sortable: false },
    { name: "Actions", cell: (row) => (<div className="dropdown table-action"><button className="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown"><i className="ti ti-dots-vertical"></i></button><div className="dropdown-menu dropdown-menu-end"><button className="dropdown-item" onClick={() => handleView(row.id)}><i className="ti ti-eye me-1"></i> View</button><button className="dropdown-item" onClick={() => handleEdit(row)}><i className="ti ti-edit text-blue me-1"></i> Edit</button><button className="dropdown-item" onClick={() => { setDeleteId(row.id); const modal = new window.bootstrap.Modal(document.getElementById('delete_comment')); modal.show(); }}><i className="ti ti-trash me-1"></i> Delete</button></div></div>), sortable: false }
  ];

  return (
    <>
      <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
        <div><h4 className="mb-1">Comments <span className="badge badge-soft-primary ms-2">{totalRows}</span></h4></div>
        <div className="gap-2 d-flex align-items-center flex-wrap"><button className="btn btn-primary" onClick={() => { resetForm(); setModalMode("add"); const offcanvas = new window.bootstrap.Offcanvas(document.getElementById("offcanvas_comment")); offcanvas.show(); }}>Add Comment</button></div>
      </div>

      <div className="card border-0 rounded-0">
        <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <div className="input-icon input-icon-start position-relative"><span className="input-icon-addon text-dark"><i className="ti ti-search" /></span><input type="text" className="form-control" placeholder="Search" onChange={handleSearch} /></div>
        </div>
        <div className="card-body">
          <DataTable columns={columns} data={comments} progressPending={loading} progressComponent={<div className="text-center p-4">Loading comments...</div>} pagination paginationServer paginationTotalRows={totalRows} paginationPerPage={perPage} paginationRowsPerPageOptions={[10,25,50,100]} onChangePage={(page) => setPage(page)} onChangeRowsPerPage={(newPerPage) => { setPerPage(newPerPage); setPage(1); }} sortServer onSort={(column, direction) => { if (column.sortField) { setSortColumn(column.sortField); setSortDirection(direction); } }} highlightOnHover responsive striped />
        </div>
      </div>

      <div className="offcanvas offcanvas-end offcanvas-large" tabIndex="-1" id="offcanvas_comment">
        <div className="offcanvas-header border-bottom"><h5>{modalMode === "edit" ? "Edit Comment" : "Add Comment"}</h5><button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button></div>
        <div className="offcanvas-body"><form onSubmit={handleSubmit}>
          {isAdminOrOwner && <div className="mb-3"><label className="form-label">Branch <span className="text-danger">*</span></label><select name="branch_id" className={`form-control ${errors.branch_id ? 'is-invalid' : ''}`} value={formData.branch_id} onChange={(e) => setFormData({...formData, branch_id: e.target.value})} required><option value="">Select Branch</option>{branchOptions.map((branch) => (<option key={branch.id} value={branch.id}>{branch.name}</option>))}</select>{errors.branch_id && <small className="text-danger">{errors.branch_id}</small>}</div>}
          <div className="mb-3"><label className="form-label">Comment <span className="text-danger">*</span></label><textarea className={`form-control ${errors.comment ? 'is-invalid' : ''}`} value={formData.comment} onChange={(e) => setFormData({...formData, comment: e.target.value})} required rows={3}></textarea>{errors.comment && <small className="text-danger">{errors.comment}</small>}</div>
          <div className="mb-3"><label className="form-label">Type</label><select className="form-control" value={formData.is_comment_for_crm} onChange={(e) => setFormData({...formData, is_comment_for_crm: parseInt(e.target.value, 10)})}><option value={1}>CRM</option><option value={0}>LMS</option></select></div>
          <div className="mb-3 form-check form-switch"><input className="form-check-input" type="checkbox" id="commentStatus" checked={formData.status === 1} onChange={(e) => setFormData({...formData, status: e.target.checked ? 1 : 0})} /><label className="form-check-label" htmlFor="commentStatus">Active</label></div>
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Saving..." : modalMode === "edit" ? "Update" : "Save"}</button>
        </form></div>
      </div>

      <div className="modal fade" id="view_comment" tabIndex="-1"><div className="modal-dialog modal-dialog-centered"><div className="modal-content"><div className="modal-header"><h5 className="modal-title">Comment Details</h5><button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div className="modal-body">{viewData ? (<><p><strong>Comment:</strong> {viewData.comment}</p>{isAdminOrOwner && <p><strong>Branch:</strong> {viewData.branch?.name ?? '-'}</p>}<p><strong>Type:</strong> {viewData.is_comment_for_crm === 1 ? 'CRM' : 'LMS'}</p><p><strong>Status:</strong> {viewData.status === 1 ? 'Active' : 'Inactive'}</p></>) : <p>Loading...</p>}</div></div></div></div>

      <div className="modal fade" id="delete_comment" tabIndex="-1"><div className="modal-dialog modal-dialog-centered"><div className="modal-content"><div className="modal-header"><h5 className="modal-title">Delete Comment</h5><button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div className="modal-body"><p>Are you sure you want to delete this comment?</p></div><div className="modal-footer"><button className="btn btn-secondary" type="button" data-bs-dismiss="modal">Cancel</button><button className="btn btn-danger" type="button" onClick={confirmDelete}>Delete</button></div></div></div></div>
    </>
  );
};

export default Comment;

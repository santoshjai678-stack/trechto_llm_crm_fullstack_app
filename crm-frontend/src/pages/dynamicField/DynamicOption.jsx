import React, { useEffect, useState, useCallback, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import DataTable from "react-data-table-component";
import debounce from "lodash.debounce";
import Swal from "sweetalert2";
import {
  getDynamicFieldOptions,
  getDynamicFieldOptionsDropdown,
  getDynamicLeadFieldsDropdown,
  addUpdateDynamicFieldOption,
  viewDynamicFieldOption,
  updateDynamicFieldOptionStatus,
  deleteDynamicFieldOption,
} from "../../services/dynamicFieldService";
import { UserContext } from "../../context/UserContext";

const allowedInputTypes = ["select", "checkbox", "radio"];

const DynamicOption = () => {
  const { user } = useContext(UserContext);
  const [searchParams] = useSearchParams();

  const [options, setOptions] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [search, setSearch] = useState("");
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");

  const [selectedFieldId, setSelectedFieldId] = useState(null);

  const [modalMode, setModalMode] = useState("add");
  const [formData, setFormData] = useState({
    id: null,
    field_id: "",
    branch_id: user?.branch_id || "",
    name: "",
    value: "",
    status: 1,
  });

  const selectedField = fields.find((field) => Number(field.id) === Number(selectedFieldId));

  const [deleteId, setDeleteId] = useState(null);

  const fetchFields = async () => {
    try {
      const res = await getDynamicLeadFieldsDropdown();
      const data = res?.data?.data || [];
      const filtered = data.filter((field) => allowedInputTypes.includes(field.input_type));
      setFields(filtered);

      const queryFieldEncoded = searchParams.get("field_id");
      const queryField = queryFieldEncoded ? parseInt(atob(queryFieldEncoded), 10) : null;
      if (queryField && filtered.some((f) => Number(f.id) === queryField)) {
        setSelectedFieldId(queryField);
      }

      if (!selectedFieldId && filtered.length > 0) {
        setSelectedFieldId((prev) => prev || filtered[0].id);
      }

      if (!formData.field_id && filtered.length > 0) {
        // ensure form's field_id is synced with selected field
        setFormData((prev) => ({ ...prev, field_id: selectedFieldId || filtered[0].id, branch_id: selectedField?.branch_id || prev.branch_id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOptions = async () => {
    setLoading(true);

    try {
      const params = {
        search,
        sort_by: sortColumn,
        sort_order: sortDirection,
        per_page: perPage,
        page,
      };

      if (selectedFieldId) {
        params.field_id = selectedFieldId;
      }

      const res = await getDynamicFieldOptions(params);
      const payload = res?.data;

      if (payload?.status === "true") {
        setOptions(payload?.data || []);
        setTotalRows(payload?.pagination?.total || 0);
      } else {
        setOptions([]);
        setTotalRows(0);
      }
    } catch (err) {
      setOptions([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [page, perPage, sortColumn, sortDirection, search, selectedFieldId]);

  const debouncedSearch = useCallback(
    debounce((value) => {
      setPage(1);
      setSearch(value);
    }, 500),
    []
  );

  const handleSearch = (e) => {
    debouncedSearch(e.target.value);
  };

  const resetForm = () => {
    setFormData({
      id: null,
      field_id: selectedFieldId || "",
      branch_id: selectedField?.branch_id || user?.branch_id || "",
      name: "",
      value: "",
      status: 1,
    });
    setErrors({});
    setModalMode("add");
  };

  const handleEdit = async (row) => {
    setModalMode("edit");
    setErrors({});
    const selectedField = fields.find((f) => Number(f.id) === Number(row.field_id));
    setFormData({
      id: row.id,
      field_id: Number(row.field_id) || "",
      branch_id: selectedField?.branch_id || row.branch_id,
      name: row.name || "",
      value: row.value || "",
      status: row.status || 1,
    });
    const modal = new window.bootstrap.Modal(document.getElementById("add_edit_dynamic_option"));
    modal.show();
  };

  const handleView = async (id) => {
    try {
      const res = await viewDynamicFieldOption(id);
      if (res?.data?.status === "true") {
        const data = res.data.data;
        Swal.fire({
          title: "Dynamic Field Option",
          html: `<p><strong>ID:</strong> ${data.id}</p><p><strong>Field:</strong> ${data.field_name || "-"}</p><p><strong>Name:</strong> ${data.name}</p><p><strong>Value:</strong> ${data.value}</p><p><strong>Status:</strong> ${data.status === 1 ? "Active" : "Inactive"}</p>`,
          icon: "info",
        });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "Unable to load the dynamic field option" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Ensure field_id is properly set
    if (!formData.field_id) {
      setErrors({ field_id: "Please select a dynamic field" });
      setLoading(false);
      return;
    }

    const selectedFieldInPayload = fields.find((f) => Number(f.id) === Number(formData.field_id));
    const payloadBranchId = selectedFieldInPayload?.branch_id || formData.branch_id || user?.branch_id;

    const payload = {
      field_id: Number(formData.field_id),
      branch_id: Number(payloadBranchId),
      name: formData.name,
      value: formData.value,
      status: Number(formData.status),
    };

    if (modalMode === "edit") {
      payload.options_id = formData.id;
    }

    if (modalMode === "edit") {
      payload.options_id = formData.id;
    }

    try {
      await addUpdateDynamicFieldOption(payload);

      Swal.fire({
        icon: "success",
        title: modalMode === "edit" ? "Updated" : "Created",
        text: `Dynamic field option ${modalMode === "edit" ? "updated" : "created"} successfully.`,
        confirmButtonColor: "#3085d6",
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      const modalEl = document.getElementById("add_edit_dynamic_option");
      const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
      modalInstance?.hide();

      resetForm();
      fetchOptions();
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
    await updateDynamicFieldOptionStatus({ dynamic_field_option_id: row.id, status: newStatus });
    fetchOptions();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await deleteDynamicFieldOption(deleteId);
      if (res?.data?.status === "true") {
        Swal.fire({ icon: "success", title: "Deleted", text: "Dynamic field option deleted successfully", timer: 2500, timerProgressBar: true, showConfirmButton: false });
        setDeleteId(null);
        const modalEl = document.getElementById("delete_dynamic_option");
        const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
        modalInstance?.hide();
        fetchOptions();
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || "Failed to delete dynamic field option", timer: 3000, timerProgressBar: true, showConfirmButton: false });
    }
  };

  const columns = [
    { name: "ID", selector: (row) => row.id, sortField: "id", sortable: true },
    { name: "Field", selector: (row) => row.field_name || "-", sortable: true },
    { name: "Name", selector: (row) => row.name, sortField: "name", sortable: true },
    { name: "Value", selector: (row) => row.value, sortField: "value", sortable: true },
    {
      name: "Status",
      cell: (row) => (
        <div className="form-check form-switch">
          <input className="form-check-input" type="checkbox" checked={row.status === 1} onChange={() => handleStatusChange(row)} />
        </div>
      ),
      sortable: false,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="dropdown table-action">
          <button className="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown">
            <i className="ti ti-dots-vertical" />
          </button>
          <div className="dropdown-menu dropdown-menu-end">
            <button className="dropdown-item" onClick={() => handleView(row.id)}>
              <i className="ti ti-eye me-1" /> View
            </button>
            <button className="dropdown-item" onClick={() => handleEdit(row)}>
              <i className="ti ti-edit text-blue me-1" /> Edit
            </button>
            <button className="dropdown-item" onClick={() => { setDeleteId(row.id); const modalInstance = new window.bootstrap.Modal(document.getElementById('delete_dynamic_option')); modalInstance.show(); }}>
              <i className="ti ti-trash me-1" /> Delete
            </button>
          </div>
        </div>
      ),
      sortable: false,
    },
  ];

  return (
    <>
      <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
        <div>
          <h4 className="mb-1">
            Dynamic Field Options <span className="badge badge-soft-primary ms-2">{totalRows}</span>
          </h4>
        </div>
      </div>

      <div className="card border-0 rounded-0">
        <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <div className="input-icon input-icon-start position-relative">
            <span className="input-icon-addon text-dark">
              <i className="ti ti-search" />
            </span>
            <input type="text" className="form-control" placeholder="Search" onChange={handleSearch} />
          </div>
          <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add_edit_dynamic_option" onClick={() => {
              const selected = fields.find((f) => Number(f.id) === Number(selectedFieldId));
              setModalMode("add");
              setErrors({});
              setFormData({
                id: null,
                field_id: selectedFieldId || "",
                branch_id: selected?.branch_id || user?.branch_id || "",
                name: "",
                value: "",
                status: 1,
              });
            }}>
            Add Option
          </button>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Filter by Dynamic Field</label>
              <select
                className="form-control"
                value={selectedFieldId || ""}
                onChange={(e) => {
                  const newFieldId = Number(e.target.value) || null;
                  setSelectedFieldId(newFieldId);
                }}
              >
                <option value="">Select Field (all)</option>
                {fields.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.name} ({field.input_type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DataTable columns={columns} data={options} progressPending={loading} pagination paginationServer paginationTotalRows={totalRows} paginationPerPage={perPage} paginationRowsPerPageOptions={[10, 25, 50, 100]} onChangePage={(p) => setPage(p)} onChangeRowsPerPage={(newPerPage) => { setPerPage(newPerPage); setPage(1); }} sortServer onSort={(column, direction) => { if (column.sortField) { setSortColumn(column.sortField); setSortDirection(direction); } }} highlightOnHover responsive striped />
        </div>
      </div>

      <div className="modal fade" id="add_edit_dynamic_option" aria-hidden="true" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{modalMode === "edit" ? "Edit Dynamic Option" : "Add Dynamic Option"}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Dynamic Field <span className="text-danger">*</span></label>
                  <select
                    className={`form-control ${errors.field_id ? "is-invalid" : ""}`}
                    name="field_id"
                    value={formData.field_id}
                    onChange={(e) => {
                      const newFieldId = Number(e.target.value) || "";
                      const fieldObj = fields.find((f) => Number(f.id) === newFieldId);
                      setFormData({
                        ...formData,
                        field_id: newFieldId,
                        branch_id: fieldObj?.branch_id || user?.branch_id || formData.branch_id,
                      });
                    }}
                    required
                  >
                    <option value="">Select Field</option>
                    {fields.map((field) => (
                      <option key={field.id} value={field.id}>{field.name}</option>
                    ))}
                  </select>
                  {errors.field_id && <small className="text-danger">{errors.field_id}</small>}
                </div>
                <div className="mb-3">
                  <label className="form-label">Name <span className="text-danger">*</span></label>
                  <input type="text" className={`form-control ${errors.name ? "is-invalid" : ""}`} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  {errors.name && <small className="text-danger">{errors.name}</small>}
                </div>
                <div className="mb-3">
                  <label className="form-label">Value <span className="text-danger">*</span></label>
                  <input type="text" className={`form-control ${errors.value ? "is-invalid" : ""}`} value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} required />
                  {errors.value && <small className="text-danger">{errors.value}</small>}
                </div>
                <div className="mb-3 form-check form-switch">
                  <input className="form-check-input" type="checkbox" checked={formData.status === 1} onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 1 : 0 })} />
                  <label className="form-check-label">Active</label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" data-bs-dismiss="modal" disabled={loading}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Saving..." : modalMode === "edit" ? "Update" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="modal fade" id="delete_dynamic_option" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
          <div className="modal-content rounded-0">
            <div className="modal-body p-4 text-center position-relative">
              <div className="mb-3 position-relative z-1">
                <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle"><i className="ti ti-trash fs-24" /></span>
              </div>
              <h5 className="mb-1">Delete Confirmation</h5>
              <p className="mb-3">Are you sure you want to remove this dynamic field option?</p>
              <div className="d-flex justify-content-center">
                <button className="btn btn-light me-2 w-100" data-bs-dismiss="modal">Cancel</button>
                <button className="btn btn-primary w-100" onClick={confirmDelete}>Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DynamicOption;

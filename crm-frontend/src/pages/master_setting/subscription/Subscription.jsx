import React, { useEffect, useState, useCallback } from "react";
import DataTable from "react-data-table-component";
import debounce from "lodash.debounce";
import Swal from "sweetalert2";
import {
  getSubscriptionList,
  addSubscription,
  updateSubscription,
  viewSubscriptionStatus,
  updateSubscriptionStatus,
  deleteSubscription,
} from "../../../services/subscriptionService";

const Subscription = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [search, setSearch] = useState("");
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");
  const [deleteId, setDeleteId] = useState(null);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [formData, setFormData] = useState({
    id: null,
    type: "branch",
    name: "",
    code: "",
    price: "",
    duration: "",
    duration_type: "day",
    is_trial: 0,
    status: 1,
    lms_crm_access: 1,
    max_users: "",
    max_users_status: 1,
    max_users_is_unlimited: 1,
    max_branches: "",
    max_branches_status: 1,
    max_branches_is_unlimited: 1,
    max_leads: "",
    max_leads_status: 1,
    max_leads_is_unlimited: 1,
    max_comment: "",
    max_comment_status: 1,
    max_comment_is_unlimited: 1,
    max_compaigns: "",
    max_compaigns_status: 1,
    max_compaigns_is_unlimited: 1,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleEdit = (row) => {
    setModalMode("edit");
    setErrors({});

    setFormData({
      id: row.id,
      type: row.type || "branch",
      name: row.name,
      code: row.code,
      price: row.price,
      duration: row.duration,
      duration_type: row.duration_type || "day",
      is_trial: row.is_trial ? 1 : 0,
      status: row.status ? 1 : 0,
      lms_crm_access: row.feature?.lms_crm_access ?? 1,
      max_users: row.feature?.max_users ?? "",
      max_users_status: row.feature?.max_users_status ?? 1,
      max_users_is_unlimited: row.feature?.max_users_is_unlimited ?? 1,
      max_branches: row.feature?.max_branches ?? "",
      max_branches_status: row.feature?.max_branches_status ?? 1,
      max_branches_is_unlimited: row.feature?.max_branches_is_unlimited ?? 1,
      max_leads: row.feature?.max_leads ?? "",
      max_leads_status: row.feature?.max_leads_status ?? 1,
      max_leads_is_unlimited: row.feature?.max_leads_is_unlimited ?? 1,
      max_comment: row.feature?.max_comment ?? "",
      max_comment_status: row.feature?.max_comment_status ?? 1,
      max_comment_is_unlimited: row.feature?.max_comment_is_unlimited ?? 1,
      max_compaigns: row.feature?.max_compaigns ?? "",
      max_compaigns_status: row.feature?.max_compaigns_status ?? 1,
      max_compaigns_is_unlimited: row.feature?.max_compaigns_is_unlimited ?? 1,
    });
  };

  const buildPayload = () => {
    const payload = {
      type: formData.type,
      name: formData.name,
      code: formData.code,
      description: "", // optional, not yet in UI
      price: Number(formData.price || 0),
      duration: Number(formData.duration || 0),
      duration_type: formData.duration_type,
      is_trial: formData.is_trial,
      status: formData.status,
      lms_crm_access: Number(formData.lms_crm_access || 0),
      max_users: Number(formData.max_users || 0),
      max_users_status: formData.max_users_status,
      max_users_is_unlimited: formData.max_users_is_unlimited,
      max_branches: Number(formData.max_branches || 0),
      max_branches_status: formData.max_branches_status,
      max_branches_is_unlimited: formData.max_branches_is_unlimited,
      max_leads: Number(formData.max_leads || 0),
      max_leads_status: formData.max_leads_status,
      max_leads_is_unlimited: formData.max_leads_is_unlimited,
      max_comment: Number(formData.max_comment || 0),
      max_comment_status: formData.max_comment_status,
      max_comment_is_unlimited: formData.max_comment_is_unlimited,
      max_compaigns: Number(formData.max_compaigns || 0),
      max_compaigns_status: formData.max_compaigns_status,
      max_compaigns_is_unlimited: formData.max_compaigns_is_unlimited,
    };

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      let payload = buildPayload();

      if (modalMode === "edit") {
        payload = {
          ...payload,
          subscription_id: formData.id,
        };
        await updateSubscription(payload);
      } else {
        await addSubscription(payload);
      }

      Swal.fire({
        icon: "success",
        title:
          modalMode === "edit"
            ? "Subscription Updated"
            : "Subscription Created",
        text:
          modalMode === "edit"
            ? "Subscription updated successfully."
            : "Subscription added successfully.",
        confirmButtonColor: "#3085d6",
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      fetchSubscriptions();

      const offcanvasEl = document.getElementById("offcanvas_add");
      const offcanvasInstance =
        window.bootstrap.Offcanvas.getInstance(offcanvasEl);
      offcanvasInstance?.hide();
    } catch (err) {
      if (err.response?.status === 422) {
        const apiErrors = err.response?.data?.errors;
        const formatted = {};

        Object.keys(apiErrors).forEach((key) => {
          formatted[key] = Array.isArray(apiErrors[key]) ? apiErrors[key].join(", ") : apiErrors[key];
        });

        setErrors(formatted);
      } else {
        Swal.fire({
          icon: "error",
          title: "Something went wrong",
          text: "Please try again later.",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (row) => {
    const newStatus = row.status === 1 || row.status === true ? 0 : 1;

    const res = await updateSubscriptionStatus({
      subscription_id: row.id,
      status: newStatus,
    });

    if (res?.data?.status === "true") {
      fetchSubscriptions();
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await deleteSubscription({
        subscription_id: deleteId,
      });

      if (res?.data?.status === "true") {
        Swal.fire({
          icon: "success",
          title: "Subscription Deleted",
          text: "Subscription deleted successfully.",
          timer: 3000,
          showConfirmButton: false,
        });

        fetchSubscriptions();

        const modalEl = document.getElementById("delete_subscription");
        const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
        modalInstance?.hide();
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: "Please try again later.",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const fetchSubscriptions = async () => {
    setLoading(true);

    const res = await getSubscriptionList({
      search,
      sort_by: sortColumn,
      sort_order: sortDirection,
      per_page: perPage,
      page,
    });

    if (res && res.status === "true") {
      setSubscriptions(res.data);
      setTotalRows(res.pagination.total);
    } else {
      setSubscriptions([]);
      setTotalRows(0);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage, sortColumn, sortDirection, search]);

  const debouncedSearch = useCallback(
    debounce((value) => {
      setPage(1);
      setSearch(value);
    }, 500),
    [],
  );

  const handleSearch = (e) => {
    debouncedSearch(e.target.value);
  };

  const columns = [
    {
      name: "ID",
      selector: (row) => row.id,
      sortField: "id",
      sortable: true,
    },
    {
      name: "Type",
      selector: (row) => row.type.replace(/^./, (char) => char.toUpperCase()),
      sortField: "type",
      sortable: true,
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortField: "name",
      sortable: true,
    },
    {
      name: "Code",
      selector: (row) => row.code,
      sortField: "code",
      sortable: true,
    },
    {
      name: "Price",
      selector: (row) => row.price,
      sortField: "price",
      sortable: true,
    },
    {
      name: "Duration",
      selector: (row) =>
        row.duration +
        " " +
        row.duration_type.replace(/^./, (char) => char.toUpperCase()),
      sortField: "duration",
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) => (
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id={`status-${row.id}`}
            checked={row.status === 1 || row.status === true}
            onChange={() => handleStatusChange(row)}
          />
        </div>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="dropdown table-action">
          <button
            className="action-icon btn btn-xs shadow btn-icon btn-outline-light"
            data-bs-toggle="dropdown"
          >
            <i className="ti ti-dots-vertical"></i>
          </button>

          <div className="dropdown-menu dropdown-menu-end">
            <button
              className="dropdown-item"
              onClick={() => handleEdit(row)}
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvas_add"
            >
              <i className="ti ti-edit text-blue me-1"></i> Edit
            </button>

            <button
              className="dropdown-item"
              onClick={() => setDeleteId(row.id)}
              data-bs-toggle="modal"
              data-bs-target="#delete_subscription"
            >
              <i className="ti ti-trash me-1"></i> Delete
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
        <div>
          <h4 className="mb-1">
            Subscription Plans
            <span className="badge badge-soft-primary ms-2">{totalRows}</span>
          </h4>
        </div>
        <div className="gap-2 d-flex align-items-center flex-wrap">
          <div className="dropdown">
            <a
              className="dropdown-toggle btn btn-outline-light px-2 shadow"
              data-bs-toggle="dropdown"
            >
              <i className="ti ti-package-export me-2" />
              Export
            </a>
            <div className="dropdown-menu  dropdown-menu-end">
              <ul>
                <li>
                  <a  className="dropdown-item">
                    <i className="ti ti-file-type-pdf me-1" />
                    Export as PDF
                  </a>
                </li>
                <li>
                  <a className="dropdown-item">
                    <i className="ti ti-file-type-xls me-1" />
                    Export as Excel
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <a
            className="btn btn-icon btn-outline-light shadow"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            aria-label="Refresh"
            data-bs-original-title="Refresh"
            onClick={fetchSubscriptions}
          >
            <i className="ti ti-refresh" />
          </a>
        </div>
      </div>
      {/* End Page Header */}
      {/* card start */}
      <div className="card border-0 rounded-0">
        <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <div className="input-icon input-icon-start position-relative">
            <span className="input-icon-addon text-dark">
              <i className="ti ti-search" />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search"
              onChange={handleSearch}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setModalMode("add");
              setErrors({});
              setFormData({
                id: null,
                type: "branch",
                name: "",
                code: "",
                price: "",
                duration: "",
                duration_type: "day",
                is_trial: 0,
                status: 1,
                lms_crm_access: 2,
                max_users: "",
                max_users_status: 0,
                max_users_is_unlimited: 0,
                max_branches: "",
                max_branches_status: 0,
                max_branches_is_unlimited: 0,
                max_leads: "",
                max_leads_status: 0,
                max_leads_is_unlimited: 0,
                max_comment: "",
                max_comment_status: 0,
                max_comment_is_unlimited: 0,
                max_compaigns: "",
                max_compaigns_status: 0,
                max_compaigns_is_unlimited: 0,
              });
            }}
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvas_add"
          >
            <i className="ti ti-square-rounded-plus-filled me-1" />
            Add Subscription
          </button>
        </div>
        <div className="card-body">
          <DataTable
            columns={columns}
            data={subscriptions}
            progressPending={loading}
            pagination
            paginationServer
            paginationTotalRows={totalRows}
            paginationPerPage={perPage}
            paginationRowsPerPageOptions={[10, 25, 50, 100]}
            onChangePage={(page) => setPage(page)}
            onChangeRowsPerPage={(newPerPage) => {
              setPerPage(newPerPage);
              setPage(1);
            }}
            sortServer
            onSort={(column, sortDirection) => {
              if (column.sortField) {
                setSortColumn(column.sortField);
                setSortDirection(sortDirection);
              }
            }}
            highlightOnHover
            responsive
            striped
          />
        </div>
      </div>
      {/* card end */}
      {/* Add Contact */}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_add"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">
            {modalMode === "edit" ? "Edit Plan" : "Add New Plan"}
          </h5>
          <button
            type="button"
            className="btn-close custom-btn-close border p-1 me-0 d-flex align-items-center justify-content-center rounded-circle"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <form onSubmit={handleSubmit}>
            <div className="accordion accordion-bordered" id="main_accordion">
              {/* Basic Info */}
              <div className="accordion-item rounded mb-3">
                <div className="accordion-header">
                  <a
                    href="#"
                    className="accordion-button accordion-custom-button rounded"
                    data-bs-toggle="collapse"
                    data-bs-target="#basic"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-file-description" />
                    </span>
                    Plan Info
                  </a>
                </div>
                <div
                  className="accordion-collapse collapse show"
                  id="basic"
                  data-bs-parent="#main_accordion"
                >
                  <div className="accordion-body border-top pb-0">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">
                            Plan Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${errors.name ? "is-invalid" : ""}`}
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                          />
                          {errors.name && (
                            <small className="text-danger">{errors.name}</small>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Plan Type <span className="text-danger">*</span>
                          </label>
                          <select
                            className="form-select"
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="branch">Branch</option>
                            <option value="sub-branch">Sub Branch</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Plan Code <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${errors.code ? "is-invalid" : ""}`}
                            name="code"
                            value={formData.code}
                            onChange={handleInputChange}
                            required
                          />
                          {errors.code && (
                            <small className="text-danger">{errors.code}</small>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Plan Price <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${errors.price ? "is-invalid" : ""}`}
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            required
                            min="0"
                          />
                          {errors.price && (
                            <small className="text-danger">
                              {errors.price}
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Basic Info */}
              {/* Plan Settings */}
              <div className="accordion-item border-top rounded mb-3">
                <div className="accordion-header">
                  <a
                    href="#"
                    className="accordion-button accordion-custom-button rounded"
                    data-bs-toggle="collapse"
                    data-bs-target="#address"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-settings" />
                    </span>
                    Plan Settings
                  </a>
                </div>
                <div
                  className="accordion-collapse collapse"
                  id="address"
                  data-bs-parent="#main_accordion"
                >
                  <div className="accordion-body border-top pb-0">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Duration <span className="text-danger">*</span>
                          </label>
                          <div className="d-flex align-items-center">
                            <input
                              type="number"
                              className={`form-control ${errors.duration ? "is-invalid" : ""}`}
                              name="duration"
                              value={formData.duration}
                              onChange={handleInputChange}
                              required
                              min="1"
                            />
                          </div>
                          {errors.duration && (
                            <small className="text-danger">
                              {errors.duration}
                            </small>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Duration Type <span className="text-danger">*</span>
                          </label>
                          <select
                            className="form-select"
                            name="duration_type"
                            value={formData.duration_type}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="day">Day(s)</option>
                            <option value="month">Month(s)</option>
                            <option value="year">Year(s)</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Dashboard Access
                            <span className="text-danger">*</span>
                          </label>
                          <select
                            className="form-select"
                            name="lms_crm_access"
                            value={formData.lms_crm_access}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="1">LMS</option>
                            <option value="2">CRM</option>
                            <option value="3">Both</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Max Users</label>
                          <div className="d-flex align-items-center">
                            <input
                              type="number"
                              className="form-control"
                              name="max_users"
                              value={formData.max_users}
                              onChange={handleInputChange}
                              min="0"
                              disabled={formData.max_users_status === 0}
                            />
                            <div className="form-check form-switch ms-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                name="max_users_status"
                                checked={formData.max_users_status === 1}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="form-check mt-1">
                            <input
                              type="checkbox"
                              name="max_users_is_unlimited"
                              checked={formData.max_users_is_unlimited === 1}
                              class="form-check-input"
                              id="max_users_is_unlimited"
                              onChange={handleInputChange}
                              disabled={formData.max_users_status === 0}
                            />
                            <label className="form-check-label">
                              Unlimited users
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Max Branches</label>
                          <div className="d-flex align-items-center">
                            <input
                              type="number"
                              className="form-control"
                              name="max_branches"
                              value={formData.max_branches}
                              onChange={handleInputChange}
                              min="0"
                              disabled={formData.max_branches_status === 0}
                            />
                            <div className="form-check form-switch ms-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                name="max_branches_status"
                                checked={formData.max_branches_status === 1}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="form-check mt-1">
                            <input
                              type="checkbox"
                              name="max_branches_is_unlimited"
                              checked={formData.max_branches_is_unlimited === 1}
                              class="form-check-input"
                              id="max_branches_is_unlimited"
                              onChange={handleInputChange}
                              disabled={formData.max_branches_status === 0}
                            />
                            <label className="form-check-label">
                              Unlimited branches
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Max Leads</label>
                          <div className="d-flex align-items-center">
                            <input
                              type="number"
                              className="form-control"
                              name="max_leads "
                              value={formData.max_leads}
                              onChange={handleInputChange}
                              min="0"
                              disabled={formData.max_leads_status === 0}
                            />
                            <div className="form-check form-switch ms-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                name="max_leads_status"
                                checked={formData.max_leads_status === 1}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="form-check mt-1">
                            <input
                              type="checkbox"
                              name="max_leads_is_unlimited"
                              checked={formData.max_leads_is_unlimited === 1}
                              class="form-check-input"
                              id="max_leads_is_unlimited"
                              onChange={handleInputChange}
                              disabled={formData.max_leads_status === 0}
                            />
                            <label className="form-check-label">
                              Unlimited leads
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Max Comments</label>
                          <div className="d-flex align-items-center">
                            <input
                              type="number"
                              className="form-control"
                              name="max_comment"
                              value={formData.max_comment}
                              onChange={handleInputChange}
                              min="0"
                              disabled={formData.max_comment_status === 0}
                            />
                            <div className="form-check form-switch ms-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                name="max_comment_status"
                                checked={formData.max_comment_status === 1}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="form-check mt-1">
                            <input
                              type="checkbox"
                              name="max_comment_is_unlimited"
                              checked={formData.max_comment_is_unlimited === 1}
                              class="form-check-input"
                              id="max_comment_is_unlimited"
                              onChange={handleInputChange}
                              disabled={formData.max_comment_status === 0}
                            />
                            <label className="form-check-label">
                              Unlimited comments
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Max Compaigns</label>
                          <div className="d-flex align-items-center">
                            <input
                              type="number"
                              className="form-control"
                              name="max_compaigns"
                              value={formData.max_compaigns}
                              onChange={handleInputChange}
                              min="0"
                              disabled={formData.max_compaigns_status === 0}
                            />
                            <div className="form-check form-switch ms-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                name="max_compaigns_status"
                                checked={formData.max_compaigns_status === 1}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="form-check mt-1">
                            <input
                              type="checkbox"
                              name="max_compaigns_is_unlimited"
                              checked={
                                formData.max_compaigns_is_unlimited === 1
                              }
                              class="form-check-input"
                              id="max_compaigns_is_unlimited"
                              onChange={handleInputChange}
                              disabled={formData.max_compaigns_status === 0}
                            />
                            <label className="form-check-label">
                              Unlimited compaigns
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6"></div>
                      <div className="col-md-3">
                        <div className="mb-3">
                          <label className="form-label">Trial Plan</label>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="is_trial"
                              checked={formData.is_trial === 1}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="mb-3">
                          <label className="form-label">Status</label>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="status"
                              checked={formData.status === 1}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Address Info */}
            </div>
            <div className="d-flex align-items-center justify-content-end">
              <button
                type="button"
                data-bs-dismiss="offcanvas"
                className="btn btn-light me-2"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {modalMode === "edit"
                  ? loading
                    ? "Updating..."
                    : "Update"
                  : loading
                    ? "Creating..."
                    : "Create New"}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* /Add Contact */}
      {/* Delete modal */}
      <div className="modal fade" id="delete_subscription">
        <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
          <div className="modal-content rounded-0">
            <div className="modal-body p-4 text-center position-relative">
              <div className="mb-3 position-relative z-1">
                <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle">
                  <i className="ti ti-trash fs-24" />
                </span>
              </div>
              <h5 className="mb-1">Delete Confirmation</h5>
              <p className="mb-3">
                Are you sure you want to remove this subscription?
              </p>
              <div className="d-flex justify-content-center">
                <button
                  type="button"
                  className="btn btn-light position-relative z-1 me-2 w-100"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary position-relative z-1 w-100"
                  onClick={confirmDelete}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Subscription;

import React, { useEffect, useState, useCallback, useContext } from "react";
import DataTable from "react-data-table-component";
import debounce from "lodash.debounce";
import Swal from "sweetalert2";
import Select from "react-select";
import {
  getEmployeeList,
  addEmployee,
  updateEmployee,
  viewEmployee,
  updateEmployeeStatus,
  deleteEmployee,
} from "../../services/employeeService";
import { getBranchSubbranchDropdown } from "../../services/branchService";
import {
  getCountries,
  getStates,
  getCities,
} from "../../services/locationService";

import { getRoles } from "../../services/roleService";
import { UserContext } from "../../context/UserContext";

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [search, setSearch] = useState("");
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"

  const [roleOptions, setRoleOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);

  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const [viewData, setViewData] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    role_id: "",
    branch_id: "",
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone_number: "",
    address: "",
    country_id: "",
    state_id: "",
    city_id: "",
    zip: "",
    status: 1,
    profile_image: null,
  });

  const [profilePreview, setProfilePreview] = useState(null);

  const { user } = useContext(UserContext);
  const isAdminOrOwner = user?.role_id === 1 || user?.role_id === 2;

  // Load initial dropdowns
  const loadRoles = async () => {
    try {
      const res = await getRoles();
      const list = res?.data?.data ?? res?.data ?? res;
      const options = (list || []).map((r) => ({
        value: r.id,
        label: r.name,
      }));
      setRoleOptions(options);

      if (formData.role_id) {
        const selected = options.find((o) => o.value === formData.role_id);
        setSelectedRole(selected || null);
      }
    } catch (err) {
      console.error("Error loading roles:", err);
    }
  };

  const loadBranches = async () => {
    if (!isAdminOrOwner) return;
    try {
      const res = await getBranchSubbranchDropdown();
      const list = res?.data?.data ?? res?.data ?? res;
      const options = (list || []).map((b) => ({
        value: b.id,
        label: b.name || b.branch_name || `Branch ${b.id}`,
      }));
      setBranchOptions(options);

      if (formData.branch_id) {
        const selected = options.find((o) => o.value === formData.branch_id);
        setSelectedBranch(selected || null);
      }
    } catch (err) {
      console.error("Error loading branches:", err);
    }
  };

  const loadCountries = async () => {
    try {
      const res = await getCountries();
      const list = res?.data?.data ?? res?.data ?? res;
      const options = (list || []).map((c) => ({
        value: c.id,
        label: c.name,
      }));
      setCountryOptions(options);

      if (formData.country_id) {
        const selected = options.find((c) => c.value === formData.country_id);
        setSelectedCountry(selected || null);
      }
    } catch (err) {
      console.error("Error loading countries:", err);
    }
  };

  const loadStates = async (countryId, selectedStateId = null) => {
    if (!countryId) {
      setStateOptions([]);
      setSelectedState(null);
      return;
    }
    try {
      const states = await getStates(countryId);
      const options = (states || []).map((s) => ({
        value: s.id,
        label: s.name,
      }));
      setStateOptions(options);

      const selected = options.find((s) => s.value === selectedStateId);
      setSelectedState(selected || null);
    } catch (err) {
      console.error("Error loading states:", err);
    }
  };

  const loadCities = async (countryId, stateId, selectedCityId = null) => {
    if (!countryId || !stateId) {
      setCityOptions([]);
      setSelectedCity(null);
      return;
    }
    try {
      const cities = await getCities(countryId, stateId);
      const options = (cities || []).map((c) => ({
        value: c.id,
        label: c.name,
      }));
      setCityOptions(options);

      const selected = options.find((c) => c.value === selectedCityId);
      setSelectedCity(selected || null);
    } catch (err) {
      console.error("Error loading cities:", err);
    }
  };

  useEffect(() => {
    loadRoles();
    loadBranches();
    loadCountries();
  }, [isAdminOrOwner]);

  const handleCountryChange = async (option) => {
    setSelectedCountry(option);
    setSelectedState(null);
    setSelectedCity(null);
    setFormData((prev) => ({
      ...prev,
      country_id: option?.value || "",
      state_id: "",
      city_id: "",
    }));

    if (option?.value) {
      await loadStates(option.value);
    } else {
      setStateOptions([]);
      setCityOptions([]);
    }
  };

  const handleStateChange = async (option) => {
    setSelectedState(option);
    setSelectedCity(null);
    setFormData((prev) => ({
      ...prev,
      state_id: option?.value || "",
      city_id: "",
    }));

    if (option?.value) {
      await loadCities(selectedCountry?.value, option.value);
    } else {
      setCityOptions([]);
    }
  };

  const handleCityChange = (option) => {
    setSelectedCity(option);
    setFormData((prev) => ({
      ...prev,
      city_id: option?.value || "",
    }));
  };

  const handleRoleChange = (option) => {
    setSelectedRole(option);
    setFormData((prev) => ({
      ...prev,
      role_id: option?.value || "",
    }));
  };

  const handleBranchChange = (option) => {
    setSelectedBranch(option);
    setFormData((prev) => ({
      ...prev,
      branch_id: option?.value || "",
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === "profile_image") {
      const file = files?.[0] ?? null;
      setFormData((prev) => ({
        ...prev,
        profile_image: file,
      }));
      setProfilePreview(file ? URL.createObjectURL(file) : null);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      id: null,
      role_id: "",
      branch_id: isAdminOrOwner ? "" : user?.branch_id || "",
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      phone_number: "",
      address: "",
      country_id: "",
      state_id: "",
      city_id: "",
      zip: "",
      status: 1,
      profile_image: null,
    });
    setSelectedRole(null);
    setSelectedBranch(null);
    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedCity(null);
    setStateOptions([]);
    setCityOptions([]);
    setProfilePreview(null);
    setErrors({});
  };

  const handleAdd = () => {
    setModalMode("add");
    resetForm();
  };

  const handleEdit = async (row) => {
    setModalMode("edit");
    setErrors({});

    setFormData({
      id: row.id,
      role_id: row.role_id || "",
      branch_id: isAdminOrOwner ? (row.branch_id || "") : (user?.branch_id || ""),
      name: row.name || "",
      email: row.email || "",
      password: "",
      password_confirmation: "",
      phone_number: row.phone_number || "",
      address: row.address || "",
      country_id: row.country_id || "",
      state_id: row.state_id || "",
      city_id: row.city_id || "",
      zip: row.zip || "",
      status: row.status ?? 1,
      profile_image: null,
    });

    const roleOption = row.role_id
      ? roleOptions.find((r) => r.value === row.role_id) || {
          value: row.role_id,
          label: row.role_name,
        }
      : null;
    setSelectedRole(roleOption);

    const branchOption = row.branch_id
      ? branchOptions.find((b) => b.value === row.branch_id) || {
          value: row.branch_id,
          label: row.branch_name,
        }
      : null;
    setSelectedBranch(branchOption);

    const countryOpt = row.country_id
      ? { value: row.country_id, label: row.country_name }
      : null;
    await handleCountryChange(countryOpt);

    const stateOpt = row.state_id
      ? { value: row.state_id, label: row.state_name }
      : null;
    await handleStateChange(stateOpt);

    const cityOpt = row.city_id
      ? { value: row.city_id, label: row.city_name }
      : null;
    handleCityChange(cityOpt);

    setProfilePreview(
      row.profile_image
        ? `${process.env.REACT_APP_IMAGE_UPLOAD_PATH || ""}${row.profile_image}`
        : null
    );
  };

  const buildFormData = () => {
    const form = new FormData();
    form.append("name", formData.name);
    form.append("email", formData.email);
    form.append("role_id", formData.role_id);
    form.append("branch_id", isAdminOrOwner ? formData.branch_id : user?.branch_id);
    form.append("phone_number", formData.phone_number);
    form.append("address", formData.address);
    form.append("country_id", formData.country_id);
    form.append("state_id", formData.state_id);
    form.append("city_id", formData.city_id);
    form.append("zip", formData.zip);
    form.append("status", formData.status);

    // Only append password fields if in add mode or if password is being changed
    if (modalMode === "add") {
      form.append("password", formData.password);
      form.append("password_confirmation", formData.password_confirmation);
    } else if (formData.password) {
      form.append("password", formData.password);
      form.append("password_confirmation", formData.password_confirmation);
    }

    if (formData.profile_image) {
      form.append("profile_image", formData.profile_image);
    }

    if (modalMode === "edit") {
      form.append("employee_id", formData.id);
    }

    return form;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Client-side validation for passwords in add mode
    if (modalMode === "add") {
      if (!formData.password) {
        setErrors({ password: "Password is required" });
        setLoading(false);
        return;
      }
      if (formData.password !== formData.password_confirmation) {
        setErrors({ password_confirmation: "Passwords do not match" });
        setLoading(false);
        return;
      }
    } else if (formData.password) {
      if (formData.password !== formData.password_confirmation) {
        setErrors({ password_confirmation: "Passwords do not match" });
        setLoading(false);
        return;
      }
    }

    try {
      const payload = buildFormData();

      if (modalMode === "edit") {
        await updateEmployee(payload);
      } else {
        await addEmployee(payload);
      }

      Swal.fire({
        icon: "success",
        title: modalMode === "edit" ? "Employee Updated" : "Employee Created",
        text:
          modalMode === "edit"
            ? "Employee updated successfully."
            : "Employee added successfully.",
        confirmButtonColor: "#3085d6",
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      fetchEmployees();

      const offcanvasEl = document.getElementById("offcanvas_add_employee");
      const offcanvasInstance =
        window.bootstrap.Offcanvas.getInstance(offcanvasEl);
      offcanvasInstance?.hide();

      resetForm();
    } catch (err) {
      if (err.response?.status === 422) {
        const apiErrors = err.response?.data?.errors;
        const formatted = {};

        Object.keys(apiErrors).forEach((key) => {
          formatted[key] = Array.isArray(apiErrors[key])
            ? apiErrors[key].join(", ")
            : apiErrors[key];
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

    try {
      await updateEmployeeStatus({
        employee_id: row.id,
        status: newStatus,
      });

      setEmployees((prev) =>
        prev.map((item) =>
          item.id === row.id ? { ...item, status: newStatus } : item
        )
      );
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: "Please try again later.",
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete Employee",
      text: "Are you sure you want to delete this employee?",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteEmployee({ employee_id: id });

      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Employee deleted successfully.",
        timer: 2500,
        showConfirmButton: false,
      });
      fetchEmployees();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: "Please try again later.",
      });
    }
  };

  const fetchEmployees = useCallback(
    async (signal = null) => {
      setLoading(true);
      try {
        const res = await getEmployeeList(
          {
            search,
            sort_field: sortColumn,
            sort_order: sortDirection,
            per_page: perPage,
            page,
          },
          signal
        );

        if (signal?.aborted) return;

        // Axios wraps API response in res.data
        const payload = res?.data;

        if (payload?.status === "true") {
          setEmployees(payload.data || []);
          setTotalRows(payload.pagination?.total || 0);
        } else {
          setEmployees([]);
          setTotalRows(0);
        }
      } catch (err) {
        if (!signal?.aborted) {
          setEmployees([]);
          setTotalRows(0);
        }
      }
      setLoading(false);
    },
    [page, perPage, sortColumn, sortDirection, search]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchEmployees(controller.signal);
    return () => controller.abort();
  }, [fetchEmployees]);

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

  const handleView = async (employeeId) => {
    try {
      const res = await viewEmployee({ employee_id: employeeId });
      const employeeData = res?.data?.data ?? res?.data;
      if (employeeData) {
        setViewData(employeeData);
        const modalEl = document.getElementById("view_employee");
        const modal = new window.bootstrap.Modal(modalEl);
        modal.show();
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Unable to load employee",
        text: "Please try again later.",
      });
    }
  };

  const columns = [
    {
      name: "Profile",
      cell: (row) => (
        <div>
          {row.profile_image ? (
            <img
              src={`${process.env.REACT_APP_IMAGE_UPLOAD_PATH || ""}${row.profile_image}`}
              alt={row.name}
              style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "#e9ecef",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
              }}
            >
              {row.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      ),
      sortable: false,
      width: "80px",
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortField: "name",
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortField: "email",
      sortable: true,
    },
    {
      name: "Phone",
      selector: (row) => row.phone_number,
      sortField: "phone_number",
      sortable: true,
    },
    ...(isAdminOrOwner ? [{ name: "Branch", selector: (row) => row.branch_name, sortable: false }] : []),
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
      sortable: false,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="dropdown table-action" style={{ position: "relative", zIndex: 10 }}>
          <button
            className="action-icon btn btn-xs shadow btn-icon btn-outline-light"
            data-bs-toggle="dropdown"
          >
            <i className="ti ti-dots-vertical"></i>
          </button>
          <div className="dropdown-menu dropdown-menu-end">
            <button
              className="dropdown-item"
              onClick={() => handleView(row.id)}
            >
              <i className="ti ti-eye me-1"></i> View
            </button>
            <button
              className="dropdown-item"
              onClick={() => {
                handleEdit(row);
              }}
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvas_add_employee"
            >
              <i className="ti ti-edit text-blue me-1"></i> Edit
            </button>
            <button
              className="dropdown-item"
              onClick={() => handleDelete(row.id)}
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
            Employee
            <span className="badge badge-soft-primary ms-2">{totalRows}</span>
          </h4>
        </div>
        <div className="gap-2 d-flex align-items-center flex-wrap">
          <a
            className="btn btn-icon btn-outline-light shadow"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            aria-label="Refresh"
            data-bs-original-title="Refresh"
            onClick={() => fetchEmployees()}
          >
            <i className="ti ti-refresh" />
          </a>
        </div>
      </div>

      <div className="card border-0 rounded-0">
        <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <div className="input-icon input-icon-start position-relative">
            <span className="input-icon-addon text-dark">
              <i className="ti ti-search" />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, email, or phone"
              onChange={handleSearch}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleAdd}
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvas_add_employee"
          >
            <i className="ti ti-square-rounded-plus-filled me-1" />
            Add Employee
          </button>
        </div>
        <div className="card-body">
          <DataTable
            columns={columns}
            data={employees}
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

      {/* Add/Edit Offcanvas */}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_add_employee"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">
            {modalMode === "edit" ? "Edit Employee" : "Add New Employee"}
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
                    Basic Information
                  </a>
                </div>
                <div
                  className="accordion-collapse collapse show"
                  id="basic"
                  data-bs-parent="#main_accordion"
                >
                  <div className="accordion-body border-top pb-0">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Role <span className="text-danger">*</span>
                          </label>
                          <Select
                            options={roleOptions}
                            value={selectedRole}
                            onChange={handleRoleChange}
                            placeholder="Select Role"
                            isClearable
                          />
                          {errors.role_id && (
                            <small className="text-danger">{errors.role_id}</small>
                          )}
                        </div>
                      </div>
                      {isAdminOrOwner && (
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Branch <span className="text-danger">*</span>
                            </label>
                            <Select
                              options={branchOptions}
                              value={selectedBranch}
                              onChange={handleBranchChange}
                              placeholder="Select Branch"
                              isClearable
                            />
                            {errors.branch_id && (
                              <small className="text-danger">{errors.branch_id}</small>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Name <span className="text-danger">*</span>
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
                            Email <span className="text-danger">*</span>
                          </label>
                          <input
                            type="email"
                            className={`form-control ${errors.email ? "is-invalid" : ""}`}
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                          {errors.email && (
                            <small className="text-danger">{errors.email}</small>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Password {modalMode === "add" ? <span className="text-danger">*</span> : "(Leave blank to keep current)"}
                          </label>
                          <input
                            type="password"
                            className={`form-control ${errors.password ? "is-invalid" : ""}`}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required={modalMode === "add"}
                          />
                          {errors.password && (
                            <small className="text-danger">{errors.password}</small>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Confirm Password {modalMode === "add" ? <span className="text-danger">*</span> : ""}
                          </label>
                          <input
                            type="password"
                            className={`form-control ${errors.password_confirmation ? "is-invalid" : ""}`}
                            name="password_confirmation"
                            value={formData.password_confirmation}
                            onChange={handleInputChange}
                            required={modalMode === "add"}
                          />
                          {errors.password_confirmation && (
                            <small className="text-danger">{errors.password_confirmation}</small>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Phone Number <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${errors.phone_number ? "is-invalid" : ""}`}
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleInputChange}
                            required
                            maxLength={10}
                            minLength={10}
                          />
                          {errors.phone_number && (
                            <small className="text-danger">{errors.phone_number}</small>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Profile Image</label>
                          <input
                            type="file"
                            className={`form-control ${errors.profile_image ? "is-invalid" : ""}`}
                            name="profile_image"
                            accept="image/*"
                            onChange={handleInputChange}
                          />
                          {errors.profile_image && (
                            <small className="text-danger">{errors.profile_image}</small>
                          )}

                          {profilePreview && (
                            <img
                              src={profilePreview}
                              alt="Profile Preview"
                              className="mt-2 rounded"
                              style={{
                                width: 80,
                                height: 80,
                                objectFit: "cover",
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Info */}
              <div className="accordion-item rounded mb-3">
                <div className="accordion-header">
                  <a
                    href="#"
                    className="accordion-button accordion-custom-button rounded"
                    data-bs-toggle="collapse"
                    data-bs-target="#location"
                  >
                    <span className="avatar avatar-md rounded me-1">
                      <i className="ti ti-map-pin" />
                    </span>
                    Location Information
                  </a>
                </div>
                <div
                  className="accordion-collapse collapse"
                  id="location"
                  data-bs-parent="#main_accordion"
                >
                  <div className="accordion-body border-top pb-0">
                    <div className="row">
                      
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Address</label>
                          <textarea
                            className={`form-control ${errors.address ? "is-invalid" : ""}`}
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            rows={2}
                          />
                          {errors.address && (
                            <small className="text-danger">{errors.address}</small>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Country</label>
                          <Select
                            options={countryOptions}
                            value={selectedCountry}
                            onChange={handleCountryChange}
                            placeholder="Select Country"
                            isClearable
                          />
                          {errors.country_id && (
                            <small className="text-danger">{errors.country_id}</small>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">State</label>
                          <Select
                            options={stateOptions}
                            value={selectedState}
                            onChange={handleStateChange}
                            placeholder="Select State"
                            isClearable
                            isDisabled={!selectedCountry}
                          />
                          {errors.state_id && (
                            <small className="text-danger">{errors.state_id}</small>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">City</label>
                          <Select
                            options={cityOptions}
                            value={selectedCity}
                            onChange={handleCityChange}
                            placeholder="Select City"
                            isClearable
                            isDisabled={!selectedState}
                          />
                          {errors.city_id && (
                            <small className="text-danger">{errors.city_id}</small>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Zip</label>
                          <input
                            type="text"
                            className={`form-control ${errors.zip ? "is-invalid" : ""}`}
                            name="zip"
                            value={formData.zip}
                            onChange={handleInputChange}
                            maxLength={6}
                            minLength={4}
                          />
                          {errors.zip && (
                            <small className="text-danger">{errors.zip}</small>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
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

      {/* View Employee Modal */}
      <div className="modal fade" id="view_employee">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Employee Details</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {viewData ? (
                <div className="row">
                  <div className="col-md-6">
                    <dl className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Name</label>
                          <input
                            className="form-control"
                            type="text"
                            value={viewData.name}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Email</label>
                          <input
                            className="form-control"
                            type="text"
                            value={viewData.email}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Phone Number</label>
                          <input
                            className="form-control"
                            type="text"
                            value={viewData.phone_number}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Role</label>
                          <input
                            className="form-control"
                            type="text"
                            value={viewData.role_name}
                            readOnly
                          />
                        </div>
                      </div>
                      {isAdminOrOwner && (
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Branch</label>
                            <input
                              className="form-control"
                              type="text"
                              value={viewData.branch_name}
                              readOnly
                            />
                          </div>
                        </div>
                      )}
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Status</label>
                          <input
                            className="form-control"
                            type="text"
                            value={viewData.status === 1 ? "Active" : "Inactive"}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Address</label>
                          <input
                            className="form-control"
                            type="text"
                            value={viewData.address}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Country</label>
                          <input
                            className="form-control"
                            type="text"
                            value={viewData.country_name}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">State</label>
                          <input
                            className="form-control"
                            type="text"
                            value={viewData.state_name}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">City</label>
                          <input
                            className="form-control"
                            type="text"
                            value={viewData.city_name}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Zip</label>
                          <input
                            className="form-control"
                            type="text"
                            value={viewData.zip}
                            readOnly
                          />
                        </div>
                      </div>
                    </dl>
                  </div>
                  <div className="col-md-6">
                    <dl className="row">
                      <div className="col-md-12 text-center">
                        {viewData.profile_image ? (
                          <img
                            src={`${process.env.REACT_APP_IMAGE_UPLOAD_PATH || ""}${viewData.profile_image}`}
                            alt="Employee Profile"
                            style={{
                              width: 180,
                              height: 180,
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 180,
                              height: 180,
                              borderRadius: "50%",
                              backgroundColor: "#e9ecef",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "48px",
                              color: "#6c757d",
                            }}
                          >
                            {viewData.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </dl>
                  </div>
                </div>
              ) : (
                <p>Loading...</p>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Employee;

import React, { useEffect, useState, useCallback } from "react";
import DataTable from "react-data-table-component";
import debounce from "lodash.debounce";
import Swal from "sweetalert2";
import Select from "react-select";
import {
  getBranchDropdown,
  getBranchList,
  addBranch,
  updateBranch,
  viewBranch,
  updateBranchStatus,
  deleteBranch,
} from "../../services/branchService";
import { getCountries, getStates, getCities } from "../../services/locationService";

const SubBranch = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [search, setSearch] = useState("");
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"

  const [countryOptions, setCountryOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const [viewData, setViewData] = useState(null);
  const [branchOptions, setBranchOptions] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const [formData, setFormData] = useState({
    id: null,
    branch_id: "",
    name: "",
    email: "",
    mobile_no: "",
    owner_name: "",
    owner_email: "",
    address: "",
    country_id: "",
    state_id: "",
    city_id: "",
    zip: "",
    status: 1,
    logo_image: null,
  });

  const [logoPreview, setLogoPreview] = useState(null);

  const loadCountries = async () => {
    const countryRes = await getCountries();
    const options = countryRes.map((c) => ({
      value: c.id,
      label: c.name,
    }));
    setCountryOptions(options);

    if (formData.country_id) {
      const selected = options.find((c) => c.value === formData.country_id);
      setSelectedCountry(selected || null);
    }
  };

  const loadBranchOptions = async () => {
    const res = await getBranchDropdown();
    const list = res?.data ?? res;
    const options = (list || []).map((b) => ({
      value: b.id,
      label: b.name || b.branch_name || `Branch ${b.id}`,
    }));
    setBranchOptions(options);

    if (formData.branch_id) {
      const selected = options.find((o) => o.value === formData.branch_id);
      setSelectedBranch(selected || null);
    }
  };

  const loadStates = async (countryId, selectedStateId = null) => {
    if (!countryId) {
      setStateOptions([]);
      setSelectedState(null);
      return;
    }
    const stateRes = await getStates(countryId);
    const options = stateRes.map((s) => ({
      value: s.id,
      label: s.name,
    }));
    setStateOptions(options);

    const selected = options.find((s) => s.value === selectedStateId);
    setSelectedState(selected || null);
  };

  const loadCities = async (countryId, stateId, selectedCityId = null) => {
    if (!countryId || !stateId) {
      setCityOptions([]);
      setSelectedCity(null);
      return;
    }
    const cityRes = await getCities(countryId, stateId);
    const options = cityRes.map((c) => ({
      value: c.id,
      label: c.name,
    }));
    setCityOptions(options);

    const selected = options.find((c) => c.value === selectedCityId);
    setSelectedCity(selected || null);
  };

  useEffect(() => {
    loadCountries();
    loadBranchOptions();
  }, []);

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

  const handleBranchChange = (option) => {
    setSelectedBranch(option);
    setFormData((prev) => ({
      ...prev,
      branch_id: option?.value || "",
    }));
  };

  const getBranchLabel = (branchId) => {
    if (!branchId) return "";
    const match = branchOptions.find((b) => b.value === branchId);
    return match ? match.label : "";
  };
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === "logo_image") {
      const file = files?.[0] ?? null;
      setFormData((prev) => ({
        ...prev,
        logo_image: file,
      }));
      setLogoPreview(file ? URL.createObjectURL(file) : null);
      return;
    }

    let sanitizedValue = value;

    if (name === "name") {
      // Allow only letters and spaces for branch name.
      sanitizedValue = value.replace(/[^a-zA-Z\s]/g, "");
    }

    if (name === "mobile_no" || name === "zip") {
      // Allow only digits for mobile number and zip
      sanitizedValue = value.replace(/\D/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : sanitizedValue,
    }));
  };

  const resetForm = () => {
    setFormData({
      id: null,
      branch_id: "",
      name: "",
      email: "",
      mobile_no: "",
      owner_name: "",
      owner_email: "",
      address: "",
      country_id: "",
      state_id: "",
      city_id: "",
      zip: "",
      status: 1,
      logo_image: null,
    });
    setSelectedBranch(null);
    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedCity(null);
    setStateOptions([]);
    setCityOptions([]);
    setLogoPreview(null);
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
      branch_id: row.branch_id || "",
      name: row.name || "",
      email: row.email || "",
      mobile_no: row.mobile_no || "",
      owner_name: row.owner_name || "",
      owner_email: row.owner_email || "",
      address: row.address || "",
      country_id: row.country_id || "",
      state_id: row.state_id || "",
      city_id: row.city_id || "",
      zip: row.zip || "",
      status: row.status ?? 0,
      logo_image: null,
    });

    const branchOption = row.branch_id
      ? branchOptions.find((b) => b.value === row.branch_id) || {
          value: row.branch_id,
          label: row.branch_name || `Branch ${row.branch_id}`,
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

    setLogoPreview(row.logo ? `${process.env.REACT_APP_IMAGE_UPLOAD_PATH || ""}${row.logo}` : null);
  };

  const buildFormData = () => {
    const form = new FormData();
    form.append("name", formData.name);
    form.append("email", formData.email);
    form.append("mobile_no", formData.mobile_no);
    form.append("owner_name", formData.owner_name);
    form.append("owner_email", formData.owner_email);
    form.append("address", formData.address);
    form.append("country_id", formData.country_id);
    form.append("state_id", formData.state_id);
    form.append("city_id", formData.city_id);
    form.append("zip", formData.zip);
    // For sub-branches we need to include parent branch id when creating.
    form.append(
      "branch_id",
      modalMode === "edit" ? formData.id : formData.branch_id,
    );
    // always send main branch flag as 0 since sub-branches cannot be main branches
    form.append("is_this_main_branch", 0);
    form.append("status", formData.status);

    if (formData.logo_image) {
      form.append("logo_image", formData.logo_image);
    }

    return form;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const payload = buildFormData();

      if (modalMode === "edit") {
        await updateBranch(payload);
      } else {
        await addBranch(payload);
      }

      Swal.fire({
        icon: "success",
        title: modalMode === "edit" ? "Branch Updated" : "Branch Created",
        text:
          modalMode === "edit"
            ? "Branch updated successfully."
            : "Branch added successfully.",
        confirmButtonColor: "#3085d6",
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      fetchBranches();

      const offcanvasEl = document.getElementById("offcanvas_add");
      const offcanvasInstance = window.bootstrap.Offcanvas.getInstance(offcanvasEl);
      offcanvasInstance?.hide();

      resetForm();
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

    const res = await updateBranchStatus({
      branch_id: row.id,
      status: newStatus,
    });

    if (res?.data?.status === "true") {
      setBranches((prev) =>
        prev.map((item) =>
          item.id === row.id ? { ...item, status: newStatus } : item,
        ),
      );
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete Branch",
      text: "Are you sure you want to delete this branch?",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await deleteBranch({ branch_id: id });

      if (res?.data?.status === "true") {
        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: "Branch deleted successfully.",
          timer: 2500,
          showConfirmButton: false,
        });
        fetchBranches();
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: "Please try again later.",
      });
    }
  };

  const fetchBranches = useCallback(
    async (signal = null) => {
      setLoading(true);
      const res = await getBranchList(
        {
          search,
          sort_by: sortColumn,
          sort_order: sortDirection,
          per_page: perPage,
          page,
          is_this_main_branch: 0,
        },
        signal,
      );

      if (signal?.aborted) return;

      if (res && res.status === "true") {
        setBranches(res.data);
        setTotalRows(res.pagination.total);
      } else {
        setBranches([]);
        setTotalRows(0);
      }
      setLoading(false);
    },
    [page, perPage, sortColumn, sortDirection, search],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchBranches(controller.signal);
    return () => controller.abort();
  }, [fetchBranches]);

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

  const enhanceViewDataWithLocationNames = async (data) => {
    if (!data) return data;

    const getNameFromOptions = (options, id) => {
      return options?.find((o) => o.value === id)?.label || "";
    };

    const country_name = data.country_name || getNameFromOptions(countryOptions, data.country_id);
    let state_name = data.state_name || "";
    let city_name = data.city_name || "";

    if (!state_name && data.country_id) {
      try {
        const states = await getStates(data.country_id);
        state_name = states?.find((s) => s.id === data.state_id)?.name || "";
      } catch {
        state_name = "";
      }
    }

    if (!city_name && data.country_id && data.state_id) {
      try {
        const cities = await getCities(data.country_id, data.state_id);
        city_name = cities?.find((c) => c.id === data.city_id)?.name || "";
      } catch {
        city_name = "";
      }
    }

    return {
      ...data,
      country_name,
      state_name,
      city_name,
    };
  };

  const handleView = async (branchId) => {
    try {
      const res = await viewBranch({ branch_id: branchId });
      const branchData = res?.data?.data ?? res?.data;
      if (branchData) {
        const enhanced = await enhanceViewDataWithLocationNames(branchData);
        setViewData(enhanced);
        const modalEl = document.getElementById("view_branch");
        const modal = new window.bootstrap.Modal(modalEl);
        modal.show();
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Unable to load branch",
        text: "Please try again later.",
      });
    }
  };

  const columns = [
    {
      name: "Branch Name",
      selector: (row) => getBranchLabel(row.branch_id) || row.branch_name || "",
      sortField: "branch_id",
      sortable: true,
    },
    {
      name: "Sub-Branch Name",
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
      name: "Mobile No.",
      selector: (row) => row.mobile_no,
      sortField: "mobile_no",
      sortable: true,
    },
    {
      name: "Owner Name",
      selector: (row) => row.owner_name,
      sortField: "owner_name",
      sortable: true,
    },
    {
      name: "Owner Email",
      selector: (row) => row.owner_email,
      sortField: "owner_email",
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
      sortable: false,
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
              data-bs-target="#offcanvas_add"
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
            Sub-Branch
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
                  <a className="dropdown-item">
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
            onClick={() => fetchBranches()}
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
              placeholder="Search"
              onChange={handleSearch}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleAdd}
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvas_add"
          >
            <i className="ti ti-square-rounded-plus-filled me-1" />
            Add Sub-Branch
          </button>
        </div>
        <div className="card-body">
          <DataTable
            columns={columns}
            data={branches}
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

      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_add"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">
            {modalMode === "edit" ? "Edit Sub-Branch" : "Add New Sub-Branch"}
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
                    Sub-Branch Info
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
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Branch Name <span className="text-danger">*</span>
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
                            Branch Email <span className="text-danger">*</span>
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
                            Branch Mobile No. <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${errors.mobile_no ? "is-invalid" : ""}`}
                            name="mobile_no"
                            value={formData.mobile_no}
                            onChange={handleInputChange}
                            required
                            maxLength={10}
                          />
                          {errors.mobile_no && (
                            <small className="text-danger">{errors.mobile_no}</small>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Owner Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${errors.owner_name ? "is-invalid" : ""}`}
                            name="owner_name"
                            value={formData.owner_name}
                            onChange={handleInputChange}
                            required
                          />
                          {errors.owner_name && (
                            <small className="text-danger">{errors.owner_name}</small>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Owner Email <span className="text-danger">*</span>
                          </label>
                          <input
                            type="email"
                            className={`form-control ${errors.owner_email ? "is-invalid" : ""}`}
                            name="owner_email"
                            value={formData.owner_email}
                            onChange={handleInputChange}
                            required
                          />
                          {errors.owner_email && (
                            <small className="text-danger">{errors.owner_email}</small>
                          )}
                        </div>
                      </div>
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
                          <label className="form-label">
                            Country <span className="text-danger">*</span>
                          </label>
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
                          <label className="form-label">
                            State <span className="text-danger">*</span>
                          </label>
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
                          <label className="form-label">
                            City <span className="text-danger">*</span>
                          </label>
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
                          />
                          {errors.zip && (
                            <small className="text-danger">{errors.zip}</small>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Logo</label>
                          <input
                            type="file"
                            className={`form-control ${errors.logo_image ? "is-invalid" : ""}`}
                            name="logo_image"
                            accept="image/*"
                            onChange={handleInputChange}
                          />
                          {errors.logo_image && (
                            <small className="text-danger">{errors.logo_image}</small>
                          )}

                          {logoPreview && (
                            <img
                              src={logoPreview}
                              alt="Logo Preview"
                              className="mt-2"
                              style={{ width: 80, height: 80, objectFit: "cover" }}
                            />
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

      <div className="modal fade" id="view_branch">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Sub-Branch Details</h5>
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
                          <label className="form-label">Branch</label>
                          <input
                            className="form-control "
                            type="text"
                            value={getBranchLabel(viewData.branch_id) || viewData.branch_name || ""}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Branch Name</label>
                          <input className="form-control " type="text" name="name" value={viewData.name} readOnly />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Branch Email</label>
                          <input className="form-control " type="text" name="email" value={viewData.email} readOnly />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Branch Mobile No. </label>
                          <input className="form-control " type="text" name="mobile_no" value={viewData.mobile_no} readOnly />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Owner Name</label>
                          <input className="form-control " type="text" name="owner_name" value={viewData.owner_name} readOnly />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Owner Email</label>
                          <input className="form-control " type="text" name="owner_email" value={viewData.owner_email} readOnly />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Address</label>
                          <input className="form-control " type="text" name="address" value={viewData.address} readOnly />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Country</label>
                          <input className="form-control " type="text" name="country" value={viewData.country_name} readOnly />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">State</label>
                          <input className="form-control " type="text" name="state" value={viewData.state_name} readOnly />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">City</label>
                          <input className="form-control " type="text" name="city" value={viewData.city_name} readOnly />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Zip</label>
                          <input className="form-control " type="text" name="zip" value={viewData.zip} readOnly />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Main Branch</label>
                          <input className="form-control " type="text" name="owner_email" value={viewData.is_this_main_branch === 1 ? "Yes" : "No"} readOnly />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Status</label>
                          <input className="form-control " type="text" name="owner_email" value={viewData.status === 1 ? "Active" : "Inactive"} readOnly />
                        </div>
                      </div>
                    </dl>
                  </div>
                  <div className="col-md-6">
                    <dl className="row">
                      <div className="col-md-12 text-center">
                          {viewData.logo ? (
                            <img
                              src={`${process.env.REACT_APP_IMAGE_UPLOAD_PATH || ""}${viewData.logo}`}
                              alt="Branch Logo"
                              style={{ width: 180, height: 180, objectFit: "cover" }}
                              className="rounded"
                            />
                          ) : (
                            <div className="border rounded py-5">
                              <span className="text-muted">No logo</span>
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

export default SubBranch;

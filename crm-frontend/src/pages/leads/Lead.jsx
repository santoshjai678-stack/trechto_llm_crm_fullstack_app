
import React, { useEffect, useState, useCallback, useContext } from "react";
import DataTable from "react-data-table-component";
import debounce from "lodash.debounce";
import Select from "react-select";
import Swal from "sweetalert2";
import { getLeads, addLead, updateLead, viewLead, updateLeadStatus, deleteLead, getSalesExecutives } from "../../services/leadService";
import { getBranchSubbranchDropdown } from "../../services/branchService";
import { getDynamicLeadFieldsDropdown, getDynamicLeadFieldsForFilter, getDynamicLeadFieldsForDatatableList, getDynamicFieldOptionsDropdown } from "../../services/dynamicFieldService";
import { getCommentDropdown } from "../../services/commentService";
import { getFormSectionsDropdown, getFormSectionsWithFields } from "../../services/formSectionService";
import { UserContext } from "../../context/UserContext";

const Lead = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [search, setSearch] = useState("");
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");

  const [branchOptions, setBranchOptions] = useState([]);
  const [commentOptions, setCommentOptions] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [salesExecutives, setSalesExecutives] = useState([]);
  const [sections, setSections] = useState([]);
  const [dynamicFields, setDynamicFields] = useState({});
  const [dynamicOptions, setDynamicOptions] = useState({});
  const [filterFields, setFilterFields] = useState([]);
  const [filterValues, setFilterValues] = useState({});
  const [datatableFields, setDatatableFields] = useState([]);
  const [dateRange, setDateRange] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const [viewData, setViewData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [modalMode, setModalMode] = useState("add");
  const [formData, setFormData] = useState({
    id: null,
    branch_id: "",
    user_id: "",
    sales_id: "",
    lead_status: "",
    follow_up_date: "",
    comment_id: "",
    other_comment: "",
  });

  const { user } = useContext(UserContext);
  const isAdminOrOwner = user?.role_id === 1 || user?.role_id === 2;

  const isSuperAdmin = user?.role_id === 1;

  const leadStatusOptions = [
    { value: "new", label: "New" },
    { value: "open", label: "Open" },
    { value: "demo", label: "Demo" },
    { value: "visit", label: "Visit" },
    { value: "converted", label: "Converted" },
    { value: "closed", label: "Closed" },
  ];

  const dateRangeOptions = [
    { value: "all", label: "All" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last_30_days", label: "Last 30 Days" },
    { value: "this_month", label: "This Month" },
    { value: "last_month", label: "Last Month" },
    { value: "custom", label: "Custom Range" },
  ];

  const getOptionByValue = (options, value) => {
    if (!Array.isArray(options)) return null;
    return options.find((opt) => String(opt.value) === String(value)) || null;
  };

  const loadSalesExecutives = async () => {
    try {
      const res = await getSalesExecutives();
      const list = res?.data?.data ?? res?.data ?? res;
      setSalesExecutives(list || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadBranchOptions = async () => {
    try {
      const res = await getBranchSubbranchDropdown();
      const list = res?.data?.data ?? res?.data ?? res;
      setBranchOptions(list || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCommentOptions = async () => {
    try {
      const res = await getCommentDropdown();
      const list = res?.data?.data ?? res?.data ?? res;
      setCommentOptions(list || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadFilterFields = async () => {
    try {
      const params = {};
      if (!isAdminOrOwner) params.branch_id = user?.branch_id;
      const res = await getDynamicLeadFieldsForFilter(params);
      const list = res?.data?.data ?? res?.data ?? res;
      setFilterFields(list || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadDatatableFields = async () => {
    try {
      const params = {};
      if (!isAdminOrOwner) params.branch_id = user?.branch_id;
      const res = await getDynamicLeadFieldsForDatatableList(params);
      const list = res?.data?.data ?? res?.data ?? res;
      setDatatableFields(list || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSectionsAndFields = async () => {
    try {
      const params = {};
      if (!isAdminOrOwner) params.branch_id = user?.branch_id;

      const res = await getFormSectionsWithFields(params);
      const sectionsData = res?.data?.data ?? [];

      // Set sections
      setSections(sectionsData);

      // Group fields by section_id and collect options
      const groupedFields = {};
      const optionsMap = {};

      sectionsData.forEach(section => {
        groupedFields[section.id] = section.dynamic_field || [];

        // Process options for each field
        section.dynamic_field?.forEach(field => {
          if (field.dynamic_field_option && field.dynamic_field_option.length > 0) {
            optionsMap[field.slug] = field.dynamic_field_option;
          }
        });
      });

      setDynamicFields(groupedFields);
      setDynamicOptions(optionsMap);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = useCallback(async (signal = null) => {
    setLoading(true);
    try {
      const params = {
        search,
        sort_by: sortColumn,
        sort_order: sortDirection,
        per_page: perPage,
        page,
      };

      if (isAdminOrOwner && selectedBranch) {
        params.branch_id = selectedBranch;
      }

      // date range filters
      if (dateRange === "today") {
        const today = new Date().toISOString().slice(0, 10);
        params.from_date = today;
        params.to_date = today;
      } else if (dateRange === "yesterday") {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        const day = d.toISOString().slice(0, 10);
        params.from_date = day;
        params.to_date = day;
      } else if (dateRange === "last_30_days") {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        params.from_date = start.toISOString().slice(0, 10);
        params.to_date = end.toISOString().slice(0, 10);
      } else if (dateRange === "this_month") {
        const now = new Date();
        params.from_date = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
        params.to_date = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
      } else if (dateRange === "last_month") {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
        params.from_date = firstDay.toISOString().slice(0, 10);
        params.to_date = lastDay.toISOString().slice(0, 10);
      } else if (dateRange === "custom") {
        if (customFrom) params.from_date = customFrom;
        if (customTo) params.to_date = customTo;
      }

      Object.keys(filterValues).forEach((key) => {
        if (filterValues[key] !== "" && filterValues[key] !== null && filterValues[key] !== undefined) {
          params[key] = filterValues[key];
        }
      });

      if (!isAdminOrOwner) {
        params.branch_id = user?.branch_id;
      }

      const res = await getLeads(params, signal);
      if (signal?.aborted) return;
      const payload = res?.data;
      if (payload?.status === "true") {
        setRows(payload.data || []);
        setTotalRows(payload.pagination?.total || 0);
      } else {
        setRows([]);
        setTotalRows(0);
      }
    } catch (err) {
      if (!signal?.aborted) {
        setRows([]);
        setTotalRows(0);
      }
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, sortColumn, sortDirection, user, isAdminOrOwner, selectedBranch, dateRange, customFrom, customTo, filterValues]);

  useEffect(() => {
    if (!isAdminOrOwner) {
      setSelectedBranch(user?.branch_id || "");
    }
    loadSalesExecutives();
    loadBranchOptions();
    loadCommentOptions();
    loadSectionsAndFields();
    loadFilterFields();
    loadDatatableFields();
  }, [isAdminOrOwner, user]);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  const debouncedSearch = useCallback(debounce((value) => {
    setPage(1);
    setSearch(value);
  }, 500), []);

  const handleSearch = (e) => {
    debouncedSearch(e.target.value);
  };

  const resetForm = () => {
    const newFormData = {
      id: null,
      branch_id: isAdminOrOwner ? "" : user?.branch_id || "",
      user_id: "",
      sales_id: "",
      lead_status: "",
      follow_up_date: "",
      comment_id: "",
      other_comment: "",
    };

    // Add dynamic fields from all sections
    Object.values(dynamicFields).forEach(sectionFields => {
      sectionFields.forEach(field => {
        newFormData[field.slug] = "";
      });
    });

    setFormData(newFormData);
    setErrors({});
    setModalMode("add");
  };

  const handleEdit = async (row) => {
    setModalMode("edit");
    const selectedComment = commentOptions.find(comment => String(comment.id) === String(row.comment_id));
    const isOtherComment = selectedComment && (selectedComment.comment.toLowerCase() === 'other');
    
    const newFormData = {
      id: row.id,
      branch_id: isAdminOrOwner ? (row.branch_id || "") : (user?.branch_id || ""),
      user_id: row.user_id || "",
      sales_id: row.sales_id || "",
      lead_status: row.lead_status || "",
      follow_up_date: row.follow_up_date || "",
      comment_id: row.comment_id || "",
      other_comment: isOtherComment ? (row.other_comment || "") : "",
    };

    // Add dynamic fields from all sections
    Object.values(dynamicFields).forEach(sectionFields => {
      sectionFields.forEach(field => {
        newFormData[field.slug] = row[field.slug] || "";
      });
    });

    setFormData(newFormData);
    setErrors({});
    const offcanvasEl = document.getElementById("offcanvas_add");
    const offcanvas = new window.bootstrap.Offcanvas(offcanvasEl);
    offcanvas.show();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const payload = { ...formData };
      if (!isAdminOrOwner) {
        payload.branch_id = user?.branch_id;
      }

      if (modalMode === "edit") {
        payload.lead_id = formData.id;
        await updateLead(payload);
      } else {
        await addLead(payload);
      }

      Swal.fire({
        icon: "success",
        title: modalMode === "edit" ? "Updated" : "Created",
        text: `Lead ${modalMode === "edit" ? "updated" : "created"} successfully.`,
        confirmButtonColor: "#3085d6",
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      const offcanvasEl = document.getElementById("offcanvas_add");
      const offcanvas = window.bootstrap.Offcanvas.getInstance(offcanvasEl);
      offcanvas?.hide();

      resetForm();
      fetchData();
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
    await updateLeadStatus({ lead_id: row.id, status: newStatus });
    fetchData();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await deleteLead(deleteId);
      if (res?.data?.status === "true") {
        Swal.fire({ icon: "success", title: "Deleted", text: "Lead deleted successfully", timer: 2500, timerProgressBar: true, showConfirmButton: false });
        setDeleteId(null);
        const modalEl = document.getElementById("delete_lead");
        const modal = window.bootstrap.Modal.getInstance(modalEl);
        modal?.hide();
        fetchData();
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || "Failed to delete lead", timer: 3000, timerProgressBar: true, showConfirmButton: false });
    }
  };

  const handleView = async (id) => {
    try {
      const res = await viewLead(id);
      if (res?.data?.status === "true") {
        setViewData(res.data.data);
        const modalEl = document.getElementById("view_lead");
        const modal = new window.bootstrap.Modal(modalEl);
        modal.show();
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "Unable to load lead" });
    }
  };

  const renderDynamicField = (field) => {
    const value = formData[field.slug] || "";
    const error = errors[field.slug];
    const isRequired = field.is_required == 1;

    switch (field.input_type) {
      case 'select':
        {
          const options = (dynamicOptions[field.slug] || []).map((opt) => ({
            value: opt.value,
            label: opt.name,
          }));
          const selectedOption = getOptionByValue(options, value);
        return (
          <div className="mb-3" key={field.slug}>
            <label className="form-label">{field.name} {isRequired && <span className="text-danger">*</span>}</label>
            <Select
              className={error ? "is-invalid" : ""}
              options={options}
              value={selectedOption}
              onChange={(opt) => setFormData({ ...formData, [field.slug]: opt ? opt.value : "" })}
              placeholder={`Select ${field.name}`}
              isClearable={!isRequired}
            />
            {error && <small className="text-danger">{error}</small>}
          </div>
        );
        }

      case 'radio':
        return (
          <div className="mb-3" key={field.slug}>
            <label className="form-label">{field.name} {isRequired && <span className="text-danger">*</span>}</label>
            <div>
              {(dynamicOptions[field.slug] || []).map((option) => (
                <div className="form-check" key={option.id}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name={field.slug}
                    value={option.value}
                    checked={value === option.value}
                    onChange={(e) => setFormData({ ...formData, [field.slug]: e.target.value })}
                    required={isRequired}
                  />
                  <label className="form-check-label">{option.name}</label>
                </div>
              ))}
            </div>
            {error && <small className="text-danger">{error}</small>}
          </div>
        );

      case 'checkbox':
        return (
          <div className="mb-3" key={field.slug}>
            <label className="form-label">{field.name} {isRequired && <span className="text-danger">*</span>}</label>
            <div>
              {(dynamicOptions[field.slug] || []).map((option) => (
                <div className="form-check" key={option.id}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={option.value}
                    checked={Array.isArray(value) ? value.includes(option.value) : value === option.value}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : (value ? [value] : []);
                      const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter(v => v !== option.value);
                      setFormData({ ...formData, [field.slug]: newValues.length === 1 ? newValues[0] : newValues });
                    }}
                  />
                  <label className="form-check-label">{option.name}</label>
                </div>
              ))}
            </div>
            {error && <small className="text-danger">{error}</small>}
          </div>
        );

      case 'date':
        return (
          <div className="mb-3" key={field.slug}>
            <label className="form-label">{field.name} {isRequired && <span className="text-danger">*</span>}</label>
            <input
              type="date"
              className={`form-control ${error ? 'is-invalid' : ''}`}
              value={value}
              onChange={(e) => setFormData({ ...formData, [field.slug]: e.target.value })}
              required={isRequired}
            />
            {error && <small className="text-danger">{error}</small>}
          </div>
        );

      case 'datetime':
        return (
          <div className="mb-3" key={field.slug}>
            <label className="form-label">{field.name} {isRequired && <span className="text-danger">*</span>}</label>
            <input
              type="datetime-local"
              className={`form-control ${error ? 'is-invalid' : ''}`}
              value={value}
              onChange={(e) => setFormData({ ...formData, [field.slug]: e.target.value })}
              required={isRequired}
            />
            {error && <small className="text-danger">{error}</small>}
          </div>
        );

      case 'time':
        return (
          <div className="mb-3" key={field.slug}>
            <label className="form-label">{field.name} {isRequired && <span className="text-danger">*</span>}</label>
            <input
              type="time"
              className={`form-control ${error ? 'is-invalid' : ''}`}
              value={value}
              onChange={(e) => setFormData({ ...formData, [field.slug]: e.target.value })}
              required={isRequired}
            />
            {error && <small className="text-danger">{error}</small>}
          </div>
        );

      case 'number':
        return (
          <div className="mb-3" key={field.slug}>
            <label className="form-label">{field.name} {isRequired && <span className="text-danger">*</span>}</label>
            <input
              type="number"
              className={`form-control ${error ? 'is-invalid' : ''}`}
              value={value}
              onChange={(e) => setFormData({ ...formData, [field.slug]: e.target.value })}
              required={isRequired}
              min={field.min_length || undefined}
              max={field.max_length || undefined}
            />
            {error && <small className="text-danger">{error}</small>}
          </div>
        );

      case 'email':
        return (
          <div className="mb-3" key={field.slug}>
            <label className="form-label">{field.name} {isRequired && <span className="text-danger">*</span>}</label>
            <input
              type="email"
              className={`form-control ${error ? 'is-invalid' : ''}`}
              value={value}
              onChange={(e) => setFormData({ ...formData, [field.slug]: e.target.value })}
              required={isRequired}
              maxLength={field.max_length || undefined}
            />
            {error && <small className="text-danger">{error}</small>}
          </div>
        );

      case 'file':
        return (
          <div className="mb-3" key={field.slug}>
            <label className="form-label">{field.name} {isRequired && <span className="text-danger">*</span>}</label>
            <input
              type="file"
              className={`form-control ${error ? 'is-invalid' : ''}`}
              onChange={(e) => setFormData({ ...formData, [field.slug]: e.target.files[0] })}
              required={isRequired}
              accept="image/*"
            />
            {error && <small className="text-danger">{error}</small>}
          </div>
        );

      default:
        return (
          <div className="mb-3" key={field.slug}>
            <label className="form-label">{field.name} {isRequired && <span className="text-danger">*</span>}</label>
            <input
              type="text"
              className={`form-control ${error ? 'is-invalid' : ''}`}
              value={value}
              onChange={(e) => setFormData({ ...formData, [field.slug]: e.target.value })}
              required={isRequired}
              maxLength={field.max_length || undefined}
            />
            {error && <small className="text-danger">{error}</small>}
          </div>
        );
    }
  };

  const dynamicDataColumns = datatableFields.map((field) => ({
    name: field.name,
    selector: (row) => (row[field.slug] !== null && row[field.slug] !== undefined ? row[field.slug] : "-"),
    sortable: true,
  }));

  const columns = [
    { name: "ID", selector: (row) => row.id, sortField: "id", sortable: true },
    { name: "Sales Executive", selector: (row) => row.sales_name || "-", sortable: true },
    { name: "Lead Status", selector: (row) => row.lead_status || "-", sortable: true },
    { name: "Follow Up Date", selector: (row) => row.follow_up_date ? new Date(row.follow_up_date).toLocaleDateString() : "-", sortable: true },
    ...(isAdminOrOwner ? [{ name: "Branch", selector: (row) => row.branch_name || "-", sortable: false }] : []),
    ...dynamicDataColumns,
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
            <button className="dropdown-item" onClick={() => { setDeleteId(row.id); const modal = new window.bootstrap.Modal(document.getElementById('delete_lead')); modal.show(); }}>
              <i className="ti ti-trash me-1" /> Delete
            </button>
          </div>
        </div>
      ),
      sortable: false
    },
  ];

  return (
    <>
      <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
        <div>
          <h4 className="mb-1">Leads <span className="badge badge-soft-primary ms-2">{totalRows}</span></h4>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0 p-0">
              <li className="breadcrumb-item"><a href="index-2.html">Home</a></li>
              <li className="breadcrumb-item active" aria-current="page">Leads</li>
            </ol>
          </nav>
        </div>
        {!isSuperAdmin && (
        <div className="gap-2 d-flex align-items-center flex-wrap">
          <button className="btn btn-primary" onClick={() => { resetForm(); setModalMode("add"); const offcanvas = new window.bootstrap.Offcanvas(document.getElementById("offcanvas_add")); offcanvas.show(); }}>
            <i className="ti ti-square-rounded-plus-filled me-1" />Add Lead
          </button>
        </div>
        )}
      </div>

      <div className="card border-0 rounded-0">
        <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <div className="input-icon input-icon-start position-relative">
            <span className="input-icon-addon text-dark">
              <i className="ti ti-search" />
            </span>
            <input type="text" className="form-control" placeholder="Search" onChange={handleSearch} />
          </div>
        </div>
        <div className="card-body">
        {/* table header */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <div className="d-flex align-items-center gap-2 flex-wrap">
                {isAdminOrOwner && (
                    <div className="me-2">
                    <label className="form-label mb-1">Branch</label>
                    <Select
                      className="w-100"
                      options={branchOptions.map((branch) => ({ value: String(branch.id), label: branch.name }))}
                      value={
                        selectedBranch
                          ? {
                            value: String(selectedBranch),
                            label: branchOptions.find((b) => String(b.id) === String(selectedBranch))?.name || String(selectedBranch),
                          }
                          : null
                      }
                      onChange={(opt) => {
                        setSelectedBranch(opt ? opt.value : "");
                        setPage(1);
                      }}
                    />
                    </div>
                )}
                <div className="me-2">
                    <i className="ti ti-calendar-due text-dark fs-14 me-1" /><label className="form-label mb-1">Date Range</label>
                    <Select
                      className="w-100"
                      options={dateRangeOptions}
                      value={getOptionByValue(dateRangeOptions, dateRange)}
                      onChange={(opt) => {
                        setDateRange(opt ? opt.value : "all");
                        setPage(1);
                      }}
                    />
                </div>
                  {dateRange === 'custom' && (
                      <>
                      <div className="me-2">
                          <label className="form-label mb-1">From</label>
                          <input type="date" className="form-control" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
                      </div>
                      <div className="me-2">
                          <label className="form-label mb-1">To</label>
                          <input type="date" className="form-control" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
                      </div>
                      </>
                  )}
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap mt-4">                                
                <div className="dropdown">
                    <a href="javascript:void(0);" className="btn btn-outline-light shadow px-2" data-bs-toggle="dropdown" data-bs-auto-close="outside"><i className="ti ti-filter me-2" />Filter<i className="ti ti-chevron-down ms-2" /></a>
                    <div className="filter-dropdown-menu dropdown-menu dropdown-menu-lg p-0">
                    <div className="filter-header d-flex align-items-center justify-content-between border-bottom">
                        <h6 className="mb-0"><i className="ti ti-filter me-1" />Filter</h6>
                        <button type="button" className="btn-close close-filter-btn" data-bs-dismiss="dropdown-menu" aria-label="Close" />
                    </div>
                    <div className="filter-set-view p-3">                                            
                        <div className="accordion" id="accordionExample">
                            <div className="filter-set-content">
                                <div className="filter-set-content-head">
                                <a href="#" className="collapsed" data-bs-toggle="collapse" data-bs-target="#status" aria-expanded="false" aria-controls="status">Lead Status</a>
                                </div>
                                <div className="filter-set-contents accordion-collapse collapse" id="status" data-bs-parent="#accordionExample">
                                <div className="filter-content-list bg-light rounded border p-2 shadow mt-2">
                                    <Select
                                      className="w-100"
                                      options={leadStatusOptions}
                                      value={getOptionByValue(leadStatusOptions, filterValues?.lead_status || "")}
                                      placeholder="All Lead Status"
                                      isClearable
                                      onChange={(opt) => {
                                        const next = opt ? opt.value : "";
                                        setFilterValues((prev) => {
                                          const updated = { ...(prev || {}) };
                                          if (!next) {
                                            delete updated.lead_status;
                                            return updated;
                                          }
                                          updated.lead_status = next;
                                          return updated;
                                        });
                                        setPage(1);
                                      }}
                                    />
                                </div>
                                </div>
                            </div>   
                            <div className="filter-set-content">
                                <div className="filter-set-content-head">
                                <a href="#" className="collapsed" data-bs-toggle="collapse" data-bs-target="#date2" aria-expanded="false" aria-controls="date2">Created Date</a>
                                </div>
                                <div className="filter-set-contents accordion-collapse collapse" id="date2" data-bs-parent="#accordionExample">
                                    <div className="filter-content-list bg-light rounded border p-2 shadow mt-2">
                                        <div className="input-group w-auto input-group-flat">
                                            <input type="text" className="form-control" data-date-format="d M, Y" />
                                            <span className="input-group-text">
                                                <i className="ti ti-calendar" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="filter-set-content">
                                <div className="filter-set-content-head">
                                    <a href="#" className="collapsed" data-bs-toggle="collapse" data-bs-target="#owner" aria-expanded="false" aria-controls="owner">Lead Owner</a>
                                </div>
                                <div className="filter-set-contents accordion-collapse collapse" id="owner" data-bs-parent="#accordionExample">
                                    <div className="filter-content-list bg-light rounded border p-2 shadow mt-2">
                                        <div className="mb-2">
                                            <div className="input-icon-start input-icon position-relative">
                                                <span className="input-icon-addon fs-12">
                                                <i className="ti ti-search" />
                                                </span>
                                                <input type="text" className="form-control form-control-md" placeholder="Search" />
                                            </div>
                                        </div>
                                        <ul className="mb-0">
                                            <li className="mb-1">
                                                <label className="dropdown-item px-2 d-flex align-items-center">
                                                <input className="form-check-input m-0 me-1" type="checkbox" />
                                                <span className="avatar avatar-xs rounded-circle me-2"><img src="assets/img/users/user-17.jpg" className="flex-shrink-0 rounded-circle" alt="img" /></span>Robert Johnson
                                                </label>
                                            </li>
                                            <li className="mb-1">
                                                <label className="dropdown-item px-2 d-flex align-items-center">
                                                <input className="form-check-input m-0 me-1" type="checkbox" />
                                                <span className="avatar avatar-xs rounded-circle me-2"><img src="assets/img/users/user-16.jpg" className="flex-shrink-0 rounded-circle" alt="img" /></span>Isabella Cooper
                                                </label>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>                                              
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <a href="javascript:void(0);" className="btn btn-outline-light w-100">Reset</a>
                            <a href="javascript:void(0);" className="btn btn-primary w-100">Filter</a>
                        </div>
                    </div>
                    </div>
                </div>
                <div className="dropdown">
                    <a href="javascript:void(0);" className="btn bg-soft-indigo px-2 border-0" data-bs-toggle="dropdown" data-bs-auto-close="outside"><i className="ti ti-columns-3 me-2" />Manage Columns</a>
                    <div className="dropdown-menu dropdown-menu-md dropdown-md p-3">
                        <ul>
                            <li className="gap-1 d-flex align-items-center mb-2">       
                                <i className="ti ti-columns me-1" />                                     
                                <div className="form-check form-switch w-100 ps-0">
                                    <label className="form-check-label d-flex align-items-center gap-2 w-100">
                                    <span>Lead Name</span>   
                                    <input className="form-check-input switchCheckDefault ms-auto" type="checkbox" role="switch" defaultChecked />     
                                    </label>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                {/* <div className="d-flex align-items-center shadow p-1 rounded border view-icons bg-white">
                    <a href="leads-list.html" className="btn btn-sm p-1 border-0 fs-14 active"><i className="ti ti-list-tree" /></a>
                    <a href="leads.html" className="flex-shrink-0 btn btn-sm p-1 border-0 ms-1 fs-14"><i className="ti ti-grid-dots" /></a>
                </div> */}
            </div>
        </div>
        

        <div className="row mb-3">
          
        </div>
        {/* table header */}
        <div className="card-body">
          <DataTable
            columns={columns}
            data={rows}
            progressPending={loading}
            progressComponent={<div className="text-center p-4">Loading leads...</div>}
            pagination
            paginationServer
            paginationTotalRows={totalRows}
            paginationPerPage={perPage}
            paginationRowsPerPageOptions={[10, 25, 50, 100]}
            onChangePage={(page) => setPage(page)}
            onChangeRowsPerPage={(newPerPage) => { setPerPage(newPerPage); setPage(1); }}
            sortServer
            onSort={(column, direction) => { if (column.sortField) { setSortColumn(column.sortField); setSortDirection(direction); } }}
            highlightOnHover
            responsive
            striped
          />
        </div>
      </div>
      </div>
      
      {/* add lead modal */}
      <div
        className="offcanvas offcanvas-end offcanvas-large"
        tabIndex={-1}
        id="offcanvas_add"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="mb-0">
          {modalMode === "edit" ? "Edit Lead" : "Add Lead"}
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
                    Lead Info
                  </a>
                </div>
                <div
                  className="accordion-collapse collapse show"
                  id="basic"
                  data-bs-parent="#main_accordion"
                >
                  <div className="accordion-body border-top pb-0">
                    <div className="row">
                      {isSuperAdmin && (
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Branch <span className="text-danger">*</span></label>
                            <Select
                              className="w-100"
                              options={branchOptions.map((branch) => ({ value: String(branch.id), label: branch.name }))}
                              value={getOptionByValue(
                                branchOptions.map((branch) => ({ value: String(branch.id), label: branch.name })),
                                formData.branch_id
                              )}
                              onChange={(opt) => setFormData({ ...formData, branch_id: opt ? opt.value : "" })}
                              isClearable
                            />
                            {errors.branch_id && <small className="text-danger">{errors.branch_id}</small>}
                          </div>
                        </div>
                      )}
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Sales Executive <span className="text-danger">*</span></label>
                          <Select
                            className="w-100"
                            options={salesExecutives.map((exec) => ({ value: String(exec.id), label: exec.name }))}
                            value={getOptionByValue(
                              salesExecutives.map((exec) => ({ value: String(exec.id), label: exec.name })),
                              formData.sales_id
                            )}
                            onChange={(opt) => setFormData({ ...formData, sales_id: opt ? opt.value : "" })}
                            isClearable
                          />
                          {errors.sales_id && <small className="text-danger">{errors.sales_id}</small>}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Lead Status</label>
                          <Select
                            className="w-100"
                            options={leadStatusOptions}
                            value={getOptionByValue(leadStatusOptions, formData.lead_status)}
                            onChange={(opt) => setFormData({ ...formData, lead_status: opt ? opt.value : "" })}
                            isClearable
                          />
                          {errors.lead_status && <small className="text-danger">{errors.lead_status}</small>}
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Follow Up Date</label>
                        <input
                          type="date"
                          className={`form-control ${errors.follow_up_date ? 'is-invalid' : ''}`}
                          value={formData.follow_up_date}
                          onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                          min={new Date().toISOString().split('T')[0]}
                        />
                        {errors.follow_up_date && <small className="text-danger">{errors.follow_up_date}</small>}
                      </div>
                      
                    </div>
                  </div>
                </div>
              </div>
              {/* Dynamic Sections */}
              {sections.map((section, index) => (
                <div className="accordion-item rounded mb-3" key={section.id}>
                  <div className="accordion-header">
                    <a
                      href="#"
                      className="accordion-button accordion-custom-button rounded"
                      data-bs-toggle="collapse"
                      data-bs-target={`#section_${section.id}`}
                    >
                      <span className="avatar avatar-md rounded me-1">
                        <i className="ti ti-file-description" />
                      </span>
                      {section.name}
                    </a>
                  </div>
                  <div
                    className="accordion-collapse collapse show"
                    id={`section_${section.id}`}
                    data-bs-parent="#main_accordion"
                  >
                    <div className="accordion-body border-top pb-0">
                      <div className="row">
                        {(dynamicFields[section.id] || []).map((field) => (
                          <div className="col-md-6" key={field.id}>
                            {renderDynamicField(field)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Comment */}
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
                    Comment
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
                          <label className="form-label">Comment <span className="text-danger">*</span></label>
                          <Select
                            className="w-100"
                            options={commentOptions.map((comment) => ({ value: String(comment.id), label: comment.comment }))}
                            value={getOptionByValue(
                              commentOptions.map((comment) => ({ value: String(comment.id), label: comment.comment })),
                              formData.comment_id
                            )}
                            onChange={(opt) => {
                              const newCommentId = opt ? opt.value : "";
                              const selectedComment = commentOptions.find(comment => String(comment.id) === String(newCommentId));
                              const isOtherComment = selectedComment && (selectedComment.comment.toLowerCase() === 'other');
                              
                              setFormData(prev => ({
                                ...prev,
                                comment_id: newCommentId,
                                other_comment: isOtherComment ? prev.other_comment : "" // Clear if not "Other"
                              }));
                            }}
                            isClearable
                          />
                          {errors.comment_id && <small className="text-danger">{errors.comment_id}</small>}
                        </div>
                      </div>
                      {(() => {
                        const selectedComment = commentOptions.find(comment => String(comment.id) === String(formData.comment_id));
                        const isOtherComment = selectedComment && (selectedComment.comment.toLowerCase() === 'other');
                        return isOtherComment ? (
                          <div className="col-md-12">
                            <div className="mb-3">
                              <label className="form-label">Other Comment Text <span className="text-danger">*</span></label>
                              <textarea
                                className={`form-control ${errors.other_comment ? 'is-invalid' : ''}`}
                                value={formData.other_comment}
                                onChange={(e) => setFormData({ ...formData, other_comment: e.target.value })}
                                rows={3}
                              />
                              {errors.other_comment && <small className="text-danger">{errors.other_comment}</small>}
                            </div>
                          </div>
                        ) : null;
                      })()}
                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Last Five Comment</label>
                          
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

     

      <div className="modal fade" id="view_lead" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Lead Details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <div className="modal-body">
              {viewData ? (
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="fw-bold mb-3">Basic Information</h6>
                    <p><strong>ID:</strong> {viewData.id}</p>
                    <p><strong>Sales Executive:</strong> {viewData.sales_name || "-"}</p>
                    <p><strong>Lead Status:</strong> {viewData.lead_status || "-"}</p>
                    <p><strong>Follow Up Date:</strong> {viewData.follow_up_date ? new Date(viewData.follow_up_date).toLocaleDateString() : "-"}</p>
                    <p><strong>Comment Date:</strong> {viewData.comment_date ? new Date(viewData.comment_date).toLocaleDateString() : "-"}</p>
                    {isAdminOrOwner && <p><strong>Branch:</strong> {viewData.branch_name || "-"}</p>}
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold mb-3">Dynamic Fields</h6>
                    {sections.map((section) => (
                      <div key={section.id} className="mb-3">
                        <h6 className="text-primary">{section.name}</h6>
                        {(dynamicFields[section.id] || []).map((field) => (
                          <p key={field.slug}><strong>{field.name}:</strong> {viewData[field.slug] || "-"}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="col-12 mt-3">
                    <h6 className="fw-bold mb-3">Timestamps</h6>
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>Created At:</strong> {new Date(viewData.created_at).toLocaleString()}</p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>Updated At:</strong> {viewData.updated_at ? new Date(viewData.updated_at).toLocaleString() : "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="delete_lead" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
          <div className="modal-content rounded-0">
            <div className="modal-body p-4 text-center position-relative">
              <div className="mb-3 position-relative z-1">
                <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle">
                  <i className="ti ti-trash fs-24" />
                </span>
              </div>
              <h5 className="mb-1">Delete Confirmation</h5>
              <p className="mb-3">Are you sure you want to remove this lead?</p>
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

export default Lead;  
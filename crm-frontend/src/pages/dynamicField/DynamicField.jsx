import React, { useEffect, useState, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import debounce from "lodash.debounce";
import Swal from "sweetalert2";
import { getDynamicLeadFields, addDynamicLeadField, updateDynamicLeadField, viewDynamicLeadField, updateDynamicLeadFieldStatus, deleteDynamicLeadField } from "../../services/dynamicFieldService";
import { getBranchSubbranchDropdown } from "../../services/branchService";
import { getFormSections } from "../../services/formSectionService";
import { UserContext } from "../../context/UserContext";

const DynamicField = () => {
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
    const [sectionOptions, setSectionOptions] = useState([]);

    const [viewData, setViewData] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const [modalMode, setModalMode] = useState("add");
    const [formData, setFormData] = useState({
        id: null,
        branch_id: "",
        section_id: "",
        name: "",
        slug: "",
        field_length: "",
        field_label: "Varchar",
        input_type: "text",
        max_length: "",
        min_length: "",
        is_searchable: 1,
        is_unique: 0,
        show_on_lead_list: 1,
        is_required: 0,
        show_in_filter: 0,
        is_birthday_field: 0,
        status: 1,
    });

    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const isAdminOrOwner = user?.role_id === 1 || user?.role_id === 2;

    const loadBranchOptions = async () => {
        if (!isAdminOrOwner) return;
        const res = await getBranchSubbranchDropdown();
        const list = res?.data?.data ?? res?.data ?? res;
        setBranchOptions(list || []);
    };

    const loadSectionOptions = async (branchId = null) => {
        const params = { per_page: 1000, page: 1 };
        if (branchId) params.branch_id = branchId;
        const res = await getFormSections(params);
        const opts = res?.data?.data || [];
        setSectionOptions(opts || []);
    };

    const fetchData = useCallback(async (signal = null) => {
        setLoading(true);
        try {
            const res = await getDynamicLeadFields({ search, sort_by: sortColumn, sort_order: sortDirection, per_page: perPage, page }, signal);
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
    }, [page, perPage, search, sortColumn, sortDirection]);

    useEffect(() => {
        loadBranchOptions();
        if (!isAdminOrOwner) {
            loadSectionOptions();
        } else {
            setSectionOptions([]);
        }
    }, [isAdminOrOwner]);

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
        setFormData({
            id: null,
            branch_id: isAdminOrOwner ? "" : user?.branch_id || "",
            section_id: "",
            name: "",
            slug: "",
            field_length: "",
            field_label: "Varchar",
            input_type: "text",
            max_length: "",
            min_length: "",
            is_searchable: 1,
            is_unique: 0,
            show_on_lead_list: 1,
            is_required: 0,
            show_in_filter: 0,
            is_birthday_field: 0,
            status: 1,
        });
        setErrors({});
        setModalMode("add");
    };

    const handleEdit = async (row) => {
        setModalMode("edit");
        const branchId = isAdminOrOwner ? (row.branch_id || "") : (user?.branch_id || "");
        setFormData({
            id: row.id,
            branch_id: branchId,
            section_id: row.section_id || "",
            name: row.name || "",
            slug: row.slug || "",
            field_length: row.field_length || "",
            field_label: row.field_label || "Varchar",
            input_type: row.input_type || "text",
            max_length: row.max_length || "",
            min_length: row.min_length || "",
            is_searchable: row.is_searchable ?? 1,
            is_unique: row.is_unique ?? 0,
            show_on_lead_list: row.show_on_lead_list ?? 1,
            is_required: row.is_required ?? 0,
            show_in_filter: row.show_in_filter ?? 0,
            is_birthday_field: row.is_birthday_field ?? 0,
            status: row.status ?? 1,
        });
        setErrors({});
        if (isAdminOrOwner && branchId) {
            await loadSectionOptions(branchId);
        }
        const offcanvasEl = document.getElementById("offcanvas_dynamic_field");
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
                section_id: formData.section_id,
                name: formData.name,
                slug: formData.slug,
                field_length: formData.field_length,
                field_label: formData.field_label,
                input_type: formData.input_type,
                max_length: formData.max_length || null,
                min_length: formData.min_length || null,
                is_searchable: formData.is_searchable,
                is_unique: formData.is_unique,
                show_on_lead_list: formData.show_on_lead_list,
                is_required: formData.is_required,
                show_in_filter: formData.show_in_filter,
                is_birthday_field: formData.is_birthday_field,
                status: formData.status,
            };

            if (modalMode === "edit") {
                payload.dynamic_lead_field_id = formData.id;
                await updateDynamicLeadField(payload);
            } else {
                await addDynamicLeadField(payload);
            }

            Swal.fire({
                icon: "success",
                title: modalMode === "edit" ? "Updated" : "Created",
                text: `Dynamic field ${modalMode === "edit" ? "updated" : "created"} successfully.`,
                confirmButtonColor: "#3085d6",
                timer: 2500,
                timerProgressBar: true,
                showConfirmButton: false,
            });

            const offcanvasEl = document.getElementById("offcanvas_dynamic_field");
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
        await updateDynamicLeadFieldStatus({ dynamic_lead_field_id: row.id, status: newStatus });
        fetchData();
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await deleteDynamicLeadField(deleteId);
            if (res?.data?.status === "true") {
                Swal.fire({ icon: "success", title: "Deleted", text: "Dynamic field deleted successfully", timer: 2500, timerProgressBar: true, showConfirmButton: false });
                setDeleteId(null);
                const modalEl = document.getElementById("delete_dynamic_field");
                const modal = window.bootstrap.Modal.getInstance(modalEl);
                modal?.hide();
                fetchData();
            }
        } catch (err) {
            Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || "Failed to delete dynamic field", timer: 3000, timerProgressBar: true, showConfirmButton: false });
        }
    };

    const handleView = async (id) => {
        try {
            const res = await viewDynamicLeadField(id);
            if (res?.data?.status === "true") {
                setViewData(res.data.data);
                const modalEl = document.getElementById("view_dynamic_field");
                const modal = new window.bootstrap.Modal(modalEl);
                modal.show();
            }
        } catch (err) {
            Swal.fire({ icon: "error", title: "Error", text: "Unable to load record" });
        }
    };

    const columns = [
        { name: "ID", selector: (row) => row.id, sortField: "id", sortable: true },
        { name: "Name", selector: (row) => row.name, sortField: "name", sortable: true },
        { name: "Slug", selector: (row) => row.slug, sortField: "slug", sortable: true },
        { name: "Section", selector: (row) => row.section_name || "-", sortable: true },
        { name: "Field Type", selector: (row) => row.field_label, sortable: true },
        { name: "Input Type", selector: (row) => row.input_type, sortable: true },
        ...(isAdminOrOwner ? [{ name: "Branch", selector: (row) => row.branch_name || "-", sortable: false }] : []),
        {
            name: "Status", cell: (row) => (
                <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" checked={row.status === 1 || row.status === true} onChange={() => handleStatusChange(row)} />
                </div>
            ), sortable: false
        },
        {
            name: "Actions", cell: (row) => (
                <div className="dropdown table-action">
                    <button className="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown">
                        <i className="ti ti-dots-vertical" />
                    </button>
                    <div className="dropdown-menu dropdown-menu-end">
                        <button className="dropdown-item" onClick={() => handleView(row.id)}><i className="ti ti-eye me-1" /> View</button>
                        <button className="dropdown-item" onClick={() => handleEdit(row)}><i className="ti ti-edit text-blue me-1" /> Edit</button>
                        {(row.input_type === 'select' || row.input_type === 'checkbox' || row.input_type === 'radio') && (
                            <button className="dropdown-item" onClick={() => navigate(`/dynamic-field-options?field_id=${btoa(row.id.toString())}`)}><i className="ti ti-list-check me-1" /> Options</button>
                        )}
                        <button className="dropdown-item" onClick={() => { setDeleteId(row.id); const modal = new window.bootstrap.Modal(document.getElementById('delete_dynamic_field')); modal.show(); }}><i className="ti ti-trash me-1" /> Delete</button>
                    </div>
                </div>
            ), sortable: false
        },
    ];

    return (
        <>
            <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
                <div><h4 className="mb-1">Dynamic Lead Fields <span className="badge badge-soft-primary ms-2">{totalRows}</span></h4></div>
                <div className="gap-2 d-flex align-items-center flex-wrap"><button className="btn btn-primary" onClick={() => { resetForm(); setModalMode("add"); const offcanvas = new window.bootstrap.Offcanvas(document.getElementById("offcanvas_dynamic_field")); offcanvas.show(); }}>Add Dynamic Field</button></div>
            </div>

            <div className="card border-0 rounded-0">
                <div className="card-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
                    <div className="input-icon input-icon-start position-relative"><span className="input-icon-addon text-dark"><i className="ti ti-search" /></span><input type="text" className="form-control" placeholder="Search" onChange={handleSearch} /></div>
                </div>
                <div className="card-body">
                    <DataTable columns={columns} data={rows} progressPending={loading} progressComponent={<div className="text-center p-4">Loading dynamic fields...</div>} pagination paginationServer paginationTotalRows={totalRows} paginationPerPage={perPage} paginationRowsPerPageOptions={[10, 25, 50, 100]} onChangePage={(page) => setPage(page)} onChangeRowsPerPage={(newPerPage) => { setPerPage(newPerPage); setPage(1); }} sortServer onSort={(column, direction) => { if (column.sortField) { setSortColumn(column.sortField); setSortDirection(direction); } }} highlightOnHover responsive striped />
                </div>
            </div>

            <div className="offcanvas offcanvas-end offcanvas-large" tabIndex="-1" id="offcanvas_dynamic_field">
                <div className="offcanvas-header border-bottom"><h5>{modalMode === "edit" ? "Edit Dynamic Field" : "Add Dynamic Field"}</h5><button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button></div>
                <div className="offcanvas-body"><form onSubmit={handleSubmit}>
                    {isAdminOrOwner && (
                        <div className="mb-3">
                            <label className="form-label">Branch <span className="text-danger">*</span></label>
                            <select className={`form-control ${errors.branch_id ? 'is-invalid' : ''}`} value={formData.branch_id} onChange={(e) => {
                                const newBranchId = e.target.value;
                                setFormData({ ...formData, branch_id: newBranchId, section_id: "" });
                                if (newBranchId) {
                                    loadSectionOptions(newBranchId);
                                } else {
                                    setSectionOptions([]);
                                }
                            }} required>
                                <option value="">Select Branch</option>
                                {branchOptions.map((item) => (<option key={item.id} value={item.id}>{item.name}</option>))}
                            </select>
                            {errors.branch_id && <small className="text-danger">{errors.branch_id}</small>}
                        </div>
                    )}

                    <div className="mb-3">
                        <label className="form-label">Form Section <span className="text-danger">*</span></label>
                        <select className={`form-control ${errors.section_id ? 'is-invalid' : ''}`} value={formData.section_id} onChange={(e) => setFormData({ ...formData, section_id: e.target.value })} required>
                            <option value="">Select Section</option>
                            {sectionOptions.map((item) => (<option key={item.id} value={item.id}>{item.name}</option>))}
                        </select>
                        {errors.section_id && <small className="text-danger">{errors.section_id}</small>}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Name <span className="text-danger">*</span></label>
                        <input type="text" className={`form-control ${errors.name ? 'is-invalid' : ''}`} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                        {errors.name && <small className="text-danger">{errors.name}</small>}
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Slug <span className="text-danger">*</span></label>
                        <input type="text" className={`form-control ${errors.slug ? 'is-invalid' : ''}`} value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required />
                        {errors.slug && <small className="text-danger">{errors.slug}</small>}
                    </div>
                    <div className="mb-3"><label className="form-label">Field Label <span className="text-danger">*</span></label>
                        <select className={`form-control ${errors.field_label ? 'is-invalid' : ''}`} value={formData.field_label} onChange={(e) => setFormData({ ...formData, field_label: e.target.value })} required>
                            <option value="">Select Field Label</option>
                            <option value="Varchar">Varchar</option>
                            <option value="Integer">Integer</option>
                            <option value="Boolean">Boolean</option>
                            <option value="Date">Date</option>
                            <option value="Datetime">Datetime</option>
                            <option value="Text">Text</option>
                        </select>
                        {errors.field_label && <small className="text-danger">{errors.field_label}</small>}
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Field Length <span className="text-danger">*</span></label>
                        <input type="number" className={`form-control ${errors.field_length ? 'is-invalid' : ''}`} value={formData.field_length} onChange={(e) => setFormData({ ...formData, field_length: e.target.value })} required />
                        {errors.field_length && <small className="text-danger">{errors.field_length}</small>}
                    </div>
                    <div className="mb-3"><label className="form-label">Input Type <span className="text-danger">*</span></label>
                        <select className={`form-control ${errors.input_type ? 'is-invalid' : ''}`} value={formData.input_type} onChange={(e) => setFormData({ ...formData, input_type: e.target.value })} required>
                            <option value="">Select Input Type</option>
                            <option value="text">text</option>
                            <option value="number">number</option>
                            <option value="email">email</option>
                            <option value="select">select</option>
                            <option value="checkbox">checkbox</option>
                            <option value="radio">radio</option>
                            <option value="date">date</option>
                            <option value="datetime">datetime</option>
                            <option value="time">time</option>
                            <option value="file">file</option>
                        </select>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Max Length</label>
                            <input type="number" className="form-control" value={formData.max_length} onChange={(e) => setFormData({ ...formData, max_length: e.target.value })} />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Min Length</label>
                            <input type="number" className="form-control" value={formData.min_length} onChange={(e) => setFormData({ ...formData, min_length: e.target.value })} />
                        </div>
                    </div>

                    <div className="row" style={{ marginLeft: 0 }}>
                        <div className="col-md-6 mb-3 form-check form-switch">
                            <input className="form-check-input" type="checkbox" id="is_searchable" checked={formData.is_searchable === 1} onChange={(e) => setFormData({ ...formData, is_searchable: e.target.checked ? 1 : 0 })} /><label className="form-check-label" htmlFor="is_searchable">Searchable</label>
                        </div>
                        <div className="col-md-6 mb-3 form-check form-switch">
                            <input className="form-check-input" type="checkbox" id="is_unique" checked={formData.is_unique === 1} onChange={(e) => setFormData({ ...formData, is_unique: e.target.checked ? 1 : 0 })} /><label className="form-check-label" htmlFor="is_unique">Unique</label>
                        </div>
                    </div>

                    <div className="row" style={{ marginLeft: 0 }}>
                        <div className="col-md-6 mb-3 form-check form-switch">
                            <input className="form-check-input" type="checkbox" id="show_on_lead_list" checked={formData.show_on_lead_list === 1} onChange={(e) => setFormData({ ...formData, show_on_lead_list: e.target.checked ? 1 : 0 })} /><label className="form-check-label" htmlFor="show_on_lead_list">Show on Lead List</label>
                        </div>
                        <div className="col-md-6 mb-3 form-check form-switch">
                            <input className="form-check-input" type="checkbox" id="is_required" checked={formData.is_required === 1} onChange={(e) => setFormData({ ...formData, is_required: e.target.checked ? 1 : 0 })} /><label className="form-check-label" htmlFor="is_required">Required</label>
                        </div>
                    </div>

                    <div className="row" style={{ marginLeft: 0 }}>
                        <div className="col-md-6 mb-3 form-check form-switch">
                            <input className="form-check-input" type="checkbox" id="show_in_filter" checked={formData.show_in_filter === 1} onChange={(e) => setFormData({ ...formData, show_in_filter: e.target.checked ? 1 : 0 })} /><label className="form-check-label" htmlFor="show_in_filter">Show in Filter</label>
                        </div>
                        <div className="col-md-6 mb-3 form-check form-switch">
                            <input className="form-check-input" type="checkbox" id="is_birthday_field" checked={formData.is_birthday_field === 1} onChange={(e) => setFormData({ ...formData, is_birthday_field: e.target.checked ? 1 : 0 })} /><label className="form-check-label" htmlFor="is_birthday_field">Birthday Field</label>
                        </div>
                    </div>

                    <div className="mb-3 form-check form-switch">
                        <input className="form-check-input" type="checkbox" id="status" checked={formData.status === 1} onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 1 : 0 })} />
                        <label className="form-check-label" htmlFor="status">Active</label>
                    </div>

                    <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Saving..." : modalMode === "edit" ? "Update" : "Save"}</button>
                </form></div>
            </div>

            <div className="modal fade" id="view_dynamic_field" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Dynamic Field Details</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                        </div>
                        <div className="modal-body">
                            {viewData ? (
                                <div className="row">
                                    <div className="col-md-6">
                                        <h6 className="fw-bold mb-3">Basic Information</h6>
                                        <p><strong>ID:</strong> {viewData.id}</p>
                                        <p><strong>Name:</strong> {viewData.name}</p>
                                        <p><strong>Slug:</strong> {viewData.slug}</p>
                                        <p><strong>Section:</strong> {viewData.section_name ?? "-"}</p>
                                        {isAdminOrOwner && <p><strong>Branch:</strong> {viewData.branch_name ?? "-"}</p>}
                                        <p><strong>Field Type:</strong> {viewData.field_label}</p>
                                        <p><strong>Input Type:</strong> {viewData.input_type}</p>
                                        <p><strong>Field Length:</strong> {viewData.field_length}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="fw-bold mb-3">Field Properties</h6>
                                        <p><strong>Max Length:</strong> {viewData.max_length || "-"}</p>
                                        <p><strong>Min Length:</strong> {viewData.min_length || "-"}</p>
                                        <p><strong>Is Searchable:</strong> {viewData.is_searchable === 1 ? "Yes" : "No"}</p>
                                        <p><strong>Is Unique:</strong> {viewData.is_unique === 1 ? "Yes" : "No"}</p>
                                        <p><strong>Show on Lead List:</strong> {viewData.show_on_lead_list === 1 ? "Yes" : "No"}</p>
                                        <p><strong>Is Required:</strong> {viewData.is_required === 1 ? "Yes" : "No"}</p>
                                        <p><strong>Show in Filter:</strong> {viewData.show_in_filter === 1 ? "Yes" : "No"}</p>
                                        <p><strong>Is Birthday Field:</strong> {viewData.is_birthday_field === 1 ? "Yes" : "No"}</p>
                                        <p><strong>Status:</strong> {viewData.status === 1 ? "Active" : "Inactive"}</p>
                                    </div>
                                    <div className="col-12 mt-3">
                                        <h6 className="fw-bold mb-3">Timestamps</h6>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <p><strong>Created At:</strong> {new Date(viewData.created_at).toLocaleString()}</p>
                                                <p><strong>Created By:</strong> {viewData.created_by_name || "-"}</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p><strong>Updated At:</strong> {viewData.updated_at ? new Date(viewData.updated_at).toLocaleString() : "-"}</p>
                                                <p><strong>Updated By:</strong> {viewData.updated_by_name || "-"}</p>
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

            <div className="modal fade" id="delete_dynamic_field" tabIndex="-1"><div className="modal-dialog modal-dialog-centered"><div className="modal-content"><div className="modal-header"><h5 className="modal-title">Delete Dynamic Field</h5><button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" /></div><div className="modal-body"><p>Are you sure you want to delete this dynamic lead field?</p></div><div className="modal-footer"><button className="btn btn-secondary" type="button" data-bs-dismiss="modal">Cancel</button><button className="btn btn-danger" type="button" onClick={confirmDelete}>Delete</button></div></div></div></div>
        </>
    );
};

export default DynamicField;

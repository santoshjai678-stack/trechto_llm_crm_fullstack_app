import React, { useEffect, useState, useCallback } from "react";
import DataTable from "react-data-table-component";
import { getRolesList, updateRoleStatus, addRole, updateRole, deleteRole } from "../../../services/roleService";
import debounce from "lodash.debounce";
import Swal from "sweetalert2";

const Role = () => {
    const [roles, setRoles] = useState([]);
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
        name: "",
        description: "",
        status: 1,
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        let newValue = type === "checkbox" ? (checked ? 1 : 0) : value;

        // Prevent special characters in role name
        if (name === "name") {
            newValue = value.replace(/[^a-zA-Z0-9 ]/g, "");
        }

        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));
    };

    const handleEdit = (row) => {
        if (isProtectedRole(row)) {
            Swal.fire({
                icon: "warning",
                title: "Action not allowed",
                text: "This role cannot be edited.",
                timer: 2500,
                timerProgressBar: true,
                showConfirmButton: false,
            });
            return;
        }

        setModalMode("edit");
        setErrors({});
        setFormData({
            id: row.id,
            name: row.name,
            description: row.description,
            status: row.status,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        // front-end validation to prevent special characters in role name
        if (!/^[a-zA-Z0-9 ]+$/.test(formData.name.trim())) {
            setErrors({ name: "Only letters, numbers and spaces are allowed for role name." });
            setLoading(false);
            return;
        }

        try {
            let payload;

            if (modalMode === "edit") {
                payload = {
                    role_id: formData.id,
                    name: formData.name,
                    description: formData.description,
                    status: formData.status,
                };
                await updateRole(payload);
            } else {
                payload = {
                    name: formData.name,
                    description: formData.description,
                    status: formData.status,
                };
                await addRole(payload);
            }

            // ✅ Success alert
            Swal.fire({
                icon: "success",
                title: modalMode === "edit"
                    ? "Role Updated"
                    : "Role Created",
                text: modalMode === "edit"
                    ? "Role updated successfully."
                    : "Role added successfully.",
                confirmButtonColor: "#3085d6",
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });

            fetchRoles();

            const modalEl = document.getElementById("add_edit_role");
            const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
            modalInstance?.hide();

        } catch (err) {

            // ✅ Same as ChangePassword.jsx
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


    const protectedRoleNames = new Set([
        "Student",
        "Support",
        "Trainer",
        "Sales",
        "Team Leader",
        "Manager",
        "Admin",
        "Branch Owner",
        "Super Admin",
    ]);

    const isProtectedRole = (role) => {
        return role && protectedRoleNames.has(role.name);
    };

    const handleStatusChange = async (row) => {
        if (isProtectedRole(row)) {
            Swal.fire({
                icon: "warning",
                title: "Action not allowed",
                text: "Status cannot be changed for this protected role.",
                timer: 2500,
                timerProgressBar: true,
                showConfirmButton: false,
            });
            return;
        }

        const newStatus = row.status === 1 ? 0 : 1;

        const res = await updateRoleStatus({
            role_id: row.id,
            status: newStatus
        });

        if (res?.data?.status === "true") {
            fetchRoles();
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        const roleToDelete = roles.find((item) => item.id === deleteId);
        if (isProtectedRole(roleToDelete)) {
            Swal.fire({
                icon: "warning",
                title: "Action not allowed",
                text: "This role cannot be deleted.",
                timer: 2500,
                timerProgressBar: true,
                showConfirmButton: false,
            });
            setDeleteId(null);
            return;
        }

        try {
            const res = await deleteRole({
                role_id: deleteId
            });

            if (res?.data?.status === "true") {
                Swal.fire({
                    icon: "success",
                    title: "Role Deleted",
                    text: "Role deleted successfully.",
                    timer: 3000,
					timerProgressBar: true,
                    showConfirmButton: false,
                });

                fetchRoles();

                // close modal
                const modalEl = document.getElementById("delete_role");
                const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
                modalInstance?.hide();
            }else {
                // ✅ Show API message
                Swal.fire({
                    icon: "error",
                    title: "Delete Failed",
                    text: res?.data?.message || "Unable to delete role.",
                });
                const modalEl = document.getElementById("delete_role");
                const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
                modalInstance?.hide();
            }
        } catch (err) {
            if (err.response?.data?.message) {
                Swal.fire({
                    icon: "error",
                    title: "Delete Failed",
                    text: err.response.data.message,
                    timer: 3000,
                    timerProgressBar: true,
                });
                
                const modalEl = document.getElementById("delete_role");
                const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
                modalInstance?.hide();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Something went wrong",
                    text: "Please try again later.",
                });
            }
        } finally {
            setDeleteId(null);
        }
    };


    // 🔄 Fetch Roles
    const fetchRoles = async () => {
        setLoading(true);

        const res = await getRolesList({
            search,
            sort_by: sortColumn,
            sort_order: sortDirection,
            per_page: perPage,
            page,
        });

        if (res && res.status === "true") {
            setRoles(res.data);
            setTotalRows(res.pagination.total);
        } else {
            setRoles([]);
            setTotalRows(0);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchRoles();
    }, [page, perPage, sortColumn, sortDirection, search]);

    // 🔍 Debounced Search
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

    // 📊 Columns
    const columns = [
        {
            name: "ID",
            selector: row => row.id,
            sortField: "id",
            sortable: true,
        },
        {
            name: "Name",
            selector: row => row.name,
            sortField: "name",
            sortable: true,
        },
        {
            name: "Slug",
            selector: row => row.slug,
            sortField: "slug",
            sortable: true,
        },
        {
            name: "Description",
            selector: row => row.description,
            sortField: "description",
            sortable: true,
        },
        {
            name: "Status",
            cell: row => (
                <div className="form-check form-switch">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id={`status-${row.id}`}
                        checked={row.status === 1}   // ✅ bind from API
                        onChange={() => handleStatusChange(row)}
                    />
                </div>
            )
        },
        {
            name: "Actions",
            cell: row => (
                <div className="dropdown table-action">
                    <button
                        className="action-icon btn btn-xs shadow btn-icon btn-outline-light"
                        data-bs-toggle="dropdown"
                    >
                        <i className="ti ti-dots-vertical"></i>
                    </button>

                    <div className="dropdown-menu dropdown-menu-end">
                        {!isProtectedRole(row) && (
                            <>
                                <button
                                    className="dropdown-item"
                                    onClick={() => handleEdit(row)}
                                    data-bs-toggle="modal"
                                    data-bs-target="#add_edit_role"
                                >
                                    <i className="ti ti-edit text-blue me-1"></i> Edit
                                </button>

                                <button
                                    className="dropdown-item"
                                    onClick={() => setDeleteId(row.id)}
                                    data-bs-toggle="modal"
                                    data-bs-target="#delete_role"
                                >
                                    <i className="ti ti-trash me-1"></i> Delete
                                </button>
                            </>
                        )}

                        {isProtectedRole(row) && (
                            <span className="px-3 py-2 text-muted">Protected role</span>
                        )}
                    </div>
                </div>
            )
        },
    ];

    return (
        <>
            {/* Page Header */}
            <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
                <div>
                    <h4 className="mb-1">
                        Role
                        <span className="badge badge-soft-primary ms-2">
                            {totalRows}
                        </span>
                    </h4>
                </div>
            </div>

            <div className="card border-0 rounded-0">
                {/* Header */}
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
                                name: "",
                                description: "",
                                status: 1,
                            });
                        }}
                        data-bs-toggle="modal"
                        data-bs-target="#add_edit_role"
                    >
                        Add Role
                    </button>
                </div>

                {/* Table */}
                <div className="card-body">
                    <DataTable
                        columns={columns}
                        data={roles}
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
            {/* Add Edit role */}
            <div className="modal fade" id="add_edit_role" role="dialog">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {modalMode === "edit" ? "Edit Role" : "Add Role"}
                            </h5>
                            <button className="btn-close custom-btn-close border p-1 me-0 text-dark" data-bs-dismiss="modal" aria-label="Close" />
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Role Name<span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    {errors.name && (
                                        <small className="text-danger">{errors.name}</small>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        name="description"
                                        className={`form-control ${errors.description ? "is-invalid" : ""}`}
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                    />
                                    {errors.description && (
                                        <small className="text-danger">{errors.description}</small>
                                    )}
                                </div>
                                <div className="mb-0">
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
                            <div className="modal-footer">
                                <div className="d-flex align-items-center justify-content-end m-0">
                                    <button
                                        type="button"
                                        className="btn btn-light me-2"
                                        data-bs-dismiss="modal"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>

                                    <button type="submit" className="btn btn-primary">
                                        {modalMode === "edit" ? loading ? "Updating..." : "Update" : loading ? "Creating..." : "Create"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* /Add Edit role  */}
            {/* delete modal */}
            <div className="modal fade" id="delete_role">
                <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
                    <div className="modal-content rounded-0">
                        <div className="modal-body p-4 text-center position-relative">
                            <div className="mb-3 position-relative z-1">
                                <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle"><i className="ti ti-trash fs-24" /></span>
                            </div>
                            <h5 className="mb-1">Delete Confirmation</h5>
                            <p className="mb-3">Are you sure you want to remove roles you selected.</p>
                            <div className="d-flex justify-content-center">
                                <a href="#" className="btn btn-light position-relative z-1 me-2 w-100" data-bs-dismiss="modal">Cancel</a>
                                <button
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
            {/* delete modal */}
        </>
    );
};

export default Role;
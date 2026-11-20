import React, { useEffect, useState, useCallback } from "react";
import DataTable from "react-data-table-component";
import { getCountries, getStates, getCityList, updateCityStatus, addCity, updateCity, deleteCity } from "../../../services/locationService";
import debounce from "lodash.debounce";
import Swal from "sweetalert2";
import Select from "react-select";

const City = () => {
    const [countryOptions, setCountryOptions] = useState([]);
    const [country, setCountry] = useState(null);
    const [stateOptions, setStateOptions] = useState([]);
    const [state, setState] = useState(null);
    const [cities, setCities] = useState([]);

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
        country_id: "",
        state_id: "",
        status: 1,
    });

    useEffect(() => {
        const loadCountries = async () => {
            const countryRes = await getCountries();
            const options = countryRes.map(c => ({
                value: c.id,
                label: c.name,
            }));
            setCountryOptions(options);
            const selected = options.find(c => c.value === formData.country_id);
            setCountry(selected || null);
        };
        loadCountries();
    }, []);

    // Load state options when country changes (for form dropdown)
    useEffect(() => {
        if (!formData.country_id) {
            setStateOptions([]);
            setState(null);
            return;
        }
        const loadStates = async () => {
            const stateRes = await getStates(formData.country_id);
            const options = stateRes.map(s => ({
                value: s.id,
                label: s.name,
            }));
            setStateOptions(options);
            const selected = options.find(s => s.value === formData.state_id);
            setState(selected || null);
        };
        loadStates();
    }, [formData.country_id]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : value
        }));
    };

    const handleAdd = () => {
        setModalMode("add");
        setFormData({
            id: "",
            name: "",
            country_id: "",
            state_id: "",
            status: 1,
        });
        setCountry(null);
        setState(null);
        setStateOptions([]);
        setErrors({});
    };

    const handleEdit = (row) => {
        setModalMode("edit");
        setFormData({
            id: row.id,
            name: row.name,
            country_id: row.country_id,
            state_id: row.state_id,
            status: row.status,
        });
        setCountry({
            value: row.country_id,
            label: row.country_name,
        });
        setState({
            value: row.state_id,
            label: row.state_name,
        });
        setErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            let payload;

            if (modalMode === "edit") {
                payload = {
                    city_id: formData.id,
                    country_id: formData.country_id,
                    state_id: formData.state_id,
                    name: formData.name,
                    status: formData.status,
                };
                await updateCity(payload);
            } else {
                payload = {
                    country_id: formData.country_id,
                    state_id: formData.state_id,
                    name: formData.name,
                    status: formData.status,
                };
                await addCity(payload);
            }

            Swal.fire({
                icon: "success",
                title: modalMode === "edit" ? "City Updated" : "City Created",
                text: modalMode === "edit" ? "City updated successfully." : "City added successfully.",
                confirmButtonColor: "#3085d6",
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });

            fetchCities();

            const modalEl = document.getElementById("add_edit_city");
            const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
            modalInstance?.hide();

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
        const newStatus = row.status === 1 ? 0 : 1;
        const res = await updateCityStatus({
            city_id: row.id,
            status: newStatus
        });
        if (res?.data?.status === "true") {
            fetchCities();
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await deleteCity({
                city_id: deleteId
            });
            if (res?.data?.status === "true") {
                Swal.fire({
                    icon: "success",
                    title: "City Deleted",
                    text: "City deleted successfully.",
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                });
                fetchCities();
                const modalEl = document.getElementById("delete_city");
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

    // Fetch Cities (accepts optional AbortSignal to cancel duplicate requests)
    const fetchCities = useCallback(async (signal = null) => {
        setLoading(true);
        const res = await getCityList(
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
        if (res && res.status === "true") {
            setCities(res.data);
            setTotalRows(res.pagination.total);
        } else {
            setCities([]);
            setTotalRows(0);
        }
        setLoading(false);
    }, [page, perPage, sortColumn, sortDirection, search]);

    useEffect(() => {
        const controller = new AbortController();
        fetchCities(controller.signal);
        return () => controller.abort();
    }, [fetchCities]);

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

    const columns = [
        {
            name: "ID",
            selector: row => row.id,
            sortField: "id",
            sortable: true,
        },
        {
            name: "Country Name",
            selector: row => row.country_name,
            sortField: "country_name",
            sortable: true,
        },
        {
            name: "State Name",
            selector: row => row.state_name,
            sortField: "state_name",
            sortable: true,
        },
        {
            name: "City Name",
            selector: row => row.name,
            sortField: "name",
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
                        checked={row.status === 1}
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
                        <button
                            className="dropdown-item"
                            onClick={() => handleEdit(row)}
                            data-bs-toggle="modal"
                            data-bs-target="#add_edit_city"
                        >
                            <i className="ti ti-edit text-blue me-1"></i> Edit
                        </button>
                        <button
                            className="dropdown-item"
                            onClick={() => setDeleteId(row.id)}
                            data-bs-toggle="modal"
                            data-bs-target="#delete_city"
                        >
                            <i className="ti ti-trash me-1"></i> Delete
                        </button>
                    </div>
                </div>
            )
        },
    ];

    return (
        <>
            <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
                <div>
                    <h4 className="mb-1">
                        City
                        <span className="badge badge-soft-primary ms-2">
                            {totalRows}
                        </span>
                    </h4>
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
                        onClick={() => handleAdd()}
                        data-bs-toggle="modal"
                        data-bs-target="#add_edit_city"
                    >
                        Add City
                    </button>
                </div>

                <div className="card-body">
                    <DataTable
                        columns={columns}
                        data={cities}
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

            {/* Add Edit City */}
            <div className="modal fade" id="add_edit_city" role="dialog">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {modalMode === "edit" ? "Edit City" : "Add City"}
                            </h5>
                            <button className="btn-close custom-btn-close border p-1 me-0 text-dark" data-bs-dismiss="modal" aria-label="Close" />
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Country Name <span className="text-danger">*</span></label>
                                    <Select
                                        options={countryOptions}
                                        value={country}
                                        onChange={(selected) => {
                                            setCountry(selected);
                                            setFormData(prev => ({
                                                ...prev,
                                                country_id: selected ? selected.value : "",
                                                state_id: "",
                                            }));
                                            setState(null);
                                        }}
                                        placeholder="Select Country"
                                    />
                                    {errors.country_id && (
                                        <small className="text-danger">{errors.country_id}</small>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">State Name <span className="text-danger">*</span></label>
                                    <Select
                                        options={stateOptions}
                                        value={state}
                                        onChange={(selected) => {
                                            setState(selected);
                                            setFormData(prev => ({
                                                ...prev,
                                                state_id: selected ? selected.value : "",
                                            }));
                                        }}
                                        placeholder="Select State"
                                        isDisabled={!formData.country_id}
                                    />
                                    {errors.state_id && (
                                        <small className="text-danger">{errors.state_id}</small>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">City Name <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    {errors.name && (
                                        <small className="text-danger">{errors.name}</small>
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

            {/* Delete modal */}
            <div className="modal fade" id="delete_city">
                <div className="modal-dialog modal-dialog-centered modal-sm rounded-0">
                    <div className="modal-content rounded-0">
                        <div className="modal-body p-4 text-center position-relative">
                            <div className="mb-3 position-relative z-1">
                                <span className="avatar avatar-xl badge-soft-danger border-0 text-danger rounded-circle"><i className="ti ti-trash fs-24" /></span>
                            </div>
                            <h5 className="mb-1">Delete Confirmation</h5>
                            <p className="mb-3">Are you sure you want to remove the city you selected.</p>
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
        </>
    );
};

export default City;

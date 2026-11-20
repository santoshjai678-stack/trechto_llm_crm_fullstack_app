import { useState, useEffect } from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";
import { ChangePasswordApi, logout } from "../../services/authService"
import Swal from "sweetalert2";



const ChangePassword = () => {
	// ✅ Hooks INSIDE component

	const navigate = useNavigate();
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState({
		current: false,
		new: false,
		confirm: false,
	  });
	
	  const togglePassword = (field) => {
		setShowPassword((prev) => ({
			...prev,
			[field]: !prev[field],
		}));
	};
		
	const [form, setForm] = useState({
		current_password: "",
		new_password: "",
		new_password_confirmation: "",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm(prev => ({
			...prev,
			[name]: value

		}));
	};
	const handleLogout = async () => {
		try {
			await logout(); // call Laravel logout API
		} catch (error) {
			// ignore if token already expired
		} finally {
			localStorage.removeItem("token");
			localStorage.removeItem("user"); // optional if used
			navigate("/login");
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setErrors({});
		setLoading(true);

		try {
			const formData = new FormData();
			formData.append("current_password", form.current_password);
			formData.append("new_password", form.new_password);
			formData.append("new_password_confirmation", form.new_password_confirmation);

			const res = await ChangePasswordApi(formData);

			// 🔐 Show message + force logout
			Swal.fire({
				icon: "success",
				title: "Password Updated",
				text: "Your password has been changed successfully. Your session is over. Please relogin to start a new session.",
				confirmButtonColor: "#3085d6",
				confirmButtonText: "OK",
			}).then(async () => {
				await handleLogout();
			});
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

	return (
		<>

			{/* Page Header */}
			<div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
				<div>
					<h4 className="mb-1">Settings</h4>
					<nav aria-label="breadcrumb">
						<ol className="breadcrumb mb-0 p-0">
							<li className="breadcrumb-item"><a href="index-2.html">Home</a></li>
							<li className="breadcrumb-item active" aria-current="page">Settings</li>
						</ol>
					</nav>
				</div>
				<div className="gap-2 d-flex align-items-center flex-wrap">
					<a href="javascript:void(0);" className="btn btn-icon btn-outline-light shadow" data-bs-toggle="tooltip" data-bs-placement="top" aria-label="Refresh" data-bs-original-title="Refresh"><i className="ti ti-refresh" /></a>
					<a href="javascript:void(0);" className="btn btn-icon btn-outline-light shadow" data-bs-toggle="tooltip" data-bs-placement="top" aria-label="Collapse" data-bs-original-title="Collapse" id="collapse-header"><i className="ti ti-transition-top" /></a>
				</div>
			</div>
			{/* End Page Header */}
			<div className="card border-0">
				<div className="card-body pb-0 pt-0 px-2">
					<ul className="nav nav-tabs nav-bordered nav-bordered-primary">
						<li className="nav-item me-3">
							<a to="/profile" className="nav-link p-2 active">
								<i className="ti ti-settings-cog me-2" />General Settings
							</a>
						</li>
						<li className="nav-item me-3 d-none">
							<a href="company-settings.html" className="nav-link p-2">
								<i className="ti ti-world-cog me-2" />Website Settings
							</a>
						</li>
						<li className="nav-item me-3 d-none">
							<a href="invoice-settings.html" className="nav-link p-2">
								<i className="ti ti-apps me-2" />App Settings
							</a>
						</li>
						<li className="nav-item me-3 d-none">
							<a href="email-settings.html" className="nav-link p-2">
								<i className="ti ti-device-laptop me-2" />System Settings
							</a>
						</li>
						<li className="nav-item me-3 d-none">
							<a href="payment-gateways.html" className="nav-link p-2">
								<i className="ti ti-moneybag me-2" />Financial Settings
							</a>
						</li>
						<li className="nav-item d-none">
							<a href="sitemap.html" className="nav-link p-2">
								<i className="ti ti-flag-cog me-2" />Other Settings
							</a>
						</li>
					</ul>
				</div> {/* end card body */}
			</div> {/* end card */}
			{/* start row */}
			<div className="row">
				<div className="col-xl-3 col-lg-12 theiaStickySidebar">
					<div className="card mb-3 mb-xl-0">
						<div className="card-body">
							<div className="settings-sidebar">
								<h5 className="mb-3 fs-17">General Settings</h5>
								<div className="list-group list-group-flush settings-sidebar">
									<NavLink to="/profile" className={({ isActive }) =>
										`d-block p-2 fw-medium ${isActive ? "active" : ""}`
									}
									>Profile</NavLink>
									<NavLink to="/change-password" className={({ isActive }) =>
										`d-block p-2 fw-medium ${isActive ? "active" : ""}`
									}
									>Change Password</NavLink>
								</div>
							</div>
						</div> {/* end card body */}
					</div> {/* end card */}
				</div> {/* end col */}
				<div className="col-xl-9 col-lg-12">
					<div className="card mb-0">
						<div className="card-body">
							<div className="border-bottom mb-3 pb-3">
								<h5 className="mb-0 fs-17">Change Password</h5>
							</div>
							<form onSubmit={handleSubmit}>
								<div className="mb-3">
									<h6 className="mb-1">Employee Information</h6>
									<p className="mb-0">Change your account password below</p>
								</div>
								<div className="border-bottom mb-3">
									{/* start row */}
									<div className="row">
										<div className="col-md-4">
											<div className="mb-3">
												<label className="form-label">
													Current Password <span className="text-danger">*</span>
												</label>
												<div className="input-group input-group-flat pass-group">
													<input
														type={showPassword.current ? "text" : "password"}
														name="current_password"
														className="form-control"
														value={form.current_password}
														onChange={handleChange}
														required
														placeholder="Root@123"
													/>
													<span
														className="input-group-text"
														onClick={() => togglePassword("current")}
														style={{ cursor: "pointer" }}
														>
														<i className={`ti ${showPassword.current ? "ti-eye" : "ti-eye-off"}`} />
													</span>
												</div>
												{errors.current_password && (
													<small className="text-danger">{errors.current_password}</small>
												)}
											</div>
										</div> {/* end col */}
										<div className="col-md-4">
											<div className="mb-3">
												<label className="form-label">
													New Password <span className="text-danger">*</span>
												</label>
												<div className="input-group input-group-flat pass-group">

													<input
														type={showPassword.new ? "text" : "password"}
														name="new_password"
														className="form-control"
														value={form.new_password}
														onChange={handleChange}
														pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$"
														title="Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
														required
														placeholder="Root@123"
													/>
													<span
														className="input-group-text"
														onClick={() => togglePassword("new")}
														style={{ cursor: "pointer" }}
														>
														<i className={`ti ${showPassword.new ? "ti-eye" : "ti-eye-off"}`} />
													</span>
												</div>
												{errors.new_password && (
													<small className="text-danger">{errors.new_password}</small>
												)}
											</div>
										</div> {/* end col */}
										<div className="col-md-4">
											<div className="mb-3">
												<label className="form-label">
													Confirm Password <span className="text-danger">*</span>
												</label>
												<div className="input-group input-group-flat pass-group">
													<input
														type={showPassword.confirm ? "text" : "password"}
														name="new_password_confirmation"
														className="form-control"
														value={form.new_password_confirmation}
														onChange={handleChange}
														required
														placeholder="Root@123"
													/>
													<span
														className="input-group-text"
														onClick={() => togglePassword("confirm")}
														style={{ cursor: "pointer" }}
														>
														<i className={`ti ${showPassword.confirm ? "ti-eye" : "ti-eye-off"}`} />
													</span>
												</div>
												{errors.new_password_confirmation && (
													<small className="text-danger">{errors.new_password_confirmation}</small>
												)}
											</div>
										</div> {/* end col */}

									</div>
									{/* end row */}
								</div>

								<div className="d-flex align-items-center justify-content-end flex-wrap gap-2">
									<a href="#" className="btn btn-sm btn-light">Cancel</a>
									<button
										type="submit"
										className="btn btn-sm btn-primary"
										disabled={loading}
									>
										{loading ? "Saving..." : "Save Changes"}
									</button>
								</div>
							</form>
						</div> {/* end card body */}
					</div> {/* end card */}
				</div> {/* end col */}
			</div>
			{/* end row */}

		</>
	);
};

export default ChangePassword;

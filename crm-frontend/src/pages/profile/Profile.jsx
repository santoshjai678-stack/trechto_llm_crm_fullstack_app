import { useState, useEffect } from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";
import Select from "react-select";
import { profileApi, profileUpdateApi } from "../../services/authService"
import { getCountries, getStates, getCities } from "../../services/locationService";
import Swal from "sweetalert2";
import { useContext } from "react";
import { UserContext } from "../../context/UserContext";


const Profile = () => {
	// ✅ Hooks INSIDE component
	const [countries, setCountries] = useState([]);
	const [states, setStates] = useState([]);
	const [cities, setCities] = useState([]);

	const [country, setCountry] = useState(null);
	const [state, setState] = useState(null);
	const [city, setCity] = useState(null);
	
	const navigate = useNavigate();
	const { user, setUser } = useContext(UserContext);
	const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
	const [form, setForm] = useState({
		name: user?.name ? user.name : "",
		email: user?.email ? user.email : "",
		phone_number: user?.phone_number ? user.phone_number : "",
		address: user?.address ? user.address : "",
		zip: user?.zip ? user.zip : ""
	});
	  
	const [imagePreview, setImagePreview] = useState(null);
  	const [imageFile, setImageFile] = useState(null);

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;
	  
		setImageFile(file);
		setImagePreview(URL.createObjectURL(file));
	};
	   
	const getImageSrc = () => {
		if (imagePreview) return imagePreview;
	  
		if (user && user.profile_image) {
		  return `${process.env.REACT_APP_IMAGE_UPLOAD_PATH}${user.profile_image}`;
		}
	  
		return "assets/img/profiles/avatar-02.jpg";
	};
	  
	const imageSrc = getImageSrc();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm(prev => ({
		  ...prev,
		  [name]: value

		}));
	  };
	  
	const handleSubmit = async (e) => {
		e.preventDefault();
		setErrors({});
		setLoading(true);
	  
		try {
		  const formData = new FormData();
		  formData.append("name", form.name);
		  formData.append("email", form.email);
		  formData.append("phone_number", form.phone_number);
		  formData.append("address", form.address);
		  formData.append("zip", form.zip);
		  formData.append("country_id", country?.value || "");
		  formData.append("state_id", state?.value || "");
		  formData.append("city_id", city?.value || "");
	  
		  if (imageFile) {
			formData.append("profile_image", imageFile);
		  }
	  
		  const res = await profileUpdateApi(formData); 
		  const updatedUser = res.data.data;

		  // update context + localStorage
		  setUser(updatedUser);
		  localStorage.setItem("user", JSON.stringify(updatedUser));


		  // ✅ Success alert
		  Swal.fire({
			icon: "success",
			title: "Profile Updated",
			text: "Your profile has been updated successfully.",
			confirmButtonColor: "#3085d6",
			timer: 3000,          // 5 seconds
			timerProgressBar: true,
			showConfirmButton: false,
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
	  
	useEffect(() => {
		profileApi()
			.then(async (res) => {
				const data = res.data.data;
				// setUser(data);
				setForm({
					name: data.name || "",
					email: data.email || "",
					phone_number: data.phone_number || "",
					address: data.address || "",
					zip: data.zip || ""
				});
				  
				// 1️⃣ Load countries
				const countryRes = await getCountries();
				const countryOptions = countryRes.map(c => ({
				value: c.id,
				label: c.name,
				}));
				setCountries(countryOptions);

				const selectedCountry = countryOptions.find(
					c => c.value === data.country_id
				);
				setCountry(selectedCountry);

				// 2️⃣ Load states
				const stateRes = await getStates(data.country_id);
				const stateOptions = stateRes.map(s => ({
				value: s.id,
				label: s.name,
				}));
				setStates(stateOptions);

				const selectedState = stateOptions.find(
					s => s.value === data.state_id
				);
				setState(selectedState);

				// 3️⃣ Load cities
				const cityRes = await getCities(data.country_id, data.state_id);
				const cityOptions = cityRes.map(c => ({
				value: c.id,
				label: c.name,
				}));
				setCities(cityOptions);

				const selectedCity = cityOptions.find(
					c => c.value === data.city_id
				);
				setCity(selectedCity);
			})
			.catch(() => {
				localStorage.removeItem("token");
				navigate("/login");
			});
	}, []);

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
									<NavLink  to="/profile" className={({ isActive }) => 
                                            `d-block p-2 fw-medium ${isActive ? "active" : ""}`
                                        }
                                        >Profile</NavLink>
									<NavLink  to="/change-password" className={({ isActive }) => 
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
								<h5 className="mb-0 fs-17">Profile</h5>
							</div>
							<form onSubmit={handleSubmit}>
								<div className="mb-3">
									<h6 className="mb-1">Employee Information</h6>
									<p className="mb-0">Provide the information below</p>
								</div>
								<div className="mb-3">
									<div className="profile-upload d-flex align-items-center">
										<div className="profile-upload-img avatar avatar-xxl border border-dashed rounded position-relative flex-shrink-0">
											{!imageSrc || imageSrc.includes("avatar-02.jpg") ? (
												<span><i className="ti ti-photo" /></span>
											) : null}

											{/* Debug log */}
											{/* {console.log("imageSrc:", imageSrc)} */}

											<img
												src={imageSrc}
												alt="Profile"
												className="avatar-img"
												onError={(e) => {
												e.target.src = "assets/img/profiles/avatar-02.jpg";
												}}
											/>

											<a href="javascript:void(0);" id="removeImage1" className="profile-remove">
												<i className="ti ti-x" />
											</a>
										</div>

										<div className="profile-upload-content ms-3">
											<label className="d-inline-flex align-items-center position-relative btn btn-primary btn-sm mb-2">
												<i className="ti ti-file-broken me-1" />Upload File
												<input
													type="file"
													accept="image/*"
													id="image"
													className="input-img position-absolute w-100 h-100 opacity-0 top-0 end-0"
													onChange={handleImageChange}
												/>
											</label>
											<p className="mb-0">JPG, JPEG or PNG. Max size of 800K</p>
											{errors.profile_image && (
												<small className="text-danger">{errors.profile_image}</small>
											)}
										</div>
									</div>
								</div>
								<div className="border-bottom mb-3">
									{/* start row */}
									<div className="row">
										<div className="col-md-4">
											<div className="mb-3">
												<label className="form-label">
													Name <span className="text-danger">*</span>
												</label>
												<input
													type="text"
													name="name"
													className="form-control"
													value={form.name}
													onChange={handleChange}
													required
												/>
												{errors.name && (
													<small className="text-danger">{errors.name}</small>
												)}
											</div>
										</div> {/* end col */}
										<div className="col-md-4">
											<div className="mb-3">
												<label className="form-label">
													Phone Number <span className="text-danger">*</span>
												</label>
												<input
													type="text"
													name="phone_number"
													className="form-control"
													value={form.phone_number}
													onChange={handleChange}
													required
												/>
												{errors.phone_number && (
													<small className="text-danger">{errors.phone_number}</small>
												)}
											</div>
										</div> {/* end col */}
										<div className="col-md-4">
											<div className="mb-3">
												<label className="form-label">
													Email <span className="text-danger">*</span>
												</label>
												<input
													type="text"
													name="email"
													className="form-control"
													value={form.email}
													onChange={handleChange}
													required
												/>
												{errors.email && (
													<small className="text-danger">{errors.email}</small>
												)}
											</div>
										</div> {/* end col */}

									</div>
									{/* end row */}
								</div>
								<div className="border-bottom mb-3">
									<div className="mb-3">
										<h6 className="mb-1">Address</h6>
										<p className="mb-0">Please enter the address details</p>
									</div>
									{/* start row */}
									<div className="row">
										<div className="col-md-12">
											<div className="mb-3">
												<label className="form-label">
													Address
												</label>
												<input
													type="text"
													name="address"
													className="form-control"
													value={form.address}
													onChange={handleChange}
													required
												/>
												{errors.address && (
													<small className="text-danger">{errors.address}</small>
												)}
											</div>
										</div> {/* end col */}
										{/* Country */}
										<div className="col-md-6 mb-3">
											<label className="form-label">Country</label>
											<Select
												value={country}
												options={countries}
												onChange={async (val) => {
													setCountry(val);
													setState(null);
													setCity(null);
													setStates([]);
													setCities([]);

													const stateRes = await getStates(val.value);
													const stateOptions = stateRes?.map(s => ({
													value: s.id,
													label: s.name,
													}));
													setStates(stateOptions);
												}}
												placeholder="Select Country"
												required
											/>
											{errors.country_id && (
												<small className="text-danger">{errors.country_id}</small>
											)}
										</div>

										{/* State */}
										<div className="col-md-6 mb-3">
											<label className="form-label">State / Province</label>
											<Select
												value={state}
												options={states}
												onChange={async (val) => {
													setState(val);
													setCity(null);
													setCities([]);

													const cityRes = await getCities(country.value, val.value);
													const cityOptions = cityRes.map(c => ({
													value: c.id,
													label: c.name,
													}));
													setCities(cityOptions);
												}}
												placeholder="Select State"
												isDisabled={!country}
												required
											/>
											{errors.state_id && (
												<small className="text-danger">{errors.state_id}</small>
											)}
										</div>

										{/* City */}
										<div className="col-md-6 mb-3">
											<label className="form-label">City</label>
											<Select
												value={city}
												options={cities}
												onChange={setCity}
												placeholder="Select City"
												isDisabled={!state}
												required
											/>
											{errors.city_id && (
												<small className="text-danger">{errors.city_id}</small>
											)}
										</div>
										<div className="col-lg-6 col-md-6">
											<div className="mb-3">
												<label className="form-label">
													Postal Code
												</label>
												<input
													type="text"
													name="zip"
													className="form-control"
													value={form.zip}
													onChange={handleChange}
													required
												/>
												{errors.zip && (
													<small className="text-danger">{errors.zip}</small>
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

export default Profile;

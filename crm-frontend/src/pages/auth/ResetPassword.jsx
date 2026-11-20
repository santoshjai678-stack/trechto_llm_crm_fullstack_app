import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPasswordApi } from "../../services/authService";
import Swal from "sweetalert2";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email") || "";
    const tokenParam = params.get("token") || "";

    setEmail(emailParam);
    setToken(tokenParam);
  }, [location.search]);

  const togglePassword = () => setShowPassword((prev) => !prev);
  const toggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res = await resetPasswordApi({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });

      if (res.data?.status === true || res.data?.status === "true") {
        await Swal.fire({
          icon: "success",
          title: "Password Reset",
          text: "Your password has been updated. Redirecting to login...",
          confirmButtonColor: "#3085d6",
          timer: 2500,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        navigate("/login");
      }
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
    <form
      onSubmit={handleSubmit}
      className="w-100 p-4 pb-0 d-flex flex-column justify-content-between vh-100"
    >
      <div>
        {/* Logo */}
        <div className="text-center mb-4 auth-logo">
          <img src="/assets/img/logo.svg" className="img-fluid" alt="Logo" />
        </div>

        <div className="mb-3">
          <h3 className="mb-2">Reset Password</h3>
          <p className="mb-0">
            Enter a new password for your account.
          </p>
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="form-label">Email Address</label>
          <div className="input-group input-group-flat">
            <input
              type="email"
              className="form-control"
              value={email}
              readOnly
              required
            />
            <span className="input-group-text">
              <i className="ti ti-mail"></i>
            </span>
          </div>
          {errors.email && <small className="text-danger">{errors.email}</small>}
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="form-label">Password</label>
          <div className="input-group input-group-flat pass-group">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control pass-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="input-group-text toggle-password"
              onClick={togglePassword}
              style={{ cursor: "pointer" }}
            >
              <i className={`ti ${showPassword ? "ti-eye" : "ti-eye-off"}`} />
            </span>
          </div>
          {errors.password && <small className="text-danger">{errors.password}</small>}
        </div>

        {/* Password Confirmation */}
        <div className="mb-3">
          <label className="form-label">Confirm Password</label>
          <div className="input-group input-group-flat pass-group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="form-control pass-input"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
            />
            <span
              className="input-group-text toggle-password"
              onClick={toggleConfirmPassword}
              style={{ cursor: "pointer" }}
            >
              <i className={`ti ${showConfirmPassword ? "ti-eye" : "ti-eye-off"}`} />
            </span>
          </div>
          {errors.password_confirmation && (
            <small className="text-danger">{errors.password_confirmation}</small>
          )}
        </div>

        <div className="mb-3">
          <button className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </div>

      <div className="text-center pb-4">
        <p className="text-dark mb-0">
          © {new Date().getFullYear()} - CRMS
        </p>
      </div>
    </form>
  );
};

export default ResetPassword;

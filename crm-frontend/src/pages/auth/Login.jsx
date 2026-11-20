import React, { useState } from "react";
import { loginApi } from "../../services/authService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError("");

    try {
      const res = await loginApi({ email, password });

      if (res.data.status === "true") {
        const token = res.data?.data?.token;
        if (token) {
          localStorage.setItem("token", token);
          window.location.href = "/dashboard";
        } else {
          setError("Login failed: missing token.");
          setLoading(false);
        }
      }
    } catch (err) {
      setError(err.response?.data?.errors || err.response?.data?.message || "Invalid credentials");
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
          <h3 className="mb-2">Sign In</h3>
          <p className="mb-0">
            Access the CRMS panel using your email and passcode.
          </p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* Email */}
        <div className="mb-3">
          <label className="form-label">Email Address</label>
          <div className="input-group input-group-flat">
            <input
              type="email"
              className="form-control"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className="input-group-text">
              <i className="ti ti-mail"></i>
            </span>
          </div>
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="form-label">Password</label>
          <div className="input-group input-group-flat pass-group">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control pass-input"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
                className="input-group-text toggle-password"
                onClick={togglePassword}
                style={{ cursor: "pointer" }}
              >
                <i className={`ti ${showPassword ? "ti-eye" : "ti-eye-off"}`}></i>
            </span>
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="form-check form-check-md d-flex align-items-center">
            <input className="form-check-input mt-0" type="checkbox" defaultValue id="checkebox-md" defaultChecked />
            <label className="form-check-label text-dark ms-1" htmlFor="checkebox-md">
              Remember Me
            </label>
          </div>
          <div className="text-end">
            <a href="/forgot-password" className="link-danger fw-medium link-hover">Forgot Password?</a>
          </div>
        </div>
        <div className="mb-3">
          <button
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
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

export default Login;

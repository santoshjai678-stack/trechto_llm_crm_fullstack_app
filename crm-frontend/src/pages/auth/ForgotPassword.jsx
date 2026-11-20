import React, { useState } from "react";
import { forgotPasswordApi } from "../../services/authService";
import Swal from "sweetalert2";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError("");

    try {
      const res = await forgotPasswordApi({ email });

      if (res.data.status === "true" && res.data.status_code === 200) {
        await Swal.fire({
            icon: "success",
            title: "Forgot Password",
            text: "Password reset link sent to your email. Please check your inbox.",
            confirmButtonColor: "#3085d6",
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
        });

        window.location.href = "/login";
      }
    } catch (err) {
      setError(err.response?.data?.errors || err.response?.data?.message || "Invalid email");
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
          <h3 className="mb-2">Forgot Password?</h3>
          <p className="mb-0">
            If you forgot your password, well, then we’ll email you instructions to reset your password.
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

        <div className="mb-3">
          <button
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Submiting..." : "Submit"}
          </button>
        </div>
        <div className="mb-3 text-center">
            <p className="mb-0">Return to <a href="/login" className="link-indigo fw-bold link-hover"> Login</a></p>
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

export default ForgotPassword;

import React, { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { profileApi, logout } from "../../../services/authService";
import { UserContext } from "../../../context/UserContext";

const Header = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  
  const getImageSrc = () => {
		if (user && user.profile_image) {
		  return `${process.env.REACT_APP_IMAGE_UPLOAD_PATH}${user.profile_image}`;
		}
	  
		return "assets/img/profiles/avatar-02.jpg";
	};
	  
	const profileImageSrc = getImageSrc();

  // 🔹 Fetch profile
  useEffect(() => {
    profileApi()
      .then((res) => {
        const profileData = res.data.data;
        setUser(profileData);

        // store in localStorage so other components can use it
        localStorage.setItem("user", JSON.stringify(profileData));
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  // 🔹 Logout handler
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // ignore error (token may already be expired)
    } finally {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  return (
      <header className="navbar-header">
        <div className="page-container topbar-menu">
          <div className="d-flex align-items-center gap-2">
            {/* Logo */}
            <a href="index-2.html" className="logo">
              {/* Logo Normal */}
              <span className="logo-light">
                <span className="logo-lg"><img src="assets/img/logo.svg" alt="logo" /></span>
                <span className="logo-sm"><img src="assets/img/logo-small.svg" alt="small logo" /></span>
              </span>
              {/* Logo Dark */}
              <span className="logo-dark">
                <span className="logo-lg"><img src="assets/img/logo-white.svg" alt="dark logo" /></span>
              </span>
            </a>
            {/* Sidebar Mobile Button */}
            <a id="mobile_btn" className="mobile-btn" href="#sidebar">
              <i className="ti ti-menu-deep fs-24" />
            </a>
            <button className="sidenav-toggle-btn btn border-0 p-0" id="toggle_btn2"> 
              <i className="ti ti-arrow-bar-to-right" />
            </button> 
            {/* Search */}
            <div className="me-auto d-flex align-items-center header-search d-lg-flex d-none">
              {/* Search */}
              <div className="input-icon position-relative me-2">
                <input type="text" className="form-control" placeholder="Search Keyword" />
                <span className="input-icon-addon d-inline-flex p-0 header-search-icon"><i className="ti ti-command" /></span>
              </div>
              {/* /Search */}
            </div>
          </div>
          <div className="d-flex align-items-center">
            {/* Search for Mobile */}
            <div className="header-item d-flex d-lg-none me-2">
              <button className="topbar-link btn" data-bs-toggle="modal" data-bs-target="#searchModal" type="button">
                <i className="ti ti-search fs-16" />
              </button>
            </div>
            {/* Minimize */}
            <div className="header-item">
              <div className="dropdown me-2">
                <a href="javascript:void(0);" className="btn topbar-link btnFullscreen"><i className="ti ti-maximize" /></a>
              </div> 
            </div> 
            {/* Minimize */} 
            {/* Light/Dark Mode Button */}
            <div className="header-item d-none d-sm-flex me-2">
              <button className="topbar-link btn topbar-link" id="light-dark-mode" type="button">
                <i className="ti ti-moon fs-16" />
              </button>
            </div>
            <div className="header-line" />
            {/* message */}
            <div className="header-item">
              <div className="dropdown me-2">
                <a href="chat.html" className="btn topbar-link">
                  <i className="ti ti-message-circle-exclamation" />
                  <span className="badge rounded-pill">14</span>
                </a>
              </div> 
            </div>
            {/* Notification Dropdown */}
            <div className="header-item">
              <div className="dropdown me-2">
                <button className="topbar-link btn topbar-link dropdown-toggle drop-arrow-none" data-bs-toggle="dropdown" data-bs-offset="0,24" type="button" aria-haspopup="false" aria-expanded="false">
                  <i className="ti ti-bell-check fs-16 animate-ring" />
                  <span className="badge rounded-pill">10</span>
                </button>
                <div className="dropdown-menu p-0 dropdown-menu-end dropdown-menu-lg" style={{minHeight: 300}}>
                  <div className="p-2 border-bottom">
                    <div className="row align-items-center">
                      <div className="col">
                        <h6 className="m-0 fs-16 fw-semibold"> Notifications</h6>
                      </div>
                    </div>
                  </div>
                  {/* Notification Body */}
                  <div className="notification-body position-relative z-2 rounded-0" data-simplebar>
                    {/* Item*/}
                    <div className="dropdown-item notification-item py-3 text-wrap border-bottom" id="notification-1">
                      <div className="d-flex">
                        <div className="me-2 position-relative flex-shrink-0">
                          <img src="assets/img/users/user-01.jpg" className="avatar-md rounded-circle" alt="Img" />
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-0 fw-medium text-dark">John Doe</p>
                          <p className="mb-1 text-wrap">
                            left 6 comments on <span className="fw-medium text-dark">Isla Nublar SOC2 compliance report</span>
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fs-12"><i className="ti ti-clock me-1" />4 min ago</span>
                            <div className="notification-action d-flex align-items-center float-end gap-2">
                              <a href="javascript:void(0);" className="notification-read rounded-circle bg-danger" data-bs-toggle="tooltip" title="Make as Read" data-bs-original-title="Make as Read" aria-label="Make as Read" />
                              <button className="btn rounded-circle p-0" data-dismissible="#notification-1">
                                <i className="ti ti-x" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Item*/}
                    <div className="dropdown-item notification-item py-3 text-wrap border-bottom" id="notification-2">
                      <div className="d-flex">
                        <div className="me-2 position-relative flex-shrink-0">
                          <img src="assets/img/users/user-12.jpg" className="avatar-md rounded-circle" alt="Img" />
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-0 fw-medium text-dark">Thomas William</p>
                          <p className="mb-1 text-wrap">
                            “Oh, I finished de-bugging the phones, but the system's compiling for eighteen minutes, or twenty...”
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fs-12"><i className="ti ti-clock me-1" />8 min ago</span>
                            <div className="notification-action d-flex align-items-center float-end gap-2">
                              <a href="javascript:void(0);" className="notification-read rounded-circle bg-danger" data-bs-toggle="tooltip" title="Make as Read" data-bs-original-title="Make as Read" aria-label="Make as Read" />
                              <button className="btn rounded-circle p-0" data-dismissible="#notification-2">
                                <i className="ti ti-x" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Item*/}
                    <div className="dropdown-item notification-item py-3 text-wrap border-bottom" id="notification-3">
                      <div className="d-flex">
                        <div className="me-2 position-relative flex-shrink-0">
                          <img src="assets/img/profiles/avatar-12.jpg" className="avatar-md rounded-circle" alt="Img" />
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-0 fw-medium text-dark">Sarah Anderson</p>
                          <p className="mb-1 text-wrap">
                            attached a file to <span className="fw-medium text-dark">Isla Nublar SOC2 compliance report</span>
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fs-12"><i className="ti ti-clock me-1" />15 min ago</span>
                            <div className="notification-action d-flex align-items-center float-end gap-2">
                              <a href="javascript:void(0);" className="notification-read rounded-circle bg-danger" data-bs-toggle="tooltip" title="Make as Read" data-bs-original-title="Make as Read" aria-label="Make as Read" />
                              <button className="btn rounded-circle p-0" data-dismissible="#notification-3">
                                <i className="ti ti-x" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Item*/}
                    <div className="dropdown-item notification-item py-3 text-wrap" id="notification-4">
                      <div className="d-flex">
                        <div className="me-2 position-relative flex-shrink-0">
                          <img src="assets/img/profiles/avatar-08.jpg" className="avatar-md rounded-circle" alt="Img" />
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-0 fw-medium text-dark">Ann McClure</p>
                          <p className="mb-1 text-wrap">
                            mentioned you in <span className="fw-medium text-dark">Bug Fix Review - Task #432</span>
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fs-12"><i className="ti ti-clock me-1" />20 min ago</span>
                            <div className="notification-action d-flex align-items-center float-end gap-2">
                              <a href="javascript:void(0);" className="notification-read rounded-circle bg-danger" data-bs-toggle="tooltip" title="Make as Read" data-bs-original-title="Make as Read" aria-label="Make as Read" />
                              <button className="btn rounded-circle p-0" data-dismissible="#notification-4">
                                <i className="ti ti-x" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* View All*/}
                  <div className="p-2 rounded-bottom border-top text-center">
                    <a href="notifications.html" className="text-center text-decoration-underline fs-14 mb-0">
                      View All Notifications
                    </a>
                  </div>
                </div>
              </div>
            </div> 
            {/* User Dropdown */}
            <div className="dropdown profile-dropdown d-flex align-items-center justify-content-center">
              <a href="javascript:void(0);" className="topbar-link dropdown-toggle drop-arrow-none position-relative" data-bs-toggle="dropdown" data-bs-offset="0,22" aria-haspopup="false" aria-expanded="false">
                <img src={profileImageSrc} width={38} className="rounded-1 d-flex" alt="user-image" />
                <span className="online text-success"><i className="ti ti-circle-filled d-flex bg-white rounded-circle border border-1 border-white" /></span>
              </a>
              <div className="dropdown-menu dropdown-menu-end dropdown-menu-md p-2">
                <div className="d-flex align-items-center bg-light rounded-3 p-2 mb-2">
                  <img src={profileImageSrc} className="rounded-circle" width={42} height={42} alt="Img" />
                  <div className="ms-2">
                    <p className="fw-medium text-dark mb-0">{user?.name || "—"}</p>
                    <span className="d-block fs-13">{user?.role?.name || "—"}</span>
                  </div>
                </div>
                {/* Item*/}
                <Link to="/profile" className="dropdown-item">
                  <i className="ti ti-user-circle me-1 align-middle" />
                  <span className="align-middle">Profile Settings</span>
                </Link>
                <div className="pt-2 mt-2 border-top">
                  <button onClick={handleLogout} className="dropdown-item text-danger">
                    <i className="ti ti-logout me-1 fs-17 align-middle" />
                    <span className="align-middle">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

  );
};

export default Header;

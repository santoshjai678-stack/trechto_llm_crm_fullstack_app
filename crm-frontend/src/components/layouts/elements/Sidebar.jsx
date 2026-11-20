import React, { useEffect, useState, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { UserContext } from "../../../context/UserContext";

const Sidebar = () => {
  const { user } = useContext(UserContext);
  const roleId = user?.role_id;
  const isSuperAdmin = roleId === 1;
  const isBranchOwner = roleId === 2;
  const isBranchAdmin = roleId === 3;

  const location = useLocation();
  const isMasterActive = ["/country", "/state", "/city", "/role"].includes(location.pathname);
  const isSubscriptionActive = ["/subscription"].includes(location.pathname);
  const isBranchActive = ["/branch", "/sub-branch"].includes(location.pathname);
  const isEmployeeActive = ["/employee"].includes(location.pathname);
  const isFormSectionActive = ["/form-sections", "/dynamic-fields", '/dynamic-field-options'].includes(location.pathname);
  const isCommentActive = ["/comments"].includes(location.pathname);
  const isLeadActive = ["/leads"].includes(location.pathname);

  return (
     <>
      <div className="modal fade" id="searchModal">
        <div className="modal-dialog modal-lg">
          <div className="modal-content bg-transparent">
            <div className="card shadow-none mb-0">
              <div className="px-3 py-2 d-flex flex-row align-items-center" id="search-top">
                <i className="ti ti-search fs-22" />
                <input type="search" className="form-control border-0" placeholder="Search" />
                <button type="button" className="btn p-0" data-bs-dismiss="modal" aria-label="Close"><i className="ti ti-x fs-22" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* This is a single-line comment in JSX */}
      <div className="sidebar" id="sidebar">
        {/* Start Logo */}
        <div className="sidebar-logo">
          <div>
            {/* Logo Normal */}
            <a href="index-2.html" className="logo logo-normal">
              <img src="assets/img/logo.svg" alt="Logo" />
            </a>
            {/* Logo Small */}
            <a href="index-2.html" className="logo-small">
              <img src="assets/img/logo-small.svg" alt="Logo" />
            </a>
            {/* Logo Dark */}
            <a href="index-2.html" className="dark-logo">
              <img src="assets/img/logo-white.svg" alt="Logo" />
            </a>
          </div>
          <button className="sidenav-toggle-btn btn border-0 p-0 active" id="toggle_btn"> 
            <i className="ti ti-arrow-bar-to-left" />
          </button>
          {/* Sidebar Menu Close */}
          <button className="sidebar-close">
            <i className="ti ti-x align-middle" />
          </button>                
        </div>
        {/* End Logo */}
        {/* Sidenav Menu */}
        <div className="sidebar-inner" data-simplebar>                
          <div id="sidebar-menu" className="sidebar-menu">
            <ul>
              <li className="menu-title"><span>Main Menu</span></li>
              <li>
                <ul>
                  <li className={location.pathname === "/dashboard" ? "active" : ""}>
                    <Link to="/dashboard"><i className="ti ti-dashboard" /><span>Dashboard</span></Link>
                  </li>
                  {isSuperAdmin && (
                    <li className="submenu">
                      <a href="#" className={isMasterActive ? "active subdrop" : ""}>
                        <i className="ti ti-settings-cog" /><span>Master Setting</span>
                        <span className="menu-arrow" />
                      </a>
                      <ul>
                        <li><Link to="/country" className={location.pathname === "/country" ? "active" : ""}>Country</Link></li>
                        <li><Link to="/state" className={location.pathname === "/state" ? "active" : ""}>State</Link></li>
                        <li><Link to="/city" className={location.pathname === "/city" ? "active" : ""}>City</Link></li>
                        <li><Link to="/role" className={location.pathname === "/role" ? "active" : ""}>Role</Link></li>
                      </ul>
                    </li>
                  )}
                  {isSuperAdmin && (
                    <li className="submenu">
                      <a href="#" className={isSubscriptionActive ? "active subdrop" : ""}>
                        <i className="ti ti-brand-apple-podcast" /><span>Subscription</span>
                        <span className="menu-arrow" />
                      </a>
                      <ul>
                        <li><Link to="/subscription" className={location.pathname === "/subscription" ? "active" : ""}>Subscription</Link></li>
                      </ul>
                    </li>
                  )}
                  {(isSuperAdmin || isBranchOwner) && (
                    <li className="submenu">
                      <a href="#" className={isBranchActive ? "active subdrop" : ""}>
                        <i className="ti ti-brand-airtable" /><span>Branch</span>
                        <span className="menu-arrow" />
                      </a>
                      <ul>
                        {(isSuperAdmin) && (
                          <li><Link to="/branch" className={location.pathname === "/branch" ? "active" : ""}>Branch</Link></li>
                        )}
                        <li><Link to="/sub-branch" className={location.pathname === "/sub-branch" ? "active" : ""}>Sub-Branch</Link></li>
                      </ul>
                    </li>
                  )}
                  {(isSuperAdmin || isBranchOwner || isBranchAdmin) && (
                    <li className="submenu">
                      <a href="#" className={isEmployeeActive ? "active subdrop" : ""}>
                        <i className="ti ti-users" /><span>Employee</span>
                        <span className="menu-arrow" />
                      </a>
                      <ul>
                        <li><Link to="/employee" className={location.pathname === "/employee" ? "active" : ""}>Employee</Link></li>
                      </ul>
                    </li>
                  )}
                  {(isSuperAdmin || isBranchOwner || isBranchAdmin) && (
                    <li className="submenu">
                      <a href="#" className={isCommentActive ? "active subdrop" : ""}>
                        <i className="ti ti-message-check" /><span>Comments</span>
                        <span className="menu-arrow" />
                      </a>
                      <ul>
                        <li><Link to="/comments" className={location.pathname === "/comments" ? "active" : ""}>Comments</Link></li>
                      </ul>
                    </li>
                  )}                   
                  <li className="submenu">
                    <a href="#" className={isFormSectionActive ? "active subdrop" : ""}>
                      <i className="ti ti-forms" /><span>Section & Dynamic Fields</span>
                      <span className="menu-arrow" />
                    </a>
                    <ul>
                      <li><Link to="/form-sections" className={location.pathname === "/form-sections" ? "active" : ""}>Form Sections</Link></li>
                      <li><Link to="/dynamic-fields" className={location.pathname === "/dynamic-fields"  ? "active" : ""}>Dynamic Lead Fields</Link></li>
                      <li><Link to="/dynamic-field-options" className={location.pathname === "/dynamic-field-options" ? "active" : ""}>Dynamic Field Options</Link></li>
                    </ul>
                  </li>                
                  <li className="submenu">
                    <a href="#" className={isLeadActive ? "active subdrop" : ""}>
                      <i className="ti ti-chart-arcs" /><span>Lead</span>
                      <span className="menu-arrow" />
                    </a>
                    <ul>
                      <li><Link to="/leads" className={location.pathname === "/leads" ? "active" : ""}>Leads</Link></li>
                    </ul>
                  </li>
                                
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
      </>
  );
};

export default Sidebar;

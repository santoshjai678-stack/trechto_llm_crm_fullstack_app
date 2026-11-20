import React from "react";
import { useLocation } from 'react-router-dom';

const AuthLayout = ({ children }) => {
  const location = useLocation();
  let bgClass = 'account-bg-01';
  if (location.pathname.includes('forgot-password')) bgClass = 'account-bg-03';
  else if (location.pathname.includes('reset-password')) bgClass = 'account-bg-04';
  return (
    <div className="account-page bg-white">
      <div className="main-wrapper">
        <div className="overflow-hidden p-3 acc-vh">
          <div className="row vh-100 w-100 g-0">
            <div className="col-lg-6 vh-100 overflow-y-auto overflow-x-hidden">
              <div className="row">
                <div className="col-md-10 mx-auto vh-100 d-flex align-items-center">
                  {children}
                </div>
              </div>
            </div>

            {/* Right Side Background */}
            <div className={`col-lg-6 ${bgClass}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

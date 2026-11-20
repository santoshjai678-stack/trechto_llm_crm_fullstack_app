import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "../components/layouts/AuthLayout";
import AppLayout from "../components/layouts/AppLayout";

import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import Dashboard from "../pages/dashboard/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import Profile from "../pages/profile/Profile";
import ChangePassword from "../pages/profile/ChangePassword";
import Country from "../pages/master_setting/country/Country";
import State from "../pages/master_setting/state/State";
import City from "../pages/master_setting/city/City";
import Role from "../pages/master_setting/role/Role";
import Subscription from "../pages/master_setting/subscription/Subscription";
import Branch from "../pages/branch/Branch";
import SubBranch from "../pages/branch/SubBranch";
import Employee from "../pages/employee/Employee";
import Comment from "../pages/comment/Comment";
import FormSection from "../pages/formSection/FormSection";
import DynamicField from "../pages/dynamicField/DynamicField";
import DynamicOption from "../pages/dynamicField/DynamicOption";
import Lead from "../pages/leads/Lead";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        {/* Auth */}
        <Route
          path="/login"
          element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AuthLayout>
              <ForgotPassword />
            </AuthLayout>
          }
        />
        <Route
          path="/reset-password"
          element={
            <AuthLayout>
              <ResetPassword />
            </AuthLayout>
          }
        />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          }
        />
        {/* Profile */}
        <Route
          path="/profile"
          element={
            <AppLayout>
              <Profile />
            </AppLayout>
          }
        />
        {/* ChangePassword */}
        <Route
          path="/change-password"
          element={
            <AppLayout>
              <ChangePassword />
            </AppLayout>
          }
        />
        {/* Master Setting */}
        {/* Country */}
        <Route
          path="/country"
          element={
            <AppLayout>
              <Country />
            </AppLayout>
          }
        />
        {/* State */}
        <Route
          path="/state"
          element={
            <AppLayout>
              <State />
            </AppLayout>
          }
        />
        {/* City */}
        <Route
          path="/city"
          element={
            <AppLayout>
              <City />
            </AppLayout>
          }
        />
        {/* Role */}
        <Route
          path="/role"
          element={
            <AppLayout>
              <Role />
            </AppLayout>
          }
        />
        {/* Subscription */}
        <Route
          path="/subscription"
          element={
            <AppLayout>
              <Subscription />
            </AppLayout>
          }
        />
        
        {/* Branch */}
        <Route
          path="/branch"
          element={
            <AppLayout>
              <Branch />
            </AppLayout>
          }
        />
        {/* Sub-Branch */}
        <Route
          path="/sub-branch"
          element={
            <AppLayout>
              <SubBranch />
            </AppLayout>
          }
        />
        {/* Employee */}
        <Route
          path="/employee"
          element={
            <AppLayout>
              <Employee />
            </AppLayout>
          }
        />
        {/* Form Sections */}
        <Route
          path="/form-sections"
          element={
            <AppLayout>
              <FormSection />
            </AppLayout>
          }
        />
        {/* Dynamic Lead Fields */}
        <Route
          path="/dynamic-fields"
          element={
            <AppLayout>
              <DynamicField />
            </AppLayout>
          }
        />
        {/* Dynamic Field Options */}
        <Route
          path="/dynamic-field-options"
          element={
            <AppLayout>
              <DynamicOption />
            </AppLayout>
          }
        />
        {/* Comments */}
        <Route
          path="/comments"
          element={
            <AppLayout>
              <Comment />
            </AppLayout>
          }
        />
        {/* Leads */}
        <Route
          path="/leads"
          element={
            <AppLayout>
              <Lead />
            </AppLayout>
          }
        />
      </Route>

      {/* Default */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;

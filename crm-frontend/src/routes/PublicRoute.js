import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../utils/token";

const PublicRoute = () => {
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default PublicRoute;

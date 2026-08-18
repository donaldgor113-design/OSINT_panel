import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

export default function ProtectedRoute() {
  const status = useAppSelector((s) => s.auth.status);

  if (status !== "authenticated") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

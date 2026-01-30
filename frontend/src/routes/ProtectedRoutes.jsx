import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import AdminLayout from "../layouts/AdminLayout";
import DoctorLayout from "../layouts/DoctorLayout";
import PatientLayout from "../layouts/PatientLayout";
import StaffLayout from "../layouts/StaffLayout";

function ProtectedRoutes() {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;

  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />} />
      <Route path="/doctor" element={<DoctorLayout />} />
      <Route path="/patient" element={<PatientLayout />} />
      <Route path="/staff" element={<StaffLayout />} />
    </Routes>
  );
}

export default ProtectedRoutes;

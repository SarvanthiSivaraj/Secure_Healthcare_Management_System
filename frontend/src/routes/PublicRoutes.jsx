import { Routes, Route } from "react-router-dom";
import Login from "../auth/Login";
import RegisterPatient from "../auth/RegisterPatient";
import RegisterDoctor from "../auth/RegisterDoctor";
import RegisterOrganization from "../auth/RegisterOrganization";

function PublicRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register/patient" element={<RegisterPatient />} />
      <Route path="/register/doctor" element={<RegisterDoctor />} />
      <Route path="/register/org" element={<RegisterOrganization />} />
    </Routes>
  );
}

export default PublicRoutes;

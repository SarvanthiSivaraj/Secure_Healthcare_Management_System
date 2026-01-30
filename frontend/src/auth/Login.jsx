import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = () => {
    // mock login
    const user = {
      role: "ADMIN",
      verification_status: "VERIFIED"
    };

    login(user);

    // role-based redirect
    if (user.role === "ADMIN") navigate("/admin");
    if (user.role === "DOCTOR") navigate("/doctor");
    if (user.role === "PATIENT") navigate("/patient");
    if (user.role === "STAFF") navigate("/staff");
  };

  return (
    <div>
      <h2>Login</h2>
      <button onClick={handleLogin}>Mock Login</button>
    </div>
  );
}

export default Login;

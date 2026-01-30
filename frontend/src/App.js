import { AuthProvider } from "./context/AuthContext";
import PublicRoutes from "./routes/PublicRoutes";
import ProtectedRoutes from "./routes/ProtectedRoutes";

function App() {
  return (
    <AuthProvider>
      <PublicRoutes />
      <ProtectedRoutes />
    </AuthProvider>
  );
}

export default App;

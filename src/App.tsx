import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminLayout from "./components/admin-layout";
import ProtectedRoute from "./components/protected-route";
import AdminLogin from "./components/admin-login";
import Dashboard from "./pages/dashboard";
import Vendors from "./pages/vendors";
import UserAccounts from "./pages/users";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Login Page */}
        <Route path="/" element={<AdminLogin />} />

        {/* 1. Check if logged in */}
        <Route element={<ProtectedRoute />}>
          {/* 2. Wrap these in the Sidebar Layout */}
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/users" element={<UserAccounts />} />
          </Route>
        </Route>

        {/* Fallback for 404s */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;

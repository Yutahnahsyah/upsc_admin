import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Store, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  // Helper to check if a link is active
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar - Remains Static */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col fixed h-full">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-primary">UPSmart Canteen</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Button
            variant={isActive("/dashboard") ? "secondary" : "ghost"}
            className="w-full justify-start gap-2"
            onClick={() => navigate("/dashboard")}
          >
            <LayoutDashboard size={20} /> Dashboard
          </Button>
          <Button
            variant={isActive("/vendors") ? "secondary" : "ghost"} // Add the active state
            className="w-full justify-start gap-2"
            onClick={() => navigate("/vendors")} // Add the navigation logic
          >
            <Store size={20} /> Stalls & Vendors Accounts
          </Button>
          <Button
            variant={isActive("/users") ? "secondary" : "ghost"}
            className="w-full justify-start gap-2"
            onClick={() => navigate("/users")}
          >
            <Users size={20} /> User Accounts
          </Button>
        </nav>
        <div className="p-4 border-t">
          <Button
            variant="destructive"
            className="w-full gap-2"
            onClick={handleLogout}
          >
            <LogOut size={20} /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content - Changes based on Route */}
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}

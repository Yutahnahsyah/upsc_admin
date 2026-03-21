import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Store, Users, LogOut, ShieldUser } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  // Helper to check if a link is active
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar - Remains Static */}
      <aside className="fixed hidden h-full w-64 flex-col border-r bg-white md:flex">
        <div className="border-b p-6">
          <h2 className="text-primary text-xl font-bold">UPSmart Canteen</h2>
          <div className="mt-2 flex items-center gap-2 text-slate-600">
            <ShieldUser size={20} className="text-blue-500"></ShieldUser>
            <span className="truncate text-sm font-medium">Head Admin Account</span>
          </div>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          <Button variant={isActive('/dashboard') ? 'secondary' : 'ghost'} className="w-full justify-start gap-2" onClick={() => navigate('/dashboard')}>
            <LayoutDashboard size={20} /> Dashboard
          </Button>
          <Button
            variant={isActive('/vendors') ? 'secondary' : 'ghost'} // Add the active state
            className="w-full justify-start gap-2"
            onClick={() => navigate('/vendors')} // Add the navigation logic
          >
            <Store size={20} /> Stalls & Vendors Accounts
          </Button>
          <Button variant={isActive('/users') ? 'secondary' : 'ghost'} className="w-full justify-start gap-2" onClick={() => navigate('/users')}>
            <Users size={20} /> User Accounts
          </Button>
        </nav>
        <div className="border-t p-4">
          <Button variant="destructive" className="w-full gap-2" onClick={handleLogout}>
            <LogOut size={20} /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content - Changes based on Route */}
      <main className="ml-64 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}

import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Store, Users, LogOut, ShieldCheck, ChevronRight, ShieldUser } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/vendors': 'Manage Stalls & Vendors',
  '/users': 'Manage User Accounts',
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Admin Panel';

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/vendors', label: 'Stalls & Vendors', icon: Store },
    { path: '/users', label: 'User Accounts', icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ── Sidebar — copied exactly from VendorLayout ── */}
      <aside
        className="fixed hidden h-full flex-col overflow-hidden transition-all duration-200 md:flex md:w-16 lg:w-56"
        style={{ background: 'linear-gradient(180deg, #1a5c2a 0%, #14491f 60%, #0f3a18 100%)' }}
      >
        {/* Gold top accent */}
        <div className="h-1 w-full flex-shrink-0" style={{ background: 'linear-gradient(90deg, #c9a84c, #e8c96a, #c9a84c)' }} />

        {/* Brand — hidden on icon-only (md) */}
        <div className="hidden flex-shrink-0 border-b border-white/10 px-5 py-5 lg:block">
          <span className="text-xs font-semibold tracking-widest text-amber-300/80 uppercase">PHINMA Education</span>
          <h2 className="mt-0.5 text-lg leading-tight font-bold text-white">UPSmart Canteen</h2>
        </div>

        {/* Icon-only brand mark for md */}
        <div className="flex flex-shrink-0 items-center justify-center border-b border-white/10 py-4 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-400/20">
            <ShieldCheck className="h-4 w-4 text-amber-300" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          <p className="mb-2 hidden px-3 text-[10px] font-bold tracking-widest text-white/30 uppercase lg:block">Navigation</p>

          {navItems.map(({ path, label, icon: Icon }) => {
            const active = isActive(path);
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                title={label}
                className={`group flex w-full items-center rounded-xl px-2 py-2.5 text-sm font-medium transition-all duration-150 lg:justify-between lg:px-3 ${
                  active ? 'border border-white/20 bg-white/15 text-white shadow-sm' : 'border border-transparent text-white/60 hover:bg-white/8 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${active ? 'bg-amber-400/25' : 'bg-transparent group-hover:bg-white/10'}`}>
                    <Icon className={`h-4 w-4 ${active ? 'text-amber-300' : 'text-white/60 group-hover:text-white'}`} />
                  </div>
                  <span className="hidden lg:inline">{label}</span>
                </div>
                {active && <ChevronRight className="hidden h-3.5 w-3.5 text-amber-300/70 lg:block" />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="flex-shrink-0 border-t border-white/10 p-2 lg:p-4">
          <button
            onClick={handleLogout}
            title="Logout"
            className="group flex w-full items-center justify-center gap-3 rounded-xl border border-transparent px-2 py-2.5 text-sm font-medium text-white/60 transition-all hover:border-red-400/20 hover:bg-red-500/20 hover:text-red-300 lg:justify-start lg:px-3"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-transparent transition-all group-hover:bg-red-500/20">
              <LogOut className="h-4 w-4" />
            </div>
            <span className="hidden lg:inline">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Area — copied exactly from VendorLayout ── */}
      <div className="flex min-h-screen flex-1 flex-col md:ml-16 lg:ml-56">
        {/* ── Top Header Bar ── */}
        <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b px-6 py-3" style={{ backgroundColor: '#ffffff', borderColor: '#e8d99a' }}>
          {/* Left: Page Title */}
          <div>
            <h1 className="text-xl font-bold tracking-tight lg:text-2xl" style={{ color: '#1a5c2a' }}>
              {pageTitle}
            </h1>
            <div className="mt-0.5 h-0.5 rounded-full" style={{ width: `${pageTitle.length * 10}px`, background: 'linear-gradient(90deg, #c9a84c, #e8c96a, transparent)' }} />
          </div>

          {/* Right: Admin Badge — same sizing as vendor badges */}
          <div className="flex items-center gap-2 rounded-xl border px-3 py-1.5" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border" style={{ backgroundColor: '#dbeafe', borderColor: '#93c5fd' }}>
              <ShieldUser className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <div className="leading-tight">
              <p className="text-[9px] font-medium" style={{ color: '#9ca3af' }}>
                Logged in as
              </p>
              {/* Dynamic Vendor Name */}
              <p className="text-xs font-bold text-blue-700">Head Admin</p>
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1" style={{ backgroundColor: '#f0f7f1' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

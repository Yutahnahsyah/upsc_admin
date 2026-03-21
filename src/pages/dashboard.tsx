import { useState, useEffect } from 'react';
import { Users, Store, UserStar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  // 1. Define state to hold your counts
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    activeStalls: 0,
    inactiveStalls: 0,
  });
  const [loading, setLoading] = useState(true);

  // 2. Fetch data from your Express API
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // FIX: Changed from 'token' to 'adminToken' to match your working reference
        const token = localStorage.getItem('adminToken');

        const response = await fetch('http://localhost:3000/api/adminDashboard', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401 || response.status === 403) {
          console.error('Unauthorized or Forbidden. Check if adminToken is valid.');
          return;
        }

        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);
  return (
    <>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, Head Admin</h1>
      </header>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={loading ? '...' : stats.totalUsers.toLocaleString()} icon={<Users className="text-blue-500" />} />
        <StatCard title="Total Vendors" value={loading ? '...' : stats.totalVendors.toLocaleString()} icon={<UserStar className="text-gray-500" />} />
        <StatCard title="Active Stalls" value={loading ? '...' : stats.activeStalls.toLocaleString()} icon={<Store className="text-green-500" />} />
        <StatCard title="Inactive Stalls" value={loading ? '...' : stats.inactiveStalls.toLocaleString()} icon={<Store className="text-gray-500" />} />
      </div>

      <Card className="col-span-4 flex flex-col border-2 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-[200px] items-center justify-center rounded-md border-2 border-dashed">Main management table or charts will go here.</div>
        </CardContent>
      </Card>
    </>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

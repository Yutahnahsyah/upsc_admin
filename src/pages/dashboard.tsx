import { useState, useEffect } from 'react';
import { Users, Store, UserStar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    activeStalls: 0,
    inactiveStalls: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
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
    <div className="p-4 md:p-6 lg:p-8">
      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={loading ? '...' : stats.totalUsers.toLocaleString()} icon={<Users className="h-5 w-5" style={{ color: '#1a5c2a' }} />} />
        <StatCard title="Total Vendors" value={loading ? '...' : stats.totalVendors.toLocaleString()} icon={<UserStar className="h-5 w-5" style={{ color: '#c9a84c' }} />} />
        <StatCard title="Active Stalls" value={loading ? '...' : stats.activeStalls.toLocaleString()} icon={<Store className="h-5 w-5" style={{ color: '#1a5c2a' }} />} />
        <StatCard title="Inactive Stalls" value={loading ? '...' : stats.inactiveStalls.toLocaleString()} icon={<Store className="h-5 w-5 text-gray-400" />} />
      </div>

      {/* Recent Activity Card */}
      <Card className="flex flex-col shadow-sm" style={{ border: '1.5px solid #c9a84c', backgroundColor: '#ffffff' }}>
        <CardHeader>
          <CardTitle style={{ color: '#1a5c2a' }}>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex h-[200px] items-center justify-center rounded-md border-2 border-dashed text-sm" style={{ borderColor: '#b8d9be', color: '#6b7280', backgroundColor: '#f5fbf6' }}>
            Main management table or charts will go here.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="shadow-sm transition-shadow hover:shadow-md" style={{ border: '1.5px solid #c9a84c', backgroundColor: '#ffffff' }}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium" style={{ color: '#14491f' }}>
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="pt-3">
        <div className="text-2xl font-bold" style={{ color: '#1a5c2a' }}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

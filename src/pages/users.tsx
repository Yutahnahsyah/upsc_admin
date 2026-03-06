import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search, Trash2 } from 'lucide-react';

interface User {
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
  created_at: string;
}

export default function UserAccounts() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async (showRefreshToast = false) => {
    const token = localStorage.getItem('adminToken');
    try {
      if (showRefreshToast) setIsRefreshing(true);

      const response = await fetch('http://localhost:3000/api/allUsers', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data);

      if (showRefreshToast) toast.success('User list refreshed');
    } catch {
      toast.error('Error loading user data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employee_id.includes(searchTerm),
  );

  const handleDelete = async (employeeId: string) => {
    if (!confirm('Do you want to delete this employee?')) return;

    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch('http://localhost:3000/api/deleteUser', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ employee_id: employeeId }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to delete user');

      setUsers((prev) => prev.filter((user) => user.employee_id !== employeeId));

      // FIX: Use the dynamic message from your controller
      toast.success(data.message);
    } catch (err: any) {
      toast.error(err.message || 'Could not delete employee');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Manage User Accounts</h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>All Registered Employees</CardTitle>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => fetchUsers(true)} disabled={loading || isRefreshing}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>

            <div className="relative w-64">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input placeholder="Search users..." className="h-9 pl-8 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="mx-6 overflow-hidden rounded-md border border-slate-200">
            <Table className="w-full">
              <TableHeader className="sticky top-0 z-10 border-b bg-slate-50/50">
                <TableRow className={'grid w-full grid-cols-[0.8fr_1.5fr_1.5fr_1fr_1fr]'}>
                  <TableHead className="flex items-center py-3 pl-6">Employee ID</TableHead>
                  <TableHead className="flex items-center py-3">Full Name</TableHead>
                  <TableHead className="flex items-center py-3">Email</TableHead>
                  <TableHead className="flex items-center justify-center py-3">Department</TableHead>
                  <TableHead className="flex items-center justify-center py-3">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="block max-h-[400px] w-full overflow-y-auto">
                {loading ? (
                  <div className="text-muted-foreground py-10 text-center text-sm">Loading...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-muted-foreground py-10 text-center text-sm">No users found.</div>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow
                      key={user.employee_id}
                      className={`${'grid w-full grid-cols-[0.8fr_1.5fr_1.5fr_1fr_1fr]'} border-b transition-colors last:border-0 hover:bg-slate-50/30`}
                    >
                      <TableCell className="text-muted-foreground flex items-center py-2 pl-6 text-sm font-medium">#{user.employee_id}</TableCell>
                      <TableCell className="flex flex-col justify-center overflow-hidden py-2">
                        <div className="truncate text-sm font-medium">{user.full_name}</div>
                        <div className="text-muted-foreground text-[10px]">Joined {new Date(user.created_at).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground flex items-center truncate py-2 text-sm">{user.email}</TableCell>
                      <TableCell className="text-muted-foreground flex items-center justify-center py-2 text-sm">{user.department}</TableCell>
                      <TableCell className="flex items-center justify-center py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 h-8 text-xs"
                          onClick={() => handleDelete(user.employee_id)}
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

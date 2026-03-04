import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw, Search, Trash2 } from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async (showRefreshToast = false) => {
    const token = localStorage.getItem("adminToken");
    try {
      if (showRefreshToast) setIsRefreshing(true);

      const response = await fetch("http://localhost:3000/api/allUsers", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      setUsers(data);

      if (showRefreshToast) toast.success("User list updated");
    } catch {
      toast.error("Error loading user data");
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
    if (!confirm("Are you sure you want to delete this employee?")) return;

    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch("http://localhost:3000/api/deleteUser", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ employee_id: employeeId }),
      });

      if (!response.ok) throw new Error("Failed to delete user");

      setUsers((prev) =>
        prev.filter((user) => user.employee_id !== employeeId),
      );
      toast.success("Employee removed successfully");
    } catch {
      toast.error("Could not delete employee");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Manage User Accounts
      </h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>All Registered Employees</CardTitle>

          {/* Header Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => fetchUsers(true)}
              disabled={loading || isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>

            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8 h-9 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="mx-6 rounded-md border border-slate-200 overflow-hidden">
            <Table className="w-full flex flex-col">
              {/* FIXED HEADER */}
              <TableHeader className="block w-full bg-slate-50/50 border-b">
                <TableRow className="flex w-full">
                  <TableHead className="flex-[0.8] pl-6 py-3 flex items-center">
                    Employee ID
                  </TableHead>
                  <TableHead className="flex-[1.5] py-3 flex items-center">
                    Full Name
                  </TableHead>
                  <TableHead className="flex-[1.5] py-3 flex items-center">
                    Email
                  </TableHead>
                  <TableHead className="flex-1 py-3 flex items-center justify-center">
                    Department
                  </TableHead>
                  <TableHead className="flex-1 py-3 flex items-center justify-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              {/* SCROLLABLE BODY */}
              <TableBody className="block max-h-[400px] overflow-y-auto w-full">
                {loading ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    Loading users...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    No users found.
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow
                      key={user.employee_id}
                      className="flex w-full border-b last:border-0 hover:bg-slate-50/30 transition-colors"
                    >
                      <TableCell className="flex-[0.8] pl-6 py-2 flex items-center text-sm text-muted-foreground font-medium">
                        #{user.employee_id}
                      </TableCell>
                      <TableCell className="flex-[1.5] py-2 flex flex-col justify-center overflow-hidden">
                        <div className="font-medium text-sm truncate">
                          {user.full_name}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Joined{" "}
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="flex-[1.5] py-2 flex items-center text-sm truncate">
                        {user.email}
                      </TableCell>
                      <TableCell className="flex-1 py-2 flex items-center justify-center text-sm">
                        {user.department}
                      </TableCell>
                      <TableCell className="flex-1 py-2 flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(user.employee_id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Delete
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

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Search,
  Trash2,
  RefreshCw,
  Power,
  PowerOff,
  MapPin,
  Loader2,
  Store,
  User,
  Contact,
  RectangleEllipsis,
  Hash,
} from "lucide-react";

// --- Interfaces ---
interface Stall {
  stall_id: number;
  stall_name: string;
  location: string;
  is_active: boolean;
}

interface Vendor {
  admin_id: number;
  stall_id: number;
  stall_name?: string; // From the JOIN
  full_name: string;
  username: string;
}

export default function Vendors() {
  // Lists State
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);

  // Search States
  const [stallSearch, setStallSearch] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");

  // Form States
  const [stallData, setStallData] = useState({ stall_name: "", location: "" });
  const [isCreatingStall, setIsCreatingStall] = useState(false);
  const [vendorData, setVendorData] = useState({
    full_name: "",
    username: "",
    password: "",
    stall_id: "",
  });
  const [isRegisteringVendor, setIsRegisteringVendor] = useState(false);

  // Refresh States
  const [isRefreshingStalls, setIsRefreshingStalls] = useState(false);
  const [isRefreshingVendors, setIsRefreshingVendors] = useState(false);

  // --- API Handlers ---
  const fetchData = async () => {
    const token = localStorage.getItem("adminToken");
    try {
      const [stallsRes, vendorsRes] = await Promise.all([
        fetch("http://localhost:3000/api/allStalls", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:3000/api/allVendors", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const sData = await stallsRes.json();
      const vData = await vendorsRes.json();
      setStalls(Array.isArray(sData) ? sData : []);
      setVendors(Array.isArray(vData) ? vData : []);
    } catch {
      toast.error("Failed to load directories");
    } finally {
      setLoadingLists(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateStall = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Trim the values to remove leading/trailing whitespace
    const trimmedName = stallData.stall_name.trim();
    const trimmedLocation = stallData.location.trim();

    // 2. Validate that the fields aren't empty after trimming
    if (!trimmedName || !trimmedLocation) {
      toast.error(
        "Stall name and location cannot be empty or just whitespace.",
      );
      return; // Stop the function here
    }

    setIsCreatingStall(true);
    const token = localStorage.getItem("adminToken");

    try {
      const response = await fetch("http://localhost:3000/api/createStall", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // 3. Send the trimmed data to the server
        body: JSON.stringify({
          stall_name: trimmedName,
          location: trimmedLocation,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to create stall");
      toast.success("Stall created!");
      setStallData({ stall_name: "", location: "" });
      fetchData(); // Refresh lists
      setVendorData((prev) => ({
        ...prev,
        stall_id: data.stall.stall_id.toString(),
      }));
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsCreatingStall(false);
    }
  };

  const handleRegisterVendor = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Trim all string inputs to remove whitespace
    const fullName = vendorData.full_name.trim();
    const username = vendorData.username.trim();
    const password = vendorData.password; // Usually, we don't trim passwords (spaces can be intentional), but we check length
    const stallId = vendorData.stall_id.trim();
    const trimmedPassword = vendorData.password.trim();

    // 2. Validation: Check for empty/whitespace-only fields
    if (!fullName || !username || !password || !stallId) {
      return toast.error("All fields are required and cannot be empty.");
    }

    // 3. Validation: Full Name (Letters and spaces only)
    // Regex explanation: ^[a-zA-Z\s]+$ means start to end, only letters and whitespace
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(fullName)) {
      return toast.error("Full Name can only contain letters and spaces.");
    }

    // 4. Validation: Length constraints
    if (username.length < 6) {
      return toast.error("Username must be at least 6 characters long.");
    }
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters long.");
    }
    if (trimmedPassword.length < 6) {
      return toast.error(
        "Password must be at least 6 characters (excluding spaces).",
      );
    }
    if (!trimmedPassword) {
      return toast.error(
        "Password cannot be empty or consist only of whitespace.",
      );
    }

    // 5. Validation: Logic check (Existing)
    if (username.toLowerCase() === fullName.toLowerCase()) {
      return toast.error("Username and Full Name cannot be the same.");
    }

    setIsRegisteringVendor(true);
    const token = localStorage.getItem("adminToken");

    try {
      const response = await fetch("http://localhost:3000/api/registerVendor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // 6. Send the cleaned/trimmed data
        body: JSON.stringify({
          ...vendorData,
          full_name: fullName,
          username: username,
          stall_id: stallId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      toast.success("Vendor account created");
      setVendorData({
        full_name: "",
        username: "",
        password: "",
        stall_id: "",
      });
      fetchData();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsRegisteringVendor(false);
    }
  };

  const toggleStallStatus = async (stallId: number, currentStatus: boolean) => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch(
        "http://localhost:3000/api/updateStallStatus",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            stall_id: stallId,
            is_active: !currentStatus,
          }),
        },
      );

      if (!response.ok) throw new Error("Update failed");

      // Local UI update: Find the stall and flip its status
      setStalls((prev) =>
        prev.map((s) =>
          s.stall_id === stallId ? { ...s, is_active: !currentStatus } : s,
        ),
      );
      toast.success(`Stall is now ${!currentStatus ? "Active" : "Inactive"}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteStall = async (stallId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this stall? This will remove all associated data.",
      )
    )
      return;

    const token = localStorage.getItem("adminToken");

    try {
      const response = await fetch("http://localhost:3000/api/deleteStall", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // Matching the pattern of sending the ID in the body
        body: JSON.stringify({ stall_id: stallId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete stall");
      }

      // 2. Update the UI locally (assuming your state is called 'stalls')
      setStalls((prev) => prev.filter((stall) => stall.stall_id !== stallId));

      toast.success("Stall removed successfully");
    } catch {
      toast.error("Could not delete stall");
    }
  };

  const handleDeleteVendor = async (adminId: number) => {
    // Always ask for confirmation before deleting data!
    if (!confirm("Are you sure you want to delete this vendor account?"))
      return;

    const token = localStorage.getItem("adminToken");
    try {
      const response = await fetch("http://localhost:3000/api/deleteVendor", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ admin_id: adminId }),
      });

      if (!response.ok) throw new Error("Failed to delete vendor"); // Update the UI locally so the vendor disappears immediately

      setVendors((prev) =>
        prev.filter((vendor) => vendor.admin_id !== adminId),
      );
      toast.success("Vendor removed successfully");
    } catch {
      toast.error("Could not delete vendor");
    }
  };

  // Function to refresh stalls
  const fetchStalls = async (showToast = false) => {
    try {
      if (showToast) setIsRefreshingStalls(true);
      const token = localStorage.getItem("adminToken");
      const response = await fetch("http://localhost:3000/api/allStalls", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setStalls(data); // Using setStalls as suggested by your TS error
      if (showToast) toast.success("Stall list refreshed");
    } catch {
      toast.error("Failed to refresh stalls");
    } finally {
      setIsRefreshingStalls(false);
    }
  };

  // Function to refresh vendors
  const fetchVendors = async (showToast = false) => {
    try {
      if (showToast) setIsRefreshingVendors(true);
      const token = localStorage.getItem("adminToken");
      const response = await fetch("http://localhost:3000/api/allVendors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setVendors(data); // Using setVendors as suggested by your TS error
      if (showToast) toast.success("Vendor list refreshed");
    } catch {
      toast.error("Failed to refresh vendors");
    } finally {
      setIsRefreshingVendors(false);
    }
  };

  // --- Filter Logic ---
  const filteredStalls = stalls.filter(
    (s) =>
      s.stall_name.toLowerCase().includes(stallSearch.toLowerCase()) ||
      s.stall_id.toString().includes(stallSearch),
  );

  const filteredVendors = vendors.filter(
    (v) =>
      v.full_name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
      v.username.toLowerCase().includes(vendorSearch),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Manage Stalls & Vendors
      </h1>

      {/* Forms Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Stall Form Card (Your existing code) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Initialize New Stall</CardTitle>
            </div>
            <CardDescription>
              Set up the physical stall location first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateStall} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Stall Name</label>
                <div className="relative">
                  <Store className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Enter the stall name here..."
                    value={stallData.stall_name}
                    onChange={(e) =>
                      setStallData({ ...stallData, stall_name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Enter the location of stall..."
                    value={stallData.location}
                    onChange={(e) =>
                      setStallData({ ...stallData, location: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <Button
                className="w-full"
                type="submit"
                disabled={isCreatingStall}
              >
                {isCreatingStall && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Stall
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Vendor Form Card (Your existing code) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Register Vendor Account</CardTitle>
            </div>
            <CardDescription>
              Assign a manager to an existing stall ID.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegisterVendor} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <div className="relative">
                    <Contact className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Enter your full name here..."
                      value={vendorData.full_name}
                      onChange={(e) =>
                        setVendorData({
                          ...vendorData,
                          full_name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stall ID</label>
                  <div className="relative">
                    <Hash className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      type="number"
                      placeholder="ID of an existing stall..."
                      value={vendorData.stall_id}
                      onChange={(e) =>
                        setVendorData({
                          ...vendorData,
                          stall_id: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Enter your username here..."
                    value={vendorData.username}
                    onChange={(e) =>
                      setVendorData({ ...vendorData, username: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Temporary Password
                </label>
                <div className="relative">
                  <RectangleEllipsis className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    type="password"
                    placeholder="••••••••"
                    value={vendorData.password}
                    onChange={(e) =>
                      setVendorData({ ...vendorData, password: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <Button
                className="w-full"
                type="submit"
                disabled={isRegisteringVendor}
              >
                {isRegisteringVendor && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Register Vendor
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stall Directory Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Stall Directory</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => fetchStalls(true)}
                disabled={loadingLists || isRefreshingStalls}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshingStalls ? "animate-spin" : ""}`}
                />
              </Button>
              <div className="relative w-48">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search stalls..."
                  className="pl-8 h-9 text-sm"
                  value={stallSearch}
                  onChange={(e) => setStallSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* HORIZONTAL SCROLL WRAPPER */}
            <div className="mx-6 rounded-md border border-slate-200 overflow-x-auto">
              {/* MIN-WIDTH ensures the layout doesn't collapse on mobile */}
              <Table className="w-full min-w-[700px]">
                {/* HEADER */}
                <TableHeader className="bg-slate-50/50 border-b sticky top-0 z-10">
                  {/* Using a grid ratio that prioritizes the Name/Location column */}
                  <TableRow className="grid grid-cols-[0.8fr_2fr_1fr_2.2fr] w-full">
                    <TableHead className="pl-6 py-3 flex items-center">
                      Stall ID
                    </TableHead>
                    <TableHead className="py-3 flex items-center">
                      Stall Name
                    </TableHead>
                    <TableHead className="py-3 flex items-center justify-center">
                      Status
                    </TableHead>
                    <TableHead className="py-3 flex items-center justify-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                {/* BODY */}
                <TableBody className="block max-h-[232px] overflow-y-auto w-full">
                  {loadingLists ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                      Loading...
                    </div>
                  ) : filteredStalls.length === 0 ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                      No stalls found.
                    </div>
                  ) : (
                    filteredStalls.map((s) => (
                      <TableRow
                        key={s.stall_id}
                        className="grid grid-cols-[0.85fr_2.15fr_1fr_2.2fr] w-full border-b last:border-0 hover:bg-slate-50/30 transition-colors"
                      >
                        <TableCell className="pl-6 py-3 flex items-center text-sm font-medium">
                          #{s.stall_id}
                        </TableCell>

                        <TableCell className="py-3 flex flex-col justify-center min-w-0">
                          <div className="font-semibold text-sm leading-tight truncate">
                            {s.stall_name}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {s.location}
                          </div>
                        </TableCell>

                        <TableCell className="py-3 flex items-center justify-center">
                          <span
                            className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                              s.is_active
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}
                          >
                            {s.is_active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>

                        <TableCell className="py-3 flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 text-xs ${
                              s.is_active
                                ? "text-slate-500"
                                : "text-green-600 font-bold"
                            }`}
                            onClick={() =>
                              toggleStallStatus(s.stall_id, s.is_active)
                            }
                          >
                            {s.is_active ? (
                              <PowerOff className="mr-1.5 h-3.5 w-3.5" />
                            ) : (
                              <Power className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            {s.is_active ? "Deactivate" : "Activate"}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteStall(s.stall_id)}
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
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
        {/* Vendor Directory Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Vendor Directory</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => fetchVendors(true)}
                disabled={loadingLists || isRefreshingVendors}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshingVendors ? "animate-spin" : ""}`}
                />
              </Button>
              <div className="relative w-48">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
                  className="pl-8 h-9 text-sm"
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* 1. HORIZONTAL SCROLL WRAPPER */}
            <div className="mx-6 rounded-md border border-slate-200 overflow-x-auto">
              {/* 2. MIN-WIDTH ensures the table doesn't squish on small screens */}
              <Table className="w-full min-w-[600px]">
                {/* HEADER */}
                <TableHeader className="bg-slate-50/50 border-b sticky top-0 z-10">
                  <TableRow className="grid grid-cols-[1.5fr_1.5fr_0.8fr_1fr] w-full">
                    <TableHead className="pl-6 py-3 flex items-center">
                      Full Name
                    </TableHead>
                    <TableHead className="py-3 flex items-center">
                      Username
                    </TableHead>
                    <TableHead className="py-3 flex items-center justify-center text-center">
                      Stall ID
                    </TableHead>
                    <TableHead className="py-3 flex items-center justify-center text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                {/* BODY */}
                <TableBody className="block max-h-[244px] overflow-y-auto w-full">
                  {loadingLists ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                      Loading vendors...
                    </div>
                  ) : filteredVendors.length === 0 ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                      No vendors found.
                    </div>
                  ) : (
                    filteredVendors.map((v) => (
                      <TableRow
                        key={v.admin_id}
                        className="grid grid-cols-[1.5fr_1.4fr_1fr_0.8fr] w-full border-b last:border-0 hover:bg-slate-50/30 transition-colors"
                      >
                        <TableCell className="pl-6 py-2 flex items-center text-sm truncate font-medium">
                          {v.full_name}
                        </TableCell>
                        <TableCell className="py-2 flex items-center text-sm text-muted-foreground truncate">
                          {v.username}
                        </TableCell>
                        <TableCell className="py-2 flex items-center justify-center text-sm text-muted-foreground font-medium">
                          #{v.stall_id}
                        </TableCell>
                        <TableCell className="py-2 flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteVendor(v.admin_id)}
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
        </Card>{" "}
      </div>
    </div>
  );
}

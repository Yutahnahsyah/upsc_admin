import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Search, Trash2, RefreshCw, Power, PowerOff, MapPin, Store, User, Contact, RectangleEllipsis, Hash } from 'lucide-react';

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
  stall_name?: string;
  full_name: string;
  username: string;
}

export default function Vendors() {
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);

  const [stallSearch, setStallSearch] = useState('');
  const [vendorSearch, setVendorSearch] = useState('');

  const [stallData, setStallData] = useState({ stall_name: '', location: '' });
  const [vendorData, setVendorData] = useState({
    full_name: '',
    username: '',
    password: '',
    stall_id: '',
  });

  // --- API Helper ---
  const apiCall = async (endpoint: string, options: RequestInit) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`http://localhost:3000/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json();
    // If the controller sends res.status(400+), this throws and
    // Sonner uses data.message for the 'error' toast.
    if (!response.ok) throw new Error(data.message || 'An error occurred');
    return data; // This 'data' contains your controller's success message
  };

  // --- Optimized Fetchers ---

  const fetchStalls = useCallback(async (isManual = false) => {
    const promise = apiCall(`/allStalls?t=${Date.now()}`, { method: 'GET' });

    if (isManual) {
      toast.promise(promise, {
        loading: 'Updating Stall Directory...',
        success: (data) => {
          setStalls(Array.isArray(data) ? data : []);
          return 'Stalls refreshed';
        },
        error: (err) => err.message,
      });
    } else {
      try {
        const data = await promise;
        setStalls(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Failed to load stalls');
      }
    }
  }, []);

  const fetchVendors = useCallback(async (isManual = false) => {
    const promise = apiCall(`/allVendors?t=${Date.now()}`, { method: 'GET' });

    if (isManual) {
      toast.promise(promise, {
        loading: 'Updating Vendor Directory...',
        success: (data) => {
          setVendors(Array.isArray(data) ? data : []);
          return 'Vendors refreshed';
        },
        error: (err) => err.message,
      });
    } else {
      try {
        const data = await promise;
        setVendors(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Failed to load vendors');
      }
    }
  }, []);

  // --- Initial Load ---
  useEffect(() => {
    const loadAll = async () => {
      setLoadingLists(true);
      await Promise.all([fetchStalls(false), fetchVendors(false)]);
      setLoadingLists(false);
    };
    loadAll();
  }, [fetchStalls, fetchVendors]);

  // --- Handlers ---
  const handleCreateStall = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = stallData.stall_name.trim();
    const trimmedLocation = stallData.location.trim();

    if (!trimmedName || !trimmedLocation) {
      return toast.error('All fields are required');
    }

    const promise = apiCall('/createStall', {
      method: 'POST',
      body: JSON.stringify({ stall_name: trimmedName, location: trimmedLocation }),
    });

    toast.promise(promise, {
      loading: 'Initializing stall...',
      success: (data) => {
        setStallData({ stall_name: '', location: '' });
        fetchStalls();
        return data.message;
      },
      error: (err) => err.message,
    });
  };

  const handleRegisterVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = vendorData.full_name.trim();
    const username = vendorData.username.trim();
    const stallId = vendorData.stall_id.trim();
    const password = vendorData.password;

    if (!fullName || !username || !password || !stallId) {
      return toast.error('All fields are required');
    }

    const promise = apiCall('/registerVendor', {
      method: 'POST',
      body: JSON.stringify({ ...vendorData, full_name: fullName, username, stall_id: stallId }),
    });

    toast.promise(promise, {
      loading: 'Registering vendor account...',
      success: (data) => {
        setVendorData({ full_name: '', username: '', password: '', stall_id: '' });
        fetchVendors();
        return data.message;
      },
      error: (err) => err.message,
    });
  };

  const toggleStallStatus = async (stallId: number, currentStatus: boolean) => {
    const promise = apiCall('/updateStallStatus', {
      method: 'PATCH',
      body: JSON.stringify({ stall_id: stallId, is_active: !currentStatus }),
    });

    toast.promise(promise, {
      loading: 'Updating status...',
      success: (data) => {
        setStalls((prev) => prev.map((s) => (s.stall_id === stallId ? { ...s, is_active: !currentStatus } : s)));
        return data.message;
      },
      error: (err) => err.message,
    });
  };

  const handleDeleteStall = async (stallId: number) => {
    if (!confirm('Do you want to delete this stall?')) return;
    const promise = apiCall('/deleteStall', {
      method: 'DELETE',
      body: JSON.stringify({ stall_id: stallId }),
    });

    toast.promise(promise, {
      loading: 'Deleting stall...',
      success: (data) => {
        setStalls((prev) => prev.filter((s) => s.stall_id !== stallId));
        return data.message;
      },
      error: (err) => err.message,
    });
  };

  const handleDeleteVendor = async (adminId: number) => {
    if (!confirm('Do you want to delete this vendor?')) return;
    const promise = apiCall('/deleteVendor', {
      method: 'DELETE',
      body: JSON.stringify({ admin_id: adminId }),
    });

    toast.promise(promise, {
      loading: 'Removing vendor...',
      success: (data) => {
        setVendors((prev) => prev.filter((v) => v.admin_id !== adminId));
        return data.message; // Uses res.json({ message: "..." }) from back-end
      },
      error: (err) => err.message,
    });
  };

  // --- Filter Logic ---
  const filteredStalls = useMemo(() => stalls.filter((s) => s.stall_name.toLowerCase().includes(stallSearch.toLowerCase()) || s.stall_id.toString().includes(stallSearch)), [stalls, stallSearch]);

  const filteredVendors = useMemo(
    () => vendors.filter((v) => v.full_name.toLowerCase().includes(vendorSearch.toLowerCase()) || v.username.toLowerCase().includes(vendorSearch)),
    [vendors, vendorSearch]
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Manage Stalls & Vendors</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Initialize New Stall */}
        <Card>
          <CardHeader>
            <CardTitle>Initialize New Stall</CardTitle>
            <CardDescription>Set up the physical stall location first.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateStall} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Stall Name</label>
                <div className="relative">
                  <Store className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                  <Input
                    className="pl-9"
                    placeholder="Enter the stall name here..."
                    value={stallData.stall_name}
                    onChange={(e) => setStallData({ ...stallData, stall_name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <div className="relative">
                  <MapPin className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                  <Input className="pl-9" placeholder="Enter the location of stall..." value={stallData.location} onChange={(e) => setStallData({ ...stallData, location: e.target.value })} required />
                </div>
              </div>
              <button className="w-full rounded-md bg-[#111] py-2 font-medium text-white transition-all hover:bg-black">Create Stall</button>
            </form>
          </CardContent>
        </Card>

        {/* Register Vendor Account */}
        <Card>
          <CardHeader>
            <CardTitle>Register Vendor Account</CardTitle>
            <CardDescription>Assign a manager to an existing stall ID.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegisterVendor} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <div className="relative">
                    <Contact className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                    <Input
                      className="pl-9"
                      placeholder="Enter the full name here..."
                      value={vendorData.full_name}
                      onChange={(e) => setVendorData({ ...vendorData, full_name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stall ID</label>
                  <div className="relative">
                    <Hash className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                    <Input
                      className="pl-9"
                      type="number"
                      placeholder="ID of an existing stall..."
                      value={vendorData.stall_id}
                      onChange={(e) => setVendorData({ ...vendorData, stall_id: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <div className="relative">
                  <User className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                  <Input className="pl-9" placeholder="Enter the username here..." value={vendorData.username} onChange={(e) => setVendorData({ ...vendorData, username: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Temporary Password</label>
                <div className="relative">
                  <RectangleEllipsis className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                  <Input className="pl-9" type="password" placeholder="••••••••" value={vendorData.password} onChange={(e) => setVendorData({ ...vendorData, password: e.target.value })} required />
                </div>
              </div>
              <button className="w-full rounded-md bg-[#111] py-2 font-medium text-white transition-all hover:bg-black">Register Vendor</button>
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
                onClick={() => fetchStalls(true)} // Calls only Stalls
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <div className="relative w-48">
                <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                <Input placeholder="Search stalls..." className="h-9 pl-8 text-sm" value={stallSearch} onChange={(e) => setStallSearch(e.target.value)} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="mx-6 overflow-x-auto rounded-md border border-slate-200">
              <Table className="w-full min-w-[700px]">
                <TableHeader className="sticky top-0 z-10 border-b bg-slate-50/50">
                  <TableRow className="grid w-full grid-cols-[0.8fr_2fr_1fr_2.2fr]">
                    <TableHead className="flex items-center py-3 pl-6">Stall ID</TableHead>
                    <TableHead className="flex items-center py-3">Stall Name</TableHead>
                    <TableHead className="flex items-center justify-center py-3">Status</TableHead>
                    <TableHead className="flex items-center justify-center py-3">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="block max-h-[242px] w-full overflow-y-auto">
                  {loadingLists ? (
                    <div className="text-muted-foreground py-10 text-center text-sm">Loading...</div>
                  ) : (
                    filteredStalls.map((s) => (
                      <TableRow key={s.stall_id} className="grid w-full grid-cols-[0.85fr_2.15fr_1fr_2.2fr] border-b last:border-0 hover:bg-slate-50/30">
                        <TableCell className="flex items-center py-3 pl-6 text-sm font-medium">#{s.stall_id}</TableCell>
                        <TableCell className="flex min-w-0 flex-col justify-center py-3">
                          <div className="truncate text-sm font-semibold">{s.stall_name}</div>
                          <div className="text-muted-foreground truncate text-[11px]">{s.location}</div>
                        </TableCell>
                        <TableCell className="flex items-center justify-center py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${s.is_active ? 'border border-green-200 bg-green-100 text-green-700' : 'border border-slate-200 bg-slate-100 text-slate-500'}`}
                          >
                            {s.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell className="flex items-center justify-center gap-1 py-3">
                          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => toggleStallStatus(s.stall_id, s.is_active)}>
                            {s.is_active ? <PowerOff className="mr-1.5 h-3.5 w-3.5" /> : <Power className="mr-1.5 h-3.5 w-3.5" />}
                            {s.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 h-8 text-xs" onClick={() => handleDeleteStall(s.stall_id)}>
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
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
                onClick={() => fetchVendors(true)} // Calls only Vendors
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <div className="relative w-48">
                <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                <Input placeholder="Search vendors..." className="h-9 pl-8 text-sm" value={vendorSearch} onChange={(e) => setVendorSearch(e.target.value)} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="mx-6 overflow-x-auto rounded-md border border-slate-200">
              <Table className="w-full min-w-[600px]">
                <TableHeader className="sticky top-0 z-10 border-b bg-slate-50/50">
                  <TableRow className="grid w-full grid-cols-[1.5fr_1.5fr_0.8fr_1fr]">
                    <TableHead className="flex items-center py-3 pl-6">Full Name</TableHead>
                    <TableHead className="flex items-center py-3">Username</TableHead>
                    <TableHead className="flex items-center justify-center py-3">Stall ID</TableHead>
                    <TableHead className="flex items-center justify-center py-3">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="block max-h-[244px] w-full overflow-y-auto">
                  {loadingLists ? (
                    <div className="text-muted-foreground py-10 text-center text-sm">Loading...</div>
                  ) : (
                    filteredVendors.map((v) => (
                      <TableRow key={v.admin_id} className="grid w-full grid-cols-[1.5fr_1.4fr_1fr_0.8fr] border-b last:border-0 hover:bg-slate-50/30">
                        <TableCell className="flex items-center truncate py-2 pl-6 text-sm font-medium">{v.full_name}</TableCell>
                        <TableCell className="text-muted-foreground flex items-center truncate py-2 text-sm">{v.username}</TableCell>
                        <TableCell className="text-muted-foreground flex items-center justify-center py-2 text-sm font-medium">#{v.stall_id}</TableCell>
                        <TableCell className="flex items-center justify-center py-2">
                          <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 h-8 text-xs" onClick={() => handleDeleteVendor(v.admin_id)}>
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
    </div>
  );
}

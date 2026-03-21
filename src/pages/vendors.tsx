import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Search, Trash2, RefreshCw, Power, PowerOff, MapPin, Store, User, Contact, RectangleEllipsis, Archive, Edit } from 'lucide-react';
import { PasswordInput } from '@/components/ui/password-input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// --- Interfaces ---
interface Stall {
  stall_id: number;
  stall_name: string;
  location: string;
  is_active: boolean;
}

export interface Vendor {
  admin_id: number;
  full_name: string;
  username: string;
  stall_id: number;
  is_active: boolean;
  stall_name?: string;
  new_password?: string;
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

  const [vendorTab, setVendorTab] = useState<'active' | 'archived'>('active');
  const [stallTab, setStallTab] = useState<'active' | 'deactivated'>('active');

  // Modal States
  const [editingStall, setEditingStall] = useState<Stall | null>(null);
  const [isStallEditOpen, setIsStallEditOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [isVendorEditOpen, setIsVendorEditOpen] = useState(false);

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
    if (!response.ok) throw new Error(data.message || 'An error occurred');
    return data;
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
    if (!trimmedName || !trimmedLocation) return toast.error('All fields are required');

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

  const handleUpdateStall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStall) return;

    const promise = apiCall(`/updateStallProfile/${editingStall.stall_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        stall_name: editingStall.stall_name,
        location: editingStall.location,
      }),
    });

    toast.promise(promise, {
      loading: 'Saving changes...',
      success: (data) => {
        setStalls((prev) => prev.map((s) => (s.stall_id === editingStall.stall_id ? { ...s, ...editingStall } : s)));
        setIsStallEditOpen(false);
        return data.message;
      },
      error: (err) => err.message,
    });
  };

  const handleUpdateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendor) return;

    if (editingVendor.new_password && editingVendor.new_password.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }

    const updatePromise = (async () => {
      await apiCall(`/updateVendor/${editingVendor.admin_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          full_name: editingVendor.full_name,
          username: editingVendor.username,
          stall_id: editingVendor.stall_id,
        }),
      });

      if (editingVendor.new_password) {
        await apiCall('/changeVendorPassword', {
          method: 'PATCH',
          body: JSON.stringify({
            admin_id: editingVendor.admin_id,
            new_password: editingVendor.new_password,
          }),
        });
      }

      fetchVendors();
      setIsVendorEditOpen(false);
    })();

    toast.promise(updatePromise, {
      loading: 'Updating vendor profile...',
      success: 'Vendor updated successfully',
      error: (err) => err.message || 'Failed to update vendor',
    });
  };

  const handleDeleteStall = async (stallId: number) => {
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

  const handleArchiveVendor = async (adminId: number) => {
    const vendor = vendors.find((v) => v.admin_id === adminId);
    if (!vendor) return;

    const promise = apiCall('/archiveVendor', {
      method: 'DELETE',
      body: JSON.stringify({ admin_id: adminId }),
    });

    toast.promise(promise, {
      loading: `${vendor.is_active ? 'Archiving' : 'Restoring'} vendor...`,
      success: (data) => {
        setVendors((prev) => prev.map((v) => (v.admin_id === adminId ? { ...v, is_active: !v.is_active } : v)));
        return data.message;
      },
      error: (err) => err.message,
    });
  };

  // --- Filter Logic ---
  const filteredStalls = stalls.filter((s) => {
    const matchesSearch = s.stall_name.toLowerCase().includes(stallSearch.toLowerCase());
    const matchesTab = stallTab === 'active' ? s.is_active : !s.is_active;
    return matchesSearch && matchesTab;
  });

  const filteredVendors = useMemo(() => {
    return vendors
      .filter((v) => {
        const matchesSearch = v.full_name.toLowerCase().includes(vendorSearch.toLowerCase()) || v.username.toLowerCase().includes(vendorSearch);
        const matchesTab = vendorTab === 'active' ? v.is_active : !v.is_active;
        return matchesSearch && matchesTab;
      })
      .sort((a, b) => b.stall_id - a.stall_id);
  }, [vendors, vendorSearch, vendorTab]);

  const uniqueLocations = useMemo(() => {
    const locations = stalls.map((s) => s.location);
    return Array.from(new Set(locations)).filter((loc) => loc && loc.trim() !== '');
  }, [stalls]);

  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Manage Stalls & Vendors</h1>
      </header>

      {/* --- Modals --- */}
      <Dialog open={isStallEditOpen} onOpenChange={setIsStallEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Stall Details</DialogTitle>
            <DialogDescription>Update the name and physical location for this stall.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateStall} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Stall Name</label>
              <div className="relative">
                <Store className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                <Input className="pl-9" value={editingStall?.stall_name || ''} onChange={(e) => setEditingStall((prev) => (prev ? { ...prev, stall_name: e.target.value } : null))} required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <div className="relative">
                <MapPin className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                <Input className="pl-9" value={editingStall?.location || ''} onChange={(e) => setEditingStall((prev) => (prev ? { ...prev, location: e.target.value } : null))} required />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsStallEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-black text-white hover:bg-slate-800">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isVendorEditOpen} onOpenChange={setIsVendorEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Vendor Profile</DialogTitle>
            <DialogDescription>Update vendor details, stall assignment, or credentials.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateVendor} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <div className="relative">
                <Contact className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                <Input className="pl-9" value={editingVendor?.full_name || ''} onChange={(e) => setEditingVendor((prev) => (prev ? { ...prev, full_name: e.target.value } : null))} required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <div className="relative">
                <User className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                <Input className="pl-9" value={editingVendor?.username || ''} onChange={(e) => setEditingVendor((prev) => (prev ? { ...prev, username: e.target.value } : null))} required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Assigned Stall</label>
              <Select value={editingVendor?.stall_id?.toString()} onValueChange={(val) => setEditingVendor((prev) => (prev ? { ...prev, stall_id: parseInt(val) } : null))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a stall" />
                </SelectTrigger>
                <SelectContent position="popper" className="z-[100] w-[--radix-select-trigger-width] border bg-white shadow-md">
                  {stalls.map((s) => (
                    <SelectItem key={s.stall_id} value={s.stall_id.toString()}>
                      {s.stall_name} (#{s.stall_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Change Password</label>
                <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">Optional</span>
              </div>
              <div className="relative">
                <RectangleEllipsis className="text-muted-foreground absolute top-2.5 left-2.5 z-10 h-4 w-4" />
                <PasswordInput
                  className="pl-9"
                  placeholder="Enter new password (min 6 chars)"
                  value={editingVendor?.new_password || ''}
                  onChange={(e) => setEditingVendor((prev) => (prev ? { ...prev, new_password: e.target.value } : null))}
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsVendorEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-black text-white hover:bg-slate-800">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
                  <Input
                    className="pl-9"
                    placeholder="Enter the location of stall..."
                    value={stallData.location}
                    onChange={(e) => setStallData({ ...stallData, location: e.target.value })}
                    required
                    list="location-suggestions"
                  />
                  <datalist id="location-suggestions">
                    {uniqueLocations.map((loc, index) => (
                      <option key={index} value={loc} />
                    ))}
                  </datalist>
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#111] font-medium text-white transition-all hover:bg-black">
                Create Stall
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Register Vendor Account */}
        <Card>
          <CardHeader>
            <CardTitle>Register Vendor Account</CardTitle>
            <CardDescription>Assign a manager to an existing stall from the directory.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegisterVendor} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <div className="relative">
                    <Contact className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                    <Input className="pl-9" placeholder="Enter full name..." value={vendorData.full_name} onChange={(e) => setVendorData({ ...vendorData, full_name: e.target.value })} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assigned Stall</label>
                  <Select value={vendorData.stall_id} onValueChange={(val) => setVendorData({ ...vendorData, stall_id: val })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a stall" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="z-[100] border bg-white shadow-md">
                      {stalls.length === 0 ? (
                        <div className="text-muted-foreground p-2 text-center text-xs">No stalls available</div>
                      ) : (
                        stalls.map((s) => (
                          <SelectItem key={s.stall_id} value={s.stall_id.toString()}>
                            {s.stall_name} (#{s.stall_id})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <div className="relative">
                  <User className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                  <Input className="pl-9" placeholder="Enter username..." value={vendorData.username} onChange={(e) => setVendorData({ ...vendorData, username: e.target.value })} required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <PasswordInput
                  placeholder="••••••••"
                  value={vendorData.password}
                  onChange={(e) => setVendorData({ ...vendorData, password: e.target.value })}
                  required
                  leftIcon={<RectangleEllipsis className="h-4 w-4" />}
                />
              </div>

              <Button type="submit" className="w-full bg-[#111] font-medium text-white transition-all hover:bg-black">
                Register Vendor
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <TooltipProvider>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Stall Directory Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Stall Directory</CardTitle>
              <div className="flex items-center gap-2">
                <div className="mr-2 flex rounded-md bg-slate-100 p-0.5">
                  <button
                    onClick={() => setStallTab('active')}
                    className={`rounded-sm px-3 py-1 text-xs font-medium transition-all ${stallTab === 'active' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setStallTab('deactivated')}
                    className={`rounded-sm px-3 py-1 text-xs font-medium transition-all ${stallTab === 'deactivated' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Deactivated
                  </button>
                </div>
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => fetchStalls(true)}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <div className="relative w-48">
                  <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                  <Input placeholder="Search stalls..." className="h-9 pl-8 text-sm" value={stallSearch} onChange={(e) => setStallSearch(e.target.value)} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="mx-6 overflow-hidden rounded-md border border-slate-200">
                <Table className="w-full min-w-[600px] table-fixed">
                  <TableHeader className="sticky top-0 z-10 block w-full border-b bg-slate-50/50 pr-[6px]">
                    <TableRow className="flex w-full">
                      <TableHead className="flex w-[15%] items-center py-3 pl-6">Stall ID</TableHead>
                      <TableHead className="flex w-[45%] items-center py-3">Name & Location</TableHead>
                      <TableHead className="flex w-[15%] items-center justify-center py-3">Status</TableHead>
                      <TableHead className="flex w-[25%] items-center justify-center py-3">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="block max-h-[242px] w-full overflow-y-auto">
                    {loadingLists ? (
                      <TableRow className="flex w-full items-center justify-center py-20">
                        <TableCell className="flex flex-col items-center gap-2">
                          <RefreshCw className="text-muted-foreground h-6 w-6 animate-spin" />
                          <span className="text-muted-foreground text-xs">Fetching stalls...</span>
                        </TableCell>
                      </TableRow>
                    ) : filteredStalls.length === 0 ? (
                      <TableRow className="flex w-full items-center justify-center py-20">
                        <TableCell className="text-muted-foreground text-sm">No stalls found.</TableCell>
                      </TableRow>
                    ) : (
                      filteredStalls.map((s) => (
                        <TableRow key={s.stall_id} className="flex w-full border-b last:border-0 hover:bg-slate-50/30">
                          <TableCell className="flex w-[15%] items-center py-3 pl-6 text-sm font-medium">#{s.stall_id}</TableCell>
                          <TableCell className="flex w-[45%] min-w-0 flex-col justify-center py-3">
                            <div className="truncate text-sm font-semibold">{s.stall_name}</div>
                            <div className="text-muted-foreground truncate text-[11px]">{s.location}</div>
                          </TableCell>
                          <TableCell className="flex w-[15%] items-center justify-center py-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${s.is_active ? 'border-green-200 bg-green-100 text-green-700' : 'border-red-200 bg-red-100 text-red-700'} border`}
                            >
                              {s.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell className="flex w-[25%] items-center justify-center gap-2 py-3">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                  onClick={() => {
                                    setEditingStall(s);
                                    setIsStallEditOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit Stall</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-8 w-8 ${s.is_active ? 'text-slate-500' : 'text-green-600 hover:bg-green-50'}`}
                                  onClick={() => toggleStallStatus(s.stall_id, s.is_active)}
                                >
                                  {s.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{s.is_active ? 'Deactivate Stall' : 'Activate Stall'}</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <Dialog>
                                <TooltipTrigger asChild>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 h-8 w-8">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                </TooltipTrigger>

                                <TooltipContent>
                                  <p>Delete Stall</p>
                                </TooltipContent>

                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Are you sure?</DialogTitle>
                                    <DialogDescription>
                                      This will permanently delete <span className="font-bold">{s.stall_name}</span> and all associated data.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <DialogClose asChild>
                                      <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button variant="destructive" onClick={() => handleDeleteStall(s.stall_id)}>
                                      Confirm Delete
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </Tooltip>
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
                <div className="mr-2 flex rounded-md bg-slate-100 p-0.5">
                  <button
                    onClick={() => setVendorTab('active')}
                    className={`rounded-sm px-3 py-1 text-xs font-medium transition-all ${vendorTab === 'active' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setVendorTab('archived')}
                    className={`rounded-sm px-3 py-1 text-xs font-medium transition-all ${vendorTab === 'archived' ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Archived
                  </button>
                </div>
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => fetchVendors(true)}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <div className="relative w-48">
                  <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                  <Input placeholder="Search vendors..." className="h-9 pl-8 text-sm" value={vendorSearch} onChange={(e) => setVendorSearch(e.target.value)} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="mx-6 overflow-hidden rounded-md border border-slate-200">
                <Table className="w-full min-w-[600px] table-fixed">
                  <TableHeader className="sticky top-0 z-10 block w-full border-b bg-slate-50/50 pr-[6px]">
                    <TableRow className="flex w-full">
                      <TableHead className="flex w-[15%] items-center py-3 pl-6">Stall ID</TableHead>
                      <TableHead className="flex w-[45%] items-center py-3">Name & Username</TableHead>
                      <TableHead className="flex w-[15%] items-center justify-center py-3">Status</TableHead>
                      <TableHead className="flex w-[25%] items-center justify-center py-3">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="block max-h-[242px] w-full overflow-y-auto">
                    {loadingLists ? (
                      <TableRow className="flex w-full items-center justify-center py-20">
                        <TableCell className="flex flex-col items-center gap-2">
                          <RefreshCw className="text-muted-foreground h-6 w-6 animate-spin" />
                          <span className="text-muted-foreground text-xs">Loading vendors...</span>
                        </TableCell>
                      </TableRow>
                    ) : filteredVendors.length === 0 ? (
                      <TableRow className="flex w-full items-center justify-center py-20">
                        <TableCell className="text-muted-foreground text-sm">No vendors found.</TableCell>
                      </TableRow>
                    ) : (
                      filteredVendors.map((v) => (
                        <TableRow key={v.admin_id} className="flex w-full border-b last:border-0 hover:bg-slate-50/30">
                          <TableCell className="flex w-[15%] items-center py-3 pl-6 text-sm font-medium">#{v.stall_id}</TableCell>
                          <TableCell className="flex w-[45%] min-w-0 flex-col justify-center py-3">
                            <div className="truncate text-sm font-semibold">{v.full_name}</div>
                            <div className="text-muted-foreground truncate text-[11px]">@{v.username}</div>
                          </TableCell>
                          <TableCell className="flex w-[15%] items-center justify-center py-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${v.is_active ? 'border-green-200 bg-green-100 text-green-700' : 'border-slate-200 bg-slate-100 text-slate-500'} border`}
                            >
                              {v.is_active ? 'Active' : 'Archived'}
                            </span>
                          </TableCell>
                          <TableCell className="flex w-[25%] items-center justify-center gap-2 py-3">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                  onClick={() => {
                                    setEditingVendor(v);
                                    setIsVendorEditOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit Profile</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-8 w-8 ${v.is_active ? 'text-slate-600 hover:bg-slate-100' : 'text-blue-600 hover:bg-blue-50'}`}
                                  onClick={() => handleArchiveVendor(v.admin_id)}
                                >
                                  {v.is_active ? <Archive className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{v.is_active ? 'Archive Vendor' : 'Restore Vendor'}</TooltipContent>
                            </Tooltip>
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
      </TooltipProvider>
    </div>
  );
}

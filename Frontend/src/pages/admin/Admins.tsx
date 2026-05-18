import { useState, useEffect } from "react";
import {
  Search,
  Mail,
  UserPlus,
  Trash2,
  ShieldAlert,
  User,
  Key,
  Calendar,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AdminRecord {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  avatar: string | null;
  created_at: string;
}

export default function AdminAdmins() {
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminRecord | null>(null);

  // Form State for New Admin
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
    password: "",
    pin: "",
  });

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchAdmins();
    fetchCurrentAdmin();
  }, []);

  const fetchCurrentAdmin = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/admin/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      if (response.ok) {
        setCurrentAdmin(await response.json());
      }
    } catch (error) {
      console.error("Failed to fetch current admin", error);
    }
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/manage/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      if (response.ok) {
        setAdmins(await response.json());
      }
    } catch (error) {
      console.error("Failed to fetch admins", error);
      toast.error("Failed to load admin records");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_URL}/admin/manage/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("New admin created successfully");
        setAddDialogOpen(false);
        setFormData({
          username: "",
          email: "",
          full_name: "",
          password: "",
          pin: "",
        });
        fetchAdmins();
      } else {
        const error = await response.json();
        toast.error(error.detail || "Failed to create admin");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_URL}/admin/manage/${selectedAdmin.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (response.ok) {
        toast.success("Admin deleted successfully");
        setDeleteDialogOpen(false);
        fetchAdmins();
      } else {
        const error = await response.json();
        toast.error(error.detail || "Failed to delete admin");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredAdmins = admins.filter((a) => {
    return (
      a.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.full_name && a.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="h-8 w-48 rounded bg-muted/40 animate-pulse mb-2" />
            <div className="h-4 w-72 rounded bg-muted/30 animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-24 rounded bg-muted/20 animate-pulse" />
            <div className="h-10 w-32 rounded bg-muted/20 animate-pulse" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="h-5 w-32 rounded bg-muted/40 animate-pulse" />
                <div className="h-4 w-48 rounded bg-muted/30 animate-pulse" />
              </div>
              <div className="h-10 w-full md:w-80 rounded-md bg-muted/20 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border/50 overflow-hidden">
              <div className="w-full">
                <div className="h-12 border-b border-border/50 bg-muted/10 flex items-center px-4 justify-between">
                  <div className="h-4 w-1/4 rounded bg-muted/30 animate-pulse" />
                  <div className="h-4 w-1/5 rounded bg-muted/30 animate-pulse" />
                  <div className="h-4 w-1/6 rounded bg-muted/30 animate-pulse" />
                  <div className="h-4 w-1/6 rounded bg-muted/30 animate-pulse" />
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 border-b border-border/50 flex items-center px-4 justify-between last:border-0">
                    <div className="flex items-center gap-3 w-1/4">
                      <div className="h-9 w-9 rounded-full bg-muted/30 animate-pulse" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-28 rounded bg-muted/40 animate-pulse" />
                        <div className="h-3 w-20 rounded bg-muted/30 animate-pulse" />
                      </div>
                    </div>
                    <div className="h-4 w-1/5 rounded bg-muted/30 animate-pulse" />
                    <div className="h-4 w-1/6 rounded bg-muted/30 animate-pulse" />
                    <div className="h-6 w-16 rounded-full bg-muted/40 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Management</h2>
          <p className="text-muted-foreground">
            Manage administrative access and system operators
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="h-8 px-3">
            Total Admins: {admins.length}
          </Badge>
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <UserPlus size={18} />
            Add Admin
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>System Administrators</CardTitle>
              <CardDescription>
                High-level access accounts for TruthLens AI
              </CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search admins..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Admin Profile</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredAdmins.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          <AvatarImage src={a.avatar || undefined} />
                          <AvatarFallback className="bg-primary/5 text-primary">
                            {(a.full_name?.[0] || a.username[0]).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {a.full_name || "System Admin"}
                          </span>
                          <span className="text-xs text-muted-foreground italic">@{a.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail size={12} /> {a.email}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} /> {a.created_at ? new Date(a.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {a.username === "Sujay2008" ? (
                        <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-100">
                          Project Leader
                        </Badge>
                      ) : a.id === currentAdmin?.id ? (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                          You
                        </Badge>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setSelectedAdmin(a);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Admin Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleAddAdmin}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="text-primary" />
                Add New Administrator
              </DialogTitle>
              <DialogDescription>
                Create a new administrative account with full system access.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Username</label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="johndoe"
                    className="pl-9"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="john@truthlens.ai"
                    className="pl-9"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Initial Password</label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Security PIN (Optional)</label>
                <div className="relative">
                  <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="6-digit PIN"
                    className="pl-9"
                    maxLength={6}
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? <LoadingSpinner /> : "Create Admin"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <ShieldAlert />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>@{selectedAdmin?.username}</strong>?
              This action will immediately revoke their administrative access. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAdmin} disabled={isProcessing}>
              {isProcessing ? <LoadingSpinner /> : "Confirm Deletion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

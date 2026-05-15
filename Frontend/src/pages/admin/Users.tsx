import { useState, useEffect } from "react";
import {
  Users as UsersIcon,
  Search,
  Mail,
  User,
  Phone,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Lock,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserRecord {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  avatar: string | null;
  is_active: boolean;
  is_banned: boolean;
  ban_reason: string | null;
  is_2fa_enabled: boolean;
  created_at: string | null;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [banReason, setBanReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/users/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      if (response.ok) {
        setUsers(await response.json());
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Failed to load user records");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleClick = (user: UserRecord) => {
    setSelectedUser(user);
    setAdminPassword("");
    setBanReason(user.ban_reason || "");
    setConfirmDialogOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!selectedUser || !adminPassword) return;
    
    // Require reason if banning
    if (!selectedUser.is_banned && !banReason.trim()) {
        toast.error("Please provide a reason for banning this user");
        return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`${API_URL}/admin/users/${selectedUser.id}/toggle-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify({ 
            admin_password: adminPassword,
            ban_reason: !selectedUser.is_banned ? banReason : null 
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message);
        setUsers(users.map(u => u.id === selectedUser.id ? { 
          ...u, 
          is_active: data.is_active, 
          is_banned: data.is_banned,
          ban_reason: data.is_banned ? banReason : null
        } : u));
        setConfirmDialogOpen(false);
      } else {
        toast.error(data.detail || "Verification failed");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.full_name || "";
    return (
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage registered accounts and their access status
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-8 px-3">
                Total Users: {users.length}
            </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                View and manage user profile details
              </CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email or username..."
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
                  <th className="px-4 py-3 font-medium">User Profile</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Security</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          <AvatarImage src={u.avatar || undefined} />
                          <AvatarFallback className="bg-primary/5 text-primary">
                            {(u.first_name?.[0] || u.username[0]).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {`${u.first_name || ""} ${u.last_name || ""}`.trim() || u.full_name || "N/A"}
                          </span>
                          <span className="text-xs text-muted-foreground italic">@{u.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail size={12} /> {u.email}
                        </div>
                        {u.phone_number && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone size={12} /> {u.phone_number}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                                {u.is_2fa_enabled ? (
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 text-[10px] h-4">2FA On</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-muted-foreground text-[10px] h-4">2FA Off</Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                <Calendar size={10} /> {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>
                    </td>
                    <td className="px-4 py-4">
                      {!u.is_banned ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                          Active
                        </Badge>
                      ) : (
                        <div className="flex flex-col items-start gap-1">
                          <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50">
                            Banned
                          </Badge>
                          {u.ban_reason && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1 text-[10px] text-red-600 cursor-help">
                                    <Info size={10} /> View Reason
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[200px]">
                                  <p className="text-xs">{u.ban_reason}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className={cn(
                          "h-8 gap-1.5",
                          !u.is_banned ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        )}
                        onClick={() => handleToggleClick(u)}
                      >
                        {!u.is_banned ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                        {!u.is_banned ? "Ban User" : "Unban User"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedUser?.is_banned ? <ShieldCheck className="text-emerald-600" /> : <AlertTriangle className="text-red-600" />}
              {selectedUser?.is_banned ? "Revoke Ban" : "Confirm Account Ban"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.is_banned 
                ? `You are about to restore access for ${selectedUser?.username}. This user will be able to login and use the platform again.`
                : `You are about to ban ${selectedUser?.username}. They will be immediately logged out and prevented from accessing their account.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!selectedUser?.is_banned && (
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none flex items-center gap-2">
                        Reason for Ban
                    </label>
                    <Textarea
                        placeholder="Describe why this user is being banned (e.g., spamming, inappropriate content)..."
                        className="min-h-[80px]"
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                    />
                </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                <Lock size={14} /> Confirm Admin Password
              </label>
              <Input
                type="password"
                placeholder="Enter your admin password to authorize"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
            <Button 
              variant={selectedUser?.is_banned ? "default" : "destructive"} 
              onClick={confirmToggleStatus}
              disabled={!adminPassword || (!selectedUser?.is_banned && !banReason.trim()) || isProcessing}
            >
              {isProcessing ? <LoadingSpinner /> : (selectedUser?.is_banned ? "Unban User" : "Confirm Ban")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

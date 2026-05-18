import { useState, useEffect } from "react";
import { 
  Key, 
  Trash2, 
  Search, 
  Mail, 
  User, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface AdminApiKey {
  id: number;
  name: string;
  key_prefix: string;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
  last_used_at: string | null;
  user_id: number;
  user_name: string;
  user_email: string;
}

export default function AdminApiKeys() {
  const [keys, setKeys] = useState<AdminApiKey[]>([]);
  const [filteredKeys, setFilteredKeys] = useState<AdminApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Revocation verification states
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<AdminApiKey | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [revoking, setRevoking] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchAllKeys = async () => {
    try {
      const response = await fetch(`${API_URL}/apikeys/admin`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setKeys(data);
        setFilteredKeys(data);
      } else {
        toast.error("Failed to load global API keys");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error fetching API keys");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllKeys();
  }, []);

  // Filter keys based on search
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFilteredKeys(keys);
    } else {
      const filtered = keys.filter(
        (key) =>
          key.name.toLowerCase().includes(term) ||
          key.user_name.toLowerCase().includes(term) ||
          key.user_email.toLowerCase().includes(term) ||
          key.key_prefix.toLowerCase().includes(term)
      );
      setFilteredKeys(filtered);
    }
  }, [searchTerm, keys]);

  const triggerRevokeDialog = (key: AdminApiKey) => {
    setKeyToRevoke(key);
    setAdminPassword("");
    setIsRevokeDialogOpen(true);
  };

  const handleRevokeConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyToRevoke) return;
    if (!adminPassword) {
      toast.error("Administrator password is required");
      return;
    }

    setRevoking(true);
    try {
      const response = await fetch(`${API_URL}/apikeys/admin/${keyToRevoke.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          "X-Admin-Password": adminPassword,
        },
      });

      if (response.ok) {
        toast.success("API key revoked and deleted successfully");
        setIsRevokeDialogOpen(false);
        setKeyToRevoke(null);
        setAdminPassword("");
        fetchAllKeys();
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || "Failed to revoke API key");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error revoking API key");
    } finally {
      setRevoking(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Metrics
  const activeKeysCount = keys.filter(k => k.is_active && !(k.expires_at && new Date(k.expires_at) < new Date())).length;
  const expiredKeysCount = keys.length - activeKeysCount;

  return (
    <div className="space-y-8" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">API Key Audits</h2>
        <p className="text-muted-foreground mt-1.5">
          Monitor, audit, and revoke developer API credentials issued to platform users.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Total Issued Keys</CardDescription>
            <CardTitle className="text-3xl font-bold text-blue-500 flex items-center gap-2">
              <Key className="h-6 w-6 shrink-0" /> {loading ? <Skeleton className="h-8 w-12" /> : keys.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Active Keys</CardDescription>
            <CardTitle className="text-3xl font-bold text-emerald-500 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 shrink-0" /> {loading ? <Skeleton className="h-8 w-12" /> : activeKeysCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Expired/Revoked</CardDescription>
            <CardTitle className="text-3xl font-bold text-red-500 flex items-center gap-2">
              <XCircle className="h-6 w-6 shrink-0" /> {loading ? <Skeleton className="h-8 w-12" /> : expiredKeysCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main content table */}
      <Card className="border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-muted/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" /> API Access Audit Log
            </CardTitle>
            <CardDescription>
              Monitor key labels, users, lifetimes, and programmatic activity timestamps.
            </CardDescription>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search user, email, key prefix..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-muted/30 border-border/50 focus:border-blue-500"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-4">
              <div className="flex gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-24" />
              </div>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : filteredKeys.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground">No API Keys Found</h3>
              <p className="text-muted-foreground mt-1 max-w-sm mx-auto text-sm">
                {searchTerm ? "No API keys matched your active search query." : "No API keys have been issued on the platform yet."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/40 bg-muted/15 text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  <th className="p-4 pl-6">Owner Profile</th>
                  <th className="p-4">Key Details</th>
                  <th className="p-4">Lifetimes</th>
                  <th className="p-4">Programmatic Info</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-sm">
                {filteredKeys.map((key) => {
                  const isExpired = key.expires_at && new Date(key.expires_at) < new Date();
                  return (
                    <tr key={key.id} className="hover:bg-muted/5 transition-colors">
                      {/* Owner details */}
                      <td className="p-4 pl-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-foreground">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{key.user_name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            <span>{key.user_email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Key details */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <span className="font-semibold text-foreground">{key.name}</span>
                          <div className="font-mono text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded w-fit border border-border/30">
                            {key.key_prefix}xxxxxxxxxxxxxxxx
                          </div>
                        </div>
                      </td>

                      {/* Lifetimes */}
                      <td className="p-4">
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Issued: {formatDate(key.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Expires: {formatDate(key.expires_at)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Programmatic status */}
                      <td className="p-4">
                        <div className="space-y-1.5">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
                            !key.is_active
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : isExpired 
                                ? "bg-red-500/10 text-red-500 border-red-500/20"
                                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          }`}>
                            {!key.is_active ? "Revoked" : (isExpired ? "Expired" : "Active")}
                          </span>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>Last Used: {formatDate(key.last_used_at)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => triggerRevokeDialog(key)}
                          disabled={!key.is_active}
                          className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                          title={!key.is_active ? "This API Key has already been revoked" : "Revoke API Key"}
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Secure Revocation Confirmation Modal */}
      <Dialog open={isRevokeDialogOpen} onOpenChange={setIsRevokeDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 border-border/50 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <ShieldAlert className="h-5 w-5" /> Secure Deletion Required
            </DialogTitle>
            <DialogDescription>
              You are about to revoke the API key <strong className="text-foreground">"{keyToRevoke?.name}"</strong> owned by <strong className="text-foreground">{keyToRevoke?.user_name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRevokeConfirm}>
            <div className="space-y-4 py-4">
              <div className="p-3 border border-red-500/20 bg-red-500/5 rounded-lg flex gap-3 text-xs leading-relaxed text-red-400">
                <ShieldAlert className="h-5 w-5 shrink-0 text-red-500" />
                <div>
                  <p className="font-semibold">Critical administrative action!</p>
                  <p className="mt-0.5">
                    This action is immediate and cannot be undone. Any applications using this API key will lose programmatic access immediately.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">Administrator Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  required
                  placeholder="Enter your admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="bg-muted/30 border-border/50 focus:border-red-500"
                  autoFocus
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsRevokeDialogOpen(false);
                  setKeyToRevoke(null);
                  setAdminPassword("");
                }}
                className="border-border/50 hover:bg-muted/50"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={revoking}
                className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/15"
              >
                {revoking ? "Revoking..." : "Confirm Revocation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect } from "react";
import {
  Shield,
  Search,
  Filter,
  Globe,
  AlertCircle,
  Activity,
  UserPlus,
  LogIn,
  LogOut,
  Key,
  Database,
  Trash2,
  RefreshCw,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface AuditLog {
  id: number;
  action: string;
  actor_id: number | null;
  actor_type: string;
  actor_username: string;
  target_id: number | null;
  target_type: string | null;
  description: string;
  status: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actorTypeFilter, setActorTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isClearOpen, setIsClearOpen] = useState(false);
  const [clearRange, setClearRange] = useState("24h");
  const [clearing, setClearing] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchLogs();
  }, [actorTypeFilter, statusFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/admin/audit/logs?limit=200`;
      if (actorTypeFilter !== "All") {
        url += `&actor_type=${actorTypeFilter.toLowerCase()}`;
      }
      if (statusFilter !== "All") {
        url += `&status=${statusFilter.toLowerCase()}`;
      }
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    setClearing(true);
    try {
      const response = await fetch(`${API_URL}/admin/audit/clear?time_range=${clearRange}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || "Audit logs cleared successfully");
        setIsClearOpen(false);
        fetchLogs();
      } else {
        const err = await response.json();
        toast.error(err.detail || "Failed to clear audit logs");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error clearing audit logs");
    } finally {
      setClearing(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getActionIcon = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes("login")) return <LogIn className="h-4 w-4 text-emerald-500" />;
    if (act.includes("logout")) return <LogOut className="h-4 w-4 text-amber-500" />;
    if (act.includes("registration") || act.includes("create")) return <UserPlus className="h-4 w-4 text-blue-500" />;
    if (act.includes("password") || act.includes("pin")) return <Key className="h-4 w-4 text-purple-500" />;
    if (act.includes("delete")) return <Trash2 className="h-4 w-4 text-red-500" />;
    if (act.includes("update")) return <RefreshCw className="h-4 w-4 text-blue-400" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getActorBadgeColor = (type: string) => {
    return type === "admin" 
      ? "bg-purple-500/10 text-purple-500 border-purple-500/20" 
      : "bg-blue-500/10 text-blue-500 border-blue-500/20";
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "success").toLowerCase();
    if (s === "success") {
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] h-5 px-2 font-bold uppercase">
          Success
        </Badge>
      );
    }
    if (s === "failure") {
      return (
        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] h-5 px-2 font-bold uppercase">
          Failure
        </Badge>
      );
    }
    if (s === "pending") {
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] h-5 px-2 font-bold uppercase">
          Pending
        </Badge>
      );
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const formatActionName = (action: string) => {
    return action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <div className="h-6 w-6 rounded bg-muted/30 animate-pulse" />
            </div>
            <div className="h-8 w-48 rounded bg-muted/40 animate-pulse" />
          </div>
          <div className="h-4 w-96 rounded bg-muted/30 animate-pulse" />
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="h-5 w-32 rounded bg-muted/40 animate-pulse" />
                <div className="h-4 w-48 rounded bg-muted/30 animate-pulse" />
              </div>
              <div className="flex flex-wrap w-full md:w-auto items-center gap-3">
                <div className="h-10 w-full md:w-64 rounded-md bg-muted/20 animate-pulse" />
                <div className="h-10 w-28 rounded-md bg-muted/20 animate-pulse" />
                <div className="h-10 w-28 rounded-md bg-muted/20 animate-pulse" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border/50 overflow-hidden">
              <div className="w-full">
                <div className="h-12 border-b border-border/50 bg-muted/10 flex items-center px-4 justify-between">
                  <div className="h-4 w-1/6 rounded bg-muted/30 animate-pulse" />
                  <div className="h-4 w-1/12 rounded bg-muted/30 animate-pulse" />
                  <div className="h-4 w-1/6 rounded bg-muted/30 animate-pulse" />
                  <div className="h-4 w-1/4 rounded bg-muted/30 animate-pulse" />
                  <div className="h-4 w-1/12 rounded bg-muted/30 animate-pulse" />
                </div>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 border-b border-border/50 flex items-center px-4 justify-between last:border-0">
                    <div className="flex items-center gap-3 w-1/6">
                      <div className="h-8 w-8 rounded bg-muted/30 animate-pulse" />
                      <div className="h-4 w-20 rounded bg-muted/40 animate-pulse" />
                    </div>
                    <div className="h-4 w-1/12 rounded bg-muted/30 animate-pulse" />
                    <div className="h-4 w-1/6 rounded bg-muted/30 animate-pulse" />
                    <div className="h-4 w-1/4 rounded bg-muted/30 animate-pulse" />
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
        </div>
        <p className="text-muted-foreground">
          Track all administrative and user activities across the platform
        </p>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>Activity Trail</CardTitle>
              <CardDescription>
                Showing {filteredLogs.length} recent events
              </CardDescription>
            </div>
            <div className="flex flex-wrap w-full md:w-auto items-center gap-3">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search logs..."
                  className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="h-10 w-[120px] justify-between border-border/50 bg-background/50 hover:bg-background/80 transition-all text-xs"
                    >
                      {actorTypeFilter === "All" ? "All Actors" : actorTypeFilter + "s"}
                      <Filter className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[120px] bg-[#1a1b1e] border-border/50">
                    <DropdownMenuItem onClick={() => setActorTypeFilter("All")} className="cursor-pointer hover:bg-primary/10">
                      All Actors
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActorTypeFilter("Admin")} className="cursor-pointer hover:bg-primary/10">
                      Admins
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActorTypeFilter("User")} className="cursor-pointer hover:bg-primary/10">
                      Users
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="h-10 w-[120px] justify-between border-border/50 bg-background/50 hover:bg-background/80 transition-all text-xs"
                    >
                      {statusFilter === "All" ? "All Status" : statusFilter}
                      <Filter className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[120px] bg-[#1a1b1e] border-border/50">
                    <DropdownMenuItem onClick={() => setStatusFilter("All")} className="cursor-pointer hover:bg-primary/10 text-xs">
                      All Status
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("Success")} className="cursor-pointer hover:bg-emerald-500/10 text-emerald-500 text-xs">
                      Success
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("Failure")} className="cursor-pointer hover:bg-red-500/10 text-red-500 text-xs">
                      Failure
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("Pending")} className="cursor-pointer hover:bg-amber-500/10 text-amber-500 text-xs">
                      Pending
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <Button 
                variant="outline" 
                size="icon" 
                className="shrink-0 border-border/50"
                onClick={fetchLogs}
                title="Refresh Logs"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>

              <Button 
                variant="destructive" 
                className="h-10 text-xs flex items-center gap-2 font-semibold shadow-md bg-red-600 hover:bg-red-700 transition-all shrink-0"
                onClick={() => setIsClearOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Clear Logs
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/50 overflow-hidden bg-background/30">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm text-left">
                <thead className="bg-muted/30 [&_tr]:border-b">
                  <tr className="border-b border-border/50 transition-colors">
                    <th className="h-12 px-4 align-middle font-semibold text-foreground/70 uppercase tracking-wider text-[10px]">
                      Action
                    </th>
                    <th className="h-12 px-4 align-middle font-semibold text-foreground/70 uppercase tracking-wider text-[10px]">
                      Actor
                    </th>
                    <th className="h-12 px-4 align-middle font-semibold text-foreground/70 uppercase tracking-wider text-[10px]">
                      Status
                    </th>
                    <th className="h-12 px-4 align-middle font-semibold text-foreground/70 uppercase tracking-wider text-[10px]">
                      Description
                    </th>
                    <th className="h-12 px-4 align-middle font-semibold text-foreground/70 uppercase tracking-wider text-[10px]">
                      IP Address
                    </th>
                    <th className="h-12 px-4 align-middle font-semibold text-foreground/70 uppercase tracking-wider text-[10px]">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-border/50 transition-all hover:bg-primary/[0.02] group"
                      >
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-background border border-border/50 flex items-center justify-center shadow-sm group-hover:border-primary/30 transition-colors">
                              {getActionIcon(log.action)}
                            </div>
                            <span className="font-medium whitespace-nowrap">
                              {formatActionName(log.action)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground/90">{log.actor_username}</span>
                              <Badge variant="outline" className={`${getActorBadgeColor(log.actor_type)} text-[10px] h-4 px-1.5 font-bold uppercase`}>
                                {log.actor_type}
                              </Badge>
                            </div>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Database className="h-3 w-3" /> ID: {log.actor_id || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          {getStatusBadge(log.status)}
                        </td>
                        <td className="p-4 align-middle max-w-md">
                          <p className="text-sm text-foreground/80 line-clamp-2 leading-relaxed">
                            {log.description}
                          </p>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2 text-[11px]">
                            <Globe className="h-3 w-3 text-primary/60" />
                            <span className="font-mono text-muted-foreground">
                              {log.ip_address || "Internal"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 align-middle whitespace-nowrap">
                          <div className="flex flex-col text-right md:text-left">
                            <span className="font-medium text-foreground/90">
                              {new Date(log.created_at).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="h-32 text-center text-muted-foreground"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <AlertCircle className="h-8 w-8 text-muted-foreground/30" />
                          <p>No activity logs found matching your criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isClearOpen} onOpenChange={setIsClearOpen}>
        <DialogContent className="sm:max-w-[420px] bg-[#1a1b1e] border border-border/50 text-foreground shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-500 flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500 animate-pulse" />
              Clear Audit Logs
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2 text-xs">
              Select the time range of activity logs you want to permanently delete from the database. This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-2.5 py-4">
            {[
              { value: "24h", label: "Last 24 Hours", desc: "Purges logs from the past 24 hours" },
              { value: "7days", label: "Last 7 Days", desc: "Purges logs from the past week" },
              { value: "15days", label: "Last 15 Days", desc: "Purges logs from the past 15 days" },
              { value: "30days", label: "Last 30 Days", desc: "Purges logs from the past month" },
              { value: "all", label: "All Time", desc: "Wipes the entire audit logs table completely" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setClearRange(option.value)}
                className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all duration-200 ${
                  clearRange === option.value
                    ? "bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.1)]"
                    : "bg-muted/10 border-border/30 text-muted-foreground hover:bg-muted/20 hover:text-foreground"
                }`}
              >
                <span className="font-semibold text-sm">{option.label}</span>
                <span className="text-[11px] opacity-80 mt-0.5">{option.desc}</span>
              </button>
            ))}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 border-t border-border/30 pt-4 mt-2">
            <Button
              variant="ghost"
              onClick={() => setIsClearOpen(false)}
              disabled={clearing}
              className="hover:bg-muted/20 text-muted-foreground text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearLogs}
              disabled={clearing}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-4"
            >
              {clearing ? "Clearing Logs..." : "Confirm & Clear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

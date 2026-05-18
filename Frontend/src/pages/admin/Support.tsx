import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  MoreVertical,
  Mail,
  Phone,
  MessageSquare,
  Loader2,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface SupportTicket {
  id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  reason: string;
  message: string;
  status: "Pending" | "Processing" | "Solved" | "Rejected";
  rejection_reason?: string;
  created_at: string;
}

const AdminSupport = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Dialog States
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/support/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      if (response.ok) {
        setTickets(await response.json());
      }
    } catch (error) {
      console.error("Failed to fetch tickets", error);
      toast.error("Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (ticketId: number, status: string, reason?: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`${API_URL}/support/${ticketId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify({ status, rejection_reason: reason }),
      });

      if (response.ok) {
        toast.success(`Ticket marked as ${status}`);
        setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: status as any, rejection_reason: reason } : t));
        setRejectDialogOpen(false);
        setRejectionReason("");
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating ticket", error);
      toast.error("An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.reason.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || t.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // Priority weight: Pending (1), Processing (2), Solved (3), Rejected (4)
    const weights: Record<string, number> = {
      "Pending": 1,
      "Processing": 2,
      "Solved": 3,
      "Rejected": 4
    };
    
    const weightA = weights[a.status] || 99;
    const weightB = weights[b.status] || 99;
    
    if (weightA !== weightB) {
      return weightA - weightB;
    }
    
    // Within the same status, sort by date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">Pending</Badge>;
      case "Processing":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">Processing</Badge>;
      case "Solved":
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">Solved</Badge>;
      case "Rejected":
        return <Badge variant="secondary" className="bg-rose-100 text-rose-700 border-rose-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Support Tickets</h2>
          <p className="text-muted-foreground">Manage and respond to user support requests.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or subject..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground" />
          <select 
            className="bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="solved">Solved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="w-full">
            <div className="h-12 border-b border-border/50 bg-muted/10 flex items-center px-6 justify-between">
              <div className="h-4 w-1/4 rounded bg-muted/30 animate-pulse" />
              <div className="h-4 w-1/5 rounded bg-muted/30 animate-pulse" />
              <div className="h-4 w-1/6 rounded bg-muted/30 animate-pulse" />
              <div className="h-4 w-1/6 rounded bg-muted/30 animate-pulse" />
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 border-b border-border/50 flex items-center px-6 justify-between last:border-0">
                <div className="flex flex-col gap-1.5 w-1/4">
                  <div className="h-4 w-28 rounded bg-muted/40 animate-pulse" />
                  <div className="h-3 w-36 rounded bg-muted/30 animate-pulse" />
                </div>
                <div className="h-4 w-1/5 rounded bg-muted/30 animate-pulse" />
                <div className="h-6 w-16 rounded-full bg-muted/40 animate-pulse" />
                <div className="h-4 w-1/6 rounded bg-muted/30 animate-pulse" />
              </div>
            ))}
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
            <MessageSquare size={48} strokeWidth={1} />
            <p>No support tickets found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Subject</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Raised At</th>
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{ticket.full_name}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail size={10} /> {ticket.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[200px] truncate font-medium">
                        {ticket.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Clock size={12} />
                          {new Date(ticket.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <span className="text-xs text-muted-foreground/70 pl-4">
                          {new Date(ticket.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-primary border-primary/20 hover:bg-primary/5"
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setViewDialogOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              disabled={ticket.status === "Processing"}
                              onClick={() => handleStatusUpdate(ticket.id, "Processing")}
                            >
                              <Clock className="mr-2 h-4 w-4 text-blue-500" /> Mark Processing
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              disabled={ticket.status === "Solved"}
                              onClick={() => handleStatusUpdate(ticket.id, "Solved")}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Mark Solved
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              disabled={ticket.status === "Rejected"}
                              className="text-rose-500 focus:text-rose-600"
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setRejectDialogOpen(true);
                              }}
                            >
                              <XCircle className="mr-2 h-4 w-4" /> Reject Ticket
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Ticket Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center justify-between pr-8">
              <DialogTitle>Ticket Details</DialogTitle>
              {selectedTicket && getStatusBadge(selectedTicket.status)}
            </div>
            <DialogDescription>
              Ticket ID: #{selectedTicket?.id} • Submitted on {selectedTicket && new Date(selectedTicket.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">User</p>
                  <p className="font-semibold">{selectedTicket.full_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Subject</p>
                  <p className="font-semibold">{selectedTicket.reason}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Email</p>
                  <p className="text-sm flex items-center gap-1.5"><Mail size={14} className="text-primary" /> {selectedTicket.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Phone</p>
                  <p className="text-sm flex items-center gap-1.5"><Phone size={14} className="text-primary" /> {selectedTicket.phone_number || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare size={16} className="text-primary" /> User Message
                </h4>
                <div className="bg-background p-4 rounded-lg border text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.message}
                </div>
              </div>

              {selectedTicket.status === "Rejected" && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2 text-rose-500">
                    <XCircle size={16} /> Rejection Reason
                  </h4>
                  <div className="bg-rose-50/50 p-4 rounded-lg border border-rose-100 text-sm text-rose-700 italic">
                    {selectedTicket.rejection_reason || "No specific reason provided."}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
            {selectedTicket?.status === "Pending" && (
              <Button onClick={() => handleStatusUpdate(selectedTicket.id, "Processing")}>
                Start Processing
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-500">
              <AlertCircle size={20} /> Reject Ticket
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request. This reason will be sent to the user via email.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection Reason</label>
              <Textarea 
                placeholder="Explain why this ticket is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="h-32 focus-visible:ring-rose-500/20"
              />
            </div>
            <div className="bg-rose-50 p-3 rounded-md border border-rose-100 text-xs text-rose-600">
              Note: An automated email will be sent to <strong>{selectedTicket?.email}</strong> with this reason.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedTicket && handleStatusUpdate(selectedTicket.id, "Rejected", rejectionReason)}
              disabled={!rejectionReason || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Rejecting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Reject & Notify
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSupport;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  BrainCircuit,

  TrendingUp,
  Eye,
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

import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FeedbackItem {
  id: number;
  analysis_log_id: number;
  scan_type: string;
  scan_id: number;
  rating: string;
  message: string;
  corrected_label: string;
  model_processed: boolean;
  created_at: string;
  user_name: string;
  user_email: string;
  filename: string;
  predicted_label: string;
  confidence_score: number;
}

interface OverviewData {
  total_feedbacks: number;
  processed_feedbacks: number;
  pending_feedbacks: number;
  likes_total: number;
  dislikes_total: number;
  learning_stats: any[];
}

export default function AdminFeedback() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sentimentFilter, setSentimentFilter] = useState("All");
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const [fRes, oRes] = await Promise.all([
        fetch(`${API_URL}/admin/feedback/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/admin/feedback/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (fRes.ok && oRes.ok) {
        setFeedbacks(await fRes.json());
        setOverview(await oRes.json());
      }
    } catch (error) {
      console.error("Failed to fetch feedback data", error);
      toast.error("Failed to load feedback records");
    } finally {
      setLoading(false);
    }
  };

  const processFeedback = async (id: number) => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/admin/feedback/${id}/process`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Feedback marked as processed for training");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to process feedback");
    }
  };

  const filteredFeedbacks = feedbacks.filter((f) => {
    const matchesSearch =
      f.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.filename.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "All" || 
      (statusFilter === "Processed" && f.model_processed) || 
      (statusFilter === "Pending" && !f.model_processed);
    
    const matchesSentiment = 
      sentimentFilter === "All" || 
      (sentimentFilter === "Positive" && f.rating === "like") || 
      (sentimentFilter === "Correction" && f.rating === "dislike");
      
    return matchesSearch && matchesStatus && matchesSentiment;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 rounded bg-muted/40 animate-pulse mb-2" />
          <div className="h-4 w-72 rounded bg-muted/30 animate-pulse" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-28 rounded bg-muted/30 animate-pulse" />
                  <div className="h-8 w-16 rounded bg-muted/40 animate-pulse" />
                </div>
                <div className="h-10 w-10 rounded bg-muted/20 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="h-5 w-32 rounded bg-muted/40 animate-pulse" />
                <div className="h-4 w-48 rounded bg-muted/30 animate-pulse" />
              </div>
              <div className="flex w-full md:w-auto items-center gap-2">
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
                  <div className="h-4 w-1/4 rounded bg-muted/30 animate-pulse" />
                  <div className="h-4 w-1/6 rounded bg-muted/30 animate-pulse" />
                  <div className="h-4 w-1/4 rounded bg-muted/30 animate-pulse" />
                  <div className="h-4 w-1/6 rounded bg-muted/30 animate-pulse" />
                </div>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 border-b border-border/50 flex items-center px-4 justify-between last:border-0">
                    <div className="flex flex-col gap-1.5 w-1/4">
                      <div className="h-4 w-28 rounded bg-muted/40 animate-pulse" />
                      <div className="h-3 w-36 rounded bg-muted/30 animate-pulse" />
                    </div>
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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Feedback</h2>
        <p className="text-muted-foreground">
          Monitor model accuracy and manage feedback for continuous learning
        </p>
      </div>

      {overview && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Feedback"
            value={overview.total_feedbacks}
            icon={MessageSquare}
            color="text-blue-600"
          />
          <StatCard
            title="Training Ready"
            value={overview.processed_feedbacks}
            icon={BrainCircuit}
            color="text-purple-600"
            description="Processed for model tuning"
          />
          <StatCard
            title="Pending Review"
            value={overview.pending_feedbacks}
            icon={Clock}
            color="text-yellow-600"
          />
          <StatCard
            title="Accuracy Signal"
            value={`${((overview.likes_total / (overview.total_feedbacks || 1)) * 100).toFixed(1)}%`}
            icon={TrendingUp}
            color="text-emerald-600"
            description="Positive user sentiment"
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>Feedback Records</CardTitle>
              <CardDescription>
                Detailed log of user corrections and comments
              </CardDescription>
            </div>
            <div className="flex w-full md:w-auto items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search feedback..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <select
                  className="h-10 w-[130px] rounded-md border border-input bg-background px-3 py-2 text-sm appearance-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Processed">Processed</option>
                </select>
                <Filter className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  className="h-10 w-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm appearance-none"
                  value={sentimentFilter}
                  onChange={(e) => setSentimentFilter(e.target.value)}
                >
                  <option value="All">All Sentiments</option>
                  <option value="Positive">Positive</option>
                  <option value="Correction">Correction</option>
                </select>
                <Filter className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-md border overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[800px]">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">User & Scan</th>
                  <th className="px-4 py-3 font-medium">Sentiment</th>
                  <th className="px-4 py-3 font-medium">Message/Correction</th>
                  <th className="px-4 py-3 font-medium">Model Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredFeedbacks.map((f) => (
                  <tr key={f.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-medium text-foreground">{f.user_name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <ExternalLink size={12} /> {f.filename}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {f.rating === "like" ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                          <ThumbsUp size={16} /> Positive
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-600 font-medium">
                          <ThumbsDown size={16} /> Correction
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 max-w-[300px]">
                      {f.corrected_label && (
                        <Badge variant="outline" className="mb-1 border-red-200 bg-red-50 text-red-700">
                          Should be: {f.corrected_label}
                        </Badge>
                      )}
                      <p className="text-muted-foreground line-clamp-2 italic">
                        "{f.message || "No comment"}"
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      {f.model_processed ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                          <CheckCircle2 size={12} className="mr-1" /> Processed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-700 border-yellow-200 bg-yellow-50">
                          <Clock size={12} className="mr-1" /> Pending Training
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => navigate(`/admin/scans?search=${encodeURIComponent(f.filename)}&highlightId=${f.analysis_log_id}`)}
                        >
                          <Eye size={14} /> See Scan
                        </Button>
                        {!f.model_processed && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5"
                            onClick={() => processFeedback(f.id)}
                          >
                            <BrainCircuit size={14} /> Train Model
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="block md:hidden space-y-4">
            {filteredFeedbacks.length > 0 ? (
              filteredFeedbacks.map((f) => (
                <div
                  key={f.id}
                  className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm space-y-3"
                >
                  {/* User & Scan Header Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-foreground truncate">
                        {f.user_name}
                      </h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                        <ExternalLink size={12} className="flex-shrink-0" /> <span className="truncate">{f.filename}</span>
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      {f.rating === "like" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                          <ThumbsUp size={12} /> Like
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-red-600 font-semibold bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                          <ThumbsDown size={12} /> Correction
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border/50" />

                  {/* Details Block */}
                  <div className="space-y-2 text-xs">
                    {f.corrected_label && (
                      <div>
                        <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 text-[10px] h-4.5 px-1.5 font-bold">
                          Should be: {f.corrected_label}
                        </Badge>
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground leading-relaxed italic bg-muted/20 p-2 rounded border border-border/30">
                      "{f.message || "No comment"}"
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <div className="text-[10px] text-muted-foreground">
                        {f.created_at ? new Date(f.created_at).toLocaleDateString() : 'N/A'}
                      </div>
                      <div>
                        {f.model_processed ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-[9px] h-4.5 px-1.5">
                            <CheckCircle2 size={10} className="mr-0.5" /> Processed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-700 border-yellow-200 bg-yellow-50 text-[9px] h-4.5 px-1.5">
                            <Clock size={10} className="mr-0.5" /> Pending Review
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex-1"
                      onClick={() => navigate(`/admin/scans?search=${encodeURIComponent(f.filename)}&highlightId=${f.analysis_log_id}`)}
                    >
                      <Eye size={12} /> See Scan
                    </Button>
                    {!f.model_processed && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1 flex-1"
                        onClick={() => processFeedback(f.id)}
                      >
                        <BrainCircuit size={12} /> Train Model
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground p-8 border rounded-lg">
                No feedback records found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, description }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </div>
          <div className={cn("p-3 rounded-xl bg-muted/50", color)}>
            <Icon size={24} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  FileText,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";

interface AdminOverviewData {
  total_scans: number;
  total_users: number;
  total_real_detected: number;
  total_fake_detected: number;
  happy_feedback: number;
  unhappy_feedback: number;
  happy_feedback_rate: number;
  scan_type_breakdown: { name: string; scans: number }[];
  real_vs_fake: { name: string; scans: number }[];
  recent_activity: {
    id: number;
    user_name: string;
    file_type: string;
    result_label: string;
    date: string;
    confidence: number;
  }[];
}

const scanColors = ["#2563eb", "#0891b2", "#059669", "#7c3aed", "#f59e0b", "#dc2626"];
const resultColors = ["#16a34a", "#dc2626"];

const riskLabels = ["fake", "deepfake", "ai generated", "malicious", "suspicious", "likely fake"];
const safeLabels = ["real", "clean", "human written", "authentic"];

function normalizeConfidence(value: number) {
  if (!Number.isFinite(value)) return 0;
  return value <= 1 ? value * 100 : value;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getResultTone(label: string) {
  const normalized = label.toLowerCase();
  if (riskLabels.some((risk) => normalized.includes(risk))) {
    return "risk";
  }
  if (safeLabels.some((safe) => normalized.includes(safe))) {
    return "safe";
  }
  return "neutral";
}

export default function AdminAreaPage() {
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const loadOverview = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const token = localStorage.getItem("admin_token");
        const response = await fetch(`${apiUrl}/dashboard/admin-overview`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("admin_token");
          toast.error("Admin session expired. Please sign in again.");
          navigate("/auth/admin", { replace: true });
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load admin overview");
        }

        const data = (await response.json()) as AdminOverviewData;
        setOverview(data);
      } catch (error) {
        console.error("Admin overview error:", error);
        toast.error("Failed to load admin analytics");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [apiUrl, navigate],
  );

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const pieData = useMemo(() => {
    if (!overview) return [];
    return overview.real_vs_fake.map((item) => ({
      name: item.name,
      value: item.scans,
    }));
  }, [overview]);

  const feedbackTotal = (overview?.happy_feedback ?? 0) + (overview?.unhappy_feedback ?? 0);
  const riskRate =
    overview && overview.total_scans > 0
      ? (overview.total_fake_detected / overview.total_scans) * 100
      : 0;

  const kpiCards = [
    {
      title: "Total Scans",
      value: overview?.total_scans ?? 0,
      detail: "All user analyses",
      icon: Activity,
      tone: "blue",
    },
    {
      title: "Users",
      value: overview?.total_users ?? 0,
      detail: "Registered accounts",
      icon: Users,
      tone: "cyan",
    },
    {
      title: "Safe Results",
      value: overview?.total_real_detected ?? 0,
      detail: "Real, clean, or human",
      icon: ShieldCheck,
      tone: "green",
    },
    {
      title: "Risk Results",
      value: overview?.total_fake_detected ?? 0,
      detail: `${riskRate.toFixed(1)}% of scans`,
      icon: ShieldAlert,
      tone: "red",
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!overview) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        Failed to load admin analytics.
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Admin Dashboard
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Monitor scan volume, model output trends, user activity, and
            feedback quality across TruthLens AI.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => loadOverview(true)}
          disabled={refreshing}
          className="w-full shrink-0 md:w-auto"
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="min-w-0">
              <CardContent className="flex items-start justify-between gap-3 p-4 sm:gap-4 sm:p-5">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <div className="mt-2 text-2xl font-semibold sm:text-3xl">{card.value}</div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{card.detail}</p>
                </div>
                <div
                  className={cn(
                    "shrink-0 rounded-lg p-3",
                    card.tone === "blue" && "bg-blue-500/10 text-blue-600",
                    card.tone === "cyan" && "bg-cyan-500/10 text-cyan-600",
                    card.tone === "green" && "bg-emerald-500/10 text-emerald-600",
                    card.tone === "red" && "bg-red-500/10 text-red-600",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="min-w-0 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Scans By Tool
            </CardTitle>
            <CardDescription>
              Distribution of scan activity by detector type.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] sm:h-[320px]">
              {overview.scan_type_breakdown.some((item) => item.scans > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overview.scan_type_breakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                    />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip cursor={{ fill: "hsl(var(--muted))" }} />
                    <Bar dataKey="scans" radius={[6, 6, 0, 0]}>
                      {overview.scan_type_breakdown.map((entry, index) => (
                        <Cell
                          key={`${entry.name}-${index}`}
                          fill={scanColors[index % scanColors.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState text="No scan data yet." />
              )}
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 border-t pt-4">
              {overview.scan_type_breakdown.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: scanColors[index % scanColors.length] }}
                  />
                  <span className="text-xs font-medium text-muted-foreground">
                    {item.name}: <span className="text-foreground font-semibold">{item.scans}</span>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Real vs Fake
            </CardTitle>
            <CardDescription>
              Aggregated result classification across all scans.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] sm:h-[320px]">
              {pieData.some((item) => item.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="52%"
                      outerRadius="78%"
                      paddingAngle={4}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`${entry.name}-${index}`}
                          fill={resultColors[index % resultColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState text="No result split yet." />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {pieData.map((item, index) => (
                <div key={item.name} className="min-w-0 rounded-lg border p-3">
                  <div className="flex min-w-0 items-center gap-2 text-sm">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: resultColors[index % resultColors.length] }}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <p className="mt-1 text-xl font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Feedback Health
              </CardTitle>
              <CardDescription>
                User feedback submitted after scans.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={() => navigate("/admin/feedback")}
            >
              View All <ChevronRight size={12} />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <FeedbackMetric
                icon={ThumbsUp}
                label="Positive"
                value={overview.happy_feedback}
                className="text-emerald-600"
              />
              <FeedbackMetric
                icon={ThumbsDown}
                label="Negative"
                value={overview.unhappy_feedback}
                className="text-red-600"
              />
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Positive rate</span>
                <span className="font-medium">
                  {feedbackTotal ? `${overview.happy_feedback_rate.toFixed(1)}%` : "N/A"}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width: `${feedbackTotal ? overview.happy_feedback_rate : 0}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {feedbackTotal} total feedback submissions
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest scans submitted by users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {overview.recent_activity.length ? (
              <>
              <div className="hidden overflow-x-auto rounded-lg border md:block">
                <table className="min-w-[720px] w-full text-left text-sm">
                  <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">User</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Result</th>
                      <th className="px-4 py-3 font-medium">Confidence</th>
                      <th className="px-4 py-3 text-right font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.recent_activity.map((item) => {
                      const tone = getResultTone(item.result_label);
                      const confidence = normalizeConfidence(item.confidence);

                      return (
                        <tr key={item.id} className="border-t">
                          <td className="px-4 py-3">
                            <p className="max-w-[180px] truncate font-medium">{item.user_name}</p>
                            <p className="text-xs text-muted-foreground">Scan #{item.id}</p>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{item.file_type}</td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="secondary"
                              className={cn(
                                "border",
                                tone === "risk" && "border-red-200 bg-red-50 text-red-700",
                                tone === "safe" &&
                                  "border-emerald-200 bg-emerald-50 text-emerald-700",
                                tone === "neutral" &&
                                  "border-yellow-200 bg-yellow-50 text-yellow-700",
                              )}
                            >
                              {tone === "risk" ? (
                                <AlertTriangle className="mr-1 h-3 w-3" />
                              ) : null}
                              {item.result_label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">{confidence.toFixed(1)}%</td>
                          <td className="px-4 py-3 text-right text-muted-foreground">
                            {formatDate(item.date)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {overview.recent_activity.map((item) => {
                  const tone = getResultTone(item.result_label);
                  const confidence = normalizeConfidence(item.confidence);

                  return (
                    <div key={item.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{item.user_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Scan #{item.id} • {item.file_type}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "shrink-0 border",
                            tone === "risk" && "border-red-200 bg-red-50 text-red-700",
                            tone === "safe" &&
                              "border-emerald-200 bg-emerald-50 text-emerald-700",
                            tone === "neutral" &&
                              "border-yellow-200 bg-yellow-50 text-yellow-700",
                          )}
                        >
                          {item.result_label}
                        </Badge>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-md bg-muted/50 p-3">
                          <p className="text-xs text-muted-foreground">Confidence</p>
                          <p className="font-medium">{confidence.toFixed(1)}%</p>
                        </div>
                        <div className="rounded-md bg-muted/50 p-3">
                          <p className="text-xs text-muted-foreground">Time</p>
                          <p className="font-medium">{formatDate(item.date)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              </>
            ) : (
              <EmptyState text="No recent scans yet." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FeedbackMetric({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border p-4">
      <div className={cn("flex min-w-0 items-center gap-2 text-sm", className)}>
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex h-full min-h-[180px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
      {text}
    </div>
  );
}

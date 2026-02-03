import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Activity,
  ShieldCheck,
  ShieldAlert,
  Shield,
  FileText,
  Image as ImageIcon,
  Video,
  MoreHorizontal,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface DashboardData {
  stats: {
    title: string;
    value: string;
    change: string;
    icon_type: string;
  }[];
  chart_data: {
    name: string;
    scans: number;
  }[];
  pie_data: {
    name: string;
    value: number;
  }[];
  recent_activity: {
    id: number;
    type: string;
    name: string;
    status: string;
    date: string;
    confidence: string;
  }[];
}

export default function UserDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;
  const COLORS = ["#10b981", "#ef4444"];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard/overview`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        toast.error("Failed to load dashboard data");
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!data) return <div>Failed to load data.</div>;

  const getIcon = (type: string) => {
    switch (type) {
      case "check":
        return <ShieldCheck className="h-4 w-4 text-emerald-500" />;
      case "alert":
        return <ShieldAlert className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your verification analysis
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {data.stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {getIcon(stat.icon_type)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Weekly Analysis Activity</CardTitle>
            <CardDescription>
              Number of scans over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chart_data}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="scans" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Detection Distribution</CardTitle>
            <CardDescription>Real vs Fake content ratio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.pie_data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.pie_data.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Real</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Fake</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Analysis</CardTitle>
          <CardDescription>
            Latest files processed by the detection engine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recent_activity.length === 0 ? (
              <div className="text-center text-muted-foreground p-4">
                No recent activity found.
              </div>
            ) : (
              data.recent_activity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border border-border">
                      {item.type === "image" && (
                        <ImageIcon className="h-5 w-5 text-blue-500" />
                      )}
                      {item.type === "video" && (
                        <Video className="h-5 w-5 text-purple-500" />
                      )}
                      {item.type === "text" && (
                        <FileText className="h-5 w-5 text-orange-500" />
                      )}
                      {item.type === "malware" && (
                        <Shield className="h-5 w-5 text-rose-500" />
                      )}
                      {item.type === "audio" && (
                        <Activity className="h-5 w-5 text-yellow-500" />
                      )}
                      {item.type === "unknown" && (
                        <Activity className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {item.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        ["Real", "Clean", "Safe"].includes(item.status)
                          ? "default"
                          : ["Fake", "Malicious", "High Threat"].includes(
                                item.status,
                              )
                            ? "destructive"
                            : ["Suspicious", "Warning"].includes(item.status)
                              ? "outline"
                              : "secondary"
                      }
                      className={`
                        ${
                          ["Real", "Clean", "Safe"].includes(item.status)
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : ""
                        }
                        ${
                          ["Fake", "Malicious", "High Threat"].includes(
                            item.status,
                          )
                            ? "bg-red-500 hover:bg-red-600"
                            : ""
                        }
                        ${
                          ["Queued", "Processing"].includes(item.status)
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : ""
                        }
                        ${
                          ["Unknown"].includes(item.status)
                            ? "bg-gray-500 hover:bg-gray-600 text-white"
                            : ""
                        }
                      `}
                    >
                      {item.status}
                    </Badge>
                    <span className="text-sm font-bold text-muted-foreground w-12 text-right">
                      {item.confidence}
                    </span>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

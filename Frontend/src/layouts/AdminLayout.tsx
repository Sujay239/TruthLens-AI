import { useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ListChecks,
  Users,
  Activity,
  Settings,
  Shield,
  Headset,
  X,
  ChevronRight,
  LogOut,
  MessageSquare,
  BookOpen,
  FileText,
  Key,
} from "lucide-react";

const sidebarItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin",
  },
  { id: "scans", label: "Scans", icon: ListChecks, path: "/admin/scans" },
  { id: "blogs", label: "Blogs", icon: BookOpen, path: "/admin/blogs" },
  { id: "research", label: "Research", icon: FileText, path: "/admin/research" },
  {
    id: "feedbacks",
    label: "Feedback",
    icon: MessageSquare,
    path: "/admin/feedback",
  },
  { id: "users", label: "Users", icon: Users, path: "/admin/users" },
  { id: "admins", label: "Admins", icon: Shield, path: "/admin/admins" },
  { id: "Support", label: "Support", icon: Headset, path: "/admin/support" },
  { id: "logs", label: "Audit Logs", icon: Activity, path: "/admin/audit" },
  { id: "api-keys", label: "API Keys", icon: Key, path: "/admin/api-keys" },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/admin/settings",
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminData, setAdminData] = useState({
    full_name: "",
    username: "",
    email: "",
    avatar: "",
  });
  const API_URL = import.meta.env.VITE_API_URL;

  // Derive active section from URL instead of tracking manually
  const activeSection = useMemo(() => {
    const matched = sidebarItems.find((item) =>
      item.path === "/admin"
        ? location.pathname === "/admin" || location.pathname === "/admin/"
        : location.pathname.startsWith(item.path)
    );
    return matched?.id ?? "dashboard";
  }, [location.pathname]);


  const initials = useMemo(() => {
    if (!adminData.full_name) return "A";
    return adminData.full_name
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [adminData.full_name]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/auth/admin");
  };

  useEffect(() => {
    const loadAdmin = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/admin/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setAdminData({
            full_name: data.full_name || data.username || "Administrator",
            username: data.username || "",
            email: data.email || "",
            avatar: data.avatar || "",
          });
        }
      } catch (error) {
        console.error("Failed to load admin profile", error);
      }
    };

    loadAdmin();

    const handleProfileUpdate = () => {
      loadAdmin();
    };

    window.addEventListener("adminProfileUpdated", handleProfileUpdate);
    return () =>
      window.removeEventListener("adminProfileUpdated", handleProfileUpdate);
  }, [API_URL]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,calc(100vw-2rem))] flex-col border-r border-border bg-card/95 backdrop-blur-xl transition-transform duration-300 overflow-y-auto lg:sticky lg:top-0 lg:bottom-0 lg:h-screen lg:w-72 lg:translate-x-0 ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex items-center gap-3 border-b border-border px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex shrink-0 items-center justify-center">
              <img src="/favicon.ico" alt="Logo" className="h-10 w-10" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Admin Console
              </p>
              <p className="truncate text-lg font-bold text-foreground">
                TruthLens AI
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={18} />
            </Button>
          </div>

          <div className="border-b border-border px-4 py-4 sm:px-6 sm:py-5">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Signed in as
              </p>
              <p className="mt-1 truncate text-lg font-semibold text-foreground">
                {adminData.full_name.includes("(") 
                  ? adminData.full_name.split("(")[1]?.split(")")[0]
                  : adminData.full_name || "Administrator"}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {adminData.email || adminData.username || "Admin access"}
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 sm:px-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    setIsSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate font-medium">{item.label}</span>
                  {isActive ? (
                    <ChevronRight className="ml-auto h-4 w-4" />
                  ) : null}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-border p-4">
            <div 
              className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-muted/50 p-1 rounded-lg transition-colors"
              onClick={() => navigate("/admin/settings")}
            >
              <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold overflow-hidden border border-border">
                {adminData.avatar ? (
                  <img src={adminData.avatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate text-foreground">
                  {adminData.full_name || "Administrator"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {adminData.email || adminData.username || "Admin access"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/admin/settings");
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              className="h-11 w-full font-medium hover:bg-red-600/10 hover:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 " />
              Sign out
            </Button>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col bg-muted/20">
          <div className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-5 md:p-8">
            <div className="mx-auto min-w-0 max-md:max-w-7xl">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

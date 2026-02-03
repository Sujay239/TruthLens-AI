import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Shield,
  Bell,
  ChevronDown,
  ChevronRight,
  Hammer,
  FileText,
  Image as ImageIcon,
  Video,
  Mic,
  BrainCircuit,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export default function UserLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(true); // Default open for visibility
  const navigate = useNavigate();
  const location = useLocation();

  /* User Data State */
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    avatar: "",
  });
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/myData`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUserData({
          first_name: data.first_name || "User",
          last_name: data.last_name || "",
          avatar: data.avatar || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch user data", error);
    }
  };

  useEffect(() => {
    fetchUserData();

    // Listen for profile updates
    const handleProfileUpdate = () => {
      fetchUserData();
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () =>
      window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, []);

  const navItems = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/dashboard",
    },
    {
      label: "Analysis History",
      icon: <History size={20} />,
      path: "/dashboard/history",
    },
  ];

  /* Tools Items */
  const toolsItems = [
    {
      label: "Fake News",
      icon: <FileText size={18} />,
      path: "/dashboard/tools/fake-news",
    },
    {
      label: "Deepfake Image",
      icon: <ImageIcon size={18} />,
      path: "/dashboard/tools/deepfake-image",
    },
    {
      label: "Deepfake Video",
      icon: <Video size={18} />,
      path: "/dashboard/tools/deepfake-video",
    },
    {
      label: "Voice Detection",
      icon: <Mic size={18} />,
      path: "/dashboard/tools/voice-detection",
    },
    {
      label: "AI Text Detector",
      icon: <BrainCircuit size={18} />,
      path: "/dashboard/tools/ai-text",
    },
    {
      label: "Malware Scan",
      icon: <ShieldAlert size={18} />,
      path: "/dashboard/tools/malware-scan",
    },
  ];

  const handleLogout = () => {
    // Clear any auth tokens here
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-border flex items-center gap-3 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <Shield className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
            TruthLens
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}

          {/* Tools Section */}
          <div className="pt-2">
            <button
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Hammer size={20} />
                <span className="font-medium">Detection Tools</span>
              </div>
              {isToolsOpen ? (
                <ChevronDown
                  size={16}
                  className="text-muted-foreground/70 group-hover:text-foreground"
                />
              ) : (
                <ChevronRight
                  size={16}
                  className="text-muted-foreground/70 group-hover:text-foreground"
                />
              )}
            </button>

            {/* Dropdown Content */}
            <div
              className={`space-y-1 pl-4 mt-1 overflow-hidden transition-all duration-300 ${
                isToolsOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {toolsItems.map((tool) => (
                <button
                  key={tool.path}
                  onClick={() => {
                    navigate(tool.path);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors border-l-2 ${
                    location.pathname === tool.path
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {tool.icon}
                  {tool.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              navigate("/dashboard/settings");
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === "/dashboard/settings"
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Settings size={20} />
            Settings
          </button>
        </nav>

        <div className="p-4 border-t border-border mt-auto shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden -ml-2"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={20} />
          </Button>

          <div className="ml-auto flex items-center gap-4">
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
            </Button>

            {/* Simple User Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium">
                  {userData.first_name} {userData.last_name}
                </span>
                <span className="text-xs text-muted-foreground">Free Plan</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center border border-border overflow-hidden">
                {userData.avatar ? (
                  <img
                    src={userData.avatar}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={18} className="text-muted-foreground" />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

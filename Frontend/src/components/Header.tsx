import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Star, User, LayoutDashboard, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export default function Header() {
  const navigate = useNavigate();
  const [isUser, setIsUser] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsUser(!!localStorage.getItem("token"));
    setIsAdmin(!!localStorage.getItem("admin_token"));
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur px-6 py-4">
      <div className="flex items-center justify-between mx-auto max-w-7xl">
        {/* Left Side: Logo & Branding */}
        <Link to="/" className="flex items-center gap-3 select-none group">
          {/* Logo Icon */}
          <img
            src="/favicon.ico"
            alt="TruthLens AI Logo"
            className="h-8 w-8 transition-transform duration-300 group-hover:scale-105"
          />

          {/* Text Content */}
          <div className="flex flex-col">
            <h1 className="text-lg font-bold leading-none text-foreground group-hover:text-blue-600 transition-colors duration-200">
              TruthLens AI
            </h1>
            <span className="text-xs font-medium text-muted-foreground mt-1">
              Expose • Analyze • Secure
            </span>
          </div>
        </Link>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 md:gap-6">
          {/* GitHub Link (Ghost Button variant for clean look) */}
          <a
            href="https://github.com/Sujay239/TruthLens-AI"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="ghost"
              className="hidden md:flex gap-2 text-foreground/80 hover:text-foreground"
            >
              <Star className="h-4 w-4" />
              <span className="font-semibold">Star on GitHub</span>
            </Button>
          </a>

          <ModeToggle />

          {/* Authentication Conditional Button */}
          {isUser ? (
            <Button
              variant="outline"
              className="gap-2 shadow-sm border-blue-500/30 text-blue-600 dark:text-blue-400 dark:hover:bg-blue-950/20 hover:text-blue-700 hover:bg-blue-50/50"
              onClick={() => navigate("/dashboard")}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
          ) : isAdmin ? (
            <Button
              variant="outline"
              className="gap-2 shadow-sm border-purple-500/30 text-purple-600 dark:text-purple-400 dark:hover:bg-purple-950/20 hover:text-purple-700 hover:bg-purple-50/50"
              onClick={() => navigate("/admin")}
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Admin Panel</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              className="gap-2 shadow-sm"
              onClick={() => navigate("/auth")}
            >
              <User className="h-4 w-4" />
              <span>Sign In</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

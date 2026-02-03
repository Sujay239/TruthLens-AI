import { useNavigate } from "react-router-dom";
import { Shield, Star, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export default function Header() {
  const navigate = useNavigate();
  return (
    <header className="w-full border-b bg-background px-6 py-4">
      <div className="flex items-center justify-between mx-auto max-w-7xl">
        {/* Left Side: Logo & Branding */}
        <div className="flex items-center gap-3">
          {/* Logo Icon */}
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <Shield className="h-6 w-6" />
          </div>

          {/* Text Content */}
          <div className="flex flex-col">
            <h1 className="text-lg font-bold leading-none text-blue-600">
              TruthLens AI
            </h1>
            <span className="text-xs font-medium text-muted-foreground mt-1">
              Expose • Analyze • Secure
            </span>
          </div>
        </div>

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

          {/* Sign In Button */}
          <Button
            variant="outline"
            className="gap-2 shadow-sm"
            onClick={() => navigate("/auth")}
          >
            <User className="h-4 w-4" />
            <span>Sign In</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

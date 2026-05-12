import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "sonner";

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/myData`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else if (response.status === 401) {
          // Token is explicitly invalid/expired — clear it
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          toast.error("Session expired. Please login again.");
        } else {
          // Server error (500, etc.) — keep token, allow access
          // The user shouldn't be logged out due to a temporary server issue
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth validation error:", error);
        // Network error (backend restarting/offline) — keep token, allow access
        // JWT is self-contained, so the token is still valid even if we can't verify now
        setIsAuthenticated(true);
      }
    };

    validateToken();
  }, [API_URL]);

  if (isAuthenticated === null) {
    // Loading state
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground animate-pulse">
            Verifying Access...
          </p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;

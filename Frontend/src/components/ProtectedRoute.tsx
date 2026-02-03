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
        } else {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          toast.error("Session expired. Please login again.");
        }
      } catch (error) {
        console.error("Auth validation error:", error);
        // On network error, maybe allow slightly or fail safe?
        // Creating a simplified approach: If we can't verify, we log them out for security.
        localStorage.removeItem("token");
        setIsAuthenticated(false);
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

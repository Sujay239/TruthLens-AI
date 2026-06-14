import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "sonner";

const AdminProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("admin_token");

      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/admin/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else if (response.status === 401) {
          localStorage.removeItem("admin_token");
          setIsAuthenticated(false);
          toast.error("Admin session expired. Please sign in again.");
        } else {
          setIsAuthenticated(false);
          toast.error("Unable to verify admin access.");
        }
      } catch {
        setIsAuthenticated(false);
      }
    };

    validateToken();
  }, [API_URL]);

  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <p className="text-muted-foreground animate-pulse">
            Verifying Admin Access...
          </p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/admin" replace />;
};

export default AdminProtectedRoute;

import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export default function GithubCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const API_URL = import.meta.env.VITE_API_URL;

    if (code && !hasFetched.current) {
      hasFetched.current = true; // Prevent double firing in React Strict Mode

      const loginWithGithub = async () => {
        try {
          const response = await fetch(`${API_URL}/auth/github-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          });

          if (response.ok) {
            const data = await response.json();
            localStorage.setItem("token", data.access_token);
            toast.success("GitHub Login successful!");
            navigate("/dashboard");
          } else {
            const error = await response.json();
            toast.error("GitHub Login failed", { description: error.detail });
            navigate("/auth");
          }
        } catch (err) {
          toast.error("Network error during GitHub Login");
          navigate("/auth");
        }
      };

      loginWithGithub();
    } else if (!code) {
      navigate("/auth");
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground animate-pulse">
          Authenticating with GitHub...
        </p>
      </div>
    </div>
  );
}

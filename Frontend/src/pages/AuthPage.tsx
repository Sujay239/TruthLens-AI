import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, ArrowRight, CheckCircle2, Github } from "lucide-react";
import authBg from "../assets/auth-bg.png";
import { toast } from "sonner";
import { useGoogleLogin } from "@react-oauth/google";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [activeTab, setActiveTab] = useState("login");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch(`${API_URL}/auth/myData`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            navigate("/dashboard");
            return;
          } else {
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          localStorage.removeItem("token");
        }
      }
      setIsCheckingAuth(false);
    };
    verifyToken();
  }, [navigate]);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/auth/google-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: tokenResponse.access_token,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("token", data.access_token);
          toast.success("Login successful!");
          navigate("/dashboard");
        } else {
          const errorData = await response.json();
          toast.error("Google login failed", { description: errorData.detail });
        }
      } catch (error) {
        toast.error("Google login failed", {
          description: "Network error occurred.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      toast.error("Google login failed");
    },
  });

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoadingSpinner className="h-10 w-10 text-primary" />
      </div>
    );
  }

  const handleGithubLogin = () => {
    const CLIENT_ID = "Ov23liDMQfI42XVPRzpE";
    const REDIRECT_URI = "http://localhost:5173/auth/github/callback";
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user:email`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginData.email.toLowerCase().trim(), // Ensure lowercase
          password: loginData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        toast.error("Login failed", { description: errorData.detail });
      }
    } catch (error) {
      toast.error("Login failed", { description: "Network error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const username =
        `${registerData.firstName}${registerData.lastName}`.toLowerCase() +
        Math.floor(Math.random() * 1000); // Simple username generation

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerData.email.toLowerCase().trim(),
          username: username,
          password: registerData.password,
          first_name: registerData.firstName,
          last_name: registerData.lastName,
          full_name: `${registerData.firstName} ${registerData.lastName}`, // Optional now
        }),
      });

      if (response.ok) {
        toast.success("Registration successful!", {
          description: "Please verify email to login.",
        });
        setActiveTab("login");
        setRegisterData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
        });
      } else {
        const errorData = await response.json();
        toast.error("Registration failed", { description: errorData.detail });
      }
    } catch (error) {
      toast.error("Registration failed", {
        description: "Network error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Left Side - Visual Branding */}
      <div className="hidden relative lg:flex flex-col justify-between p-10 text-white dark:border-r border-zinc-800 bg-zinc-900">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 z-10" />
          <img
            src={authBg}
            alt="Security Background"
            className="w-full h-full object-cover opacity-60"
          />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2 text-lg font-bold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/90 backdrop-blur-sm shadow-lg shadow-blue-900/20">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl tracking-tight">TruthLens AI</span>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 space-y-8 max-w-lg mb-10">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
              Verified Truth in a <br />
              <span className="text-blue-400">Digital World</span>
            </h1>
            <p className="text-lg text-slate-200/90 leading-relaxed font-light">
              Join thousands of journalists, researchers, and concerned citizens
              using our advanced models to verify digital content in real-time.
            </p>
          </div>

          <div className="flex flex-col gap-4 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 text-slate-200">
              <CheckCircle2 className="h-5 w-5 text-blue-400" />
              <span className="font-medium">99.2% Detection Accuracy</span>
            </div>
            <div className="flex items-center gap-3 text-slate-200">
              <CheckCircle2 className="h-5 w-5 text-cyan-400" />
              <span className="font-medium">Deepfake Analysis Engine</span>
            </div>
            <div className="flex items-center gap-3 text-slate-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span className="font-medium">Real-time Verification API</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex justify-between text-sm text-slate-400 font-medium">
          <p>© {new Date().getFullYear()} TruthLens AI</p>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="/terms" className="hover:text-white transition-colors">
              Terms
            </a>
            <a href="/ethics" className="hover:text-white transition-colors">
              Ethics
            </a>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="flex items-center justify-center p-8 bg-background relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[400px] z-10">
          <div className="text-center lg:hidden mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Shield className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold">TruthLens AI</span>
            </div>
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground mt-2">
              Enter your credentials to access your account
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12 p-1 bg-muted/60">
              <TabsTrigger
                value="login"
                className="text-sm font-medium transition-all"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="text-sm font-medium transition-all"
              >
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="login"
              className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
            >
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0 text-center">
                  <CardTitle className="text-2xl">
                    Sign in to your account
                  </CardTitle>
                  <CardDescription>
                    Enter your email below to login to your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        className="h-11"
                        required
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData({ ...loginData, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <a
                          href="/auth/forgot-password"
                          className="text-sm text-blue-600 hover:text-blue-500 font-medium hover:underline"
                        >
                          Forgot password?
                        </a>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        className="h-11"
                        required
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base font-medium shadow-lg shadow-blue-600/20"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          Sign In <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="px-0 flex flex-col gap-5">
                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-muted" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="w-full h-11 font-medium hover:bg-muted/50 transition-colors"
                      type="button"
                      onClick={() => googleLogin()}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Google
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-11 font-medium hover:bg-muted/50 transition-colors"
                      type="button"
                      onClick={handleGithubLogin}
                    >
                      <Github className="mr-2 h-4 w-4" />
                      GitHub
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent
              value="register"
              className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
            >
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0 text-center">
                  <CardTitle className="text-2xl">Create an account</CardTitle>
                  <CardDescription>
                    Enter your details below to create your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First name</Label>
                        <Input
                          id="first-name"
                          placeholder="John"
                          className="h-11"
                          required
                          value={registerData.firstName}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              firstName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last name</Label>
                        <Input
                          id="last-name"
                          placeholder="Doe"
                          className="h-11"
                          required
                          value={registerData.lastName}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              lastName: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        className="h-11"
                        required
                        value={registerData.email}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        className="h-11"
                        required
                        value={registerData.password}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            password: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base font-medium shadow-lg shadow-blue-600/20"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          Create Account <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="px-0 flex flex-col gap-5">
                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-muted" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <Button
                      variant="outline"
                      className="w-full h-11 font-medium hover:bg-muted/50 transition-colors"
                      type="button"
                      onClick={() => googleLogin()}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Google
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-11 font-medium hover:bg-muted/50 transition-colors"
                      type="button"
                      onClick={handleGithubLogin}
                    >
                      <Github className="mr-2 h-4 w-4" />
                      GitHub
                    </Button>
                  </div>
                  <div className="text-sm text-center w-full text-muted-foreground mt-2">
                    By clicking continue, you agree to our{" "}
                    <a
                      href="/terms"
                      className="underline underline-offset-4 hover:text-primary transition-colors"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      className="underline underline-offset-4 hover:text-primary transition-colors"
                    >
                      Privacy Policy
                    </a>
                    , and{" "}
                    <a
                      href="/ethics"
                      className="underline underline-offset-4 hover:text-primary transition-colors"
                    >
                      Ethics
                    </a>
                    .
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

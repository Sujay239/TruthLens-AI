import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  ArrowLeft,
  Mail,
  Lock,
} from "lucide-react";
import authBg from "../assets/auth-bg.png";

import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset Password State
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });

  // State for email
  const [email, setEmail] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast.success("Reset link sent to your email.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.password !== passwords.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: passwords.password }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast.success("Password reset successful!");
        setTimeout(() => navigate("/auth"), 2000);
      } else {
        const data = await response.json();
        toast.error("Failed to reset password", { description: data.detail });
      }
    } catch (error) {
      toast.error("Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* Left Side - Visual Branding (Same as AuthPage) */}
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
              Secure Account <br />
              <span className="text-blue-400">Recovery</span>
            </h1>
            <p className="text-lg text-slate-200/90 leading-relaxed font-light">
              Don't worry, it happens to the best of us. We'll help you regain
              access to your centralized truth verification platform in just a
              few steps.
            </p>
          </div>

          <div className="flex flex-col gap-4 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 text-slate-200">
              <CheckCircle2 className="h-5 w-5 text-blue-400" />
              <span className="font-medium">Secure Verification Link</span>
            </div>
            <div className="flex items-center gap-3 text-slate-200">
              <CheckCircle2 className="h-5 w-5 text-cyan-400" />
              <span className="font-medium">Instant Delivery</span>
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
          </div>
        </div>
      </div>

      {/* Right Side - Forgot Password Form */}
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
          </div>

          <Card className="border-none shadow-none bg-transparent">
            {token ? (
              // RESET PASSWORD VIEW
              !isSubmitted ? (
                <>
                  <CardHeader className="px-0 pt-0 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold">
                      Reset Password
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      Enter your new password below to secure your account.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          className="h-11"
                          required
                          value={passwords.password}
                          onChange={(e) =>
                            setPasswords({
                              ...passwords,
                              password: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">
                          Confirm Password
                        </Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          className="h-11"
                          required
                          value={passwords.confirmPassword}
                          onChange={(e) =>
                            setPasswords({
                              ...passwords,
                              confirmPassword: e.target.value,
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
                            Reset Password{" "}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </>
              ) : (
                <div className="text-center animate-in fade-in zoom-in duration-300">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    Password Reset Successful
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Your password has been successfully updated. You can now
                    login with your new credentials.
                  </p>
                  <Button
                    className="w-full h-11"
                    onClick={() => navigate("/auth")}
                  >
                    Go to Login
                  </Button>
                </div>
              )
            ) : // FORGOT PASSWORD VIEW (Enter Email)
            !isSubmitted ? (
              <>
                <CardHeader className="px-0 pt-0 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold">
                    Forgot password?
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Enter the email address associated with your account and
                    we'll send you a link to reset your password.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        className="h-11"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                          Send Reset Link{" "}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </>
            ) : (
              <div className="text-center animate-in fade-in zoom-in duration-300">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Check your email</h3>
                <p className="text-muted-foreground mb-6">
                  We have sent a password reset link to your email address.
                  Please check your inbox and spam folder.
                </p>
                <Button
                  className="w-full h-11"
                  variant="outline"
                  onClick={() => setIsSubmitted(false)}
                >
                  Try another email
                </Button>
              </div>
            )}
            <CardFooter className="px-0 flex justify-center mt-6">
              <Button
                variant="link"
                className="text-muted-foreground hover:text-primary gap-2"
                onClick={() => navigate("/auth")}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Shield, ArrowRight, CheckCircle2, UserCog, Lock } from "lucide-react";
import authBg from "../assets/auth-bg.png";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"credentials" | "pin">("credentials");
  const [adminId, setAdminId] = useState<number | null>(null);
  const [adminLabel, setAdminLabel] = useState("");
  const [formError, setFormError] = useState("");
  const [credentials, setCredentials] = useState({
    identifier: "",
    password: "",
  });
  const [pinDigits, setPinDigits] = useState(["", "", "", "", "", ""]);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  const API_URL = import.meta.env.VITE_API_URL;

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError("");

    try {
      if (step === "credentials") {
        const response = await fetch(`${API_URL}/auth/admin/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: credentials.identifier.trim(),
            password: credentials.password,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setAdminId(data.admin_id);
          setAdminLabel(credentials.identifier.trim());
          setStep("pin");
          setPinDigits(["", "", "", "", "", ""]);
          toast.success("Credentials verified", {
            description: "Enter the 6-digit PIN to continue.",
          });
        } else {
          const errorData = await response.json();
          setFormError(errorData.detail || "Incorrect admin credentials.");
          toast.error("Admin login failed", { description: errorData.detail });
        }

        return;
      }

      if (!adminId) {
        setFormError("Please verify your credentials again.");
        toast.error("Admin login failed", {
          description: "Please verify your credentials again.",
        });
        setStep("credentials");
        return;
      }

      const response = await fetch(`${API_URL}/auth/admin/verify-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_id: adminId,
          pin: pinDigits.join(""),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("admin_token", data.access_token);
        toast.success("Admin login successful!");
        navigate("/admin");
      } else {
        const errorData = await response.json();
        setFormError(errorData.detail || "Invalid PIN.");
        toast.error("Admin login failed", { description: errorData.detail });
      }
    } catch {
      setFormError("Network error occurred.");
      toast.error("Admin login failed", {
        description: "Network error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToCredentials = () => {
    setStep("credentials");
    setAdminId(null);
    setAdminLabel("");
    setFormError("");
    setPinDigits(["", "", "", "", "", ""]);
  };

  const handlePinChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const nextPinDigits = [...pinDigits];
    nextPinDigits[index] = value;
    setPinDigits(nextPinDigits);

    if (value && index < pinRefs.current.length - 1) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !pinDigits[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  const handlePinPaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const pastedDigits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedDigits) {
      return;
    }

    const nextPinDigits = ["", "", "", "", "", ""];
    pastedDigits.split("").forEach((digit, index) => {
      nextPinDigits[index] = digit;
    });

    setPinDigits(nextPinDigits);
    pinRefs.current[Math.min(pastedDigits.length, 5)]?.focus();
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="hidden relative lg:flex flex-col justify-between p-10 text-white dark:border-r border-zinc-800 bg-zinc-950">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-black/85 via-slate-950/55 to-slate-900/30 z-10" />
          <img
            src={authBg}
            alt="Security background"
            className="h-full w-full object-cover opacity-55"
          />
        </div>

        <div className="relative z-10 flex items-center gap-2 text-lg font-bold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600/90 backdrop-blur-sm shadow-lg shadow-cyan-900/20">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl tracking-tight">TruthLens AI</span>
        </div>

        <div className="relative z-10 max-w-lg space-y-8 mb-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <UserCog className="h-3.5 w-3.5" />
              Admin Portal
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
              Secure access to the
              <br />
              <span className="text-cyan-300">administration console</span>
            </h1>
            <p className="text-lg text-slate-200/90 leading-relaxed font-light">
              Sign in with your administrator credentials to manage reviews,
              monitor system activity, and keep the platform protected.
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-3 text-slate-200">
              <CheckCircle2 className="h-5 w-5 text-cyan-300" />
              <span className="font-medium">Restricted access gateway</span>
            </div>
            <div className="flex items-center gap-3 text-slate-200">
              <CheckCircle2 className="h-5 w-5 text-cyan-300" />
              <span className="font-medium">Audit-ready sign in flow</span>
            </div>
            <div className="flex items-center gap-3 text-slate-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              <span className="font-medium">Username or email supported</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex justify-between text-sm text-slate-400 font-medium">
          <p>© {new Date().getFullYear()} TruthLens AI</p>
          <button
            type="button"
            className="transition-colors hover:text-white"
            onClick={() => navigate("/auth")}
          >
            Back to user sign in
          </button>
        </div>
      </div>

      <div className="relative flex items-center justify-center overflow-hidden bg-background p-8">
        <div className="pointer-events-none absolute right-0 top-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.05),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.06),_transparent_30%)]" />

        <div className="relative z-10 w-full max-w-[440px]">
          <div className="mb-8 text-center lg:hidden">
            <div className="mb-4 flex items-center justify-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-600 text-white shadow-lg shadow-cyan-500/20">
                <Shield className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold">TruthLens AI</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">
              <UserCog className="h-3.5 w-3.5" />
              Admin Portal
            </div>
          </div>

          <Card className="border-none bg-transparent shadow-none">
            <CardHeader className="px-0 pt-0 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-500/20">
                <Lock className="h-7 w-7 text-cyan-600 dark:text-cyan-300" />
              </div>
              <CardTitle className="text-3xl font-bold">
                Admin Sign In
              </CardTitle>
              <CardDescription className="mx-auto mt-2 max-w-sm text-base">
                {step === "credentials"
                  ? "Use your username or email and password to verify access."
                  : `Enter the 6-digit PIN for ${adminLabel || "your account"} to continue.`}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-0">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                {step === "credentials" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="admin-identifier">
                        Username or Email
                      </Label>
                      <Input
                        id="admin-identifier"
                        type="text"
                        placeholder="admin@example.com"
                        className={`h-11 ${formError && step === "credentials" ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        required
                        value={credentials.identifier}
                        onChange={(e) => {
                          if (formError) setFormError("");
                          setCredentials({
                            ...credentials,
                            identifier: e.target.value,
                          });
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Password</Label>
                      <Input
                        id="admin-password"
                        type="password"
                        className={`h-11 ${formError && step === "credentials" ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        required
                        value={credentials.password}
                        onChange={(e) => {
                          if (formError) setFormError("");
                          setCredentials({
                            ...credentials,
                            password: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="admin-pin">6-Digit PIN</Label>
                    <div
                      className="flex gap-2 sm:gap-3"
                      onPaste={handlePinPaste}
                    >
                      {pinDigits.map((digit, index) => (
                        <Input
                          key={index}
                          ref={(element) => {
                            pinRefs.current[index] = element;
                          }}
                          id={index === 0 ? "admin-pin" : undefined}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          autoComplete="one-time-code"
                          className={`h-12 flex-1 text-center text-lg font-semibold ${formError && step === "pin" ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                          required
                          value={digit}
                          onChange={(e) => {
                            if (formError) setFormError("");
                            handlePinChange(index, e.target.value.slice(-1));
                          }}
                          onKeyDown={(e) => handlePinKeyDown(index, e)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {formError ? (
                  <p className="text-sm font-medium text-red-500">
                    {formError}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  className="h-11 w-full bg-cyan-600 text-base font-medium text-white shadow-lg shadow-cyan-500/20 hover:bg-cyan-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      {step === "credentials"
                        ? "Verify Credentials"
                        : "Enter Admin Console"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 px-0">
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Administrative access only
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-11 w-full border-cyan-200/70 bg-cyan-50/70 font-medium text-cyan-800 hover:bg-cyan-100/90 hover:text-cyan-900 dark:border-cyan-900/50 dark:bg-cyan-950/40 dark:text-cyan-100 dark:hover:bg-cyan-900/40"
                onClick={
                  step === "pin"
                    ? handleBackToCredentials
                    : () => navigate("/auth")
                }
              >
                {step === "pin" ? "Back to credentials" : "Back to user login"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

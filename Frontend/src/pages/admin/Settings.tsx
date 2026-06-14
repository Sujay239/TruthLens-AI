import { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Lock,
  KeyRound,
  Save,
  Eye,
  EyeOff,
  Camera,
  Loader2,
  CheckCircle2,
  Circle,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface AdminProfile {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  avatar?: string;
}

const API_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("admin_token");

const patchReq = async (url: string, body: object) => {
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Request failed");
  return data;
};

const postReq = async (url: string, body: object) => {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Request failed");
  return data;
};

type Tab = "profile" | "security";

// Password requirements checker
const passChecks = (p: string) => ({
  length: p.length >= 8,
  upper: /[A-Z]/.test(p),
  special: /[!@#$%^&*]/.test(p),
  number: /[0-9]/.test(p),
});

// OTP Input Component for PINs
function OTPInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  error = false,
  shaking = false,
}: {
  length?: number;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  error?: boolean;
  shaking?: boolean;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const pinArray = value
    .split("")
    .concat(Array(length).fill(""))
    .slice(0, length);

  const handleChange = (val: string, index: number) => {
    const digit = val.slice(-1);
    if (!/^\d*$/.test(digit)) return;

    const newPin = [...pinArray];
    newPin[index] = digit;
    const combined = newPin.join("");
    onChange(combined);

    if (digit && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !pinArray[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        justifyContent: "center",
        animation: shaking
          ? "shake 0.5s cubic-bezier(.36,.07,.19,.97) both"
          : "none",
      }}
    >
      <style>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
      {Array(length)
        .fill(0)
        .map((_, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={pinArray[i]}
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            disabled={disabled}
            style={{
              width: 46,
              height: 54,
              borderRadius: 10,
              border: error
                ? "1.5px solid #ef4444"
                : "1px solid hsl(var(--border))",
              background: error
                ? "rgba(239, 68, 68, 0.05)"
                : "hsl(var(--background))",
              color: error ? "#ef4444" : "var(--foreground)",
              fontSize: 20,
              fontWeight: 700,
              textAlign: "center",
              outline: "none",
              transition: "all 0.2s",
              boxShadow: error
                ? "0 0 10px rgba(239, 68, 68, 0.15)"
                : pinArray[i]
                  ? "0 0 0 2px rgba(59,130,246,0.3)"
                  : "none",
              borderColor: error
                ? "#ef4444"
                : pinArray[i]
                  ? "#3b82f6"
                  : "hsl(var(--border))",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = error ? "#ef4444" : "#3b82f6")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = error
                ? "#ef4444"
                : pinArray[i]
                  ? "#3b82f6"
                  : "hsl(var(--border))")
            }
          />
        ))}
    </div>
  );
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  // PIN specific states
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [verifyingOldPin, setVerifyingOldPin] = useState(false);
  const [oldPinVerified, setOldPinVerified] = useState(false);
  const [pinSetupStep, setPinSetupStep] = useState<"entering" | "confirming">(
    "entering",
  );
  const [pinError, setPinError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [savingPin, setSavingPin] = useState(false);

  const [expandedSection, setExpandedSection] = useState<
    "none" | "password" | "pin"
  >("none");

  const checks = passChecks(newPass);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/admin/me`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) {
          const data: AdminProfile = await res.json();
          setProfile(data);
          setFullName(data.full_name || "");
          setEmail(data.email || "");
          if (data.avatar) setAvatarPreview(data.avatar);
        }
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_URL}/admin/manage/me/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");
      setProfile(data);
      setAvatarPreview(data.avatar);
      toast.success("Avatar updated!");
      window.dispatchEvent(new Event("adminProfileUpdated"));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
      const updated = await patchReq(`${API_URL}/admin/manage/me`, {
        full_name: fullName,
        email,
      });
      setProfile(updated);
      toast.success("Profile saved successfully!");
      window.dispatchEvent(new Event("adminProfileUpdated"));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPass !== confirmPass) return toast.error("Passwords do not match");
    if (!Object.values(checks).every(Boolean))
      return toast.error("Password does not meet requirements");
    setSavingPass(true);
    try {
      await patchReq(`${API_URL}/admin/manage/me/password`, {
        current_password: currentPass,
        new_password: newPass,
      });
      toast.success("Password updated!");
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
      setExpandedSection("none");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSavingPass(false);
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleVerifyOldPin = async () => {
    if (currentPin.length < 6) {
      setPinError("Please enter your full 6-digit PIN");
      triggerShake();
      return;
    }
    setVerifyingOldPin(true);
    setPinError(null);
    try {
      await postReq(`${API_URL}/admin/manage/me/pin/verify`, {
        pin: currentPin,
      });
      setOldPinVerified(true);
      setPinSetupStep("entering");
      toast.success("PIN verified! Now set your new PIN.");
    } catch (e: any) {
      setPinError(e.message || "Incorrect PIN. Please try again.");
      triggerShake();
    } finally {
      setVerifyingOldPin(false);
    }
  };

  const handlePinChange = async () => {
    if (newPin !== confirmPin) {
      setPinError("PINs do not match. Please try again.");
      triggerShake();
      return;
    }
    if (newPin.length < 6) {
      setPinError("New PIN must be 6 digits");
      triggerShake();
      return;
    }
    setSavingPin(true);
    setPinError(null);
    try {
      await patchReq(`${API_URL}/admin/manage/me/pin`, {
        current_pin: currentPin,
        new_pin: newPin,
      });
      toast.success("PIN updated successfully!");
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      setOldPinVerified(false);
      setPinSetupStep("entering");
      setExpandedSection("none");
    } catch (e: any) {
      setPinError(e.message);
      triggerShake();
    } finally {
      setSavingPin(false);
    }
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((s) => s[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : (profile?.username?.[0]?.toUpperCase() ?? "A");

  if (loading) {
    return (
      <div style={{ fontFamily: "Inter, sans-serif", color: "#e5e2e1" }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div className="h-8 w-40 rounded bg-muted/40 animate-pulse mb-2" />
          <div className="h-4 w-72 rounded bg-muted/30 animate-pulse" />
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <div className="h-9 w-24 rounded-full bg-muted/20 animate-pulse" />
          <div className="h-9 w-24 rounded-full bg-muted/20 animate-pulse" />
        </div>

        <div
          style={{
            background: "rgba(23, 23, 23, 0.48)",
            border: "1px solid rgba(189, 182, 182, 0.72)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {/* Avatar banner */}
          <div
            style={{
              padding: "32px 32px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div className="h-20 w-20 rounded-full bg-muted/30 animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-36 rounded bg-muted/40 animate-pulse" />
              <div className="h-4 w-20 rounded bg-muted/30 animate-pulse" />
              <div className="h-3 w-40 rounded bg-muted/20 animate-pulse" />
            </div>
          </div>

          {/* Form */}
          <div
            style={{
              padding: 32,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div className="space-y-2">
              <div className="h-4 w-20 rounded bg-muted/30 animate-pulse" />
              <div className="h-10 w-full rounded bg-muted/20 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-muted/30 animate-pulse" />
              <div className="h-10 w-full rounded bg-muted/20 animate-pulse" />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 4,
              }}
            >
              <div className="h-10 w-36 rounded bg-muted/30 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Shared styles ───────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    background: "var(--background)",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
    color: "var(--foreground)",
    padding: "10px 14px",
    width: "100%",
    outline: "none",
    fontSize: 14,
    fontFamily: "Inter, sans-serif",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--muted-foreground)",
    marginBottom: 6,
    display: "block",
  };
  const cardStyle: React.CSSProperties = {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 16,
    overflow: "hidden",
  };
  const primaryBtn = (disabled?: boolean): React.CSSProperties => ({
    background: disabled ? "#1e3a6e" : "#3b82f6",
    color: disabled ? "#555" : "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontFamily: "Inter, sans-serif",
    opacity: disabled ? 0.6 : 1,
  });

  const collapsibleStyle = (isExpanded: boolean): React.CSSProperties => ({
    maxHeight: isExpanded ? "1200px" : "0px",
    opacity: isExpanded ? 1 : 0,
    overflow: "hidden",
    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    transform: isExpanded ? "translateY(0)" : "translateY(-10px)",
  });

  // ─── Tabs ─────────────────────────────────────────────────────────
  const tabs = [
    { id: "profile" as Tab, label: "Profile", icon: <User size={15} /> },
    { id: "security" as Tab, label: "Security", icon: <Lock size={15} /> },
  ];

  return (
    <div
      style={{ fontFamily: "Inter, sans-serif", color: "var(--foreground)" }}
    >
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            margin: 0,
            color: "var(--foreground)",
          }}
        >
          Settings
        </h2>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: 14,
            color: "var(--muted-foreground)",
          }}
        >
          Manage your{" "}
          <span style={{ color: "#3b82f6" }}>profile information</span> and
          account security.
        </p>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTab(t.id);
              setExpandedSection("none");
              setOldPinVerified(false);
              setPinError(null);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: 999,
              border:
                activeTab === t.id
                  ? "1px solid #3b82f6"
                  : "1px solid hsl(var(--border))",
              background:
                activeTab === t.id ? "rgba(59,130,246,0.12)" : "transparent",
              color: activeTab === t.id ? "#3b82f6" : "var(--muted-foreground)",
              fontWeight: 500,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              transition: "all 0.15s",
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ─── PROFILE TAB ─────────────────────────────────────────── */}
      {activeTab === "profile" && (
        <div style={cardStyle}>
          {/* Avatar banner */}
          <div
            style={{
              padding: "32px 32px 24px",
              borderBottom: "1px solid hsl(var(--border))",
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div style={{ position: "relative" }} className="group">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="avatar"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid hsl(var(--border))",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "#1e3a6e",
                    color: "#3b82f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    fontWeight: 700,
                    border: "2px solid rgba(59,130,246,0.3)",
                  }}
                >
                  {initials}
                </div>
              )}
              {/* Camera overlay */}
              <button
                onClick={() => avatarInputRef.current?.click()}
                title="Change photo"
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.55)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0,
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
              >
                {uploadingAvatar ? (
                  <Loader2 size={20} className="animate-spin" color="#fff" />
                ) : (
                  <Camera size={20} color="#fff" />
                )}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontWeight: 700,
                  fontSize: 18,
                  color: "var(--foreground)",
                }}
              >
                {profile?.full_name || profile?.username}
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 13,
                  color: "var(--muted-foreground)",
                }}
              >
                @{profile?.username}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#f59e0b" }}>
                Username cannot be changed
              </p>
            </div>
          </div>

          {/* Form */}
          <div
            style={{
              padding: 32,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div>
              <label style={labelStyle}>
                <User
                  size={12}
                  style={{
                    display: "inline",
                    marginRight: 6,
                    verticalAlign: "middle",
                  }}
                />
                Full Name
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                style={inputStyle}
                onFocus={(e) => (e.target.style.border = "1px solid #3b82f6")}
                onBlur={(e) =>
                  (e.target.style.border = "1px solid hsl(var(--border))")
                }
              />
            </div>
            <div>
              <label style={labelStyle}>
                <Mail
                  size={12}
                  style={{
                    display: "inline",
                    marginRight: 6,
                    verticalAlign: "middle",
                  }}
                />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={inputStyle}
                onFocus={(e) => (e.target.style.border = "1px solid #3b82f6")}
                onBlur={(e) =>
                  (e.target.style.border = "1px solid hsl(var(--border))")
                }
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 4,
              }}
            >
              <button
                onClick={handleProfileSave}
                disabled={savingProfile}
                style={primaryBtn(savingProfile)}
              >
                {savingProfile ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── SECURITY TAB ────────────────────────────────────────── */}
      {activeTab === "security" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Change Password Section */}
          <div style={cardStyle}>
            <div
              style={{
                padding: "20px 28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom:
                  expandedSection === "password"
                    ? "1px solid hsl(var(--border))"
                    : "none",
                transition: "border-bottom 0.3s",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: expandedSection === "password" ? 18 : 16,
                    fontWeight: 700,
                    color: "var(--foreground)",
                    transition: "font-size 0.3s",
                  }}
                >
                  Change Password
                </p>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 13,
                    color: "var(--muted-foreground)",
                  }}
                >
                  {expandedSection === "password"
                    ? "Ensure your account is using a long, random password to stay secure."
                    : "Update your account password to stay secure."}
                </p>
              </div>
              <button
                onClick={() =>
                  setExpandedSection(
                    expandedSection === "password" ? "none" : "password",
                  )
                }
                style={
                  expandedSection === "password"
                    ? {
                        background: "none",
                        border: "1px solid hsl(var(--border))",
                        color: "var(--muted-foreground)",
                        padding: "6px 12px",
                        borderRadius: 6,
                        fontSize: 12,
                        cursor: "pointer",
                      }
                    : { ...primaryBtn(false), padding: "8px 16px" }
                }
              >
                {expandedSection === "password" ? (
                  "Cancel"
                ) : (
                  <>
                    <Lock size={14} /> Change Pass
                  </>
                )}
              </button>
            </div>

            <div style={collapsibleStyle(expandedSection === "password")}>
              <div
                style={{
                  padding: 28,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 28,
                }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div>
                    <label style={labelStyle}>Current Password</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showCurrentPass ? "text" : "password"}
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                        placeholder="Enter current password"
                        style={{ ...inputStyle, paddingRight: 42 }}
                        onFocus={(e) =>
                          (e.target.style.border = "1px solid #3b82f6")
                        }
                        onBlur={(e) =>
                          (e.target.style.border =
                            "1px solid hsl(var(--border))")
                        }
                      />
                      <button
                        onClick={() => setShowCurrentPass((v) => !v)}
                        style={{
                          position: "absolute",
                          right: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--muted-foreground)",
                        }}
                      >
                        {showCurrentPass ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>New Password</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showNewPass ? "text" : "password"}
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="Enter new password"
                        style={{ ...inputStyle, paddingRight: 42 }}
                        onFocus={(e) =>
                          (e.target.style.border = "1px solid #3b82f6")
                        }
                        onBlur={(e) =>
                          (e.target.style.border =
                            "1px solid hsl(var(--border))")
                        }
                      />
                      <button
                        onClick={() => setShowNewPass((v) => !v)}
                        style={{
                          position: "absolute",
                          right: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--muted-foreground)",
                        }}
                      >
                        {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Confirm New Password</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        placeholder="Confirm new password"
                        style={{ ...inputStyle, paddingRight: 42 }}
                        onFocus={(e) =>
                          (e.target.style.border = "1px solid #3b82f6")
                        }
                        onBlur={(e) =>
                          (e.target.style.border =
                            "1px solid hsl(var(--border))")
                        }
                      />
                      <button
                        onClick={() => setShowConfirmPass((v) => !v)}
                        style={{
                          position: "absolute",
                          right: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--muted-foreground)",
                        }}
                      >
                        {showConfirmPass ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: "hsl(var(--muted)/0.3)",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    padding: "20px 22px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyBetween: "space-between",
                      marginBottom: 16,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        fontSize: 13,
                        color: "var(--foreground)",
                      }}
                    >
                      Password Requirements
                    </p>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#3b82f6",
                        fontWeight: 600,
                        background: "rgba(59,130,246,0.1)",
                        padding: "2px 8px",
                        borderRadius: 4,
                      }}
                    >
                      Security
                    </span>
                  </div>
                  {[
                    { label: "Minimum 8 characters long", ok: checks.length },
                    {
                      label: "At least one uppercase character",
                      ok: checks.upper,
                    },
                    {
                      label: "At least one special character (!@#$%)",
                      ok: checks.special,
                    },
                    { label: "At least one number", ok: checks.number },
                  ].map((req) => (
                    <div
                      key={req.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 12,
                      }}
                    >
                      {req.ok ? (
                        <CheckCircle2 size={16} color="#22c55e" />
                      ) : (
                        <Circle size={16} className="text-muted-foreground" />
                      )}
                      <span
                        style={{
                          fontSize: 13,
                          color: req.ok ? "#22c55e" : "var(--muted-foreground)",
                        }}
                      >
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  padding: "0 28px 28px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={handlePasswordChange}
                  disabled={
                    savingPass || !currentPass || !newPass || !confirmPass
                  }
                  style={primaryBtn(
                    savingPass || !currentPass || !newPass || !confirmPass,
                  )}
                >
                  {savingPass ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Lock size={15} />
                  )}
                  Update Password
                </button>
              </div>
            </div>
          </div>

          {/* Change PIN Section */}
          <div style={cardStyle}>
            <div
              style={{
                padding: "20px 28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom:
                  expandedSection === "pin"
                    ? "1px solid hsl(var(--border))"
                    : "none",
                transition: "border-bottom 0.3s",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: expandedSection === "pin" ? 18 : 16,
                    fontWeight: 700,
                    color: "var(--foreground)",
                    transition: "font-size 0.3s",
                  }}
                >
                  Security PIN
                </p>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 13,
                    color: "var(--muted-foreground)",
                  }}
                >
                  {oldPinVerified
                    ? "Set your new 6-digit security PIN."
                    : "Verify your current PIN to set a new one."}
                </p>
              </div>
              <button
                onClick={() => {
                  setExpandedSection(
                    expandedSection === "pin" ? "none" : "pin",
                  );
                  setOldPinVerified(false);
                  setCurrentPin("");
                  setNewPin("");
                  setConfirmPin("");
                  setPinError(null);
                  setPinSetupStep("entering");
                }}
                style={
                  expandedSection === "pin"
                    ? {
                        background: "none",
                        border: "1px solid hsl(var(--border))",
                        color: "var(--muted-foreground)",
                        padding: "6px 12px",
                        borderRadius: 6,
                        fontSize: 12,
                        cursor: "pointer",
                      }
                    : { ...primaryBtn(false), padding: "8px 16px" }
                }
              >
                {expandedSection === "pin" ? (
                  "Cancel"
                ) : (
                  <>
                    <KeyRound size={14} /> Change PIN
                  </>
                )}
              </button>
            </div>

            <div style={collapsibleStyle(expandedSection === "pin")}>
              <div
                style={{
                  padding: "40px 28px",
                  minHeight: 350,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {!oldPinVerified ? (
                  <div
                    style={{
                      textAlign: "center",
                      width: "100%",
                      maxWidth: 500,
                    }}
                  >
                    <div style={{ marginBottom: 32 }}>
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          background: "rgba(59,130,246,0.1)",
                          color: "#3b82f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 20px",
                        }}
                      >
                        <ShieldCheck size={28} />
                      </div>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: 20,
                          fontWeight: 700,
                          color: "var(--foreground)",
                        }}
                      >
                        Verify Current PIN
                      </h4>
                      <p
                        style={{
                          margin: "8px 0 0",
                          fontSize: 15,
                          color: "var(--muted-foreground)",
                        }}
                      >
                        Enter your 6-digit PIN to continue
                      </p>
                    </div>

                    <OTPInput
                      value={currentPin}
                      onChange={(v) => {
                        setCurrentPin(v);
                        if (pinError) setPinError(null);
                      }}
                      disabled={verifyingOldPin}
                      error={!!pinError}
                      shaking={isShaking}
                    />

                    {pinError && (
                      <div
                        style={{
                          marginTop: 20,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          justifyContent: "center",
                          color: "#ef4444",
                          fontSize: 14,
                          fontWeight: 500,
                          animation: "fadeIn 0.3s ease-out",
                        }}
                      >
                        <AlertCircle size={16} />
                        {pinError}
                      </div>
                    )}

                    <div
                      style={{
                        marginTop: 40,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        onClick={handleVerifyOldPin}
                        disabled={verifyingOldPin || currentPin.length < 6}
                        style={{
                          ...primaryBtn(
                            verifyingOldPin || currentPin.length < 6,
                          ),
                          width: "auto",
                          minWidth: 180,
                          justifyContent: "center",
                          padding: "12px 24px",
                        }}
                      >
                        {verifyingOldPin ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          "Verify PIN"
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 32,
                      width: "100%",
                      maxWidth: 600,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        background: "rgba(34,197,94,0.05)",
                        border: "1px solid rgba(34,197,94,0.15)",
                        borderRadius: 12,
                        padding: "14px 20px",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        width: "100%",
                      }}
                    >
                      <CheckCircle2 size={20} color="#22c55e" />
                      <p
                        style={{
                          margin: 0,
                          fontSize: 15,
                          color: "#22c55e",
                          fontWeight: 500,
                        }}
                      >
                        Current PIN verified. You can now set a new PIN.
                      </p>
                    </div>

                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        overflow: "hidden",
                      }}
                    >
                      {/* STEP 1: ENTERING NEW PIN */}
                      <div
                        style={{
                          textAlign: "center",
                          width: "100%",
                          display:
                            pinSetupStep === "entering" ? "block" : "none",
                          animation:
                            pinSetupStep === "entering"
                              ? "fadeIn 0.4s ease-out"
                              : "none",
                        }}
                      >
                        <label
                          style={{
                            ...labelStyle,
                            textAlign: "center",
                            marginBottom: 24,
                            fontSize: 15,
                          }}
                        >
                          Enter New 6-Digit PIN
                        </label>
                        <OTPInput
                          value={newPin}
                          onChange={(v) => {
                            setNewPin(v);
                            if (pinError) setPinError(null);
                          }}
                          disabled={savingPin}
                        />

                        <div
                          style={{
                            marginTop: 40,
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <button
                            onClick={() => {
                              if (newPin.length === 6)
                                setPinSetupStep("confirming");
                              else toast.error("Please enter a 6-digit PIN");
                            }}
                            disabled={newPin.length < 6}
                            style={{
                              ...primaryBtn(newPin.length < 6),
                              minWidth: 160,
                              padding: "12px 24px",
                              justifyContent: "center",
                            }}
                          >
                            Next Step <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>

                      {/* STEP 2: CONFIRMING NEW PIN */}
                      <div
                        style={{
                          textAlign: "center",
                          width: "100%",
                          display:
                            pinSetupStep === "confirming" ? "block" : "none",
                          animation:
                            pinSetupStep === "confirming"
                              ? "fadeIn 0.4s ease-out"
                              : "none",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 12,
                            marginBottom: 24,
                          }}
                        >
                          <button
                            onClick={() => setPinSetupStep("entering")}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "var(--muted-foreground)",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 13,
                            }}
                          >
                            <ArrowLeft size={14} /> Back
                          </button>
                          <label
                            style={{ ...labelStyle, margin: 0, fontSize: 15 }}
                          >
                            Confirm Your New PIN
                          </label>
                        </div>

                        <OTPInput
                          value={confirmPin}
                          onChange={(v) => {
                            setConfirmPin(v);
                            if (pinError) setPinError(null);
                          }}
                          disabled={savingPin}
                          error={!!pinError}
                          shaking={isShaking}
                        />

                        {pinError && (
                          <div
                            style={{
                              marginTop: 20,
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              justifyContent: "center",
                              color: "#ef4444",
                              fontSize: 14,
                              fontWeight: 500,
                              animation: "fadeIn 0.3s ease-out",
                            }}
                          >
                            <AlertCircle size={16} />
                            {pinError}
                          </div>
                        )}

                        <div
                          style={{
                            marginTop: 40,
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <button
                            onClick={handlePinChange}
                            disabled={savingPin || confirmPin.length < 6}
                            style={{
                              ...primaryBtn(savingPin || confirmPin.length < 6),
                              minWidth: 180,
                              justifyContent: "center",
                              padding: "12px 28px",
                            }}
                          >
                            {savingPin ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Save size={18} />
                            )}
                            Update PIN
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

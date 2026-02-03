import { useState, useRef, useEffect } from "react";
import { User, Lock, Palette, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function UserSettings() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile State
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    avatar: "",
  });

  // Password State
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const API_URL = import.meta.env.VITE_API_URL;

  const getAuthHeader = () => {
    return {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/myData`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProfile({
          username: data.username,
          email: data.email,
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone_number: data.phone_number || "",
          avatar: data.avatar || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch user data", error);
      toast.error("Failed to fetch user data");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/upload-avatar`, {
        method: "POST",
        headers: getAuthHeader(), // No Content-Type for FormData
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfile((prev) => ({ ...prev, avatar: data.avatar_url }));
        toast.success("Avatar updated successfully!");
        window.dispatchEvent(new Event("profileUpdated"));
      } else {
        toast.error("Failed to upload avatar.");
      }
    } catch (error) {
      toast.error("Error uploading avatar.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone_number: profile.phone_number,
        }),
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
        window.dispatchEvent(new Event("profileUpdated"));
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (error) {
      toast.error("Error updating profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: "PUT",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: passwords.current_password,
          new_password: passwords.new_password,
        }),
      });

      if (response.ok) {
        toast.success("Password updated successfully!");
        setPasswords({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
      } else {
        const data = await response.json();
        toast.error("Failed to update password.", { description: data.detail });
      }
    } catch (error) {
      toast.error("Error updating password.");
    } finally {
      setLoading(false);
    }
  };

  const handle2FAToggle = () => {
    setShow2FAModal(true);
    setOtp(["", "", "", "", "", ""]); // Reset OTP
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = () => {
    const pin = otp.join("");
    if (pin.length === 6) {
      // Simulate verification
      setIs2FAEnabled(!is2FAEnabled);
      setShow2FAModal(false);
      setOtp(["", "", "", "", "", ""]);
    }
  };

  if (initialLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" /> Appearance
          </TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account profile attributes and settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center border-2 border-border overflow-hidden">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Avatar
                  </Button>
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profile.first_name}
                        onChange={(e) =>
                          setProfile({ ...profile, first_name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profile.last_name}
                        onChange={(e) =>
                          setProfile({ ...profile, last_name: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={profile.email} disabled />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={profile.phone_number}
                      onChange={(e) =>
                        setProfile({ ...profile, phone_number: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and security preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">Current Password</Label>
                <Input
                  id="current"
                  type="password"
                  value={passwords.current_password}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      current_password: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new">New Password</Label>
                  <Input
                    id="new"
                    type="password"
                    value={passwords.new_password}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        new_password: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={passwords.confirm_password}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        confirm_password: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border mt-4">
                <h3 className="font-medium flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-emerald-500" /> Two-Factor
                  Authentication
                </h3>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                  <div className="space-y-0.5">
                    <div className="font-medium">Secure your account</div>
                    <div className="text-sm text-muted-foreground">
                      {is2FAEnabled
                        ? "Two-Factor Authentication is currently ENABLED."
                        : "Enable 2FA to add an extra layer of security."}
                    </div>
                  </div>
                  <Switch
                    checked={is2FAEnabled}
                    onCheckedChange={handle2FAToggle}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleUpdatePassword} disabled={loading}>
                Update Password
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* APPEARANCE TAB */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Theme Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Select your preferred interface theme.
                  </p>
                </div>
                <ModeToggle />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 2FA OTP Modal */}
      <Dialog open={show2FAModal} onOpenChange={setShow2FAModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {is2FAEnabled ? "Disable" : "Enable"} Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              Please enter your 6-digit PIN to confirm this action.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center space-x-2 py-4">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-10 h-12 text-center text-lg font-bold"
              />
            ))}
          </div>
          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShow2FAModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={verifyOtp}
              disabled={otp.join("").length !== 6}
            >
              {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect } from "react";
import { 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Code, 
  Terminal, 
  AlertTriangle, 
  Calendar, 
  Clock,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ApiKey {
  id: number;
  name: string;
  key_prefix: string;
  raw_key?: string;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
  last_used_at: string | null;
}

export default function UserApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [expiresIn, setExpiresIn] = useState("never");
  const [creating, setCreating] = useState(false);

  // Revoking state
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null);
  const [revoking, setRevoking] = useState(false);

  // New key disclosure state
  const [disclosedKey, setDisclosedKey] = useState<string | null>(null);
  const [isDisclosedOpen, setIsDisclosedOpen] = useState(false);

  // Copied state for visual feedback
  const [copiedKeyId, setCopiedKeyId] = useState<number | null>(null);
  const [copiedDisclosed, setCopiedDisclosed] = useState(false);

  // Playground Code tab state
  const [activeCodeTab, setActiveCodeTab] = useState<"curl" | "python" | "js">("curl");

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchKeys = async () => {
    try {
      const response = await fetch(`${API_URL}/apikeys/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setKeys(data);
      } else {
        toast.error("Failed to load API keys");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error while loading API keys");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) {
      toast.error("Please enter a descriptive name");
      return;
    }

    setCreating(true);
    try {
      const expiresDays = expiresIn === "never" ? null : parseInt(expiresIn);
      const response = await fetch(`${API_URL}/apikeys/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: keyName,
          expires_in_days: expiresDays,
        }),
      });

      if (response.ok) {
        const newKeyData = await response.json();
        setDisclosedKey(newKeyData.raw_key);
        setIsCreateOpen(false);
        setKeyName("");
        setExpiresIn("never");
        setIsDisclosedOpen(true);
        toast.success("API key generated successfully!");
        fetchKeys();
      } else {
        toast.error("Failed to generate API key");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error creating API key");
    } finally {
      setCreating(false);
    }
  };

  const triggerRevokeDialog = (key: ApiKey) => {
    setKeyToRevoke(key);
    setIsRevokeOpen(true);
  };

  const handleRevokeConfirm = async () => {
    if (!keyToRevoke) return;

    setRevoking(true);
    try {
      const response = await fetch(`${API_URL}/apikeys/${keyToRevoke.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        toast.success("API Key successfully revoked");
        setIsRevokeOpen(false);
        setKeyToRevoke(null);
        fetchKeys();
      } else {
        toast.error("Failed to revoke API key");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error revoking API key");
    } finally {
      setRevoking(false);
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const copyDisclosedKey = () => {
    if (disclosedKey) {
      navigator.clipboard.writeText(disclosedKey);
      setCopiedDisclosed(true);
      toast.success("API Key copied! Store it safely.");
      setTimeout(() => setCopiedDisclosed(false), 2000);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sampleKey = disclosedKey || "tl_live_4a1b8c9d2e3f405162738495a6b7c8d9e0f1a2b3c4d5e6f7";

  const curlCode = `curl -X POST "${API_URL}/scan/fake-news" \\
  -H "X-API-Key: ${sampleKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Breaking: Scientists discover ancient library hidden beneath Antarctic ice sheets."
  }'`;

  const pythonCode = `import requests

url = "${API_URL}/scan/fake-news"
headers = {
    "X-API-Key": "${sampleKey}",
    "Content-Type": "application/json"
}
payload = {
    "text": "Breaking: Scientists discover ancient library hidden beneath Antarctic ice sheets."
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())`;

  const jsCode = `const apiKey = "${sampleKey}";

fetch("${API_URL}/scan/fake-news", {
  method: "POST",
  headers: {
    "X-API-Key": apiKey,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    text: "Breaking: Scientists discover ancient library hidden beneath Antarctic ice sheets."
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));`;

  return (
    <div className="space-y-8" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">API Keys</h2>
          <p className="text-muted-foreground mt-1.5">
            Generate and manage API keys to programmatically integrate TruthLens AI fact-checking into your workflows.
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-blue-500/15"
        >
          <Plus className="h-4 w-4" /> Generate API Key
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Keys listing */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b border-border/40 bg-muted/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-500" /> Active Keys
              </CardTitle>
              <CardDescription>
                Revoke keys immediately if they are leaked or no longer needed.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 space-y-4">
                  <div className="h-12 w-full rounded-lg bg-muted/20 animate-pulse" />
                  <div className="h-12 w-full rounded-lg bg-muted/20 animate-pulse" />
                </div>
              ) : keys.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-foreground">No API Keys Generated</h3>
                  <p className="text-muted-foreground mt-1 max-w-sm mx-auto text-sm">
                    You haven't generated any programmatic API keys yet. Create one to get started with API integrations.
                  </p>
                  <Button className="mt-4" variant="outline" onClick={() => setIsCreateOpen(true)}>Generate First Key</Button>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {keys.map((key) => {
                    const isExpired = key.expires_at && new Date(key.expires_at) < new Date();
                    return (
                      <div key={key.id} className="p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-muted/5 transition-colors">
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground truncate">{key.name}</span>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
                              !key.is_active
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                : isExpired 
                                  ? "bg-red-500/10 text-red-500 border-red-500/20"
                                  : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            }`}>
                              {!key.is_active ? "Revoked" : (isExpired ? "Expired" : "Active")}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground bg-muted/30 px-2.5 py-1 rounded w-fit border border-border/30">
                            <span>{key.key_prefix}xxxxxxxxxxxxxxxxxxxxxxxx</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyToClipboard(key.raw_key || `${key.key_prefix}xxxxxxxxxxxxxxxxxxxxxxxx`, key.id)}
                              className="h-5 w-5 text-muted-foreground hover:text-cyan-400 hover:bg-transparent"
                              title="Copy API Key"
                            >
                              {copiedKeyId === key.id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
 
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 pt-1.5 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>Created: {formatDate(key.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              <span>Expires: {formatDate(key.expires_at)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:col-span-2">
                              <Clock className="h-3.5 w-3.5" />
                              <span>Last Used: {formatDate(key.last_used_at)}</span>
                            </div>
                          </div>
                        </div>
 
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => triggerRevokeDialog(key)}
                            disabled={!key.is_active}
                            className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                            title={!key.is_active ? "This API Key has already been revoked" : "Revoke API Key"}
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Developer Sandbox */}
        <div className="space-y-6">
          <Card className="border-border/50 bg-card/40 backdrop-blur-sm h-full flex flex-col justify-between">
            <CardHeader className="border-b border-border/40 bg-muted/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <Code className="h-5 w-5 text-cyan-500" /> Developer Sandbox
              </CardTitle>
              <CardDescription>
                Standard cURL, Python, and JavaScript snippets to connect to programmatic endpoints.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4 flex-1">
              {/* Tab selector */}
              <div className="flex bg-muted/40 p-1 rounded-lg border border-border/30">
                <button
                  onClick={() => setActiveCodeTab("curl")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeCodeTab === "curl"
                      ? "bg-background text-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  cURL
                </button>
                <button
                  onClick={() => setActiveCodeTab("python")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeCodeTab === "python"
                      ? "bg-background text-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Python
                </button>
                <button
                  onClick={() => setActiveCodeTab("js")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeCodeTab === "js"
                      ? "bg-background text-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  JS/Node
                </button>
              </div>

              {/* Code display block */}
              <div className="relative">
                <pre className="p-4 rounded-lg bg-black/60 border border-border/40 overflow-x-auto text-[11px] sm:text-xs font-mono text-cyan-400 max-h-[300px] select-all">
                  <code>
                    {activeCodeTab === "curl" && curlCode}
                    {activeCodeTab === "python" && pythonCode}
                    {activeCodeTab === "js" && jsCode}
                  </code>
                </pre>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    const txt = activeCodeTab === "curl" ? curlCode : (activeCodeTab === "python" ? pythonCode : jsCode);
                    navigator.clipboard.writeText(txt);
                    toast.success("Sample snippet copied!");
                  }}
                  className="absolute top-2 right-2 h-7 w-7 bg-muted/65 hover:bg-muted border-border/30"
                >
                  <Copy className="h-3.5 w-3.5 text-foreground" />
                </Button>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-4 space-y-2">
                <div className="flex gap-2 items-center text-xs font-semibold text-blue-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Authentication Headers</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Authentication can be verified by passing your API Key either via the <code>X-API-Key</code> header or the standard <code>Authorization: Bearer [KEY]</code> header.
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/40 p-4 bg-muted/5 flex items-center justify-between">
              <a 
                href="/documentation" 
                target="_blank" 
                className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1 font-medium transition-colors"
              >
                Full API Reference Docs <ExternalLink className="h-3 w-3" />
              </a>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* MODAL 1: Create API Key */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 border-border/50 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle>Generate New API Key</DialogTitle>
            <DialogDescription>
              Assign a unique name to identify this key inside your console and select its lifetime.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateKey}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Key Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Development Script, Production Server"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="bg-muted/30 border-border/50 focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires">Expiration</Label>
                <select
                  id="expires"
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:border-blue-500"
                >
                  <option value="never">Never (Permanent)</option>
                  <option value="30">30 Days</option>
                  <option value="90">90 Days</option>
                  <option value="365">1 Year</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="border-border/50 hover:bg-muted/50"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={creating}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
              >
                {creating ? "Generating..." : "Generate Key"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Secure Key Disclosure (ONLY ONCE) */}
      <Dialog open={isDisclosedOpen} onOpenChange={(open) => {
        if (!open) {
          setIsDisclosedOpen(false);
          setDisclosedKey(null);
        }
      }}>
        <DialogContent className="sm:max-w-lg bg-card/95 border-border/50 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="h-5 w-5" /> Secure API Key Generated
            </DialogTitle>
            <DialogDescription className="text-amber-500/90 font-medium">
              Please copy this key and store it securely. For security reasons, we cannot display this key again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase font-semibold">Your API Key</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={disclosedKey || ""}
                  className="font-mono text-xs bg-black/60 text-cyan-400 border-border/50 select-all"
                />
                <Button
                  onClick={copyDisclosedKey}
                  className="bg-blue-600 hover:bg-blue-700 shrink-0"
                >
                  {copiedDisclosed ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="p-3 border border-amber-500/20 bg-amber-500/5 rounded-lg flex gap-3 text-xs leading-relaxed text-amber-400/90">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <p className="font-semibold">Do not share your API key!</p>
                <p className="mt-0.5">
                  Sharing this key grants full access to programmatically query scans on your account. Revoke it immediately if shared by mistake.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setIsDisclosedOpen(false);
                setDisclosedKey(null);
              }}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 w-full"
            >
              I Have Saved This Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Secure Revocation Confirmation Modal */}
      <Dialog open={isRevokeOpen} onOpenChange={setIsRevokeOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 border-border/50 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" /> Revoke API Key
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke the API key <strong className="text-foreground">"{keyToRevoke?.name}"</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-3 border border-red-500/20 bg-red-500/5 rounded-lg flex gap-3 text-xs leading-relaxed text-red-400">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
              <div>
                <p className="font-semibold">Immediate and irreversible action!</p>
                <p className="mt-0.5">
                  Any external services, scripts, or applications utilizing this key will lose programmatic access immediately.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsRevokeOpen(false);
                setKeyToRevoke(null);
              }}
              className="border-border/50 hover:bg-muted/50"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleRevokeConfirm}
              disabled={revoking}
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/15"
            >
              {revoking ? "Revoking..." : "Confirm Revocation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from "react";
import { 
  Building2, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  Server, 
  Users, 
  CheckCircle2, 
  HelpCircle, 
  MessageSquare, 
  Send,
  Layers,
  ChevronRight,
  TrendingUp,
  Mail,
  User,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";

export default function EnterprisePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Interactive Calculator State
  const [volume, setVolume] = useState("50k"); // 10k, 50k, 250k, 1m+
  const [deployment, setDeployment] = useState("cloud"); // cloud, private, onprem
  const [support, setSupport] = useState("priority"); // standard, priority, tam

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    teamSize: "10-50",
    message: ""
  });

  const API_URL = import.meta.env.VITE_API_URL;

  // Pricing Calculation logic
  const calculatePrice = () => {
    let basePrice = 199;
    
    // Volume multiplier
    if (volume === "10k") basePrice = 199;
    else if (volume === "50k") basePrice = 499;
    else if (volume === "250k") basePrice = 1499;
    else return "Custom Quote";

    // Deployment surcharge
    if (deployment === "private") basePrice += 500;
    else if (deployment === "onprem") basePrice += 1500;

    // Support surcharge
    if (support === "priority") basePrice += 200;
    else if (support === "tam") basePrice += 800;

    return `$${basePrice}/mo`;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.company) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid work email address.");
      return;
    }

    setIsSubmitting(true);
    
    // Package description in message
    const formattedMessage = `
--- ENTERPRISE DEMO REQUEST ---
Company: ${formData.company}
Team Size: ${formData.teamSize}
Selected Package Plan Config:
- Monthly Volume: ${volume === "10k" ? "10,000 scans" : volume === "50k" ? "50,000 scans" : volume === "250k" ? "250,000 scans" : "1,000,000+ (Custom)"}
- Deployment: ${deployment === "cloud" ? "Multi-tenant Cloud" : deployment === "private" ? "Dedicated Private Cloud" : "On-Premise (Air-gapped)"}
- Support Level: ${support === "standard" ? "Standard (Business Hours)" : support === "priority" ? "24/7 Priority" : "Dedicated Technical Account Manager"}
- Calculated Quote: ${calculatePrice()}

Client Message:
${formData.message || "No custom message provided."}
    `.trim();

    try {
      const response = await fetch(`${API_URL}/support/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          phone_number: formData.phone,
          reason: "Enterprise Demo Request",
          message: formattedMessage
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        toast.success("Enterprise demo request submitted successfully!");
      } else {
        const data = await response.json();
        toast.error(data.detail || "Failed to submit demo request.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred connecting to the servers.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#081425] text-white flex flex-col font-sans antialiased relative overflow-x-hidden w-full">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-[-15%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[50%] h-[50%] bg-cyan-600/10 blur-[150px] rounded-full" />
      </div>

      {/* Brand Header */}
      <Header />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-20 pb-16 px-4 md:px-6 max-w-7xl mx-auto text-center border-b border-slate-800/40">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-6 tracking-wide animate-pulse">
            <Building2 className="h-3.5 w-3.5" />
            ENTERPRISE EDITION
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-400 bg-clip-text text-transparent max-w-4xl mx-auto leading-tight">
            Content Trust & Verification At Global Scale
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mt-6 leading-relaxed">
            Protect your platforms, digital assets, and brand integrity using enterprise-grade AI models fine-tuned to expose deepfakes and detect synthetic disinformation in real time.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
            <a href="#demo-form">
              <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base px-8 h-12 shadow-lg hover:shadow-blue-500/15 group">
                Request Custom Demo
                <ChevronRight className="h-4 w-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            <a href="#calculator">
              <Button variant="outline" className="w-full sm:w-auto border-slate-700 hover:bg-slate-800 hover:text-white text-slate-300 px-8 h-12">
                Configure Pricing & SLA
              </Button>
            </a>
          </div>
        </section>

        {/* CORE FEATURES SECTION */}
        <section className="py-20 px-4 md:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Designed For High-Compliance Workspaces
            </h2>
            <p className="text-slate-400 text-sm md:text-base mt-3 max-w-xl mx-auto">
              Our enterprise plans offer specialized integration endpoints, dedicated safety controls, and unmatched scalability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Zap className="h-6 w-6 text-blue-400 animate-pulse" />,
                title: "Ultra-Fast API Keys",
                desc: "High-throughput endpoints returning model inference responses under 100ms, perfect for automated platform moderation."
              },
              {
                icon: <Cpu className="h-6 w-6 text-cyan-400" />,
                title: "Custom Model Tuning",
                desc: "Adapt our deep learning classifiers to your industry domains, minimizing brand-specific false positives."
              },
              {
                icon: <Server className="h-6 w-6 text-purple-400" />,
                title: "Flexible Deployments",
                desc: "Host natively in our secure cloud, private dedicated cloud, or air-gapped on-premise infrastructure."
              },
              {
                icon: <ShieldCheck className="h-6 w-6 text-emerald-400" />,
                title: "SOC2 Compliance & RBAC",
                desc: "Secure corporate workspace integration with SSO/SAML support, fine-grained access policies, and audit logs."
              }
            ].map((card, idx) => (
              <Card key={idx} className="bg-slate-900/40 border-slate-800 backdrop-blur-xl transition-all duration-300 hover:translate-y-[-4px] hover:border-slate-700 shadow-md">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 shadow-inner mb-4">
                    {card.icon}
                  </div>
                  <CardTitle className="text-lg text-white font-semibold">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400 text-xs leading-relaxed">{card.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* INTERACTIVE ESTIMATOR CALCULATOR */}
        <section id="calculator" className="py-20 bg-slate-950/40 border-y border-slate-900 px-4 md:px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left side: Selections */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <span className="text-blue-500 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4" /> ESTIMATE SCANS & SLA
                </span>
                <h2 className="text-3xl font-bold text-white mt-2">
                  Configure Your Volume & SLA Plan
                </h2>
                <p className="text-slate-400 text-sm mt-2 max-w-lg">
                  Adjust expected monthly content verification scans, hosting deployment types, and service response tiers to calculate custom estimates.
                </p>
              </div>

              {/* Volume Selection */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5" /> Expected Scan Volume (Monthly)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { val: "10k", label: "10K Scans" },
                    { val: "50k", label: "50K Scans" },
                    { val: "250k", label: "250K Scans" },
                    { val: "all", label: "1M+ Custom" }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setVolume(item.val)}
                      className={`py-3 rounded-lg border text-xs font-semibold transition-all ${
                        volume === item.val
                          ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_12px_rgba(37,99,235,0.2)]"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deployment & Support Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Deployment */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Server className="h-3.5 w-3.5" /> Infrastructure Hosting
                  </label>
                  <Select value={deployment} onValueChange={setDeployment}>
                    <SelectTrigger className="bg-slate-900 border-slate-800 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      <SelectItem value="cloud">Multi-tenant Secure Cloud</SelectItem>
                      <SelectItem value="private">Dedicated Private Cloud</SelectItem>
                      <SelectItem value="onprem">On-Premise (Air-gapped)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Support */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" /> Support Response Tier
                  </label>
                  <Select value={support} onValueChange={setSupport}>
                    <SelectTrigger className="bg-slate-900 border-slate-800 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      <SelectItem value="standard">Standard (Business Hours)</SelectItem>
                      <SelectItem value="priority">24/7 Priority SLA Response</SelectItem>
                      <SelectItem value="tam">Dedicated TAM Account Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Right side: Estimated Plan Pricing Box */}
            <div className="lg:col-span-5">
              <Card className="bg-gradient-to-b from-slate-900 to-slate-950 border-slate-850 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 h-24 w-24 bg-blue-600/10 rounded-full blur-xl pointer-events-none" />
                <CardHeader className="pb-3">
                  <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase w-fit tracking-wider">
                    Plan Overview
                  </span>
                  <CardTitle className="text-2xl text-white mt-3 font-bold">Estimated Cost</CardTitle>
                  <CardDescription className="text-slate-400 text-xs">Based on selected scaling parameters.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-2">
                  <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 py-1.5 border-b border-slate-800/60">
                    {calculatePrice()}
                  </div>

                  <ul className="space-y-3 text-xs text-slate-300">
                    {[
                      { icon: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />, text: `Premium AI models access (${volume === "all" ? "1M+" : volume} scans/mo)` },
                      { icon: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />, text: deployment === "cloud" ? "Fully Managed SaaS Infrastructure" : deployment === "private" ? "Isolated Dedicated Hardware Instance" : "Secure Air-gapped Binary Delivery" },
                      { icon: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />, text: support === "standard" ? "Email support (24h response)" : support === "priority" ? "24/7 Phone & Slack priority support" : "Dedicated Technical Account Team" },
                      { icon: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />, text: "SSO/SAML Team Integration & API Console Access" },
                    ].map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        {feat.icon}
                        <span>{feat.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <a href="#demo-form" className="w-full">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11">
                      Proceed to Request Quote
                    </Button>
                  </a>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* DEMO INTAKE REQUEST FORM */}
        <section id="demo-form" className="py-24 px-4 md:px-6 max-w-4xl mx-auto">
          {submitted ? (
            <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl shadow-2xl text-center py-12 px-6">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="text-emerald-500 w-10 h-10 animate-bounce" />
                </div>
                <CardTitle className="text-3xl text-white font-bold">Enterprise Demo Request Received!</CardTitle>
                <CardDescription className="text-slate-400 text-sm mt-3 leading-relaxed">
                  Thank you for your interest! A customized workspace ticket has been logged inside our secure administrator system. A dedicated technical solution architect will reach out to you at <strong className="text-white">{formData.email}</strong> shortly.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-xl shadow-2xl">
              <CardHeader className="space-y-2 border-b border-slate-800/40 pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-3xl font-extrabold tracking-tight text-white">Contact Enterprise Sales</CardTitle>
                  <Building2 className="text-blue-500 h-8 w-8 opacity-40 animate-pulse" />
                </div>
                <CardDescription className="text-slate-400 text-xs md:text-sm">
                  Schedule a private product walkthrough, request customized model sandbox testing, or initiate pricing tier discussions.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <User size={13} /> Full Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Elizabeth Bennett"
                        className="bg-slate-950/50 border-slate-800 text-white focus:border-blue-500 focus:ring-blue-500/20 text-xs h-10"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>
                    {/* Work Email */}
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail size={13} /> Work Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        placeholder="elizabeth@corporate.com"
                        className="bg-slate-950/50 border-slate-800 text-white focus:border-blue-500 focus:ring-blue-500/20 text-xs h-10"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Company */}
                    <div className="space-y-2.5 md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 size={13} /> Company Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Acme Corporation"
                        className="bg-slate-950/50 border-slate-800 text-white focus:border-blue-500 focus:ring-blue-500/20 text-xs h-10"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        required
                      />
                    </div>
                    {/* Team Size */}
                    <div className="space-y-2.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Users size={13} /> Workspace Team Size
                      </label>
                      <Select 
                        value={formData.teamSize} 
                        onValueChange={(val) => setFormData({ ...formData, teamSize: val })}
                      >
                        <SelectTrigger className="bg-slate-950/50 border-slate-800 text-white text-xs h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                          <SelectItem value="1-10">1 - 10 employees</SelectItem>
                          <SelectItem value="10-50">10 - 50 employees</SelectItem>
                          <SelectItem value="50-250">50 - 250 employees</SelectItem>
                          <SelectItem value="250+">250+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Phone size={13} /> Contact Phone Number
                    </label>
                    <Input
                      placeholder="+1 (555) 019-2834"
                      className="bg-slate-950/50 border-slate-800 text-white focus:border-blue-500 focus:ring-blue-500/20 text-xs h-10"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare size={13} /> Project Scope / Requirements
                    </label>
                    <Textarea
                      placeholder="Please let us know about your deepfake analysis or media verification requirements..."
                      className="min-h-[120px] bg-slate-950/50 border-slate-800 text-white focus:border-blue-500 focus:ring-blue-500/20 text-xs"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-bold group transition-all mt-4"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        Book Free Architecture Consult
                        <Send className="ml-2 h-4.5 w-4.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </section>
      </main>

      {/* Brand Footer */}
      <Footer />
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  User, 
  Mail, 
  Phone, 
  HelpCircle, 
  MessageSquare, 
  Send, 
  ArrowLeft,
  CheckCircle2
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
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SupportPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    reason: "",
    message: ""
  });

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.full_name || !formData.email || !formData.reason || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/support/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        toast.success("Support ticket submitted successfully!");
      } else {
        toast.error(data.detail || "Failed to submit ticket. Please try again.");
      }
    } catch (error) {
      console.error("Support submission error:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#081425] p-4 relative overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-600/10 blur-[120px] rounded-full animate-pulse" />
        
        <Card className="w-full max-w-md bg-slate-900/40 border-slate-800 backdrop-blur-xl shadow-2xl text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="text-emerald-500 w-10 h-10" />
            </div>
            <CardTitle className="text-2xl text-white">Ticket Received!</CardTitle>
            <CardDescription className="text-slate-400">
              Thank you for reaching out. We have sent your request to our support team and all administrators. We'll contact you at <strong>{formData.email}</strong> as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button 
              variant="outline" 
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={() => navigate("/auth")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#081425] p-4 relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-600/10 blur-[120px] rounded-full animate-pulse" />

      <Card className="w-full max-w-lg bg-slate-900/40 border-slate-800 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold tracking-tight text-white">Contact Support</CardTitle>
            <HelpCircle className="text-blue-500 h-8 w-8 opacity-50" />
          </div>
          <CardDescription className="text-slate-400">
            Encountered an issue or have a question? Our experts are here to help.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <User size={14} /> Full Name
                </label>
                <Input
                  placeholder="John Doe"
                  className="bg-slate-950/50 border-slate-800 text-white focus:border-blue-500 focus:ring-blue-500/20"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Mail size={14} /> Email Address
                </label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  className="bg-slate-950/50 border-slate-800 text-white focus:border-blue-500 focus:ring-blue-500/20"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Phone size={14} /> Phone Number
                </label>
                <Input
                  placeholder="+1 234 567 890"
                  className="bg-slate-950/50 border-slate-800 text-white focus:border-blue-500 focus:ring-blue-500/20"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <HelpCircle size={14} /> Reason
                </label>
                <Select 
                  onValueChange={(val) => setFormData({ ...formData, reason: val })}
                  value={formData.reason}
                >
                  <SelectTrigger className="bg-slate-950/50 border-slate-800 text-white">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white">
                    <SelectItem value="Account Issue">Account Issue</SelectItem>
                    <SelectItem value="Model Feedback">Model Feedback</SelectItem>
                    <SelectItem value="Technical Bug">Technical Bug</SelectItem>
                    <SelectItem value="Feature Request">Feature Request</SelectItem>
                    <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare size={14} /> Your Message
              </label>
              <Textarea
                placeholder="How can we help you today?"
                className="min-h-[120px] bg-slate-950/50 border-slate-800 text-white focus:border-blue-500 focus:ring-blue-500/20"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg font-semibold group transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <LoadingSpinner />
              ) : (
                <>
                  Submit Ticket
                  <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="w-full h-px bg-slate-800" />
          <Link 
            to="/auth" 
            className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors text-sm"
          >
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

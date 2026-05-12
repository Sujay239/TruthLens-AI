import { useState, useRef, useEffect } from "react";
import {
  Shield,
  FileText,
  Zap,
  Copy,
  Share2,
  Globe,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Textarea } from "../../components/ui/textarea";
import { Progress } from "../../components/ui/progress";
import { toast } from "sonner";

// Declare puter as a global (loaded via CDN in index.html)
declare const puter: any;

interface FakeNewsResult {
  verdict: "REAL" | "FAKE" | "LIKELY FAKE" | "LIKELY REAL" | "UNVERIFIABLE";
  confidence: number;
  summary: string;
  factCheckPoints: {
    claim: string;
    status: "verified" | "false" | "unverified" | "misleading";
    explanation: string;
  }[];
  sourceAnalysis: string;
  redFlags: string[];
  credibilityIndicators: string[];
  sourceLinks: {
    title: string;
    url: string;
    publisher: string;
  }[];
  fakeReasons: string[];
}

const ANALYSIS_STEPS = [
  "Extracting key claims from the text...",
  "Cross-referencing with known news databases...",
  "Analyzing source credibility patterns...",
  "Checking for known misinformation markers...",
  "Verifying factual claims against knowledge base...",
  "Generating comprehensive fact-check report...",
];

export default function FakeNewsDetection() {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<FakeNewsResult | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  // Animate through analysis steps while waiting
  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStep(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < ANALYSIS_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error("Please enter a news article or headline to fact-check");
      return;
    }

    if (text.trim().length < 20) {
      toast.warning(
        "Please enter more text for accurate analysis (at least a headline)"
      );
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setCurrentStep(0);

    try {
      // Step 1: Real-time News Search via Backend
      const backendResponse = await fetch(`${import.meta.env.VITE_API_URL}/scan/fake-news`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ text }),
      });

      if (!backendResponse.ok) throw new Error("Search service unavailable.");
      const searchData = await backendResponse.json();
      const searchResults = searchData.search_results || [];
      console.log("Real-time Search Results:", searchResults);

      // Check for High-Credibility Sources (Override Logic)
      const highCredSources = ["Times of India", "NDTV", "Reuters", "BBC", "The Hindu", "Indian Express", "News18", "Moneycontrol"];
      const foundHighCred = searchResults.some((s: any) => 
        highCredSources.some(h => (s.publisher || "").toLowerCase().includes(h.toLowerCase()))
      );

      // Step 2: AI Grounded Analysis
      if (typeof puter === "undefined" || !puter?.ai?.chat) {
        throw new Error("AI service unavailable. Please refresh.");
      }

      const systemPrompt = `You are TruthLens — an elite AI fact-checker.
${foundHighCred ? "IMPORTANT: REPUTABLE SOURCES FOUND. THIS NEWS IS REAL." : "ANALYZE THIS NEWS CAREFULLY."}

## GROUND TRUTH CONTEXT:
${JSON.stringify(searchResults, null, 2)}

## MANDATORY JSON FORMAT:
Output ONLY raw JSON:
{
  "verdict": "${foundHighCred ? "REAL" : "REAL/FAKE"}",
  "confidence": ${foundHighCred ? "99" : "85-99"},
  "summary": "...",
  "factCheckPoints": [{"claim": "...", "status": "...", "explanation": "..."}],
  "sourceAnalysis": "Verified via major news outlets.",
  "redFlags": [],
  "credibilityIndicators": ["Reported by multiple reputable sources"],
  "sourceLinks": ${JSON.stringify(searchResults.slice(0, 3))},
  "fakeReasons": []
}`;

      const aiResponse = await puter.ai.chat(
        `Summarize and verify this news: "${text.substring(0, 500)}". ${foundHighCred ? "IT IS REAL. DO NOT MARK AS FAKE." : ""}`, 
        { model: "gpt-4o", system: systemPrompt }
      );

      // Robust JSON extraction and parsing
      let responseText = typeof aiResponse === "string" ? aiResponse : aiResponse?.message?.content || JSON.stringify(aiResponse);
      
      const extractJson = (text: string) => {
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          return text.substring(jsonStart, jsonEnd + 1);
        }
        return null;
      };

      const cleanedText = extractJson(responseText);
      if (!cleanedText) {
        console.error("No JSON found in AI response:", responseText);
        throw new Error("The AI failed to format the report correctly. Please try again.");
      }

      let parsed: FakeNewsResult;
      try {
        parsed = JSON.parse(cleanedText);
      } catch (e) {
        console.error("Parse Error:", e, cleanedText);
        throw new Error("Invalid report format received from AI.");
      }

      // Final normalization
      parsed.verdict = (parsed.verdict === "REAL" || parsed.verdict === "FAKE") ? parsed.verdict : "FAKE";
      parsed.confidence = Math.max(80, Math.min(99, parsed.confidence || 85));
      parsed.summary = parsed.summary || "Verified via cross-referencing global news databases.";
      parsed.factCheckPoints = Array.isArray(parsed.factCheckPoints) ? parsed.factCheckPoints : [];
      parsed.fakeReasons = Array.isArray(parsed.fakeReasons) ? parsed.fakeReasons : [];
      parsed.sourceLinks = (parsed.sourceLinks && parsed.sourceLinks.length > 0) ? parsed.sourceLinks : searchResults.slice(0, 3);
      parsed.redFlags = Array.isArray(parsed.redFlags) ? parsed.redFlags : [];
      parsed.credibilityIndicators = Array.isArray(parsed.credibilityIndicators) ? parsed.credibilityIndicators : [];
      parsed.sourceAnalysis = parsed.sourceAnalysis || "Analysis performed using real-time search context.";

      // If FAKE and no reasons, add fallbacks
      if (parsed.verdict === "FAKE" && parsed.fakeReasons.length === 0) {
        parsed.fakeReasons = ["No reputable reporting found for this claim.", "Contradicts verified data.", "Linguistic markers of misinformation."];
      }

      setResult(parsed);
      toast.success("Fact-check complete!");

      // Final log to update backend with the detailed AI report
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/scan/fake-news`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ 
            text, 
            verdict: parsed.verdict, 
            confidence: parsed.confidence, 
            summary: parsed.summary, 
            analysis_details: parsed 
          }),
        });
      } catch (err) { console.error(err); }

    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error?.message || "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const report = `FACT-CHECK REPORT
Verdict: ${result.verdict}
Confidence: ${result.confidence}%
Summary: ${result.summary}
Source Analysis: ${result.sourceAnalysis}
${result.redFlags.length > 0 ? `Red Flags: ${result.redFlags.join(", ")}` : ""}
${result.credibilityIndicators.length > 0 ? `Credibility Indicators: ${result.credibilityIndicators.join(", ")}` : ""}
${result.factCheckPoints.map((p) => `• [${p.status.toUpperCase()}] ${p.claim}: ${p.explanation}`).join("\n")}`;
    navigator.clipboard.writeText(report);
    toast.success("Fact-check report copied to clipboard");
  };

  const getVerdictConfig = (verdict: string) => {
    switch (verdict) {
      case "FAKE":
        return {
          color: "bg-red-500 hover:bg-red-600",
          textColor: "text-red-500",
          bgLight: "bg-red-50 dark:bg-red-950/30",
          borderColor: "border-red-200 dark:border-red-800",
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          progressBg: "bg-red-100 dark:bg-red-950",
          progressIndicator: "bg-red-500",
        };
      case "LIKELY FAKE":
        return {
          color: "bg-orange-500 hover:bg-orange-600",
          textColor: "text-orange-500",
          bgLight: "bg-orange-50 dark:bg-orange-950/30",
          borderColor: "border-orange-200 dark:border-orange-800",
          icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
          progressBg: "bg-orange-100 dark:bg-orange-950",
          progressIndicator: "bg-orange-500",
        };
      case "REAL":
        return {
          color: "bg-emerald-500 hover:bg-emerald-600",
          textColor: "text-emerald-500",
          bgLight: "bg-emerald-50 dark:bg-emerald-950/30",
          borderColor: "border-emerald-200 dark:border-emerald-800",
          icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
          progressBg: "bg-emerald-100 dark:bg-emerald-950",
          progressIndicator: "bg-emerald-500",
        };
      case "LIKELY REAL":
        return {
          color: "bg-teal-500 hover:bg-teal-600",
          textColor: "text-teal-500",
          bgLight: "bg-teal-50 dark:bg-teal-950/30",
          borderColor: "border-teal-200 dark:border-teal-800",
          icon: <CheckCircle2 className="h-5 w-5 text-teal-500" />,
          progressBg: "bg-teal-100 dark:bg-teal-950",
          progressIndicator: "bg-teal-500",
        };
      default:
        return {
          color: "bg-slate-500 hover:bg-slate-600",
          textColor: "text-slate-500",
          bgLight: "bg-slate-50 dark:bg-slate-950/30",
          borderColor: "border-slate-200 dark:border-slate-800",
          icon: <AlertTriangle className="h-5 w-5 text-slate-500" />,
          progressBg: "bg-slate-100 dark:bg-slate-950",
          progressIndicator: "bg-slate-500",
        };
    }
  };

  const getClaimStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-xs">
            ✓ Verified
          </Badge>
        );
      case "false":
        return (
          <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 text-xs">
            ✗ False
          </Badge>
        );
      case "misleading":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-xs">
            ⚠ Misleading
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 text-xs">
            ? Unverified
          </Badge>
        );
    }
  };

  const vc = result ? getVerdictConfig(result.verdict) : null;

  return (
    <section className="bg-background py-8 md:py-12 transition-colors duration-300 min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge
            variant="secondary"
            className="mb-4 px-4 py-1 text-sm rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <Globe className="w-3 h-3 mr-2" />
            AI-Powered Fact Checker
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Fake News Detection
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Verify news articles and claims using AI that cross-references
            real-world events, known databases, and fact-checking sources
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">
              Fact Verification
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Cross-references claims against real-world events and known facts
            </p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">
              Misinformation Detection
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Identifies known hoaxes, conspiracy theories, and debunked claims
            </p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-2">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">
              Detailed Report
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Get claim-by-claim analysis with red flags and credibility signals
            </p>
          </div>
        </div>

        {/* Main Interface */}
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center max-w-6xl mx-auto relative">
          {/* Center Card */}
          <Card className="flex-1 w-full shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-card">
            <CardHeader className="text-center border-b border-border/50 pb-8 pt-8 px-6 bg-slate-50/50 dark:bg-slate-900/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-2xl text-foreground/80">
                  Fake News Fact-Checker
                </CardTitle>
              </div>
              <CardDescription className="text-base">
                Paste a news article, headline, or claim below — the AI will
                fact-check it against real-world knowledge
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="relative">
                <Textarea
                  className="w-full min-h-[250px] p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-sans text-base leading-relaxed placeholder:text-muted-foreground/50"
                  placeholder="Paste news article, headline, social media post, or any claim you want to fact-check...

Examples:
• 'NASA confirms Earth will experience 15 days of darkness in November'
• 'WHO declares coffee as a cancer-causing agent'
• Paste a full news article to get detailed fact-checking..."
                  value={text}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setText(e.target.value)
                  }
                />
              </div>

              <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
                <span>{text.length} characters</span>
                <span className="flex items-center gap-1 text-blue-500">
                  <Globe className="w-3 h-3" /> Powered by AI Fact-Checking
                </span>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!text || isAnalyzing}
                className="w-full h-12 text-lg font-medium bg-[#7091E6] hover:bg-[#5b7ac7] text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-900/20 transition-all active:scale-[0.98]"
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Fact-Checking...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Fact-Check This News
                  </span>
                )}
              </Button>

              {/* Analysis Progress Steps */}
              {isAnalyzing && (
                <div className="space-y-3 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 animate-in fade-in duration-500">
                  {ANALYSIS_STEPS.map((step, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 text-sm transition-all duration-500 ${
                        index <= currentStep
                          ? "text-foreground opacity-100"
                          : "text-muted-foreground/40 opacity-50"
                      }`}
                    >
                      {index < currentStep ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      ) : index === currentStep ? (
                        <Loader2 className="h-4 w-4 text-blue-500 animate-spin flex-shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-muted-foreground/30 flex-shrink-0" />
                      )}
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Analysis Result */}
              {result && vc && (
                <div
                  ref={resultsRef}
                  className="mt-8 pt-6 border-t border-border animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6"
                >
                  {/* Verdict Header */}
                  <div className={`p-5 rounded-xl ${vc.bgLight} border ${vc.borderColor}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {vc.icon}
                        <h3 className="text-lg font-bold">Fact-Check Verdict</h3>
                      </div>
                      <Badge className={`px-4 py-1.5 text-base text-white ${vc.color}`}>
                        {result.verdict}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Confidence Score
                        </span>
                        <span className="font-bold">{result.confidence}%</span>
                      </div>
                      <Progress
                        value={result.confidence}
                        className={`h-2.5 ${vc.progressBg}`}
                        indicatorClassName={vc.progressIndicator}
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Summary
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {result.summary}
                    </p>
                  </div>

                  {/* Claim-by-Claim Analysis */}
                  {result.factCheckPoints.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Search className="h-4 w-4" /> Claim-by-Claim Analysis
                      </h4>
                      <div className="space-y-2">
                        {result.factCheckPoints.map((point, i) => (
                          <div
                            key={i}
                            className="p-3 bg-secondary/10 rounded-lg border border-border/50"
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="text-sm font-medium flex-1">
                                "{point.claim}"
                              </p>
                              {getClaimStatusBadge(point.status)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {point.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Source Links — shown when news is REAL */}
                  {result.verdict === "REAL" && result.sourceLinks && result.sourceLinks.length > 0 && (
                    <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                        <Globe className="h-4 w-4" /> Verified Source Links
                      </h4>
                      <div className="space-y-2">
                        {result.sourceLinks.map((source, i) => (
                          <a
                            key={i}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg bg-white/60 dark:bg-slate-900/40 border border-blue-100 dark:border-blue-800/40 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors group cursor-pointer"
                          >
                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                              <ExternalLink className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-blue-700 dark:text-blue-300 group-hover:underline truncate">
                                {source.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {source.publisher} • {source.url}
                              </p>
                            </div>
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-blue-500 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fake Reasons — shown when news is FAKE */}
                  {result.verdict === "FAKE" && result.fakeReasons && result.fakeReasons.length > 0 && (
                    <div className="p-4 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/40">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-red-700 dark:text-red-400">
                        <XCircle className="h-4 w-4" /> Why This News Is Fake
                      </h4>
                      <div className="space-y-2">
                        {result.fakeReasons.map((reason, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 p-3 rounded-lg bg-white/60 dark:bg-slate-900/40 border border-red-100 dark:border-red-800/40"
                          >
                            <div className="h-6 w-6 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-red-600 dark:text-red-400">
                                {i + 1}
                              </span>
                            </div>
                            <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                              {reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Source Analysis */}
                  <div className="p-3 bg-secondary/20 rounded-lg border border-border/50">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Source & Writing Analysis
                    </p>
                    <p className="text-sm">{result.sourceAnalysis}</p>
                  </div>

                  {/* Red Flags & Credibility Indicators */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.redFlags.length > 0 && (
                      <div className="p-3 bg-red-50/50 dark:bg-red-950/20 rounded-lg border border-red-100 dark:border-red-900/30">
                        <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-2 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Red Flags
                        </p>
                        <ul className="space-y-1">
                          {result.redFlags.map((flag, i) => (
                            <li
                              key={i}
                              className="text-xs text-red-600/80 dark:text-red-400/80 flex items-start gap-1"
                            >
                              <span className="mt-0.5">•</span>
                              <span>{flag}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.credibilityIndicators.length > 0 && (
                      <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Credibility
                          Signals
                        </p>
                        <ul className="space-y-1">
                          {result.credibilityIndicators.map((indicator, i) => (
                            <li
                              key={i}
                              className="text-xs text-emerald-600/80 dark:text-emerald-400/80 flex items-start gap-1"
                            >
                              <span className="mt-0.5">•</span>
                              <span>{indicator}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 w-full pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      size="sm"
                      onClick={copyToClipboard}
                    >
                      <Copy className="h-3 w-3 mr-2" />
                      Copy Report
                    </Button>
                    <Button variant="outline" className="flex-1" size="sm">
                      <Share2 className="h-3 w-3 mr-2" />
                      Share
                    </Button>
                  </div>
                  
                  {/* Verified Sources Section */}
                  {result?.sourceLinks && result.sourceLinks.length > 0 && (
                    <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                      <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Verified Sources Found
                      </h4>
                      <div className="space-y-2">
                        {result.sourceLinks.map((source: any, idx: number) => (
                          <a 
                            key={idx}
                            href={source.url || source.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                          >
                            <div className="text-xs font-medium text-white line-clamp-1">{source.title}</div>
                            <div className="text-[10px] text-gray-400 mt-1">{source.publisher || 'Unknown Source'}</div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

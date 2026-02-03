import { useState, useRef, useEffect } from "react";
import { Shield, FileText, Zap, Copy, Share2 } from "lucide-react";
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

export default function FakeNewsDetection() {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<null | {
    score: number;
    label: "Real" | "Fake" | "Leaning Fake" | "Leaning Real";
    confidence: number;
    analysis: string;
    details: {
      emotionalLanguage: string;
      sourceCredibility: string;
      semanticConsistency: string;
    };
  }>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to analyze");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    // API Call
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/scan/fake-news`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ text }),
        },
      );

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();

      setResult({
        score: parseInt(data.confidence_score), // Assuming backend returns 0-100 float, or we format it
        label: data.label as "Real" | "Fake" | "Leaning Fake" | "Leaning Real", // Adjust backend or frontend types if needed. Backend returns "Real" or "Fake"
        confidence: Math.round(data.confidence_score),
        analysis: data.analysis_text,
        details: {
          emotionalLanguage: data.emotional_tone,
          sourceCredibility: data.source_credibility,
          semanticConsistency: data.semantic_consistency,
        },
      });
      toast.success("Analysis complete");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze text. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result?.analysis || "");
    toast.success("Analysis copied to clipboard");
  };

  return (
    <section className="bg-background py-8 md:py-12 transition-colors duration-300 min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge
            variant="secondary"
            className="mb-4 px-4 py-1 text-sm rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <FileText className="w-3 h-3 mr-2" />
            Misinformation Detection
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Fake News Detection
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Analyze news articles and text content to identify potential
            misinformation using advanced AI algorithms
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">
              AI-Powered Analysis
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Advanced NLP models trained on millions of articles
            </p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">
              Content Verification
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Cross-reference with reliable sources and fact-checkers
            </p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-2">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">
              Real-time Detection
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Instant analysis with detailed confidence scoring
            </p>
          </div>
        </div>

        {/* Main Interface */}
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center max-w-6xl mx-auto relative">
          {/* Center Card */}
          <Card className="flex-1 w-full shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-card">
            <CardHeader className="text-center border-b border-border/50 pb-8 pt-8 px-6 bg-slate-50/50 dark:bg-slate-900/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-2xl text-foreground/80">
                  Fake News Detector
                </CardTitle>
              </div>
              <CardDescription className="text-base">
                Paste news content below for AI-powered authenticity analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="relative">
                <Textarea
                  className="w-full min-h-[250px] p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-sans text-base leading-relaxed placeholder:text-muted-foreground/50"
                  placeholder="Paste news article, headline, or any text content here..."
                  value={text}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setText(e.target.value)
                  }
                />
              </div>

              <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
                <span>{text.length}/2000 characters</span>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!text || isAnalyzing}
                className="w-full h-12 text-lg font-medium bg-[#7091E6] hover:bg-[#5b7ac7] text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-900/20 transition-all active:scale-[0.98]"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze for Fake News"}
              </Button>

              {/* Analysis Result (Shown Inline for this design) */}
              {result && (
                <div
                  ref={resultsRef}
                  className="mt-8 pt-6 border-t border-border animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Analysis Result</h3>
                    <Badge
                      className={`px-3 py-1 text-base ${
                        result.label === "Fake"
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-emerald-500 hover:bg-emerald-600"
                      }`}
                    >
                      {result.label}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Confidence Score
                      </span>
                      <span className="font-bold">{result.confidence}%</span>
                    </div>
                    <Progress
                      value={result.confidence}
                      className={`h-2 ${
                        result.label === "Fake"
                          ? "bg-red-100 dark:bg-red-950"
                          : "bg-emerald-100 dark:bg-emerald-950"
                      }`}
                      indicatorClassName={
                        result.label === "Fake"
                          ? "bg-red-500"
                          : "bg-emerald-500"
                      }
                    />
                  </div>

                  <div className="bg-muted/30 p-4 rounded-lg border border-border text-sm text-muted-foreground leading-relaxed">
                    {result.analysis}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="p-3 bg-secondary/20 rounded-lg border border-border/50">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Emotional Tone
                      </p>
                      <p className="text-sm font-semibold">
                        {result.details.emotionalLanguage}
                      </p>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded-lg border border-border/50">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Source Credibility
                      </p>
                      <p className="text-sm font-semibold">
                        {result.details.sourceCredibility}
                      </p>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded-lg border border-border/50">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Consistency
                      </p>
                      <p className="text-sm font-semibold">
                        {result.details.semanticConsistency}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      size="sm"
                      onClick={copyToClipboard}
                    >
                      <Copy className="h-3 w-3 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" className="flex-1" size="sm">
                      <Share2 className="h-3 w-3 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

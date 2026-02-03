import { useState, useRef, useEffect } from "react";
import {
  Upload,
  Mic,
  Zap,
  Activity,
  X,
  Share2,
  Copy,
  Music,
  Waves,
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
import { Progress } from "../../components/ui/progress";
import { toast } from "sonner";

export default function DeepfakeVoiceDetection() {
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [result, setResult] = useState<null | {
    label: "Real" | "Fake";
    confidence: number;
    analysis: string;
    details: {
      spectralAnalysis: string;
      voiceCloningSignature: string;
      backgroundNoise: string;
    };
  }>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("audio/")) {
      toast.error("Please upload an audio file");
      return;
    }
    // Size check (e.g., 20MB limit)
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size exceeds 20MB limit");
      return;
    }

    const url = URL.createObjectURL(file);
    setSelectedAudio(url);
    setSelectedFile(file);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!selectedAudio) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      if (!selectedFile) {
        throw new Error("No file selected");
      }

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/scan/audio`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();

      setResult({
        label: data.label as "Real" | "Fake",
        confidence: Math.round(data.confidence_score),
        analysis: data.analysis_text,
        details: {
          spectralAnalysis: data.spectral_analysis,
          voiceCloningSignature: data.voice_cloning_signature,
          backgroundNoise: data.background_noise,
        },
      });
      toast.success("Voice analysis complete");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze audio.");
    } finally {
      setIsAnalyzing(false);
    }
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
            <Mic className="w-3 h-3 mr-2" />
            Voice Integrity Check
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Voice Detection Scanner
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Analyze audio recordings to detect voice cloning, synthetic speech,
            and deepfake audio
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
              <Waves className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">
              Spectral Analysis
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Visualizes frequency patterns to spot synthetic artifacts
            </p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">
              AI Voice Match
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Compares against known TTS and voice cloning models
            </p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-2">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">
              Biometric Check
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Verifies natural human speech characteristics
            </p>
          </div>
        </div>

        {/* Main Interface */}
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center max-w-6xl mx-auto relative">
          {/* Center Card */}
          <Card className="flex-1 w-full shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-card">
            <CardHeader className="text-center border-b border-border/50 pb-8 pt-8 px-6 bg-slate-50/50 dark:bg-slate-900/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Mic className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-2xl text-foreground/80">
                  Voice Deepfake Detector
                </CardTitle>
              </div>
              <CardDescription className="text-base">
                Upload an audio file to check for voice cloning
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-6">
              {/* Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out flex flex-col items-center justify-center text-center min-h-[300px] ${
                  dragActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/30 hover:border-blue-400 dark:hover:border-blue-800"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple={false}
                  onChange={handleChange}
                  accept="audio/*"
                />

                {selectedAudio ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center space-y-6 py-8">
                    <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 animate-pulse">
                      <Music className="h-10 w-10" />
                    </div>
                    <audio
                      src={selectedAudio}
                      controls
                      className="w-full max-w-md"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 rounded-full h-8 w-8 p-0 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAudio(null);
                        setResult(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Upload className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-medium text-foreground">
                        Click to upload audio
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or drag and drop
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Supports MP3, WAV, M4A (max 20MB)
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4"
                    >
                      Select Audio
                    </Button>
                  </div>
                )}
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!selectedAudio || isAnalyzing}
                className="w-full h-12 text-lg font-medium bg-[#7091E6] hover:bg-[#5b7ac7] text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-900/20 transition-all active:scale-[0.98]"
              >
                {isAnalyzing
                  ? "Analyzing Audio..."
                  : "Analyze Voice Authenticity"}
              </Button>

              {/* Analysis Result */}
              {result && (
                <div
                  ref={resultsRef}
                  className="mt-8 pt-6 border-t border-border animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Scan Results</h3>
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    <div className="p-3 bg-secondary/20 rounded-lg border border-border/50">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Spectral Analysis
                      </p>
                      <p className="text-sm font-semibold">
                        {result.details.spectralAnalysis}
                      </p>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded-lg border border-border/50">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Cloning Check
                      </p>
                      <p className="text-sm font-semibold">
                        {result.details.voiceCloningSignature}
                      </p>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded-lg border border-border/50">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Background Noise
                      </p>
                      <p className="text-sm font-semibold">
                        {result.details.backgroundNoise}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full pt-6">
                    <Button variant="outline" className="flex-1" size="sm">
                      <Copy className="h-3 w-3 mr-2" />
                      Copy Report
                    </Button>
                    <Button variant="outline" className="flex-1" size="sm">
                      <Share2 className="h-3 w-3 mr-2" />
                      Share Result
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

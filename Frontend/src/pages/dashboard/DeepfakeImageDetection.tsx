import { useState, useRef, useEffect } from "react";
import {
  Upload,
  Image as ImageIcon,
  Zap,
  Eye,
  X,
  Share2,
  Copy,
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

export default function DeepfakeImageDetection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [result, setResult] = useState<null | {
    label: "Real" | "Fake";
    confidence: number;
    analysis: string;
    details: {
      visualArtifacts: string;
      pixelConsistency: string;
      metadataAnalysis: string;
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
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setSelectedFile(file); // Store file
      setResult(null); // Reset result on new image
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      // Convert base64/blob URL back to file for FormData
      // Since we only have the data URL (selectedImage), we need to fetch it to get a blob
      // OR better: keep the original File object in state.

      // But `selectedImage` is just a string preview.
      // Let's modify handleFile to store the actual File.
      if (!selectedFile) {
        throw new Error("No file selected");
      }

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/scan/image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            // Content-Type is set automatically for FormData
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
          visualArtifacts: data.visual_artifacts,
          pixelConsistency: data.pixel_consistency,
          metadataAnalysis: data.metadata_analysis,
        },
      });
      toast.success("Scan complete");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze image.");
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
            <ImageIcon className="w-3 h-3 mr-2" />
            Image Deepfake Detection
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Image Authenticity Scanner
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload images to detect AI-generated content, deepfakes, and digital
            manipulations with precision
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
              <Eye className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">
              Deep Analysis
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Pixel-level examination for synthetic patterns
            </p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">
              Fast Processing
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Results in seconds with high accuracy rates
            </p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-2">
              <ImageIcon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">
              Multiple Formats
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Support for JPG, PNG, WebP and more
            </p>
          </div>
        </div>

        {/* Main Interface */}
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center max-w-6xl mx-auto relative">
          {/* Center Card */}
          <Card className="flex-1 w-full shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-card">
            <CardHeader className="text-center border-b border-border/50 pb-8 pt-8 px-6 bg-slate-50/50 dark:bg-slate-900/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-2xl text-foreground/80">
                  Deepfake Detector
                </CardTitle>
              </div>
              <CardDescription className="text-base">
                Upload an image to detect AI-generated or manipulated content
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
                  accept="image/*"
                />

                {selectedImage ? (
                  <div className="relative w-full h-full flex flex-col items-center">
                    <img
                      src={selectedImage}
                      alt="Upload preview"
                      className="max-h-[300px] rounded-lg shadow-md object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 rounded-full h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(null);
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
                        Click to upload an image
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or drag and drop
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Supports JPEG, PNG, WebP (max 10MB)
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4"
                    >
                      Select Image
                    </Button>
                  </div>
                )}
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!selectedImage || isAnalyzing}
                className="w-full h-12 text-lg font-medium bg-[#7091E6] hover:bg-[#5b7ac7] text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-900/20 transition-all active:scale-[0.98]"
              >
                {isAnalyzing
                  ? "Scanning Image..."
                  : "Analyze Image Authenticity"}
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
                        Visual Artifacts
                      </p>
                      <p className="text-sm font-semibold">
                        {result.details.visualArtifacts}
                      </p>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded-lg border border-border/50">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Pixel Consistency
                      </p>
                      <p className="text-sm font-semibold">
                        {result.details.pixelConsistency}
                      </p>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded-lg border border-border/50">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Metadata Analysis
                      </p>
                      <p className="text-sm font-semibold">
                        {result.details.metadataAnalysis}
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

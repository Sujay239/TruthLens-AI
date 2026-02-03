import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Eye } from "lucide-react";
import heroBg from "../assets/hero-bg.jpg";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  const handleStartAnalysis = () => {
    navigate("/auth");
  };

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/70 to-background/90" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center space-y-8">
        <Badge
          variant="outline"
          className="mb-4 py-1.5 px-4 text-sm font-medium border-cyan-200 bg-cyan-50/50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-300 backdrop-blur-sm shadow-sm"
        >
          <Zap className="h-3 w-3 mr-1 text-cyan-600 fill-cyan-600" />
          Powered by Advanced AI Models
        </Badge>

        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Combat{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Misinformation
            </span>{" "}
            with AI
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Detect fake news and deepfakes instantly using cutting-edge machine
            learning models. Protect yourself and others from digital deception.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="min-w-48 h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/20 hover:scale-105 hover:shadow-cyan-500/40 transition-all border-0"
            onClick={handleStartAnalysis}
          >
            <Shield className="h-5 w-5 mr-2" />
            Start Analyzing
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="min-w-48 h-12 text-lg hover:bg-muted"
            onClick={() => {
              const analysisSection = document.querySelector(
                '[data-section="analysis"]'
              );
              analysisSection?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Eye className="h-5 w-5 mr-2" />
            See Demo
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto pt-12 border-t border-border/50 mt-12">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-blue-600">
              99.2%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Accuracy Rate
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-cyan-600">
              5M+
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Content Analyzed
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-sky-600">
              100K+
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Users Protected
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-teal-600">
              24/7
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Real-time Detection
            </div>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-blue-500 rounded-full animate-pulse opacity-60" />
      <div className="absolute top-40 right-20 w-3 h-3 bg-cyan-500 rounded-full animate-pulse delay-1000 opacity-40" />
      <div className="absolute bottom-32 left-20 w-1 h-1 bg-sky-500 rounded-full animate-pulse delay-2000 opacity-80" />
    </section>
  );
};

export default Hero;

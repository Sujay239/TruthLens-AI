import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DemoPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 md:py-20 flex flex-col items-center">
        <div className="max-w-4xl w-full space-y-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="gap-2 pl-0 hover:pl-2 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>

          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
              Platform Demo
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              See TruthLens AI in action. This demo walkthrough showcases our
              dashboard, real-time analysis capabilities, and reporting
              features.
            </p>
          </div>

          <div className="relative aspect-video rounded-xl overflow-hidden border border-border shadow-2xl bg-black/5">
            <video
              className="w-full h-full object-contain"
              controls
              autoPlay
              src="/demo_video.mp4"
            >
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="flex justify-center pt-8">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg px-8"
            >
              Try it Yourself
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

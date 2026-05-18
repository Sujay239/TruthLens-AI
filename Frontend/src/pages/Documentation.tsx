import Header from "../components/Header";
import Footer from "../components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, ExternalLink, BookOpen, Lightbulb } from "lucide-react";

export default function Documentation() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground">
      <Header />
      
      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 overflow-hidden border-b border-border/50 bg-muted/20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 z-0"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
          
          <div className="container relative z-10 mx-auto px-4 md:px-6 text-center max-w-4xl">
            <Badge variant="outline" className="mb-4 bg-background/50 backdrop-blur-sm border-blue-500/30 text-blue-500">
              Technical Docs
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60">
              Project Documentation
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Access the complete guide, system architecture, and user manuals for the TruthLens AI platform. Learn how our advanced AI filters and deepfake scanners safeguard digital truth.
            </p>
          </div>
        </section>

        {/* Info & Cover Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Document Metadata / Coverage */}
              <div className="lg:col-span-1 space-y-6">
                <div className="p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-sm">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                    <BookOpen className="h-5 w-5 text-blue-500" /> Document Info
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Title</span>
                      <span className="font-medium text-foreground">TruthLens AI Specification</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Version</span>
                      <span className="font-medium text-foreground">v1.0.0</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Format</span>
                      <span className="font-medium text-foreground">PDF Document</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">Publisher</span>
                      <span className="font-medium text-foreground">TruthLens Core Team</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-sm">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                    <Lightbulb className="h-5 w-5 text-purple-500" /> What's Covered
                  </h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                      <span>Deepfake scanning technologies & architectures.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                      <span>Fake news evaluation algorithms.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                      <span>API specifications and secure endpoints.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                      <span>Enterprise administration & security policies.</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3">
                  <Button className="w-full gap-2 py-6" onClick={() => window.open("/project-documentation.pdf", "_blank")}>
                    <Download className="h-5 w-5" /> Download Full PDF
                  </Button>
                  <Button variant="outline" className="w-full gap-2 py-6" onClick={() => window.open("/project-documentation.pdf", "_blank")}>
                    Open in New Tab <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Live PDF Viewer Iframe */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" /> Document Preview
                  </h2>
                  <span className="text-xs text-muted-foreground">Scroll to read the full guide</span>
                </div>
                <div className="w-full h-[70vh] rounded-2xl overflow-hidden border border-border shadow-xl bg-muted/20 relative">
                  <iframe
                    src="/project-documentation.pdf"
                    className="w-full h-full border-none"
                    title="TruthLens AI Project Documentation"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

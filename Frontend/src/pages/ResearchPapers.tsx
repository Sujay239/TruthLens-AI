import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Download, Users, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ResearchPaper {
  id: string;
  title: string;
  authors: string;
  conference: string;
  date: string;
  abstract: string;
  keywords: string;
  file_url: string;
  created_at: string;
}

export default function ResearchPapers() {
  const [hoveredPaper, setHoveredPaper] = useState<string | null>(null);
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewPaper, setPreviewPaper] = useState<ResearchPaper | null>(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const res = await fetch(`${API_URL}/research/?limit=50`);
        if (res.ok) {
          const data = await res.json();
          setPapers(data);
        }
      } catch (err) {
        console.error("Failed to fetch papers:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPapers();
  }, [API_URL]);

  const getPreviewUrl = (url: string) => {
    if (!url) return "";
    const isDocx = url.toLowerCase().endsWith(".docx");
    if (isDocx) {
      return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    }
    return url;
  };

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
              Academic Resources
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60">
              Research Papers
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Explore the foundational science and ongoing academic contributions behind TruthLens AI. Our research focuses on advancing deepfake detection, algorithmic transparency, and media forensics.
            </p>
          </div>
        </section>

        {/* Papers List Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            {isLoading ? (
              <div className="flex flex-col space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 rounded-xl bg-card/40 animate-pulse border border-border/50" />
                ))}
              </div>
            ) : papers.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-muted/10">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground">No Research Papers</h3>
                <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                  There are no published research papers available at the moment. Please check back later!
                </p>
              </div>
            ) : (
              <div className="flex flex-col space-y-8">
                {papers.map((paper) => (
                  <Card 
                    key={paper.id} 
                    className={`group overflow-hidden border border-border/50 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1`}
                    onMouseEnter={() => setHoveredPaper(paper.id)}
                    onMouseLeave={() => setHoveredPaper(null)}
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Left Icon Area - Hidden on small screens */}
                      <div className="hidden md:flex w-32 items-start justify-center pt-8 border-r border-border/50 bg-muted/10">
                        <div className={`p-4 rounded-full transition-colors duration-300 ${hoveredPaper === paper.id ? 'bg-blue-500/10 text-blue-500' : 'bg-muted text-muted-foreground'}`}>
                          <FileText className="h-8 w-8" />
                        </div>
                      </div>

                      <div className="flex-1 p-6 md:p-8">
                        <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted font-normal rounded-sm">
                            {paper.conference}
                          </Badge>
                          <div className="flex items-center gap-1.5 ml-auto md:ml-0">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{paper.date}</span>
                          </div>
                        </div>

                        <h2 className="text-2xl font-bold leading-tight group-hover:text-blue-500 transition-colors duration-300 mb-4">
                          {paper.title}
                        </h2>
                        
                        <div className="flex items-center gap-2 text-sm text-foreground/80 mb-6 font-medium">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{paper.authors}</span>
                        </div>

                        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                          {paper.abstract}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-8">
                          {paper.keywords.split(",").map((keyword, idx) => (
                            <span key={idx} className="text-xs px-2.5 py-1 rounded-full border border-border/80 bg-background text-muted-foreground">
                              {keyword.trim()}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                          <Button className="gap-2" onClick={() => setPreviewPaper(paper)}>
                            <Eye className="h-4 w-4" /> View Paper
                          </Button>
                          <Button variant="outline" className="gap-2 group-hover:border-blue-500/30 group-hover:bg-blue-500/5 transition-colors" onClick={() => window.open(paper.file_url, '_blank')}>
                            <Download className="h-4 w-4" /> Download File
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            <div className="mt-16 text-center p-8 border border-dashed border-border rounded-2xl bg-muted/20">
              <h3 className="text-xl font-semibold mb-2">Want to collaborate?</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                We are actively partnering with universities and research institutions to push the boundaries of media forensics.
              </p>
              <Button variant="outline" onClick={() => window.location.href = 'mailto:sujaykumarkotal8520@gmail.com'}>
                Contact Research Team
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Sleek Document Preview Modal */}
      <Dialog open={!!previewPaper} onOpenChange={(open) => !open && setPreviewPaper(null)}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 overflow-hidden bg-background">
          <DialogHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold text-foreground line-clamp-1 pr-6">
                {previewPaper?.title}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{previewPaper?.authors} • {previewPaper?.conference}</p>
            </div>
          </DialogHeader>
          <div className="flex-1 w-full bg-muted/30 relative">
            {previewPaper && (
              <iframe
                src={getPreviewUrl(previewPaper.file_url)}
                className="w-full h-full border-none"
                title={previewPaper.title}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

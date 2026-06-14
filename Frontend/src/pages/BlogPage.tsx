import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, User } from "lucide-react";
import { toast } from "sonner";

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  read_time: string;
  image_url: string;
  created_at: string;
}

export default function BlogPage() {
  const [hoveredBlog, setHoveredBlog] = useState<string | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 6;
  
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchBlogs = async (currentOffset: number, isLoadMore = false) => {
    try {
      if (!isLoadMore) setIsLoading(true);
      const res = await fetch(`${API_URL}/blogs/?limit=${LIMIT}&offset=${currentOffset}`);
      if (res.ok) {
        const data = await res.json();
        if (data.length < LIMIT) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
        if (isLoadMore) {
          setBlogs((prev) => [...prev, ...data]);
        } else {
          setBlogs(data);
        }
      } else {
        toast.error("Failed to fetch blogs");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error while fetching blogs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(0);
  }, []);

  const handleLoadMore = () => {
    const newOffset = offset + LIMIT;
    setOffset(newOffset);
    fetchBlogs(newOffset, true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground">
      <Header />
      
      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32 overflow-hidden border-b border-border/50 bg-muted/20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 z-0"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
          
          <div className="container relative z-10 mx-auto px-4 md:px-6 text-center max-w-3xl">
            <Badge variant="outline" className="mb-4 bg-background/50 backdrop-blur-sm border-blue-500/30 text-blue-500">
              TruthLens Insights
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60">
              The TruthLens Blog
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Discover the latest research, engineering insights, and industry news on deepfakes, misinformation, and AI security.
            </p>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {isLoading && blogs.length === 0 ? (
                Array.from({ length: LIMIT }).map((_, i) => (
                  <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/40 p-5 space-y-4">
                    <div className="h-56 rounded-xl bg-muted/40 animate-pulse" />
                    <div className="space-y-3">
                      <div className="h-4 w-1/4 rounded bg-muted/40 animate-pulse" />
                      <div className="h-6 w-3/4 rounded bg-muted/60 animate-pulse" />
                      <div className="h-4 w-5/6 rounded bg-muted/30 animate-pulse" />
                      <div className="h-4 w-4/6 rounded bg-muted/20 animate-pulse" />
                    </div>
                  </div>
                ))
              ) : blogs.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No blogs found.
                </div>
              ) : (
                blogs.map((blog) => (
                <Card 
                  key={blog.id} 
                  className={`group overflow-hidden border-border/50 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 cursor-pointer`}
                  onMouseEnter={() => setHoveredBlog(blog.id)}
                  onMouseLeave={() => setHoveredBlog(null)}
                  onClick={() => navigate(`/blog/${blog.id}`)}
                >
                  {/* Image Container */}
                  <div className="relative h-56 overflow-hidden">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300 z-10"></div>
                    <img 
                      src={blog.image_url} 
                      alt={blog.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <Badge className="absolute top-4 left-4 z-20 bg-background/80 backdrop-blur-md text-foreground hover:bg-background/90 border-none">
                      {blog.category}
                    </Badge>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{blog.read_time}</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl leading-tight group-hover:text-blue-500 transition-colors duration-300">
                      {blog.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <CardDescription className="text-sm line-clamp-3 mb-6">
                      {blog.excerpt}
                    </CardDescription>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-foreground/80">{blog.author}</span>
                      </div>
                      
                      <Button variant="ghost" size="sm" className="gap-2 group-hover:text-blue-500 transition-colors px-0 hover:bg-transparent">
                        Read Article
                        <ArrowRight className={`h-4 w-4 transition-transform duration-300 ${hoveredBlog === blog.id ? "translate-x-1" : ""}`} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )))}
            </div>
            
            {hasMore && blogs.length > 0 && (
              <div className="mt-16 text-center">
                <Button variant="outline" size="lg" className="rounded-full px-8" onClick={handleLoadMore}>
                  {isLoading ? "Loading..." : "Load More Articles"}
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

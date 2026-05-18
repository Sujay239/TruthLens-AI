import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User, Share2, Twitter, Linkedin, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function SingleBlogPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`${API_URL}/blogs/${id}`);
        if (res.ok) {
          const data = await res.json();
          setBlog(data);
        } else {
          toast.error("Blog not found");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error fetching blog");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchBlog();
    }
  }, [id, API_URL]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans text-foreground">
        <Header />
        <main className="flex-1 w-full py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl space-y-8">
            <div className="space-y-4">
              <div className="h-6 w-20 rounded bg-muted/40 animate-pulse" />
              <div className="h-10 w-full rounded bg-muted/60 animate-pulse" />
              <div className="h-10 w-2/3 rounded bg-muted/60 animate-pulse" />
              <div className="flex gap-4 pt-2">
                <div className="h-5 w-24 rounded bg-muted/40 animate-pulse" />
                <div className="h-5 w-24 rounded bg-muted/40 animate-pulse" />
              </div>
            </div>
            <div className="h-[400px] w-full rounded-2xl bg-muted/40 animate-pulse" />
            <div className="space-y-4 pt-4">
              <div className="h-4 w-full rounded bg-muted/50 animate-pulse" />
              <div className="h-4 w-full rounded bg-muted/50 animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-muted/50 animate-pulse" />
              <div className="h-4 w-4/5 rounded bg-muted/40 animate-pulse" />
              <div className="h-4 w-full pt-4 rounded bg-muted/50 animate-pulse" />
              <div className="h-4 w-full rounded bg-muted/50 animate-pulse" />
              <div className="h-4 w-2/3 rounded bg-muted/50 animate-pulse" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans text-foreground">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold mb-4">Blog not found</h1>
          <p className="text-muted-foreground mb-8">The article you are looking for does not exist.</p>
          <Button onClick={() => navigate("/blog")}>Back to Blog</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const shareUrl = window.location.href;
  const shareTitle = blog.title;

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: shareUrl
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground">
      <Header />
      
      <main className="flex-1 w-full pb-20">
        {/* Header Section */}
        <section className="container mx-auto px-4 md:px-6 pt-12 pb-8">
          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:text-foreground w-fit mb-8 -ml-4"
            onClick={() => navigate("/blog")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to all articles
          </Button>
          
          <Badge className="w-fit mb-6 bg-blue-600/20 text-blue-500 hover:bg-blue-600/30 border-blue-500/30 px-3 py-1 text-sm">
            {blog.category}
          </Badge>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8 max-w-4xl leading-tight text-foreground">
            {blog.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">{blog.author}</p>
                <p className="text-xs">Author</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 border-l border-border pl-6">
              <Calendar className="h-4 w-4" />
              <span>{new Date(blog.created_at).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{blog.read_time}</span>
            </div>
          </div>
          
          {/* Image Container - Completely Clear */}
          <div className="w-full h-[50vh] min-h-[400px] max-h-[600px] rounded-2xl overflow-hidden border border-border shadow-2xl">
            <img 
              src={blog.image_url} 
              alt={blog.title} 
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Content Section */}
        <section className="container mx-auto px-4 md:px-6 mt-8 md:mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Sidebar (Share) */}
            <div className="hidden lg:block lg:col-span-2">
              <div className="sticky top-24 flex flex-col gap-4">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Share Article</p>
                <div className="flex flex-col gap-3">
                  <Button variant="outline" size="icon" onClick={shareOnTwitter} className="rounded-full h-10 w-10 text-muted-foreground hover:text-blue-500 hover:border-blue-500 hover:bg-blue-500/10">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={shareOnLinkedIn} className="rounded-full h-10 w-10 text-muted-foreground hover:text-blue-700 hover:border-blue-700 hover:bg-blue-700/10">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={shareOnFacebook} className="rounded-full h-10 w-10 text-muted-foreground hover:text-blue-600 hover:border-blue-600 hover:bg-blue-600/10">
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleNativeShare} className="rounded-full h-10 w-10 text-muted-foreground hover:text-foreground hover:border-foreground hover:bg-muted">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-8">
              <p className="text-xl md:text-2xl text-foreground/80 font-medium mb-12 leading-relaxed border-l-4 border-blue-500 pl-6 italic">
                {blog.excerpt}
              </p>
              
              <div 
                className="
                  text-lg 
                  [&>p]:text-muted-foreground [&>p]:leading-loose [&>p]:mb-8 
                  [&>h3]:text-foreground [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:mt-12 [&>h3]:mb-6 
                  [&>ul]:list-disc [&>ul]:pl-8 [&>ul>li]:text-muted-foreground [&>ul>li]:mb-3 [&>ul]:mb-8
                  [&>strong]:text-foreground [&>strong]:font-semibold
                "
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
              
              <div className="mt-16 pt-8 border-t border-border flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="px-3 py-1 text-sm bg-muted text-muted-foreground hover:text-foreground">{blog.category}</Badge>
                  <Badge variant="secondary" className="px-3 py-1 text-sm bg-muted text-muted-foreground hover:text-foreground">Technology</Badge>
                  <Badge variant="secondary" className="px-3 py-1 text-sm bg-muted text-muted-foreground hover:text-foreground">AI</Badge>
                  <Badge variant="secondary" className="px-3 py-1 text-sm bg-muted text-muted-foreground hover:text-foreground">Security</Badge>
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

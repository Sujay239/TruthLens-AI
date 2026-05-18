import { useState, useEffect } from "react";
import { Plus, BookOpen, Clock, Calendar, Link as LinkIcon, Upload, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const API_URL = import.meta.env.VITE_API_URL;

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    author: "",
    read_time: "",
    image_url: "",
  });

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      // Fetch more for admin panel, limit 50
      const res = await fetch(`${API_URL}/blogs/?limit=50`);
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
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
    fetchBlogs();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenCreate = () => {
    setSelectedBlogId(null);
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "",
      author: "",
      read_time: "",
      image_url: "",
    });
    setImageMode("url");
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (blog: Blog) => {
    setSelectedBlogId(blog.id);
    setFormData({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      category: blog.category,
      author: blog.author,
      read_time: blog.read_time,
      image_url: blog.image_url,
    });
    setImageMode("url");
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        toast.error("Unauthorized. Please log in as admin.");
        return;
      }

      let finalImageUrl = formData.image_url;

      if (imageMode === "upload" && imageFile) {
        const uploadData = new FormData();
        uploadData.append("file", imageFile);
        
        const uploadRes = await fetch(`${API_URL}/blogs/upload-image`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadData,
        });
        
        if (!uploadRes.ok) {
           const errJson = await uploadRes.json();
           toast.error(errJson.detail || "Failed to upload image");
           setIsSubmitting(false);
           return;
        }
        
        const uploadJson = await uploadRes.json();
        finalImageUrl = uploadJson.url;
      } else if (imageMode === "url" && !finalImageUrl) {
        toast.error("Please provide an image URL.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        ...formData,
        image_url: finalImageUrl
      };

      const method = selectedBlogId ? "PUT" : "POST";
      const url = selectedBlogId ? `${API_URL}/blogs/${selectedBlogId}` : `${API_URL}/blogs/`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(selectedBlogId ? "Blog updated successfully!" : "Blog created successfully!");
        setIsDialogOpen(false);
        setFormData({
          title: "",
          excerpt: "",
          content: "",
          category: "",
          author: "",
          read_time: "",
          image_url: "",
        });
        setImageFile(null);
        fetchBlogs(); // Refresh list
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.detail || (selectedBlogId ? "Failed to update blog" : "Failed to create blog")}`);
      }
    } catch (error) {
      console.error(error);
      toast.error(selectedBlogId ? "An error occurred while updating the blog." : "An error occurred while creating the blog.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Blog Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Create, view, and manage blog articles for the public platform.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={handleOpenCreate}>
              <Plus className="h-4 w-4" />
              New Blog Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedBlogId ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
              <DialogDescription>
                {selectedBlogId ? "Update the details below to edit the article." : "Fill out the details below to publish a new article to the platform."} You can use standard HTML tags in the content area for formatting.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter blog title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g., Deepfake Analysis"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="author">Author Name</Label>
                  <Input
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    placeholder="e.g., John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="read_time">Read Time</Label>
                  <Input
                    id="read_time"
                    name="read_time"
                    value={formData.read_time}
                    onChange={handleInputChange}
                    placeholder="e.g., 5 min read"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3 border border-border rounded-lg p-4 bg-muted/20">
                <Label>Hero Image Source</Label>
                
                {formData.image_url && imageMode === "url" && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Current Image Preview:</p>
                    <div className="h-32 w-full sm:w-1/2 rounded-md overflow-hidden border border-border">
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
                
                <Tabs value={imageMode} onValueChange={(val) => setImageMode(val as "url" | "upload")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url" className="flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Image URL</TabsTrigger>
                    <TabsTrigger value="upload" className="flex items-center gap-2"><Upload className="w-4 h-4" /> Upload File</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="url" className="pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="image_url">Image URL</Label>
                      <Input
                        id="image_url"
                        name="image_url"
                        value={formData.image_url}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                        required={imageMode === "url"}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="upload" className="pt-4">
                    <div className="space-y-2">
                      <div className="relative border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer bg-background/50 group">
                        <Input
                          id="image_file"
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setImageFile(e.target.files[0]);
                            }
                          }}
                          required={imageMode === "upload"}
                        />
                        {imageFile ? (
                          <>
                            <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:bg-primary/20 transition-colors">
                              <Upload className="h-6 w-6" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-foreground truncate max-w-[250px]">{imageFile.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">Click or drag to change file</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-3 bg-muted rounded-full group-hover:bg-muted/80 transition-colors">
                              <Upload className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                              <p className="text-xs text-muted-foreground mt-1">SVG, PNG, JPG or GIF</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt (Short Summary)</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="A brief summary of the article..."
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Full Content (HTML supported)</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="<p>Write your article here...</p><h3>Subheadings</h3><ul><li>List item</li></ul>"
                  rows={8}
                  className="font-mono text-sm"
                  required
                />
              </div>

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Publishing..." : "Publish Post"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm flex flex-col"
            >
              <div className="h-48 bg-muted/30 animate-pulse relative" />
              <div className="p-5 flex-1 flex flex-col space-y-4">
                <div className="space-y-2">
                  <div className="h-5 w-5/6 rounded bg-muted/40 animate-pulse" />
                  <div className="h-5 w-2/3 rounded bg-muted/40 animate-pulse" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-full rounded bg-muted/30 animate-pulse" />
                  <div className="h-4 w-full rounded bg-muted/30 animate-pulse" />
                  <div className="h-4 w-4/5 rounded bg-muted/30 animate-pulse" />
                </div>
                <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                  <div className="h-3 w-16 rounded bg-muted/30 animate-pulse" />
                  <div className="h-3 w-12 rounded bg-muted/30 animate-pulse" />
                </div>
                <div className="pt-2">
                  <div className="h-8 w-full rounded bg-muted/20 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-xl border border-border border-dashed">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">No blogs found</h3>
          <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
            There are currently no blog articles published. Click "New Blog Post" to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="h-48 overflow-hidden relative">
                <img
                  src={blog.image_url}
                  alt={blog.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <Badge className="absolute top-4 left-4 bg-background/80 backdrop-blur-md border-border text-foreground">
                  {blog.category}
                </Badge>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 leading-tight">
                  {blog.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                  {blog.excerpt}
                </p>
                
                <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{blog.read_time}</span>
                  </div>
                </div>
                
                <div className="pt-4 flex gap-2 mt-auto">
                  <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => handleOpenEdit(blog)}>
                    <Edit className="h-4 w-4" /> Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

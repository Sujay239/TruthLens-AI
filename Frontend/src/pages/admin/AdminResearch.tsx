import { useState, useEffect } from "react";
import { Plus, BookOpen, Calendar, Link as LinkIcon, Upload, Edit, Trash2, Users, FileText, Eye } from "lucide-react";
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

export default function AdminResearch() {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [fileMode, setFileMode] = useState<"url" | "upload">("url");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const API_URL = import.meta.env.VITE_API_URL;

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    authors: "",
    conference: "",
    date: "",
    abstract: "",
    keywords: "",
    file_url: "",
  });

  const fetchPapers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/research/?limit=50`);
      if (res.ok) {
        const data = await res.json();
        setPapers(data);
      } else {
        toast.error("Failed to fetch research papers");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error while fetching research papers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenCreate = () => {
    setSelectedPaperId(null);
    setFormData({
      title: "",
      authors: "",
      conference: "",
      date: "",
      abstract: "",
      keywords: "",
      file_url: "",
    });
    setFileMode("url");
    setUploadedFile(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (paper: ResearchPaper) => {
    setSelectedPaperId(paper.id);
    setFormData({
      title: paper.title,
      authors: paper.authors,
      conference: paper.conference,
      date: paper.date,
      abstract: paper.abstract,
      keywords: paper.keywords,
      file_url: paper.file_url,
    });
    setFileMode("url");
    setUploadedFile(null);
    setIsDialogOpen(true);
  };

  const handleDeletePaper = async (id: string) => {
    if (!confirm("Are you sure you want to delete this research paper?")) return;

    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch(`${API_URL}/research/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success("Research paper deleted successfully!");
        fetchPapers();
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.detail || "Failed to delete research paper"}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while deleting the research paper.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("admin_token");
      let finalFileUrl = formData.file_url;

      // Handle file upload if mode is upload and a file is selected
      if (fileMode === "upload" && uploadedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", uploadedFile);

        const uploadRes = await fetch(`${API_URL}/research/upload-file`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.detail || "Failed to upload file");
        }

        const uploadJson = await uploadRes.json();
        finalFileUrl = uploadJson.url;
      } else if (fileMode === "url" && !finalFileUrl) {
        toast.error("Please provide a file URL.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        ...formData,
        file_url: finalFileUrl,
      };

      const method = selectedPaperId ? "PUT" : "POST";
      const url = selectedPaperId ? `${API_URL}/research/${selectedPaperId}` : `${API_URL}/research/`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(selectedPaperId ? "Research paper updated successfully!" : "Research paper created successfully!");
        setIsDialogOpen(false);
        setFormData({
          title: "",
          authors: "",
          conference: "",
          date: "",
          abstract: "",
          keywords: "",
          file_url: "",
        });
        setUploadedFile(null);
        fetchPapers();
      } else {
        const errorData = await res.json();
        toast.error(`Error: ${errorData.detail || (selectedPaperId ? "Failed to update paper" : "Failed to create paper")}`);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Research Papers Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Publish, edit, and manage scientific whitepapers and academic research.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={handleOpenCreate}>
              <Plus className="h-4 w-4" />
              New Research Paper
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPaperId ? "Edit Research Paper" : "Publish Research Paper"}</DialogTitle>
              <DialogDescription>
                Fill out the academic details below. Admins can upload PDFs/DOCXs directly or provide links.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter scientific paper title"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="authors">Authors</Label>
                  <Input
                    id="authors"
                    name="authors"
                    value={formData.authors}
                    onChange={handleInputChange}
                    placeholder="e.g. Sujay Kumar Kotal, Jane Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conference">Conference / Publisher</Label>
                  <Input
                    id="conference"
                    name="conference"
                    value={formData.conference}
                    onChange={handleInputChange}
                    placeholder="e.g. IEEE Vision Conference"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Publishing Date / Season</Label>
                  <Input
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    placeholder="e.g. May 2026"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords (Comma separated)</Label>
                  <Input
                    id="keywords"
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleInputChange}
                    placeholder="e.g. Deepfake, GANs, Computer Vision"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="abstract">Abstract</Label>
                <Textarea
                  id="abstract"
                  name="abstract"
                  value={formData.abstract}
                  onChange={handleInputChange}
                  placeholder="Write a clear academic abstract detailing the research goal, method, and outcome..."
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-3 border border-border rounded-lg p-4 bg-muted/20">
                <Label>Document File Source</Label>
                
                {formData.file_url && fileMode === "url" && (
                  <div className="mb-4 p-2.5 rounded border border-border bg-background flex items-center justify-between">
                    <span className="text-xs text-muted-foreground truncate max-w-[400px]">Current File: {formData.file_url}</span>
                    <a href={formData.file_url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">View File</a>
                  </div>
                )}
                
                <Tabs value={fileMode} onValueChange={(val) => setFileMode(val as "url" | "upload")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url" className="flex items-center gap-2"><LinkIcon className="w-4 h-4" /> File URL</TabsTrigger>
                    <TabsTrigger value="upload" className="flex items-center gap-2"><Upload className="w-4 h-4" /> Upload Document</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="url" className="pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="file_url">File URL</Label>
                      <Input
                        id="file_url"
                        name="file_url"
                        value={formData.file_url}
                        onChange={handleInputChange}
                        placeholder="https://example.com/paper.pdf"
                        required={fileMode === "url"}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="upload" className="pt-4">
                    <div className="space-y-3">
                      <div className="relative border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer bg-background/50 group">
                        <Input
                          id="file_upload"
                          type="file"
                          accept=".pdf,.docx"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setUploadedFile(e.target.files[0]);
                            }
                          }}
                          required={fileMode === "upload" && !selectedPaperId}
                        />
                        {uploadedFile ? (
                          <>
                            <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:bg-primary/20 transition-colors">
                              <FileText className="h-6 w-6" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-foreground truncate max-w-[250px]">{uploadedFile.name}</p>
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
                              <p className="text-xs text-muted-foreground mt-1">Only PDF or DOCX up to 25MB</p>
                            </div>
                          </>
                        )}
                      </div>

                      {uploadedFile && (
                        <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background">
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">{uploadedFile.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5"
                            onClick={() => {
                              const url = URL.createObjectURL(uploadedFile);
                              window.open(url, "_blank");
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" /> View File to Confirm
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : selectedPaperId ? "Update Paper" : "Publish Paper"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border/50 bg-card/40 p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="h-5 w-24 rounded bg-muted/40 animate-pulse" />
                  <div className="h-4 w-20 rounded bg-muted/30 animate-pulse" />
                </div>
                <div className="h-6 w-11/12 rounded bg-muted/40 animate-pulse" />
                <div className="h-4 w-32 rounded bg-muted/30 animate-pulse" />
                <div className="space-y-1.5 pt-2">
                  <div className="h-4 w-full rounded bg-muted/20 animate-pulse" />
                  <div className="h-4 w-full rounded bg-muted/20 animate-pulse" />
                  <div className="h-4 w-3/4 rounded bg-muted/20 animate-pulse" />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <div className="h-6 w-12 rounded bg-muted/20 animate-pulse" />
                <div className="h-6 w-16 rounded bg-muted/20 animate-pulse" />
                <div className="h-6 w-14 rounded bg-muted/20 animate-pulse" />
              </div>
              <div className="flex gap-2.5 pt-4 border-t border-border/50">
                <div className="h-9 flex-1 rounded-lg bg-muted/30 animate-pulse" />
                <div className="h-9 w-20 rounded-lg bg-muted/30 animate-pulse" />
                <div className="h-9 w-20 rounded-lg bg-muted/30 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : papers.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-muted/10">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No Research Papers Found</h3>
          <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
            You haven't published any scientific whitepapers yet. Publish your first research paper!
          </p>
          <Button className="mt-4" onClick={handleOpenCreate}>Publish Paper</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {papers.map((paper) => (
            <div
              key={paper.id}
              className="group overflow-hidden rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="secondary" className="bg-muted text-muted-foreground font-normal text-xs">
                    {paper.conference}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{paper.date}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold leading-tight text-foreground line-clamp-2 group-hover:text-blue-500 transition-colors duration-300">
                  {paper.title}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-foreground/80 mt-2 font-medium">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate max-w-[300px]">{paper.authors}</span>
                </div>

                <p className="text-muted-foreground text-xs mt-3 leading-relaxed line-clamp-3">
                  {paper.abstract}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {paper.keywords.split(",").map((k, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded border border-border/80 bg-background text-muted-foreground">
                      {k.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-2 border-t border-border/50 mt-6">
                <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => handleOpenEdit(paper)}>
                  <Edit className="h-4 w-4" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-500/10 border-border/50 flex-1 gap-2" onClick={() => handleDeletePaper(paper.id)}>
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

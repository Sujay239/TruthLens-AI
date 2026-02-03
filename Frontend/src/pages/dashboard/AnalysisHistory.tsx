import { useState, useEffect } from "react";
import {
  FileText,
  Image as ImageIcon,
  Video,
  Mic,
  Search,
  Filter,
  Download,
  Eye,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { jsPDF } from "jspdf";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function AnalysisHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // State for data
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/history/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Map backend data to frontend structure
        const mappedData = data.map((item: any) => ({
          id: item.id,
          name: item.filename,
          type: item.file_type, // "Image", "Video" etc.
          date: new Date(item.date_created).toLocaleDateString(), // Simple formatting
          result: item.result_label,
          confidence:
            (item.confidence_score > 1
              ? item.confidence_score
              : item.confidence_score * 100
            ).toFixed(1) + "%",
          size: item.file_size || "N/A",
          imageUrl: item.file_type === "Image" ? item.media_url : undefined,
          videoUrl: item.file_type === "Video" ? item.media_url : undefined,
          audioUrl: item.file_type === "Audio" ? item.media_url : undefined,
          // store original for detailed reports if needed
          original: item,
        }));
        setHistoryData(mappedData);
      }
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = historyData.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "All" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "Image":
        return <ImageIcon className="h-4 w-4 text-blue-500" />;
      case "Video":
        return <Video className="h-4 w-4 text-purple-500" />;
      case "Audio":
        return <Mic className="h-4 w-4 text-yellow-500" />;
      case "Text":
        return <FileText className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (result: string) => {
    const safeResult = result ? result.toLowerCase() : "";
    if (["real", "clean", "human written", "authentic"].includes(safeResult)) {
      return "bg-emerald-500 hover:bg-emerald-600";
    }
    if (
      ["fake", "deepfake", "malicious", "ai generated", "manipulated"].includes(
        safeResult,
      )
    ) {
      return "bg-red-500 hover:bg-red-600";
    }
    if (["suspicious", "unknown", "uncertain"].includes(safeResult)) {
      return "bg-yellow-500 hover:bg-yellow-600";
    }
    return "bg-gray-500";
  };

  const generatePDF = async (item: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // -- HEADER SECTION --
    // Blue Background Header
    doc.setFillColor(37, 99, 235); // Blue-600
    doc.rect(0, 0, pageWidth, 40, "F");

    // Logo (Simulated with text/shape)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("TruthLens AI", 20, 20); // Logo Text

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Advanced Content Verification Report", 20, 30);

    doc.setFontSize(10);
    doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      pageWidth - 20,
      20,
      { align: "right" },
    );
    doc.text(
      `Ref ID: #${item.id.toString().padStart(6, "0")}`,
      pageWidth - 20,
      30,
      { align: "right" },
    );

    // -- CONTENT SECTION --
    let yPos = 60;

    // Title
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Verification Analysis Result", 20, yPos);

    yPos += 15;

    // Grid Layout for Key Stats
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setFillColor(248, 250, 252); // Slate-50
    doc.roundedRect(20, yPos, pageWidth - 40, 30, 3, 3, "FD");

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text("CLASSIFICATION", 40, yPos + 10);
    doc.text("CONFIDENCE SCORE", 110, yPos + 10);
    doc.text("CONTENT TYPE", 170, yPos + 10);

    yPos += 20;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");

    // Status Color Logic for PDF text
    if (item.result === "Real")
      doc.setTextColor(16, 185, 129); // Emerald
    else if (item.result === "Fake")
      doc.setTextColor(239, 68, 68); // Red
    else doc.setTextColor(234, 179, 8); // Yellow

    doc.text(item.result.toUpperCase(), 40, yPos);

    doc.setTextColor(30, 41, 59);
    doc.text(item.confidence, 110, yPos);
    doc.text(item.type, 170, yPos);

    yPos += 30;

    // -- FILE DETAILS --
    doc.setDrawColor(37, 99, 235); // Blue accent line
    doc.setLineWidth(1);
    doc.line(20, yPos, 20, yPos + 6);
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text("Evidence Details", 25, yPos + 5);

    yPos += 15;
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);

    const details = [
      [`Filename:`, item.name],
      [`Submission Date:`, item.date],
      [`File Size:`, item.size],
    ];

    details.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, 20, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(String(value), 60, yPos);
      yPos += 8;
    });

    // -- IMAGE PREVIEW --
    if (item.type === "Image" && item.imageUrl) {
      yPos += 10;
      doc.setDrawColor(37, 99, 235);
      doc.line(20, yPos, 20, yPos + 6);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text("Visual Evidence", 25, yPos + 5);
      yPos += 15;

      try {
        // Load image
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = item.imageUrl;

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        // Calculate aspect ratio to fit within bounds
        const maxWidth = pageWidth - 40;
        const maxHeight = 100;
        let imgWidth = img.width;
        let imgHeight = img.height;

        const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
        imgWidth *= ratio;
        imgHeight *= ratio;

        doc.addImage(img, "JPEG", 20, yPos, imgWidth, imgHeight);

        // Draw border around image
        doc.setDrawColor(200, 200, 200);
        doc.rect(20, yPos, imgWidth, imgHeight);

        yPos += imgHeight + 10;
      } catch (error) {
        console.error("Could not load image for PDF", error);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("[Image Preview Unavailable]", 20, yPos);
        yPos += 10;
      }
    }

    // -- FOOTER --
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, footerY, pageWidth - 20, footerY);

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("Trust but Verify. Powered by TruthLens AI.", 20, footerY + 10);
    doc.text("www.truthlens.ai", pageWidth - 20, footerY + 10, {
      align: "right",
    });

    doc.save(`TruthLens_Report_${item.name}.pdf`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8 relative">
      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-md border border-border p-6 relative max-h-[90vh] overflow-y-auto">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-50 bg-background/50 hover:bg-background"
              onClick={() => setSelectedItem(null)}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="mb-6 text-center">
              {selectedItem.imageUrl ? (
                <div className="mx-auto mb-4 overflow-hidden rounded-lg border border-border">
                  <img
                    src={selectedItem.imageUrl}
                    alt="Evidence Preview"
                    className="w-full h-48 object-cover"
                  />
                </div>
              ) : selectedItem.videoUrl ? (
                <div className="mx-auto mb-4 overflow-hidden rounded-lg border border-border">
                  <video
                    controls
                    autoPlay
                    className="w-full h-48 object-cover bg-black"
                    src={selectedItem.videoUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  {getIcon(selectedItem.type)}
                </div>
              )}
              <h3 className="text-xl font-bold">{selectedItem.name}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedItem.date} • {selectedItem.size}
              </p>
            </div>

            {/* Display Text Content if available */}
            {selectedItem.original?.analysis_summary?.content && (
              <div className="mb-4 p-3 bg-muted/30 rounded-md border border-border max-h-40 overflow-y-auto">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedItem.original.analysis_summary.content}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <span className="font-medium">Status</span>
                <Badge
                  className={
                    getStatusColor(selectedItem.result) + " text-base px-3 py-1"
                  }
                >
                  {selectedItem.result}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border text-center">
                  <div className="text-2xl font-bold text-primary">
                    {selectedItem.confidence}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                    Confidence
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border text-center">
                  <div className="text-2xl font-bold">{selectedItem.type}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                    Format
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-4"
                onClick={() => generatePDF(selectedItem)}
              >
                <Download className="mr-2 h-4 w-4" /> Download Full Report
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedItem(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analysis History</h2>
        <p className="text-muted-foreground">
          Manage and review your past content verification results
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>All Analyses</CardTitle>
              <CardDescription>
                Showing {filteredData.length} total records
              </CardDescription>
            </div>
            <div className="flex w-full md:w-auto items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search files..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter Dropdown */}
              <div className="relative">
                <select
                  className="h-10 w-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="All">All Types</option>
                  <option value="Image">Image</option>
                  <option value="Video">Video</option>
                  <option value="Audio">Audio</option>
                  <option value="Text">Text</option>
                </select>
                <Filter className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm text-left">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                      File Name
                    </th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                      Type
                    </th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                      Confidence
                    </th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <td className="p-4 align-middle font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border">
                              {getIcon(item.type)}
                            </div>
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle text-muted-foreground">
                          {item.type}
                        </td>
                        <td className="p-4 align-middle text-muted-foreground">
                          {item.date}
                        </td>
                        <td className="p-4 align-middle font-medium">
                          {item.confidence}
                        </td>
                        <td className="p-4 align-middle">
                          <Badge className={getStatusColor(item.result)}>
                            {item.result}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View Details"
                              onClick={() => setSelectedItem(item)}
                            >
                              <Eye className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Download Report"
                              onClick={() => generatePDF(item)}
                            >
                              <Download className="h-4 w-4 text-green-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No results found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

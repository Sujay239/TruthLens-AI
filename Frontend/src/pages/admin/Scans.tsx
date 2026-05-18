import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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


export default function AdminScans() {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // State for data
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchHistory(typeFilter);
  }, [typeFilter]);

  // Handle deep-linking highlight
  useEffect(() => {
    const highlightId = searchParams.get("highlightId");
    if (highlightId && historyData.length > 0) {
      const itemToHighlight = historyData.find(item => item.id.toString() === highlightId);
      if (itemToHighlight) {
        setSelectedItem(itemToHighlight);
      }
    }
  }, [historyData, searchParams]);

  const fetchHistory = async (type?: string) => {
    setLoading(true);
    try {
      let url = `${API_URL}/admin/history/`;
      if (type && type !== "All") {
        url += `?scan_type=${type}`;
      }
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const mappedData = data.map((item: any) => ({
          id: item.id,
          name: item.filename,
          // If the backend provided a scan_type (e.g. 'fake_news'), surface it as 'News'
          type: item.scan_type === "fake_news" ? "News" : item.file_type,
          date: new Date(item.date_created).toLocaleString(),
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
          user_name: item.user_name || item.user_email || "Unknown",
          original: item,
        }));
        setHistoryData(mappedData);
      }
    } catch (error) {
      console.error("Failed to fetch admin history", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = historyData.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "News":
        return <FileText className="h-4 w-4 text-blue-500" />;
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

  const openDetails = (item: any) => {
    setSelectedItem(item);
  };

  const closeDetails = () => {
    setSelectedItem(null);
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
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("TruthLens AI", 20, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Advanced Content Verification Report", 20, 30);

    doc.setFontSize(10);
    doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      pageWidth - 20,
      20,
      {
        align: "right",
      },
    );
    doc.text(
      `Ref ID: #${item.id.toString().padStart(6, "0")}`,
      pageWidth - 20,
      30,
      {
        align: "right",
      },
    );

    let yPos = 60;

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Verification Analysis Result", 20, yPos);

    yPos += 15;

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, yPos, pageWidth - 40, 30, 3, 3, "FD");

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("CLASSIFICATION", 40, yPos + 10);
    doc.text("CONFIDENCE SCORE", 110, yPos + 10);
    doc.text("CONTENT TYPE", 170, yPos + 10);

    yPos += 20;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");

    if (item.result === "Real") doc.setTextColor(16, 185, 129);
    else if (item.result === "Fake") doc.setTextColor(239, 68, 68);
    else doc.setTextColor(234, 179, 8);

    doc.text(item.result.toUpperCase(), 40, yPos);

    doc.setTextColor(30, 41, 59);
    doc.text(item.confidence, 110, yPos);
    doc.text(item.type, 170, yPos);

    yPos += 30;

    doc.setDrawColor(37, 99, 235);
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
      [`User:`, item.user_name || "Unknown"],
    ];

    details.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label as string, 20, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(String(value), 60, yPos);
      yPos += 8;
    });

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
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = item.imageUrl;

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const maxWidth = pageWidth - 40;
        const maxHeight = 100;
        let imgWidth = img.width;
        let imgHeight = img.height;

        const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
        imgWidth *= ratio;
        imgHeight *= ratio;

        doc.addImage(img, "JPEG", 20, yPos, imgWidth, imgHeight);
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
    return (
      <div className="space-y-8">
        <div>
          <div className="h-8 w-48 rounded bg-muted/40 animate-pulse mb-2" />
          <div className="h-4 w-72 rounded bg-muted/30 animate-pulse" />
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="h-5 w-32 rounded bg-muted/40 animate-pulse" />
                <div className="h-4 w-48 rounded bg-muted/30 animate-pulse" />
              </div>
              <div className="flex w-full md:w-auto items-center gap-2">
                <div className="h-10 w-full md:w-64 rounded-md bg-muted/20 animate-pulse" />
                <div className="h-10 w-28 rounded-md bg-muted/20 animate-pulse" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border/50 overflow-hidden">
              <div className="w-full">
                <div className="h-12 border-b border-border/50 bg-muted/10 flex items-center px-4 justify-between">
                  <div className="h-4 w-1/4 rounded bg-muted/30 animate-pulse" />
                  <div className="h-4 w-1/6 rounded bg-muted/30 animate-pulse" />
                  <div className="h-4 w-1/6 rounded bg-muted/30 animate-pulse" />
                  <div className="h-4 w-1/6 rounded bg-muted/30 animate-pulse" />
                </div>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 border-b border-border/50 flex items-center px-4 justify-between last:border-0">
                    <div className="flex items-center gap-3 w-1/4">
                      <div className="h-8 w-8 rounded-full bg-muted/30 animate-pulse" />
                      <div className="space-y-1">
                        <div className="h-4 w-32 rounded bg-muted/40 animate-pulse" />
                        <div className="h-3 w-20 rounded bg-muted/30 animate-pulse" />
                      </div>
                    </div>
                    <div className="h-4 w-1/6 rounded bg-muted/30 animate-pulse" />
                    <div className="h-4 w-1/6 rounded bg-muted/30 animate-pulse" />
                    <div className="h-6 w-16 rounded-full bg-muted/40 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-md border border-border p-6 relative max-h-[90vh] overflow-y-auto">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-50 bg-background/50 hover:bg-background"
              onClick={closeDetails}
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
              ) : selectedItem.audioUrl ? (
                <div className="mx-auto mb-4 p-4 rounded-lg border border-border bg-muted/20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                      <Mic className="h-6 w-6" />
                    </div>
                    <audio
                      controls
                      autoPlay
                      className="w-full"
                      src={selectedItem.audioUrl}
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
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
              <p className="text-sm text-muted-foreground">
                User: {selectedItem.user_name}
              </p>
            </div>

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
                onClick={closeDetails}
              >
                Close
              </Button>

            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-3xl font-bold tracking-tight">All Scans</h2>
        <p className="text-muted-foreground">
          Manage and review all users' content verification results
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

              <div className="relative">
                <select
                  className="h-10 w-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="All">All Types</option>
                  <option value="News">News</option>
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
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-md border">
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
                            <div className="flex flex-col">
                              <span>{item.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {item.user_name}
                              </span>
                            </div>
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
                              onClick={() => openDetails(item)}
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

          {/* Mobile Cards View */}
          <div className="block md:hidden space-y-4">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm space-y-3"
                >
                  {/* File Header Info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 flex-shrink-0 rounded-full bg-muted flex items-center justify-center border border-border">
                        {getIcon(item.type)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold truncate" title={item.name}>
                          {item.name}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          by {item.user_name}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(item.result)} flex-shrink-0`}>
                      {item.result}
                    </Badge>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border/50" />

                  {/* Scan Info Grid */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground block mb-0.5">Format</span>
                      <span className="font-medium text-foreground">{item.type}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-0.5">Confidence</span>
                      <span className="font-semibold text-primary">{item.confidence}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-0.5">Date</span>
                      <span className="font-medium text-foreground truncate block" title={item.date}>
                        {item.date.split(",")[0]}
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs flex items-center gap-1.5"
                      onClick={() => openDetails(item)}
                    >
                      <Eye className="h-3.5 w-3.5 text-blue-500" /> View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs flex items-center gap-1.5"
                      onClick={() => generatePDF(item)}
                    >
                      <Download className="h-3.5 w-3.5 text-green-500" /> PDF Report
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground p-8 border rounded-lg">
                No results found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

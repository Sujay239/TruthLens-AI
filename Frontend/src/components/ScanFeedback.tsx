import { useEffect, useState } from "react";
import { CheckCircle2, Send, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ScanFeedbackProps {
  analysisLogId?: number | null;
  currentLabel?: string;
}

const correctionOptions = [
  "Real",
  "Fake",
  "Deepfake",
  "Human Written",
  "AI Generated",
  "Clean",
  "Suspicious",
  "Malicious",
];

export default function ScanFeedback({
  analysisLogId,
  currentLabel,
}: ScanFeedbackProps) {
  const [rating, setRating] = useState<"like" | "dislike" | null>(null);
  const [message, setMessage] = useState("");
  const [correctedLabel, setCorrectedLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const feedbackKey = analysisLogId
    ? `truthlens-feedback-submitted-${analysisLogId}`
    : "";

  useEffect(() => {
    setSubmitted(Boolean(feedbackKey && localStorage.getItem(feedbackKey)));
    setRating(null);
    setMessage("");
    setCorrectedLabel("");
  }, [feedbackKey]);

  const submitFeedback = async () => {
    if (!analysisLogId) {
      toast.error("Scan record is not ready for feedback yet.");
      return;
    }
    if (!rating) {
      toast.error("Choose like or dislike before submitting feedback.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/feedback/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          analysis_log_id: analysisLogId,
          rating,
          message: message.trim() || null,
          corrected_label:
            rating === "dislike" && correctedLabel ? correctedLabel : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || "Failed to submit feedback.");
      }

      if (feedbackKey) {
        localStorage.setItem(feedbackKey, "true");
      }
      setSubmitted(true);
      setRating(null);
      setMessage("");
      setCorrectedLabel("");
      toast.success("Thank you for your feedback.", {
        description:
          "It is valuable for us. Thanks for helping TruthLens AI.",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit feedback.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6 rounded-lg border border-border bg-muted/20 p-4">
      {submitted ? (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold">Feedback already submitted</p>
            <p className="text-xs">
              Thank you for your feedback. It is valuable for us. Thanks for
              helping TruthLens AI.
            </p>
          </div>
        </div>
      ) : (
        <>
      <div className="mb-3">
        <h4 className="text-sm font-semibold">Feedback</h4>
        <p className="text-xs text-muted-foreground">
          Help TruthLens learn from this result.
        </p>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <Button
          type="button"
          size="sm"
          variant={rating === "like" ? "default" : "outline"}
          onClick={() => setRating("like")}
        >
          <ThumbsUp className="mr-2 h-4 w-4" />
          Like
        </Button>
        <Button
          type="button"
          size="sm"
          variant={rating === "dislike" ? "destructive" : "outline"}
          onClick={() => setRating("dislike")}
        >
          <ThumbsDown className="mr-2 h-4 w-4" />
          Dislike
        </Button>
      </div>

      {rating === "dislike" && (
        <select
          className="mb-3 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={correctedLabel}
          onChange={(event) => setCorrectedLabel(event.target.value)}
        >
          <option value="">Correct label, if known</option>
          {correctionOptions
            .filter((label) => label !== currentLabel)
            .map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
        </select>
      )}

      <Textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Optional feedback message"
        className="mb-3 min-h-[72px]"
      />

      <Button
        className="w-full"
        size="sm"
        disabled={!analysisLogId || !rating || isSubmitting}
        onClick={submitFeedback}
      >
        <Send className="mr-2 h-4 w-4" />
        {isSubmitting ? "Saving Feedback..." : "Submit Feedback"}
      </Button>
        </>
      )}
    </div>
  );
}

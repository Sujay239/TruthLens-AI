import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  text?: string;
}

export function LoadingSpinner({
  size = 32,
  className = "",
  text = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center min-h-[50vh] w-full ${className}`}
    >
      <Loader2 className="animate-spin text-primary" size={size} />
      {text && (
        <p className="mt-4 text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
}

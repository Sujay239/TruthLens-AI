import {
  FileText,
  Image as ImageIcon,
  Cpu,
  ShieldCheck,
  Zap,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Features() {
  const features = [
    {
      title: "Fake News Detection",
      description:
        "Advanced NLP models analyze text patterns, sources, and linguistic cues to identify misleading or fabricated news content.",
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      badge: "BERT Powered",
    },
    {
      title: "Deepfake Analysis",
      description:
        "Computer vision algorithms detect AI-generated faces, manipulated videos, and synthetic media with high accuracy.",
      icon: <ImageIcon className="h-6 w-6 text-teal-600" />,
      badge: "CNN Vision",
    },
    {
      title: "Real-time Processing",
      description:
        "Get instant results with our optimized models running directly in your browser for maximum privacy and speed.",
      icon: <Cpu className="h-6 w-6 text-indigo-600" />,
      badge: "WebGPU",
    },
    {
      title: "Privacy First",
      description:
        "All analysis happens locally in your browser. Your content never leaves your device, ensuring complete privacy.",
      icon: <ShieldCheck className="h-6 w-6 text-orange-500" />,
      badge: "Client-Side",
    },
    {
      title: "High Accuracy",
      description:
        "Trained on millions of examples, our models achieve 99%+ accuracy in detecting manipulated content.",
      icon: <Zap className="h-6 w-6 text-red-500" />,
      badge: "99% Accurate",
    },
    {
      title: "Continuous Learning",
      description:
        "Models are regularly updated to detect the latest manipulation techniques and emerging deepfake technologies.",
      icon: <TrendingUp className="h-6 w-6 text-green-600" />,
      badge: "Always Updated",
    },
  ];

  return (
    <section className="bg-muted/50 py-20 lg:py-28">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Advanced AI Detection Capabilities
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powered by state-of-the-art machine learning models for
            comprehensive content verification
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-border bg-card shadow-sm transition-all hover:shadow-md"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-muted p-2.5">
                    {feature.icon}
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-muted text-muted-foreground hover:bg-muted/80"
                  >
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="mt-4 text-xl font-bold text-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

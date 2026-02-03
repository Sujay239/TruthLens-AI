import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/FeaturesSection";
import DetectionTools from "@/components/Detectiontools";
import Footer from "@/components/Footer";
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Header />
      <main>
        <Hero />
        <Features />
        <DetectionTools />
      </main>
      <Footer />
    </div>
  );
}

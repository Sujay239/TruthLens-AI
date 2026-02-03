import { Shield, Github, Twitter, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-background pt-16 pb-8 border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        {/* Top Section: Grid Layout */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* Column 1: Branding */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-blue-600">
                TruthLens AI
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Empowering digital literacy through AI-powered content
              verification. Protecting communities from misinformation and
              deepfakes.
            </p>
          </div>

          {/* Column 2: Product */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-foreground">Product</h3>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Fake News Detection
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Deepfake Analysis
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  API Access
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Enterprise
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-foreground">Resources</h3>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Research Papers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-foreground">Connect</h3>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Join our mission to combat misinformation and protect digital
              truth.
            </p>
          </div>
        </div>

        {/* Bottom Section: Copyright & Legal */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TruthLens AI. Built with AI for a safer
            digital world.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-foreground">
              Terms of Service
            </a>
            <a href="#" className="hover:text-slate-900">
              Ethics
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

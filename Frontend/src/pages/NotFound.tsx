import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket, Home, Zap } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden relative selection:bg-cyan-500/30">
      {/* Background Stars/Effects */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div
          className="absolute top-10 left-20 w-2 h-2 bg-white rounded-full animate-pulse opacity-20"
          style={{ animationDuration: "3s" }}
        ></div>
        <div
          className="absolute top-40 right-40 w-1 h-1 bg-cyan-400 rounded-full animate-pulse opacity-40"
          style={{ animationDuration: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/3 w-3 h-3 bg-purple-500 rounded-full blur-sm animate-bounce opacity-30"
          style={{ animationDuration: "5s" }}
        ></div>

        {/* Glowing Orbs */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-20 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 text-center px-4 space-y-8 animate-in fade-in zoom-in duration-700">
        {/* Glitchy 404 Text */}
        <div className="relative">
          <h1 className="text-[150px] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-indigo-500 drop-shadow-2xl animate-pulse">
            404
          </h1>
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg blur opacity-20 animate-tilt"></div>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Lost in the <span className="text-cyan-400">AI Era</span>?
          </h2>
          <p className="text-slate-400 text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
            The coordinates you requested seem to be drifting in the digital
            void. This sector is uncharted.
          </p>
        </div>

        {/* Animated Icon */}
        <div className="flex justify-center py-8">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
            <Rocket className="w-24 h-24 text-white rotate-45 transform transition-transform hover:scale-110 duration-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            asChild
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-6 px-8 text-lg rounded-full shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all hover:shadow-[0_0_35px_rgba(34,211,238,0.6)] hover:-translate-y-1 border border-cyan-400/30"
          >
            <Link to="/">
              <Home className="mr-2 w-5 h-5" />
              Return to Base
            </Link>
          </Button>

          <Button
            variant="outline"
            className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600 py-6 px-8 text-lg rounded-full backdrop-blur-sm bg-slate-950/50"
            onClick={() => window.history.back()}
          >
            <Zap className="mr-2 w-5 h-5" />
            Go Back
          </Button>
        </div>
      </div>

      {/* Bottom Footer Text */}
      <div className="absolute bottom-8 text-slate-600 text-sm font-mono tracking-widest uppercase opacity-50">
        System Malfunction // Sector 7G
      </div>
    </div>
  );
};

export default NotFound;

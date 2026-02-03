import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import UserLayout from "./layouts/UserLayout";
import UserDashboard from "./pages/dashboard/UserDashboard";
import AnalysisHistory from "./pages/dashboard/AnalysisHistory";
import UserSettings from "./pages/dashboard/UserSettings";
import NotFound from "./pages/NotFound";
import FakeNewsDetection from "./pages/dashboard/FakeNewsDetection";
import DeepfakeImageDetection from "./pages/dashboard/DeepfakeImageDetection";
import DeepfakeVideoDetection from "./pages/dashboard/DeepfakeVideoDetection";
import DeepfakeVoiceDetection from "./pages/dashboard/DeepfakeVoiceDetection";
import AiTextDetection from "./pages/dashboard/AiTextDetection";
import MalwareDetection from "./pages/dashboard/MalwareDetection";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "sonner";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<UserLayout />}>
            <Route index element={<UserDashboard />} />
            <Route path="history" element={<AnalysisHistory />} />
            <Route path="settings" element={<UserSettings />} />
            <Route path="tools/fake-news" element={<FakeNewsDetection />} />
            <Route
              path="tools/deepfake-image"
              element={<DeepfakeImageDetection />}
            />
            <Route
              path="tools/deepfake-video"
              element={<DeepfakeVideoDetection />}
            />
            <Route
              path="tools/voice-detection"
              element={<DeepfakeVoiceDetection />}
            />
            <Route path="tools/ai-text" element={<AiTextDetection />} />
            <Route path="tools/malware-scan" element={<MalwareDetection />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;

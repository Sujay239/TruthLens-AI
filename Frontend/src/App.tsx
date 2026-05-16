import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminAreaPage from "./pages/AdminAreaPage";
import AdminScans from "./pages/admin/Scans";
import AdminFeedback from "./pages/admin/Feedback";
import AdminUsers from "./pages/admin/Users";
import AdminAdmins from "./pages/admin/Admins";
import AdminSupport from "./pages/admin/Support";
import AdminSettings from "./pages/admin/Settings";
import AdminAuditLogs from "./pages/admin/AuditLogs";
import GithubCallback from "./pages/GithubCallback";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Ethics from "./pages/Ethics";
import DemoPage from "./pages/DemoPage";
import SupportPage from "./pages/Support";
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
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import { Toaster } from "sonner";

import PageTitleUpdater from "./components/PageTitleUpdater";

import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  const G_CLIENT_ID =
    "469032517353-n3pg2fh1gkupkbjoqfsr1anbcjqqt21b.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={G_CLIENT_ID}>
      <Router>
        <PageTitleUpdater />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/admin" element={<AdminLoginPage />} />
          <Route path="/auth/github/callback" element={<GithubCallback />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/ethics" element={<Ethics />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route
            path="/auth/forgot-password"
            element={<ForgotPasswordPage />}
          />

          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminAreaPage />} />
              <Route path="scans" element={<AdminScans />} />
              <Route path="feedback" element={<AdminFeedback />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="admins" element={<AdminAdmins />} />
              <Route path="support" element={<AdminSupport />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="audit" element={<AdminAuditLogs />} />
            </Route>
          </Route>

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
    </GoogleOAuthProvider>
  );
}

export default App;

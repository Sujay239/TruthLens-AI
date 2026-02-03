import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const PageTitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let title = "TruthLens AI";

    if (path === "/") {
      title = "TruthLens AI";
    } else if (path === "/auth") {
      title = "Sign In - TruthLens AI";
    } else if (path === "/privacy") {
      title = "Privacy Policy - TruthLens AI";
    } else if (path === "/terms") {
      title = "Terms of Service - TruthLens AI";
    } else if (path === "/dashboard") {
      title = "Dashboard - TruthLens AI";
    } else if (path.startsWith("/dashboard/tools/")) {
      const tool = path.split("/").pop();
      const toolName = tool
        ?.split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      title = `${toolName} - TruthLens AI`;
    } else if (path.startsWith("/dashboard")) {
      // Fallback for other dashboard pages like settings, history
      const page = path.split("/").pop() || "";
      const pageName = page.charAt(0).toUpperCase() + page.slice(1);
      title = `${pageName} - TruthLens AI`;
    }

    document.title = title;
  }, [location]);

  return null;
};

export default PageTitleUpdater;

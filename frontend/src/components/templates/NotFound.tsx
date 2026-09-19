import { SearchX } from "lucide-react";
import { ErrorState } from "./ErrorState";
import { usePageTitle } from "../../hooks/usePageTitle";

type NotFoundProps = {
  onReset?: () => void;
  showHomeLink?: boolean;
};

const NotFound = ({ onReset, showHomeLink = true }: NotFoundProps) => {
  usePageTitle("404 Not Found");

  return (
    <ErrorState
      code="404"
      title="Page Not Found"
      description="The page or resource you are looking for does not exist, may have been moved, or is unavailable right now."
      icon={SearchX}
      tone="primary"
      onReset={onReset}
      resetLabel="Go Back"
      showDashboardLink={showHomeLink}
      dashboardLabel="Go Back"
    />
  );
};

export default NotFound;

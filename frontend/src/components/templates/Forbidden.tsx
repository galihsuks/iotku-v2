import { ShieldAlert } from "lucide-react";
import { ErrorState } from "./ErrorState";
import { usePageTitle } from "../../hooks/usePageTitle";

type ForbiddenProps = {
  onReset?: () => void;
};

const Forbidden = ({ onReset }: ForbiddenProps) => {
  usePageTitle("403 Forbidden");

  return (
    <ErrorState
      code="403"
      title="Access Forbidden"
      description="You do not have permission to access this page or perform this action with the current account."
      icon={ShieldAlert}
      tone="warning"
      onReset={onReset}
      resetLabel="Go Back"
    />
  );
};

export default Forbidden;

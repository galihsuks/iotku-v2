import { WifiOff } from "lucide-react";
import { ErrorState } from "./ErrorState";
import { usePageTitle } from "../../hooks/usePageTitle";

type NetworkErrorProps = {
  onReset?: () => void;
};

const NetworkError = ({ onReset }: NetworkErrorProps) => {
  usePageTitle("Network Error");

  return (
    <ErrorState
      code="NETWORK"
      title="Network Connection Lost"
      description="The request could not reach the server. Please check your internet connection or try again shortly."
      icon={WifiOff}
      tone="info"
      onReset={onReset}
      resetLabel="Reload Page"
    />
  );
};

export default NetworkError;

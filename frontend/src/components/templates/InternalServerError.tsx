import { ServerCrash } from "lucide-react";
import { ErrorState } from "./ErrorState";
import { usePageTitle } from "../../hooks/usePageTitle";

type InternalServerErrorProps = {
  onReset?: () => void;
};

const InternalServerError = ({ onReset }: InternalServerErrorProps) => {
  usePageTitle("500 Internal Server Error");

  return (
    <ErrorState
      code="500"
      title="Internal Server Error"
      description="Something went wrong on the server while processing your request. Please try again in a moment."
      icon={ServerCrash}
      tone="danger"
      onReset={onReset}
      resetLabel="Try Again"
    />
  );
};

export default InternalServerError;

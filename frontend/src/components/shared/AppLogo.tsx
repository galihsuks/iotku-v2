import landscapeLogo from "../../assets/app_logo/landscape.png";
import landscapeBlackLogo from "../../assets/app_logo/landscape_black.svg";
import landscapeWhiteLogo from "../../assets/app_logo/landscape_white.svg";
import markLogo from "../../assets/app_logo/mark.png";
import markBlackLogo from "../../assets/app_logo/mark_black.svg";
import markWhiteLogo from "../../assets/app_logo/mark_white.svg";
import { cn } from "../../utils/cn";
import envVar from "../../utils/envReader";

export type AppLogoVariant =
  | "mark"
  | "mark-black"
  | "mark-white"
  | "landscape"
  | "landscape-black"
  | "landscape-white"
  | "icon"
  | "icon-bw"
  | "text"
  | "lockup"
  | "lockup-bw";

interface AppLogoProps {
  variant?: AppLogoVariant;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

const imageVariantMap: Partial<Record<AppLogoVariant, string>> = {
  mark: markLogo,
  "mark-black": markBlackLogo,
  "mark-white": markWhiteLogo,
  landscape: landscapeLogo,
  "landscape-black": landscapeBlackLogo,
  "landscape-white": landscapeWhiteLogo,
  icon: markLogo,
  "icon-bw": markBlackLogo,
  lockup: landscapeLogo,
  "lockup-bw": landscapeBlackLogo,
};

export const AppLogo = ({
  variant = "icon",
  className,
  iconClassName,
  textClassName,
}: AppLogoProps) => {
  const imageSrc = imageVariantMap[variant];

  const iconElement = (
    <img
      src={imageSrc}
      alt="App logo"
      className={cn("h-full w-full object-contain", iconClassName)}
    />
  );

  if (variant === "text") {
    return (
      <span
        className={cn("truncate text-sm font-semibold text-dark-800", textClassName, className)}
      >
        {envVar.APP_TITLE}
      </span>
    );
  }

  if (!imageSrc) {
    return null;
  }

  return <div className={cn(className)}>{iconElement}</div>;
};

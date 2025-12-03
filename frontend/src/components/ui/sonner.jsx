import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        style: {
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "500",
        },
        classNames: {
          success: "!bg-green-50 !border-green-200 !text-green-800",
          error: "!bg-red-50 !border-red-200 !text-red-800",
          warning: "!bg-yellow-50 !border-yellow-200 !text-yellow-800",
          info: "!bg-blue-50 !border-blue-200 !text-blue-800",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

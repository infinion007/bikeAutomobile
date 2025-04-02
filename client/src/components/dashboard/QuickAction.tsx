import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface QuickActionProps {
  label: string;
  icon: string;
  onClick: () => void;
  primary?: boolean;
  iconColor?: string;
}

export default function QuickAction({ 
  label, 
  icon, 
  onClick, 
  primary = false,
  iconColor = ""
}: QuickActionProps) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex-shrink-0 flex flex-col items-center justify-center rounded-lg p-4 shadow-md min-w-[100px]",
        primary 
          ? "bg-primary text-white" 
          : "bg-white text-neutral-800"
      )}
    >
      <span className={cn("material-icons mb-1", iconColor)}>
        {icon}
      </span>
      <span className="text-sm">{label}</span>
    </button>
  );
}

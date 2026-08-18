import { memo, type ReactNode } from "react";

type ChipTone = "cyan" | "orange" | "green" | "yellow" | "red";

type StatusChipProps = {
  children: ReactNode;
  active?: boolean;
  tone?: ChipTone;
  onClick?: () => void;
};

const activeToneClass: Record<ChipTone, string> = {
  cyan: "border-process-cyan bg-process-cyan/10 font-bold text-process-cyan",
  orange: "border-process-orange bg-process-orange/10 font-bold text-process-orange",
  green: "border-process-green bg-process-green/10 font-bold text-process-green",
  yellow: "border-process-yellow bg-process-yellow/10 font-bold text-process-yellow",
  red: "border-process-red bg-process-red/10 font-bold text-process-red",
};

function StatusChipComponent({ children, active, tone = "cyan", onClick }: StatusChipProps) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`chip whitespace-nowrap cursor-pointer transition-colors ${active ? activeToneClass[tone] : "opacity-70 hover:opacity-100"}`}
      >
        {children}
      </button>
    );
  }

  return <span className={`chip whitespace-nowrap ${active ? activeToneClass[tone] : ""}`}>{children}</span>;
}

export const StatusChip = memo(StatusChipComponent);
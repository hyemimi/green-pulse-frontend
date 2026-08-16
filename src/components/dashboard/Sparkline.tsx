import { memo, useMemo } from "react";
import { buildLinePath } from "../../utils/chart";

type SparklineProps = {
  variant: "up" | "down";
};

function SparklineComponent({ variant }: SparklineProps) {
  const path = useMemo(() => {
    const values = variant === "up" ? [2, 3, 2.7, 4.2, 5.5] : [12, 10.2, 8.7, 7.8, 7.7];
    return buildLinePath(values, 64, 24);
  }, [variant]);

  return (
    <svg viewBox="0 0 64 24" className="h-6 w-16 overflow-visible">
      <path d={path} fill="none" stroke="#f97316" strokeWidth="1.4" />
    </svg>
  );
}

export const Sparkline = memo(SparklineComponent);

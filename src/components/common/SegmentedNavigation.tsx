import { memo } from "react";

type SegmentTone = "cyan" | "green";

type SegmentedNavigationProps = {
  active: "process" | "esg";
  tone?: SegmentTone;
};

const activeClass: Record<SegmentTone, string> = {
  cyan: "border-process-cyan bg-process-cyan/10 text-process-cyan",
  green: "border-process-green bg-process-green/10 text-process-green",
};

function SegmentedNavigationComponent({ active, tone = "cyan" }: SegmentedNavigationProps) {
  const itemClass = (key: "process" | "esg") =>
    `rounded-md border px-3 py-1.5 text-xs font-bold transition ${
      active === key
        ? activeClass[tone]
        : "border-transparent bg-transparent text-process-muted hover:border-process-line hover:bg-[#20273d] hover:text-white"
    }`;

  return (
    <nav aria-label="Dashboard navigation" className="flex shrink-0 items-center rounded-lg border border-process-line bg-process-bg p-1">
      <a className={itemClass("process")} href="/">
        공정 모니터링
      </a>
      <a className={itemClass("esg")} href="/esg-performance">
        ESG 리포트
      </a>
    </nav>
  );
}

export const SegmentedNavigation = memo(SegmentedNavigationComponent);

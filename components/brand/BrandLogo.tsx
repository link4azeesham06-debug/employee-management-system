import LogoMark from "@/components/brand/LogoMark";

type BrandLogoProps = {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  descriptorClassName?: string;
  markSize?: number;
  showDescriptor?: boolean;
  orientation?: "horizontal" | "vertical";
  variant?: "default" | "inverse";
  decorative?: boolean;
};

export default function BrandLogo({
  className = "",
  markClassName = "",
  wordmarkClassName = "",
  descriptorClassName = "",
  markSize = 36,
  showDescriptor = false,
  orientation = "horizontal",
  variant = "default",
  decorative = false,
}: BrandLogoProps) {
  const inverse = variant === "inverse";
  const layout = orientation === "vertical"
    ? "flex-col text-center"
    : "flex-row text-left";

  return (
    <span
      className={`inline-flex items-center gap-2.5 ${layout} ${className}`}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "HR - HR Management System"}
      aria-hidden={decorative || undefined}
    >
      <LogoMark
        size={markSize}
        decorative
        className={`shrink-0 text-indigo-600 ${markClassName}`}
      />
      <span className="min-w-0" aria-hidden="true">
        <span
          className={`block text-xl font-extrabold leading-none tracking-[-0.055em] ${
            inverse ? "text-white" : "text-slate-950"
          } ${wordmarkClassName}`}
        >
          HR
        </span>
        {showDescriptor && (
          <span
            className={`mt-1 block truncate text-[11px] font-medium tracking-wide ${
              inverse ? "text-slate-400" : "text-slate-500"
            } ${descriptorClassName}`}
          >
            HR Management System
          </span>
        )}
      </span>
    </span>
  );
}

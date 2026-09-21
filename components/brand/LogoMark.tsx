import type { SVGProps } from "react";

type LogoMarkProps = Omit<SVGProps<SVGSVGElement>, "height" | "width"> & {
  size?: number;
  decorative?: boolean;
  label?: string;
};

export default function LogoMark({
  size = 32,
  decorative = false,
  label = "HR",
  className = "text-indigo-600",
  ...props
}: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : label}
      focusable="false"
      {...props}
    >
      <rect x="1" y="1" width="30" height="30" rx="8" fill="currentColor" />
      <path
        d="M8.5 8v16M8.5 16h7M15.5 8v16"
        fill="none"
        stroke="white"
        strokeWidth="2.75"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 8h4.1a4.6 4.6 0 0 1 0 9.2h-4.1M19.4 17.2 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.75"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </svg>
  );
}

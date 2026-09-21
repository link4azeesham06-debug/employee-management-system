type BrandGridProps = {
  className?: string;
};

export default function BrandGrid({ className = "" }: BrandGridProps) {
  return (
    <span
      className={`brand-grid-pattern pointer-events-none absolute inset-0 ${className}`}
      aria-hidden="true"
    />
  );
}

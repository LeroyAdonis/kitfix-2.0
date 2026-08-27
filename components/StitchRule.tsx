/**
 * StitchRule — the signature dashed-gold seam divider (DESIGN.md).
 * The single memorable element of the "Repair Sheet" design language.
 */
export function StitchRule({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`stitch-seam h-[6px] w-full ${className}`}
      style={{
        background:
          "repeating-linear-gradient(90deg, var(--color-stitch) 0 14px, transparent 14px 22px)",
      }}
    />
  );
}
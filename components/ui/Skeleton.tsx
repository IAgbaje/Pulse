import type { CSSProperties, HTMLAttributes } from "react";

export type SkeletonRadius = "sm" | "md" | "lg" | "full";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** CSS width; numbers are treated as px */
  width?: string | number;
  /** CSS height; numbers are treated as px */
  height?: string | number;
  /** Overrides the .skeleton default (radius-sm) with another radius token */
  rounded?: SkeletonRadius;
}

const roundedVar: Record<SkeletonRadius, string> = {
  sm: "var(--radius-sm)",
  md: "var(--radius-md)",
  lg: "var(--radius-lg)",
  full: "var(--radius-full)",
};

/**
 * Thin wrapper over the .skeleton shimmer recipe declared in globals.css.
 * width/height/rounded are applied inline (highest specificity) so they
 * reliably override .skeleton's own defaults regardless of CSS source order.
 */
export default function Skeleton({
  width,
  height,
  rounded,
  className = "",
  style,
  ...rest
}: SkeletonProps) {
  const mergedStyle: CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    borderRadius: rounded ? roundedVar[rounded] : undefined,
    ...style,
  };

  return (
    <div
      className={["skeleton", className].filter(Boolean).join(" ")}
      style={mergedStyle}
      {...rest}
    />
  );
}

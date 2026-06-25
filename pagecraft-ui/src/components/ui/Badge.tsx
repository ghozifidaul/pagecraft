import type { HTMLAttributes, ReactNode } from "react";

type Variant = "yellow" | "pink" | "blue" | "green" | "purple" | "red" | "paper";

type BadgeProps = {
  variant?: Variant;
  children: ReactNode;
} & HTMLAttributes<HTMLSpanElement>;

const variantStyles: Record<Variant, string> = {
  yellow: "bg-brutal-yellow text-brutal-ink",
  pink: "bg-brutal-pink text-white",
  blue: "bg-brutal-blue text-brutal-ink",
  green: "bg-brutal-green text-brutal-ink",
  purple: "bg-brutal-purple text-white",
  red: "bg-brutal-red text-white",
  paper: "bg-brutal-paper text-brutal-ink",
};

export default function Badge({
  variant = "yellow",
  className = "",
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-extrabold text-[12.5px] tracking-wide px-3 py-1.5 border-2 border-brutal-ink rounded-full shadow-[2px_2px_0_#161616] ${variantStyles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}

import type { HTMLAttributes, ReactNode } from "react";

type CardProps = {
  featured?: boolean;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export default function Card({
  featured = false,
  className = "",
  children,
  ...rest
}: CardProps) {
  const surface = featured
    ? "bg-brutal-purple text-white"
    : "bg-brutal-paper text-brutal-ink";
  return (
    <div
      className={`border-[3px] border-brutal-ink rounded-2xl shadow-[8px_8px_0_#161616] p-6 transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[11px_11px_0_#161616] ${surface} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

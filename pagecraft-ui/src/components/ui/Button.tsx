import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "success" | "danger" | "dark" | "ghost";
type Size = "md" | "sm";

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

const variantStyles: Record<Variant, string> = {
  primary: "bg-brutal-yellow",
  secondary: "bg-brutal-blue",
  success: "bg-brutal-green",
  danger: "bg-brutal-red text-white",
  dark: "bg-brutal-ink text-brutal-paper",
  ghost: "bg-brutal-paper",
};

const sizeStyles: Record<Size, string> = {
  md: "text-[15px] px-[22px] py-3 rounded-brutal shadow-[5px_5px_0_#161616] hover:shadow-[7px_7px_0_#161616] active:shadow-[1px_1px_0_#161616]",
  sm: "text-[13px] px-3.5 py-2 rounded-lg shadow-[3px_3px_0_#161616] hover:shadow-[5px_5px_0_#161616] active:shadow-[1px_1px_0_#161616]",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const motion =
    "transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5";
  const focus =
    "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-brutal-ink focus-visible:outline-offset-2";
  const disabledStyle = disabled ? "opacity-45 cursor-not-allowed pointer-events-none" : "";

  return (
    <button
      className={`inline-flex items-center gap-2 font-bold border-[3px] border-brutal-ink ${variantStyles[variant]} ${sizeStyles[size]} ${motion} ${focus} ${disabledStyle} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}

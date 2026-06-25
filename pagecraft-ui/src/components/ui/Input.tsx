import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", ...rest }: InputProps) {
  return (
    <input
      className={`w-full font-medium text-[14.5px] border-[3px] border-brutal-ink rounded-[9px] px-3.5 py-3 bg-brutal-paper shadow-[4px_4px_0_#161616] transition-all duration-150 focus:outline-none focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[6px_6px_0_#161616] ${className}`}
      {...rest}
    />
  );
}

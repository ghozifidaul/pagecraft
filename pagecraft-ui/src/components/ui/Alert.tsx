import type { ReactNode } from "react";

type Variant = "success" | "warning" | "error" | "info";

type AlertProps = {
  variant?: Variant;
  title?: string;
  onClose?: () => void;
  children: ReactNode;
};

const surfaceStyles: Record<Variant, string> = {
  success: "bg-[#E4FBEE]",
  warning: "bg-[#FFF6DC]",
  error: "bg-[#FFE7E7]",
  info: "bg-[#EFE6FC]",
};

const iconStyles: Record<Variant, string> = {
  success: "✓",
  warning: "!",
  error: "✕",
  info: "i",
};

export default function Alert({
  variant = "info",
  title,
  onClose,
  children,
}: AlertProps) {
  return (
    <div
      className={`flex items-start gap-3 border-[3px] border-brutal-ink rounded-xl px-4.5 py-4 shadow-[5px_5px_0_#161616] mb-4 ${surfaceStyles[variant]}`}
    >
      <div className="w-7.5 h-7.5 rounded-lg border-[2.5px] border-brutal-ink flex items-center justify-center font-extrabold bg-brutal-paper shrink-0">
        {iconStyles[variant]}
      </div>
      <div>
        {title && (
          <strong className="block text-[14.5px] mb-0.5">{title}</strong>
        )}
        <p className="text-[13.5px] text-gray-800 m-0">{children}</p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-auto font-extrabold text-base px-1.5 py-0.5 rounded-md hover:bg-black/10"
        >
          ✕
        </button>
      )}
    </div>
  );
}

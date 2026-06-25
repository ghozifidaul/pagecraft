import { useEffect, type ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-[480px]",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-brutal-ink/55 flex items-center justify-center z-50 p-5"
    >
      <div
        className={`bg-brutal-paper border-[3px] border-brutal-ink rounded-2xl ${maxWidth} w-full p-7 shadow-[10px_10px_0_#161616] relative`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-3.5 right-3.5 border-[2.5px] border-brutal-ink bg-brutal-paper w-8 h-8 rounded-lg font-extrabold shadow-[2px_2px_0_#161616] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#161616] transition-all duration-150"
        >
          ✕
        </button>
        {title && (
          <h2 className="text-[22px] md:text-[24px] font-extrabold tracking-tight pr-10 mb-4">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}

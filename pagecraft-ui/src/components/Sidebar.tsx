import type { BookWithPages } from "../lib/api";

type SidebarProps = {
  book: BookWithPages;
  artStyleNames: Record<string, string>;
  selectedPageId: string | null;
  generatingIllus: Record<string, boolean>;
  illusErrors: Record<string, string | null>;
  onSelectPage: (id: string) => void;
};

function Sidebar({
  book,
  artStyleNames,
  selectedPageId,
  generatingIllus,
  illusErrors,
  onSelectPage,
}: SidebarProps) {
  const pages = book.pages ?? [];

  return (
    <aside className="lg:sticky lg:top-5 h-fit flex flex-col gap-5">
      {/* Book settings */}
      <div className="bg-brutal-paper border-[3px] border-brutal-ink rounded-2xl shadow-[8px_8px_0_#161616] p-4">
        <div className="flex items-center gap-1.5 mb-3.5 px-1">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-gray-600 flex-shrink-0"
          >
            <rect x="5" y="11" width="14" height="9" rx="1.5" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <p className="text-[12px] font-extrabold tracking-wider uppercase text-gray-600">
            Book settings
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-[11px] font-extrabold tracking-wider uppercase text-gray-500 mb-1">
              Character
            </p>
            <p className="text-[13.5px] font-semibold leading-snug">
              {book.character_desc.slice(0, 100) + "..."}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-extrabold tracking-wider uppercase text-gray-500 mb-1">
              Art style
            </p>
            <p className="text-[13.5px] font-semibold">
              {artStyleNames[book.art_style_id] ?? book.art_style_id}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-extrabold tracking-wider uppercase text-gray-500 mb-1">
              Synopsis
            </p>
            <p className="text-[13.5px] font-semibold leading-snug">
              {book.synopsis.slice(0, 100) + "..."}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-extrabold tracking-wider uppercase text-gray-500 mb-1">
              Page count
            </p>
            <span className="inline-flex items-center gap-1.5 font-extrabold text-[12px] tracking-wide px-3 py-1 border-2 border-brutal-ink rounded-full shadow-[2px_2px_0_#161616] bg-brutal-blue text-white">
              {book.page_count} pages
            </span>
          </div>
        </div>

        <div className="flex items-start gap-1.5 mt-4 pt-3.5 border-t-2 border-dashed border-brutal-ink/20">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-gray-600 flex-shrink-0 mt-0.5"
          >
            <rect x="5" y="11" width="14" height="9" rx="1.5" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <p className="text-[11.5px] text-gray-600 font-medium m-0 leading-snug">
            Locked once crafting starts.
          </p>
        </div>
      </div>

      {/* Page tabs */}
      <div className="bg-brutal-paper border-[3px] border-brutal-ink rounded-2xl shadow-[8px_8px_0_#161616] p-4">
        <p className="text-[12px] font-extrabold tracking-wider uppercase text-gray-600 mb-3 px-1">
          Pages
        </p>
        <nav className="flex flex-col gap-2">
          {pages.map((p) => {
            const generating = generatingIllus[p.id] ?? false;
            const illusErr = illusErrors[p.id] ?? null;
            const isActive = p.id === selectedPageId;
            let statusChip = "bg-gray-200 text-gray-500";
            let statusLabel = "Locked";
            let statusIcon: React.ReactNode = (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <rect x="5" y="11" width="14" height="9" rx="1.5" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            );
            if (illusErr) {
              statusChip = "bg-brutal-red text-white";
              statusLabel = "Illustration failed";
              statusIcon = (
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M12 9v4M12 17h.01M10.3 3.86L1.8 18a1.5 1.5 0 0 0 1.3 2.25h17.8a1.5 1.5 0 0 0 1.3-2.25L13.7 3.86a1.5 1.5 0 0 0-2.6 0z" />
                </svg>
              );
            } else if (generating) {
              statusChip = "bg-brutal-yellow";
              statusLabel = "Generating…";
              statusIcon = (
                <svg
                  className="animate-spin"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M12 2a10 10 0 1 0 10 10" />
                </svg>
              );
            } else if (p.image_r2_key) {
              statusChip = "bg-brutal-green";
              statusLabel = "Story & art ready";
              statusIcon = (
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              );
            } else if (
              p.page_number === 1 ||
              pages.find((pp) => pp.page_number === p.page_number - 1)
                ?.image_r2_key
            ) {
              statusChip = "bg-brutal-blue text-white";
              statusLabel = "Ready to illustrate";
              statusIcon = (
                <span className="block w-2 h-2 rounded-full bg-current" />
              );
            }

            return (
              <button
                key={p.id}
                onClick={() => onSelectPage(p.id)}
                className={`flex items-center gap-2.5 text-left font-bold text-[13.5px] px-3 py-2.5 border-2 border-brutal-ink rounded-lg transition-all duration-150 ${
                  isActive
                    ? "bg-brutal-yellow -translate-x-0.5 -translate-y-0.5 shadow-[5px_5px_0_#161616]"
                    : "bg-brutal-paper shadow-[3px_3px_0_#161616] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#161616]"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full border-2 border-brutal-ink flex items-center justify-center flex-shrink-0 ${statusChip}`}
                >
                  {statusIcon}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block leading-tight">
                    Page {p.page_number}
                  </span>
                  <span className="block text-[10.5px] font-semibold text-gray-600 leading-tight truncate">
                    {statusLabel}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;

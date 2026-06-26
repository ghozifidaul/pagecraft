import type { Page } from "../lib/api";

type PageDetailProps = {
  page: Page;
  totalPages: number;
  pages: Page[];
  storyDraft: string;
  onStoryChange: (value: string) => void;
  dirty: boolean;
  saving: boolean;
  storyError: string | null;
  storyFeedbackOpen: boolean;
  storyFeedbackValue: string;
  onStoryFeedbackChange: (value: string) => void;
  onToggleStoryFeedback: () => void;
  onSaveStory: () => void;
  onRegenStory: () => void;
  generatingIllustration: boolean;
  illustrationError: string | null;
  illusFeedbackOpen: boolean;
  illusFeedbackValue: string;
  onIllusFeedbackChange: (value: string) => void;
  onToggleIllusFeedback: () => void;
  onGenerateIllustration: () => void;
  onRegenIllus: () => void;
  regeneratingStory?: boolean;
  regeneratingIllus?: boolean;
};

type PageStatus = "done" | "generating" | "error" | "locked" | "ready";

function getPageStatus(
  page: Page,
  allPages: Page[],
  generating: boolean,
  error: string | null,
): PageStatus {
  if (error) return "error";
  if (generating) return "generating";
  if (page.image_r2_key) return "done";
  if (page.page_number > 1) {
    const prev = allPages.find((p) => p.page_number === page.page_number - 1);
    if (prev && !prev.image_r2_key) return "locked";
  }
  return "ready";
}

const STATUS_META: Record<
  PageStatus,
  { label: string; chip: string }
> = {
  done: { label: "Story & art ready", chip: "bg-brutal-green" },
  error: { label: "Illustration failed", chip: "bg-brutal-red text-white" },
  ready: { label: "Ready to illustrate", chip: "bg-brutal-blue text-white" },
  locked: { label: "Locked", chip: "bg-gray-200 text-gray-500" },
  generating: { label: "Generating…", chip: "bg-brutal-yellow" },
};

function FeedbackBlock({
  title,
  placeholder,
  value,
  onChange,
  onSubmit,
  onCancel,
  loading,
}: {
  title: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <div className="mt-3 border-2 border-brutal-ink rounded-xl p-4 bg-[#EFE6FC]">
      <p className="font-bold text-[13.5px] mb-2">{title}</p>
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full font-medium text-[14px] border-[2.5px] border-brutal-ink rounded-[9px] px-3 py-2.5 bg-brutal-paper shadow-[3px_3px_0_#161616] transition-all duration-150 focus:outline-none focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[5px_5px_0_#161616]"
      />
      <div className="flex gap-2 mt-3">
        <button
          onClick={onSubmit}
          disabled={loading || !value.trim()}
          className="font-bold text-[13px] px-3.5 py-2 border-[2.5px] border-brutal-ink rounded-lg shadow-[3px_3px_0_#161616] bg-brutal-purple text-white transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#161616] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#161616] disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none"
        >
          {loading ? "Working..." : "Regenerate"}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="font-bold text-[13px] px-3.5 py-2 border-[2.5px] border-brutal-ink rounded-lg shadow-[3px_3px_0_#161616] bg-brutal-paper transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#161616] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#161616] disabled:opacity-45 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function IllustrationPlaceholder({
  children,
  dashed = false,
}: {
  children: React.ReactNode;
  dashed?: boolean;
}) {
  const border = dashed ? "border-dashed" : "border-solid";
  return (
    <div
      className={`w-full aspect-[4/3] rounded-xl border-[3px] ${border} border-brutal-ink flex items-center justify-center bg-gray-50 overflow-hidden`}
    >
      {children}
    </div>
  );
}

export default function PageDetail({
  page,
  totalPages,
  pages,
  storyDraft,
  onStoryChange,
  dirty,
  saving,
  storyError,
  storyFeedbackOpen,
  storyFeedbackValue,
  onStoryFeedbackChange,
  onToggleStoryFeedback,
  onSaveStory,
  onRegenStory,
  generatingIllustration,
  illustrationError,
  illusFeedbackOpen,
  illusFeedbackValue,
  onIllusFeedbackChange,
  onToggleIllusFeedback,
  onGenerateIllustration,
  onRegenIllus,
  regeneratingStory = false,
  regeneratingIllus = false,
}: PageDetailProps) {
  const status = getPageStatus(page, pages, generatingIllustration, illustrationError);
  const meta = STATUS_META[status];

  return (
    <>
      <div className="flex items-center justify-between mb-4 px-1 flex-wrap gap-2">
        <h2 className="text-[20px] font-extrabold">
          Page {page.page_number} <span className="text-gray-500 font-semibold text-[15px]">of {totalPages}</span>
        </h2>
        <span
          className={`inline-flex items-center gap-1.5 font-extrabold text-[12px] tracking-wide px-3 py-1.5 border-2 border-brutal-ink rounded-full shadow-[2px_2px_0_#161616] ${meta.chip}`}
        >
          {meta.label}
        </span>
      </div>

      <div className="bg-brutal-paper border-[3px] border-brutal-ink rounded-2xl shadow-[8px_8px_0_#161616] p-5 sm:p-6 mb-5">
        <label className="block font-bold text-[13.5px] mb-2">Story text</label>
        <textarea
          rows={4}
          value={storyDraft}
          onChange={(e) => onStoryChange(e.target.value)}
          className="w-full font-medium text-[14.5px] border-[3px] border-brutal-ink rounded-[9px] px-3.5 py-3 bg-brutal-paper shadow-[4px_4px_0_#161616] transition-all duration-150 focus:outline-none focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[6px_6px_0_#161616]"
        />
        {storyError && (
          <p className="text-[13px] font-semibold text-brutal-red mt-2">{storyError}</p>
        )}
        <div className="flex items-center justify-between flex-wrap gap-2 mt-3">
          <button
            onClick={onToggleStoryFeedback}
            disabled={saving}
            className="font-bold text-[13px] px-3.5 py-2 border-[2.5px] border-brutal-ink rounded-lg shadow-[3px_3px_0_#161616] bg-brutal-blue text-white transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#161616] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#161616] disabled:opacity-45 disabled:cursor-not-allowed"
          >
            Regenerate with feedback
          </button>
          <button
            onClick={onSaveStory}
            disabled={!dirty || saving}
            className={`font-bold text-[13px] px-3.5 py-2 border-[2.5px] border-brutal-ink rounded-lg shadow-[3px_3px_0_#161616] bg-brutal-green transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#161616] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#161616] ${!dirty || saving ? "opacity-45 cursor-not-allowed pointer-events-none" : ""}`}
          >
            {saving ? "Saving..." : dirty ? "Save changes" : "Saved"}
          </button>
        </div>
        {storyFeedbackOpen && (
          <FeedbackBlock
            title="Regenerate this page's story"
            placeholder="What should change about this page?"
            value={storyFeedbackValue}
                  onChange={onStoryFeedbackChange}
                  onSubmit={onRegenStory}
                  onCancel={onToggleStoryFeedback}
                  loading={regeneratingStory}
          />
        )}
      </div>

      <div className="bg-brutal-paper border-[3px] border-brutal-ink rounded-2xl shadow-[8px_8px_0_#161616] p-5 sm:p-6">
        <label className="block font-bold text-[13.5px] mb-3">Illustration</label>

        {status === "done" && (
          <>
            <div className="w-full aspect-[4/3] rounded-xl border-[3px] border-brutal-ink shadow-[4px_4px_0_#161616] flex items-center justify-center bg-[#FFFBF2] overflow-hidden">
              {page.imageUrl ? (
                <img
                  src={page.imageUrl}
                  alt={`Page ${page.page_number} illustration`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm text-gray-500 font-medium">Image unavailable</span>
              )}
            </div>
            <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 font-extrabold text-[12px] px-3 py-1 border-2 border-brutal-ink rounded-full bg-brutal-green">
                Generated
              </span>
              <button
                onClick={onToggleIllusFeedback}
                className="font-bold text-[13px] px-3.5 py-2 border-[2.5px] border-brutal-ink rounded-lg shadow-[3px_3px_0_#161616] bg-brutal-blue text-white transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#161616] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#161616]"
              >
                Regenerate with feedback
              </button>
            </div>
            {illusFeedbackOpen && (
              <FeedbackBlock
                title="Generate a different illustration"
                placeholder="What should change about this picture?"
                value={illusFeedbackValue}
                onChange={onIllusFeedbackChange}
                onSubmit={onRegenIllus}
                onCancel={onToggleIllusFeedback}
                loading={regeneratingIllus}
              />
            )}
          </>
        )}

        {status === "generating" && (
          <IllustrationPlaceholder dashed>
            <div className="flex flex-col items-center justify-center gap-2">
              <svg className="animate-spin" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2a10 10 0 1 0 10 10" />
              </svg>
              <p className="text-[13px] font-bold text-gray-600">Generating illustration…</p>
            </div>
          </IllustrationPlaceholder>
        )}

        {status === "error" && (
          <>
            <div className="flex items-start gap-3 border-[3px] border-brutal-ink rounded-xl px-[18px] py-4 shadow-[5px_5px_0_#161616] mb-3 bg-[#FFE7E7]">
              <div className="w-[30px] h-[30px] rounded-lg border-[2.5px] border-brutal-ink flex items-center justify-center font-extrabold bg-brutal-paper flex-shrink-0">
                !
              </div>
              <div>
                <strong className="block text-[14.5px] mb-0.5">Generation failed</strong>
                <p className="text-[13.5px] text-gray-800 m-0">
                  {illustrationError || "illustration generation failed — try again"}
                </p>
              </div>
            </div>
            <IllustrationPlaceholder dashed>
              <button
                onClick={onGenerateIllustration}
                className="inline-flex items-center gap-2 font-bold text-[14px] border-[3px] border-brutal-ink rounded-brutal px-5 py-2.5 shadow-[4px_4px_0_#161616] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#161616] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#161616] bg-brutal-yellow"
              >
                Try again
              </button>
            </IllustrationPlaceholder>
          </>
        )}

        {status === "locked" && (
          <IllustrationPlaceholder dashed>
            <div className="flex flex-col items-center justify-center gap-2 opacity-70">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-500">
                <rect x="5" y="11" width="14" height="9" rx="1.5" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              <p className="text-[13px] font-bold text-gray-500 text-center px-6">
                Finish page {page.page_number - 1}'s illustration first
              </p>
            </div>
          </IllustrationPlaceholder>
        )}

        {status === "ready" && (
          <IllustrationPlaceholder dashed>
            <button
              onClick={onGenerateIllustration}
              className="inline-flex items-center gap-2 font-bold text-[14px] border-[3px] border-brutal-ink rounded-brutal px-5 py-2.5 shadow-[4px_4px_0_#161616] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#161616] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#161616] bg-brutal-yellow"
            >
              Generate illustration
            </button>
          </IllustrationPlaceholder>
        )}

        <p className="text-xs text-gray-600 font-medium mt-3">
          Illustrations generate one page at a time, in order — the next page unlocks once this one succeeds.
        </p>
      </div>
    </>
  );
}

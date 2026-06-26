import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import PageDetail from "../components/PageDetail";
import Alert from "../components/ui/Alert";
import useBook from "../hooks/useBook";
import {
  ApiError,
  getArtStyles,
  updatePageStory,
  regeneratePageStory,
  generatePageIllustration,
  regeneratePageIllustration,
} from "../lib/api";

function BookCraft() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { book, loading, error, fetch, patchPage } = useBook(bookId ?? "");

  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [artStyleNames, setArtStyleNames] = useState<Record<string, string>>(
    {},
  );
  const pages = book?.pages ?? [];

  const [storyDrafts, setStoryDrafts] = useState<Record<string, string>>({});
  const [savingStories, setSavingStories] = useState<Record<string, boolean>>(
    {},
  );
  const [storyErrors, setStoryErrors] = useState<Record<string, string | null>>(
    {},
  );
  const [regeneratingStories, setRegeneratingStories] = useState<
    Record<string, boolean>
  >({});
  const [storyFeedbackOpen, setStoryFeedbackOpen] = useState(false);
  const [storyFeedbackValue, setStoryFeedbackValue] = useState("");

  const [generatingIllus, setGeneratingIllus] = useState<
    Record<string, boolean>
  >({});
  const [illusErrors, setIllusErrors] = useState<Record<string, string | null>>(
    {},
  );
  const [regeneratingIllus, setRegeneratingIllus] = useState<
    Record<string, boolean>
  >({});
  const [illusFeedbackOpen, setIllusFeedbackOpen] = useState(false);
  const [illusFeedbackValue, setIllusFeedbackValue] = useState("");

  useEffect(() => {
    if (!bookId) {
      navigate("/gallery", { replace: true });
    }
  }, []);

  useEffect(() => {
    fetch();
  }, []);

  useEffect(() => {
    getArtStyles()
      .then((styles) => {
        const map: Record<string, string> = {};
        styles.forEach((s) => {
          map[s.id] = s.name;
        });
        setArtStyleNames(map);
      })
      .catch(() => {});
  }, []);

  const effectivePageId = selectedPageId ?? pages[0]?.id ?? null;
  const selectedPage = pages.find((p) => p.id === effectivePageId) ?? null;
  const selectedDraft = selectedPageId
    ? storyDrafts[selectedPageId]
    : undefined;
  const currentStoryText =
    selectedDraft !== undefined
      ? selectedDraft
      : (selectedPage?.page_story ?? "");

  function selectPage(id: string) {
    setSelectedPageId(id);
    setStoryFeedbackOpen(false);
    setIllusFeedbackOpen(false);
  }

  function storyDirty(page: import("../lib/api").Page): boolean {
    const draft = storyDrafts[page.id];
    return draft !== undefined && draft !== page.page_story;
  }

  function clearDraft(pageId: string) {
    setStoryDrafts((prev) => {
      const next = { ...prev };
      delete next[pageId];
      return next;
    });
  }

  async function handleSaveStory(pageId: string) {
    const page = pages.find((p) => p.id === pageId);
    if (!page) return;
    const draft = storyDrafts[pageId];
    if (draft === undefined || draft === page.page_story) return;

    setSavingStories((prev) => ({ ...prev, [pageId]: true }));
    setStoryErrors((prev) => ({ ...prev, [pageId]: null }));
    try {
      const updated = await updatePageStory(bookId!, pageId, draft);
      patchPage(updated);
      clearDraft(pageId);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to save story.";
      setStoryErrors((prev) => ({ ...prev, [pageId]: msg }));
    } finally {
      setSavingStories((prev) => ({ ...prev, [pageId]: false }));
    }
  }

  async function handleRegenStory(pageId: string) {
    if (!storyFeedbackValue.trim()) return;

    setRegeneratingStories((prev) => ({ ...prev, [pageId]: true }));
    setStoryErrors((prev) => ({ ...prev, [pageId]: null }));
    try {
      const updated = await regeneratePageStory(
        bookId!,
        pageId,
        storyFeedbackValue,
      );
      patchPage(updated);
      clearDraft(pageId);
      setStoryFeedbackOpen(false);
      setStoryFeedbackValue("");
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to regenerate story.";
      setStoryErrors((prev) => ({ ...prev, [pageId]: msg }));
    } finally {
      setRegeneratingStories((prev) => ({ ...prev, [pageId]: false }));
    }
  }

  async function handleGenerateIllustration(pageId: string) {
    setGeneratingIllus((prev) => ({ ...prev, [pageId]: true }));
    setIllusErrors((prev) => ({ ...prev, [pageId]: null }));
    try {
      const updated = await generatePageIllustration(bookId!, pageId);
      patchPage(updated);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "illustration generation failed — try again";
      setIllusErrors((prev) => ({ ...prev, [pageId]: msg }));
    } finally {
      setGeneratingIllus((prev) => ({ ...prev, [pageId]: false }));
    }
  }

  async function handleRegenIllustration(pageId: string) {
    if (!illusFeedbackValue.trim()) return;

    setRegeneratingIllus((prev) => ({ ...prev, [pageId]: true }));
    setIllusErrors((prev) => ({ ...prev, [pageId]: null }));
    try {
      const updated = await regeneratePageIllustration(
        bookId!,
        pageId,
        illusFeedbackValue,
      );
      patchPage(updated);
      setIllusFeedbackOpen(false);
      setIllusFeedbackValue("");
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to regenerate illustration.";
      setIllusErrors((prev) => ({ ...prev, [pageId]: msg }));
    } finally {
      setRegeneratingIllus((prev) => ({ ...prev, [pageId]: false }));
    }
  }

  if (!bookId) return null;

  return (
    <div className="min-h-screen pb-16">
      {/* Navbar */}
      <header className="px-4 pt-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3 flex-wrap px-4">
          <button
            onClick={() => navigate("/gallery")}
            className="hidden sm:inline-flex items-center gap-1.5 font-bold text-[13px] border-[2.5px] border-brutal-ink rounded-lg px-3 py-2 shadow-[3px_3px_0_#161616] bg-brutal-paper transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#161616] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#161616]"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Gallery
          </button>
          <div className="w-10 h-10 flex-shrink-0 rounded-lg border-[2.5px] border-brutal-ink shadow-[2px_2px_0_#161616] bg-brutal-yellow flex items-center justify-center font-extrabold text-[13px]">
            PC
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-600 leading-tight">
              Book crafting
            </p>
            <h1 className="text-[18px] sm:text-[19px] font-extrabold leading-tight truncate">
              {loading ? "Loading..." : (book?.title ?? "")}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-5">
        {/* Error state */}
        {error && (
          <Alert variant="error" title="Couldn't load book">
            {error}
            <div className="mt-3">
              <button
                onClick={fetch}
                className="font-bold text-[13px] px-3.5 py-2 border-[2.5px] border-brutal-ink rounded-lg shadow-[3px_3px_0_#161616] bg-brutal-paper transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#161616]"
              >
                Try again
              </button>
            </div>
          </Alert>
        )}

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            <div className="h-64 rounded-2xl border-[3px] border-brutal-ink bg-brutal-paper shadow-[8px_8px_0_#161616] p-4 animate-pulse" />
            <div className="h-96 rounded-2xl border-[3px] border-brutal-ink bg-brutal-paper shadow-[8px_8px_0_#161616] p-6 animate-pulse" />
          </div>
        )}

        {/* Main grid */}
        {!loading && !error && book && (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            {/* Sidebar */}
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
                        onClick={() => selectPage(p.id)}
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

            {/* Detail panel */}
            <section>
              {selectedPage ? (
                <PageDetail
                  key={selectedPage.id}
                  page={selectedPage}
                  totalPages={book.page_count}
                  pages={pages}
                  storyDraft={currentStoryText}
                  onStoryChange={(value) => {
                    if (selectedPageId) {
                      setStoryDrafts((prev) => ({
                        ...prev,
                        [selectedPageId]: value,
                      }));
                    }
                  }}
                  dirty={selectedPageId ? storyDirty(selectedPage) : false}
                  saving={savingStories[selectedPage.id] ?? false}
                  storyError={storyErrors[selectedPage.id] ?? null}
                  storyFeedbackOpen={storyFeedbackOpen}
                  storyFeedbackValue={storyFeedbackValue}
                  onStoryFeedbackChange={setStoryFeedbackValue}
                  onToggleStoryFeedback={() => setStoryFeedbackOpen((v) => !v)}
                  onSaveStory={() => handleSaveStory(selectedPage.id)}
                  regeneratingStory={
                    regeneratingStories[selectedPage.id] ?? false
                  }
                  onRegenStory={() => handleRegenStory(selectedPage.id)}
                  generatingIllustration={
                    generatingIllus[selectedPage.id] ?? false
                  }
                  illustrationError={illusErrors[selectedPage.id] ?? null}
                  illusFeedbackOpen={illusFeedbackOpen}
                  illusFeedbackValue={illusFeedbackValue}
                  onIllusFeedbackChange={setIllusFeedbackValue}
                  onToggleIllusFeedback={() => setIllusFeedbackOpen((v) => !v)}
                  onGenerateIllustration={() =>
                    handleGenerateIllustration(selectedPage.id)
                  }
                  regeneratingIllus={
                    regeneratingIllus[selectedPage.id] ?? false
                  }
                  onRegenIllus={() => handleRegenIllustration(selectedPage.id)}
                />
              ) : (
                <div className="bg-brutal-paper border-[3px] border-brutal-ink rounded-2xl shadow-[8px_8px_0_#161616] p-6">
                  <p className="text-sm font-medium text-gray-600">
                    {pages.length === 0
                      ? "No pages found."
                      : "Select a page from the sidebar."}
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default BookCraft;

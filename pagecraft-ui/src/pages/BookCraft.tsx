import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import BookCraftHeader from "../components/BookCraftHeader";
import PageDetail from "../components/PageDetail";
import Sidebar from "../components/Sidebar";
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
      <BookCraftHeader loading={loading} title={book?.title ?? ""} />

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
            <Sidebar
              book={book}
              artStyleNames={artStyleNames}
              selectedPageId={selectedPageId}
              generatingIllus={generatingIllus}
              illusErrors={illusErrors}
              onSelectPage={selectPage}
            />

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

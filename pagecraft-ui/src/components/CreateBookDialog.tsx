import { useState } from "react";
import Modal from "./Modal";
import Input from "./ui/Input";
import Textarea from "./ui/Textarea";
import Button from "./ui/Button";
import Alert from "./ui/Alert";
import {
  ApiError,
  createBook,
  getArtStyles,
  type ArtStyle,
  type BookWithPages,
} from "../lib/api";

const SYNOPSIS_LIMIT = 2000;
const PAGE_MIN = 6;
const PAGE_MAX = 10;
const PAGE_DEFAULT = 6;

type CreateBookDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (book: BookWithPages) => void;
};

function CreateBookForm({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: (book: BookWithPages) => void;
}) {
  const [artStyles, setArtStyles] = useState<ArtStyle[] | null>(null);
  const [stylesError, setStylesError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [characterDesc, setCharacterDesc] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [pageCount, setPageCount] = useState<number>(PAGE_DEFAULT);
  const [artStyleId, setArtStyleId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (artStyles === null && stylesError === null) {
    getArtStyles()
      .then((styles) => {
        setArtStyles(styles);
        setArtStyleId((current) => current || styles[0]?.id || "");
      })
      .catch(() => setStylesError("Failed to load art styles."));
  }

  const synopsisOver = synopsis.length > SYNOPSIS_LIMIT;
  const pageCountValid =
    Number.isInteger(pageCount) &&
    pageCount >= PAGE_MIN &&
    pageCount <= PAGE_MAX;
  const valid =
    title.trim().length > 0 &&
    characterDesc.trim().length > 0 &&
    synopsis.trim().length > 0 &&
    pageCountValid &&
    artStyleId.length > 0 &&
    !synopsisOver;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const book = await createBook({
        title: title.trim(),
        synopsis: synopsis.trim(),
        characterDesc: characterDesc.trim(),
        pageCount,
        artStyleId,
      });
      onCreated(book);
    } catch (err) {
      if (err instanceof ApiError && err.details && err.details.length > 0) {
        setSubmitError(err.details.join(" · "));
      } else if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Failed to create book.");
      }
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {submitError && (
        <Alert variant="error" title="Couldn't create book">
          {submitError}
        </Alert>
      )}
      {stylesError && (
        <Alert variant="error" title="Couldn't load art styles">
          {stylesError}
        </Alert>
      )}

      <div className="flex gap-6">
        <div className="flex flex-col gap-5 min-w-1/2">
          <div>
            <label
              htmlFor="title"
              className="block font-bold text-[13.5px] mb-2"
            >
              Title
            </label>
            <Input
              id="title"
              placeholder="The Curious Robot"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              maxLength={120}
            />
          </div>

          <div>
            <label
              htmlFor="character"
              className="block font-bold text-[13.5px] mb-2"
            >
              Character
            </label>
            <Input
              id="character"
              placeholder="A small rust-colored robot named Pip"
              value={characterDesc}
              onChange={(e) => setCharacterDesc(e.target.value)}
              disabled={submitting}
            />
            <p className="text-xs text-gray-600 font-medium mt-1.5">
              Describe the main character so illustrations stay consistent
              across pages.
            </p>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label
                htmlFor="synopsis"
                className="block font-bold text-[13.5px]"
              >
                Synopsis
              </label>
              <span
                className={`text-xs font-semibold ${synopsisOver ? "text-brutal-red" : "text-gray-600"}`}
              >
                {synopsis.length} / {SYNOPSIS_LIMIT}
              </span>
            </div>
            <Textarea
              id="synopsis"
              rows={4}
              placeholder="A short summary of the story..."
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <span className="block font-bold text-[13.5px] mb-2">
              Pages{" "}
              <span className="text-gray-600 font-medium">
                (min {PAGE_MIN}, max {PAGE_MAX})
              </span>
            </span>
            <div className="inline-flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPageCount((c) => Math.max(PAGE_MIN, c - 1))}
                disabled={submitting || pageCount <= PAGE_MIN}
                aria-label="Decrease page count"
                className="w-9 h-9 rounded-lg border-[3px] border-brutal-ink bg-brutal-paper font-extrabold shadow-[2px_2px_0_#161616] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#161616] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#161616] transition-all duration-150 disabled:opacity-45 disabled:pointer-events-none"
              >
                −
              </button>
              <span className="w-10 text-center font-extrabold text-[18px]">
                {pageCount}
              </span>
              <button
                type="button"
                onClick={() => setPageCount((c) => Math.min(PAGE_MAX, c + 1))}
                disabled={submitting || pageCount >= PAGE_MAX}
                aria-label="Increase page count"
                className="w-9 h-9 rounded-lg border-[3px] border-brutal-ink bg-brutal-paper font-extrabold shadow-[2px_2px_0_#161616] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#161616] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#161616] transition-all duration-150 disabled:opacity-45 disabled:pointer-events-none"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="md:border-l-[3px] md:border-brutal-ink md:pl-6">
          <span className="block font-bold text-[13.5px] mb-2">Art style</span>
          {artStyles === null ? (
            <p className="text-sm text-gray-600 font-medium">
              Loading styles...
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {artStyles.map((style) => {
                const selected = artStyleId === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    disabled={submitting}
                    onClick={() => setArtStyleId(style.id)}
                    className={`text-left rounded-xl border-[3px] bg-brutal-paper overflow-hidden shadow-[3px_3px_0_#161616] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#161616] disabled:opacity-60 disabled:pointer-events-none ${
                      selected ? "border-brutal-green" : "border-brutal-ink"
                    }`}
                  >
                    <div className="aspect-square bg-brutal-ink/10 relative">
                      <img
                        src={style.imageUrl}
                        alt={style.name}
                        className="w-full h-full object-cover"
                      />
                      {selected && (
                        <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full border-[2px] border-brutal-ink bg-brutal-green flex items-center justify-center font-extrabold text-[12px]">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="px-2.5 py-1.5">
                      <p className="font-extrabold text-[12.5px] leading-tight">
                        {style.name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!valid || submitting}
        >
          {submitting ? "Generating..." : "Generate Book"}
        </Button>
      </div>
    </form>
  );
}

export default function CreateBookDialog({
  open,
  onClose,
  onCreated,
}: CreateBookDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create a Book"
      maxWidth="max-w-[80vw]"
    >
      {open && <CreateBookForm onCancel={onClose} onCreated={onCreated} />}
    </Modal>
  );
}

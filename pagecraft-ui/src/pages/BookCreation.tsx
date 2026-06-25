import { useState } from "react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

type ArtStyle = "Watercolor" | "Storybook" | "Comic" | "Pixel Art";

const artStyles: ArtStyle[] = ["Watercolor", "Storybook", "Comic", "Pixel Art"];

function BookCreation() {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<ArtStyle>("Watercolor");

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8">
        <span className="block text-[12px] font-extrabold tracking-wider uppercase text-gray-600 mb-1">
          New Book
        </span>
        <h1 className="text-[28px] md:text-[32px] font-extrabold tracking-tight">
          Create a Book
        </h1>
        <p className="mt-2 text-sm font-medium text-gray-700">
          Give your story a title and a short prompt. Pick an art style and we'll generate the
          first page.
        </p>
      </header>

      <Card>
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div>
            <label htmlFor="title" className="block font-bold text-[13.5px] mb-2">
              Title
            </label>
            <Input
              id="title"
              placeholder="The Curious Robot"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="prompt" className="block font-bold text-[13.5px] mb-2">
              Story prompt
            </label>
            <Textarea
              id="prompt"
              rows={5}
              placeholder="A small robot discovers a hidden garden on a rainy afternoon..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <p className="text-xs text-gray-600 font-medium mt-1.5">
              A sentence or two is plenty. You can refine each page after generation.
            </p>
          </div>

          <div>
            <span className="block font-bold text-[13.5px] mb-2">Art style</span>
            <div className="flex flex-wrap gap-2">
              {artStyles.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStyle(s)}
                  className="focus:outline-none"
                >
                  <Badge variant={style === s ? "green" : "paper"}>{s}</Badge>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" disabled={!title || !prompt}>
              Generate Book
            </Button>
          </div>
        </form>
      </Card>
    </main>
  );
}

export default BookCreation;

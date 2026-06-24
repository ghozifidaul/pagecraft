import { createInteraction, extractOutputImage } from "../lib/gemini";
import type {
  IllustrationGenInput,
  IllustrationGenOutput,
  GeminiInputStep,
  GeminiInputContent,
} from "../types/ai";

const MODEL = "gemini-3.1-flash-image";

function buildPrompt(input: IllustrationGenInput): string {
  const parts: string[] = [
    `Generate an illustration for a children's book page.`,
    `Art style: ${input.artStyleDescription}`,
    `Character description: ${input.characterDesc}`,
    `Scene description: ${input.pageStory}`,
  ];

  if (input.feedback) {
    parts.push(`Feedback for revision: ${input.feedback}`);
  }

  return parts.join("\n");
}

function buildInputParts(input: IllustrationGenInput): GeminiInputStep[] {
  const content: GeminiInputContent[] = [];

  if (input.previousPageImage) {
    content.push({
      type: "image",
      data: input.previousPageImage,
      mime_type: "image/png",
    });
  }

  if (input.artStyleImageBase64) {
    content.push({
      type: "image",
      data: input.artStyleImageBase64,
      mime_type: "image/png",
    });
  }

  content.push({ type: "text", text: buildPrompt(input) });

  return [{ type: "user_input", content }];
}

export async function generatePageIllustration(
  apiKey: string,
  input: IllustrationGenInput,
): Promise<IllustrationGenOutput> {
  const result = await createInteraction(apiKey, {
    model: MODEL,
    input: buildInputParts(input),
    generation_config: {
      temperature: 0.4,
    },
    response_format: {
      type: "image",
      aspect_ratio: "16:9",
      image_size: "512",
    },
  });

  if (result.status === "failed") {
    throw new Error(result.error ?? "Illustration generation failed");
  }

  const image = extractOutputImage(result.steps);

  if (!image) {
    throw new Error("No image returned from illustration generation");
  }

  return image;
}

export async function regeneratePageIllustration(
  apiKey: string,
  input: IllustrationGenInput,
): Promise<IllustrationGenOutput> {
  if (!input.feedback) {
    throw new Error("Feedback is required for illustration regeneration");
  }

  return generatePageIllustration(apiKey, input);
}

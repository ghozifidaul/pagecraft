import { createInteraction, extractOutputImage } from "../lib/gemini";
import type {
  IllustrationGenInput,
  IllustrationRegenInput,
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

  return parts.join("\n");
}

function buildRegenPrompt(input: IllustrationRegenInput): string {
  const parts: string[] = [
    `Revise the illustration for a children's book page based on feedback.`,
    `Art style: ${input.artStyleDescription}`,
    `Character description: ${input.characterDesc}`,
    `Scene description: ${input.pageStory}`,
    `Feedback: ${input.feedback}`,
  ];

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
      aspect_ratio: "4:3",
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
  input: IllustrationRegenInput,
): Promise<IllustrationGenOutput> {
  const content: GeminiInputContent[] = [];

  if (input.artStyleImageBase64) {
    content.push({
      type: "image",
      data: input.artStyleImageBase64,
      mime_type: "image/png",
    });
  }

  content.push({
    type: "image",
    data: input.currentPageImageBase64,
    mime_type: input.mimeType,
  });

  content.push({ type: "text", text: buildRegenPrompt(input) });

  const result = await createInteraction(apiKey, {
    model: MODEL,
    input: [{ type: "user_input", content }],
    generation_config: {
      temperature: 0.4,
    },
    response_format: {
      type: "image",
      aspect_ratio: "4:3",
      image_size: "512",
    },
  });

  if (result.status === "failed") {
    throw new Error(result.error ?? "Illustration regeneration failed");
  }

  const image = extractOutputImage(result.steps);

  if (!image) {
    throw new Error("No image returned from illustration regeneration");
  }

  return image;
}

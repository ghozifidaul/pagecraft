import type { ArtStyle } from "../types/db"

const ART_STYLES: ArtStyle[] = [
  {
    id: "watercolor",
    name: "Watercolor",
    description: "Soft, flowing watercolor paintings with gentle color blends",
    imageUrl: "/art-styles/watercolor.png",
  },
  {
    id: "pixel-art",
    name: "Pixel Art",
    description: "Retro 8-bit video game style pixel illustrations",
    imageUrl: "/art-styles/pixel-art.png",
  },
  {
    id: "cartoon",
    name: "Cartoon",
    description: "Bright, bold cartoon illustrations with clean lines",
    imageUrl: "/art-styles/cartoon.png",
  },
  {
    id: "sketch",
    name: "Pencil Sketch",
    description: "Hand-drawn pencil sketch style illustrations",
    imageUrl: "/art-styles/sketch.png",
  },
  {
    id: "paper-cutout",
    name: "Paper Cutout",
    description: "Layered paper cutout style with textured backgrounds",
    imageUrl: "/art-styles/paper-cutout.png",
  },
]

export function getArtStyles(): ArtStyle[] {
  return ART_STYLES
}

export function getArtStyleById(id: string): ArtStyle | undefined {
  return ART_STYLES.find((s) => s.id === id)
}

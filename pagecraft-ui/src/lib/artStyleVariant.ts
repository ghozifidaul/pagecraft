const ART_STYLE_VARIANTS: Array<
  "blue" | "pink" | "purple" | "yellow" | "green"
> = ["blue", "pink", "purple", "yellow", "green"];

export function artStyleVariant(id: string): (typeof ART_STYLE_VARIANTS)[number] {
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return ART_STYLE_VARIANTS[hash % ART_STYLE_VARIANTS.length];
}

# Neo-Brutalism Theme — Implementation Guide

A colorful neo-brutalist design system built with Tailwind CSS utility classes (no custom stylesheet). This doc gives you everything needed to reproduce the look consistently across new components: tokens, the "physics" of the style (borders/shadows/motion), and copy-paste recipes for common components.

---

## 1. Setup

### Font

Load **Plus Jakarta Sans** in `<head>` (or via `@import` / `next/font` if using a framework):

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700&display=swap"
  rel="stylesheet"
/>
```

### Tailwind config

Add this to `tailwind.config.js` (or the inline `tailwind.config` script if using the Play CDN):

```js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
      },
      colors: {
        brutal: {
          ink: "#161616",
          paper: "#FFFBF2",
          yellow: "#FFD400",
          pink: "#FF5CA8",
          blue: "#3AA6FF",
          green: "#27C281",
          purple: "#9B5DE5",
          red: "#FF4242",
        },
      },
      borderRadius: {
        brutal: "10px",
      },
    },
  },
};
```

Set the page base:

```html
<body class="font-sans bg-brutal-paper text-brutal-ink"></body>
```

Optional dotted background texture (use sparingly, e.g. only on hero/full-bleed sections):

```html
<div
  class="bg-[radial-gradient(circle,rgba(22,22,22,0.07)_1.5px,transparent_1.5px)] bg-[length:22px_22px]"
></div>
```

---

## 2. Design tokens

| Token           | Hex       | Tailwind class                                            | Use for                            |
| --------------- | --------- | --------------------------------------------------------- | ---------------------------------- |
| `brutal-ink`    | `#161616` | `bg-brutal-ink` / `text-brutal-ink` / `border-brutal-ink` | borders, body text, dark surfaces  |
| `brutal-paper`  | `#FFFBF2` | `bg-brutal-paper`                                         | page background, card/input fill   |
| `brutal-yellow` | `#FFD400` | `bg-brutal-yellow`                                        | primary actions, highlights        |
| `brutal-pink`   | `#FF5CA8` | `bg-brutal-pink`                                          | accent, avatars, hero highlight    |
| `brutal-blue`   | `#3AA6FF` | `bg-brutal-blue`                                          | secondary actions, info            |
| `brutal-green`  | `#27C281` | `bg-brutal-green`                                         | success, active/online states      |
| `brutal-purple` | `#9B5DE5` | `bg-brutal-purple`                                        | featured/pro tier, premium accents |
| `brutal-red`    | `#FF4242` | `bg-brutal-red`                                           | danger, errors                     |

**Rule:** every surface color pairs with `border-brutal-ink` and dark text, _except_ `brutal-pink`, `brutal-purple`, and `brutal-red`, which get `text-white` for contrast. Never use a 9th color — pull from this palette only.

### Typography scale

All text is Plus Jakarta Sans. Hierarchy comes from **weight + size**, not from mixing typefaces.

| Role            | Classes                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------- |
| Hero heading    | `text-[40px] sm:text-[56px] md:text-[76px] font-extrabold leading-[0.98] tracking-tight` |
| Section heading | `text-[28px] md:text-[32px] font-extrabold tracking-tight`                               |
| Card heading    | `text-[19px] font-extrabold`                                                             |
| Body            | `text-sm` or `text-[14.5px]` `font-medium`/`font-semibold`                               |
| Label / eyebrow | `text-[12px] font-extrabold tracking-wider uppercase`                                    |
| Caption / hint  | `text-xs text-gray-600 font-medium`                                                      |

---

## 3. The core "physics" of this style

Everything in this system follows the same three rules. Apply them to _any_ new interactive element, not just the components listed below.

### a) Border

Always a thick, solid, dark border:

- Standard: `border-[3px] border-brutal-ink`
- Small/compact elements (badges, checkboxes): `border-2 border-brutal-ink` or `border-[2.5px] border-brutal-ink`

### b) Offset shadow (no blur, ever)

Hard drop shadow offset down-right, same color as the border. Three sizes:

| Size | Class                        | Use for                                              |
| ---- | ---------------------------- | ---------------------------------------------------- |
| sm   | `shadow-[3px_3px_0_#161616]` | small badges, tab buttons, compact controls          |
| md   | `shadow-[5px_5px_0_#161616]` | buttons, navbar, inputs (use `4px_4px_0` for inputs) |
| lg   | `shadow-[8px_8px_0_#161616]` | cards, modal (`10px_10px_0` for modal)               |

### c) Motion states

Buttons and clickable cards **lift on hover** and **press down on click** — the shadow shrinks as the element moves toward it:

```html
class="transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5
hover:shadow-[7px_7px_0_#161616] active:translate-x-0.5 active:translate-y-0.5
active:shadow-[1px_1px_0_#161616]"
```

(Scale the hover/active shadow numbers proportionally to the element's base shadow size — e.g. a `3px` base goes to `5px` on hover and `1px` on active.)

Inputs **lift on focus** instead:

```html
class="focus:outline-none focus:-translate-x-0.5 focus:-translate-y-0.5
focus:shadow-[6px_6px_0_#161616]"
```

Cards **lift on hover** with no press state (they're not clickable buttons):

```html
class="transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1
hover:shadow-[11px_11px_0_#161616]"
```

### d) Radius

- Buttons / inputs: `rounded-brutal` (10px) or `rounded-[9px]`
- Cards / modal: `rounded-2xl`
- Pills / badges / switches / circular avatars: `rounded-full`
- Small chips / icon tiles: `rounded-lg` / `rounded-xl`

Never use `rounded-none` (too harsh) or anything above `rounded-2xl` (too soft) — this theme is "neo," not raw brutalism.

### e) Decorative tilt (optional, sparing use)

Hero/marketing elements can get a slight rotation for personality: `-rotate-1`, `-rotate-2`, `rotate-[4deg]`, `rotate-[8deg]`. Don't rotate functional UI (buttons, inputs, cards in a grid).

---

## 4. Component recipes

### Button

Base + variant pattern. Swap the bg color class for each variant; everything else stays identical.

```html
<button
  class="inline-flex items-center gap-2 font-bold text-[15px] border-[3px] border-brutal-ink
  rounded-brutal px-[22px] py-3 shadow-[5px_5px_0_#161616] transition-all duration-150
  hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#161616]
  active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#161616]
  focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-brutal-ink focus-visible:outline-offset-2
  bg-brutal-yellow"
>
  Primary
</button>
```

- **Variants:** `bg-brutal-yellow` (primary) · `bg-brutal-blue` (secondary) · `bg-brutal-green` (success) · `bg-brutal-red text-white` (danger) · `bg-brutal-ink text-brutal-paper` (dark) · `bg-brutal-paper` (ghost)
- **Small:** drop to `text-[13px] px-3.5 py-2 rounded-lg`, shadows `shadow-[3px_3px_0_#161616]` → hover `5px` → active `1px`
- **Disabled:** `opacity-45 cursor-not-allowed` + drop hover/active classes
- **Icon-only:** `p-3 rounded-[10px]`, no text, square aspect

### Badge / tag

```html
<span
  class="inline-flex items-center gap-1.5 font-extrabold text-[12.5px] tracking-wide
  px-3 py-1.5 border-2 border-brutal-ink rounded-full shadow-[2px_2px_0_#161616] bg-brutal-yellow"
>
  New
</span>
```

Swap `bg-brutal-*`, add `text-white` for pink/purple/red. Optional status dot: `<span class="w-[7px] h-[7px] rounded-full bg-brutal-ink"></span>`.

### Card

```html
<div
  class="bg-brutal-paper border-[3px] border-brutal-ink rounded-2xl shadow-[8px_8px_0_#161616] p-6
  transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[11px_11px_0_#161616]"
>
  ...
</div>
```

Featured/highlighted variant: swap `bg-brutal-paper` for a saturated color (e.g. `bg-brutal-purple text-white`) and flip child text/icon colors to white/the base color.

### Input / textarea / select

```html
<input
  class="w-full font-medium text-[14.5px] border-[3px] border-brutal-ink rounded-[9px]
  px-3.5 py-3 bg-brutal-paper shadow-[4px_4px_0_#161616] transition-all duration-150
  focus:outline-none focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[6px_6px_0_#161616]"
/>
```

Label above, bold: `class="block font-bold text-[13.5px] mb-2"`. Hint below: `class="text-xs text-gray-600 font-medium mt-1.5"`.

### Checkbox

Built from a hidden input + a sibling `<span>` styled via `peer-checked:` (no pseudo-elements):

```html
<label
  class="relative inline-flex items-center gap-2.5 cursor-pointer font-semibold text-[14.5px]"
>
  <input type="checkbox" class="peer sr-only" />
  <span
    class="w-[22px] h-[22px] rounded-md border-[2.5px] border-brutal-ink bg-brutal-paper
    shadow-[2px_2px_0_#161616] peer-checked:bg-brutal-green flex items-center justify-center
    text-[12px] font-extrabold text-transparent peer-checked:text-brutal-ink flex-shrink-0"
    >✓</span
  >
  Label text
</label>
```

### Radio

Same idea, circular, with a separate dot span (also a sibling of the input so `peer-checked:` applies directly):

```html
<label
  class="relative inline-flex items-center gap-2.5 cursor-pointer font-semibold text-[14.5px]"
>
  <input type="radio" name="group" class="peer sr-only" />
  <span
    class="relative w-[22px] h-[22px] rounded-full border-[2.5px] border-brutal-ink bg-brutal-paper
    shadow-[2px_2px_0_#161616] peer-checked:bg-brutal-pink flex-shrink-0"
  ></span>
  <span
    class="absolute left-[6px] w-2 h-2 rounded-full bg-brutal-ink opacity-0 peer-checked:opacity-100"
  ></span>
  Label text
</label>
```

### Toggle switch

Track + thumb, both siblings of the hidden input:

```html
<label class="relative inline-flex items-center cursor-pointer">
  <input type="checkbox" class="peer sr-only" />
  <span
    class="w-[50px] h-[28px] rounded-full border-[2.5px] border-brutal-ink bg-brutal-paper
    shadow-[2px_2px_0_#161616] peer-checked:bg-brutal-blue transition-colors duration-150"
  ></span>
  <span
    class="absolute left-[4px] top-[4px] w-[18px] h-[18px] rounded-full bg-brutal-ink
    peer-checked:bg-brutal-paper peer-checked:translate-x-5 transition-transform duration-150"
  ></span>
</label>
```

> **Important pattern:** for any custom form control, keep the `<input class="peer sr-only">` and every visual `<span>` as **direct siblings** inside the same `<label>`. `peer-checked:` only works on true siblings of the peer element — don't nest the visual indicator inside another wrapper or the variant won't fire.

### Alert / banner

```html
<div
  class="flex items-start gap-3 border-[3px] border-brutal-ink rounded-xl px-[18px] py-4
  shadow-[5px_5px_0_#161616] mb-4 bg-[#E4FBEE]"
>
  <div
    class="w-[30px] h-[30px] rounded-lg border-[2.5px] border-brutal-ink flex items-center
    justify-center font-extrabold bg-brutal-paper flex-shrink-0"
  >
    ✓
  </div>
  <div>
    <strong class="block text-[14.5px] mb-0.5">Title</strong>
    <p class="text-[13.5px] text-gray-800 m-0">Message</p>
  </div>
  <button
    class="ml-auto font-extrabold text-base px-1.5 py-0.5 rounded-md hover:bg-black/10"
  >
    ✕
  </button>
</div>
```

Background fills (pastel, not from the main palette — these stay desaturated so text stays readable): success `#E4FBEE`, warning `#FFF6DC`, error `#FFE7E7`, info `#EFE6FC`.

### Navbar

```html
<div
  class="flex items-center justify-between flex-wrap gap-3 border-[3px] border-brutal-ink
  rounded-2xl px-5 py-3.5 bg-brutal-paper shadow-[5px_5px_0_#161616]"
></div>
```

Logo mark: small `bg-brutal-yellow border-[2.5px] border-brutal-ink rounded-lg shadow-[2px_2px_0_#161616]` square block.

### Tabs

Tab bar with bottom border; active tab gets a fill + small lift:

```html
<button
  class="font-extrabold text-[13.5px] px-4 py-2 border-2 border-brutal-ink rounded-lg
  shadow-[3px_3px_0_#161616] bg-brutal-paper"
>
  Tab
</button>
<!-- active state -->
<button
  class="... bg-brutal-green -translate-x-0.5 -translate-y-0.5 shadow-[5px_5px_0_#161616]"
>
  Active Tab
</button>
```

### Progress bar

```html
<div
  class="w-full h-[18px] border-[2.5px] border-brutal-ink rounded-full bg-brutal-paper
  shadow-[2px_2px_0_#161616] overflow-hidden"
>
  <div
    class="h-full border-r-[2.5px] border-brutal-ink bg-brutal-blue"
    style="width:68%"
  ></div>
</div>
```

### Avatar / avatar stack

```html
<div
  class="w-[54px] h-[54px] rounded-xl border-[3px] border-brutal-ink flex items-center
  justify-center font-extrabold text-lg shadow-[3px_3px_0_#161616] bg-brutal-yellow"
>
  AK
</div>
```

Stack with `-ml-3.5` on each subsequent avatar to overlap.

### Modal

```html
<div
  class="fixed inset-0 bg-brutal-ink/55 flex items-center justify-center z-50 p-5"
>
  <div
    class="bg-brutal-paper border-[3px] border-brutal-ink rounded-2xl max-w-[420px] w-full
    p-7 shadow-[10px_10px_0_#161616] relative"
  >
    <button
      class="absolute top-3.5 right-3.5 border-[2.5px] border-brutal-ink bg-brutal-paper
      w-8 h-8 rounded-lg font-extrabold shadow-[2px_2px_0_#161616]"
    >
      ✕
    </button>
    ...
  </div>
</div>
```

Close on overlay click by checking `event.target === overlayElement`.

---

## 5. Do's and don'ts

**Do:**

- Reuse the exact shadow/border/radius values above for any new component — consistency is the whole point of this system.
- Keep all text in Plus Jakarta Sans; vary weight (400–800) and size for hierarchy instead of switching fonts.
- Keep shadows flat (`0` blur) and offset down-right only.
- Use `peer`/`peer-checked:` for any custom form control instead of relying on `:checked` pseudo-classes directly (since the visual layer is a separate `<span>`, not the input itself).

**Don't:**

- Don't introduce soft/blurred shadows (`shadow-lg`, `shadow-xl` defaults) — they break the style instantly.
- Don't use colors outside the 8-token palette.
- Don't round corners past `rounded-2xl` or remove rounding entirely (`rounded-none`).
- Don't add rotation/tilt to grids of repeated functional components (cards in a list, form fields) — reserve tilt for one-off hero/marketing accents.
- Don't write custom CSS classes/files for styling — everything should be expressible as Tailwind utilities (arbitrary value syntax `[...]` is fine and expected for shadows/colors not in the default scale).

---

## 6. Production note

If the project uses a Tailwind build step (Tailwind CLI, PostCSS, Next.js, Vite, etc.) rather than the Play CDN, just drop the `theme.extend` block from Section 1 into the project's real `tailwind.config.js`/`tailwind.config.ts` — no other changes needed. The class names used throughout this doc (`bg-brutal-yellow`, `rounded-brutal`, etc.) will resolve identically once that config is in place.

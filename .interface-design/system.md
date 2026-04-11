# Design System

Extracted from codebase on 2026-04-10. Source of truth for spacing, color, typography, and component patterns.

---

## Spacing

Base unit: **4px**

| Token | Value | Usage |
|-------|-------|-------|
| 1 | 4px | Tight gaps, icon padding |
| 2 | 8px | Default inner padding, small gaps |
| 3 | 12px | Card inner padding, medium gaps |
| 4 | 16px | Section padding, horizontal page margin |
| 5 | 20px | Large section padding |
| 6 | 24px | Section spacing |
| 8 | 32px | Page-level vertical spacing |

**Primary patterns:**
- Page horizontal padding: `px-4` (16px) or `px-5` (20px)
- Card internal padding: `p-4` (16px)
- List item gaps: `space-y-2.5` or `gap-3`
- Section vertical padding: `py-8` (32px)

---

## Border Radius

Base: `--radius: 0.625rem` (10px)

| Token | Value | Usage |
|-------|-------|-------|
| sm | 6px | Subtle rounding |
| md | 8px | Form inputs |
| lg | 10px | Default (matches base) |
| xl | 14px | Cards, buttons, containers |
| full | 9999px | Pills, badges, avatars |

**Decision tree:**
- Pills, badges, avatars, tag chips → `rounded-full`
- Cards, primary buttons, containers → `rounded-xl`
- Form inputs → `rounded-md`
- General elements → `rounded` (base 10px)

---

## Depth

**Strategy: Borders-only** (114 border vs 7 shadow occurrences)

Shadows are reserved exclusively for overlays and modals.

| Layer | Method |
|-------|--------|
| Surface separation | `border border-border` (1px solid, subtle gray) |
| Section dividers | `border-b` or `border-t` |
| Active tab indicator | `border-b-2 border-primary` |
| Modal/overlay | `shadow-lg` or `shadow-2xl` |

---

## Color

Color space: **OKLch** (perceptual uniformity). Full dark mode support via CSS variable remapping.

### Semantic Tokens

| Token | Role | Light Value |
|-------|------|-------------|
| `background` | Page background | oklch(0.976 0.003 247) — near-white |
| `card` | Card/modal surface | oklch(1 0 0) — pure white |
| `muted` | Secondary surface | oklch(0.961 0.003 247) — light gray |
| `primary` | Brand accent | oklch(0.591 0.207 253) — purple/blue |
| `destructive` | Error/danger | oklch(0.577 0.245 27.325) — red |
| `border` | Default border | oklch(0.955 0.004 247) — very light gray |
| `foreground` | Primary text | (inherits from theme) |
| `muted-foreground` | Secondary text | (inherits from theme) |

### Domain Colors

| Token | Role | Hue |
|-------|------|-----|
| `opinion-agree` | Agree vote | Purple |
| `opinion-disagree` | Disagree vote | Red |
| `opinion-neutral` | Neutral vote | Gray |
| `ai-summary-*` | AI section gradient | Blue → Lavender |

### Usage Frequency
- `bg-muted`: 111x — dominant secondary background
- `text-muted-foreground`: 84x — dominant secondary text
- `border-border`: 29x — dominant border color
- `bg-card`: 18x — card surfaces
- `text-primary`: 13x — accent text

---

## Typography

Font family: **Pretendard** (Korean-optimized sans-serif)

### Scale (CSS Custom Properties)

| Token | Size | Line-height | Weight | Usage |
|-------|------|-------------|--------|-------|
| display | 22px | 28px | 800 | Page titles |
| heading-lg | 20px | 26px | 700 | Section titles |
| heading-md | 15px | 20px | 600 | Subsection titles |
| heading-sm | 14px | 19px | 600 | Card titles |
| body-md | 14px | 19px | 400 | Body text (default) |
| body-sm | 13px | 17px | 400 | Secondary body text |
| label-md | 13px | 16px | 500 | Labels, metadata |
| label-sm | 12px | 18px | 400 | Small labels |
| micro-md | 11px | 16px | 500 | Timestamps, counts |
| micro-sm | 10px | 14px | 500 | Badges, smallest text |

### Tailwind Utility Frequency
- `text-sm` (14px): 33x — most common
- `text-xs` (12px): 13x
- `text-lg` (18px): 10x
- `text-[12px]`: 21x — custom pixel sizes also common
- `text-[13px]`: 12x

### Weight Distribution
- `font-bold` (700): 32x — headlines, primary CTAs
- `font-semibold` (600): 30x — section headers
- `font-medium` (500): 14x — labels, secondary text

---

## Components

### Button

| Variant | Height | Padding | Radius | Example |
|---------|--------|---------|--------|---------|
| Primary | h-12 (48px) | px-6 | rounded-xl | Vote buttons, main CTAs |
| Secondary | h-8 (32px) | px-3 py-1.5 | rounded-full | Tag filters, toggles |
| Icon | h-8 (32px) | p-2 | rounded-full | Icon-only actions |
| Form submit | h-12 (48px) | px-4 py-2 | rounded-md | Login, signup |

### Card

```
border border-border bg-card rounded-xl p-4
```

- Hover state: `hover:bg-muted/10 transition-colors`
- Internal spacing: `space-y-2.5` or `gap-3`
- Variant (comment): `rounded-r-xl border border-l-0 border-border bg-card p-3`

### Form Input

```
px-3 py-2 border border-border rounded-md bg-background
```

- Focus: `focus:ring-2 focus:ring-primary`
- Placeholder: `text-muted-foreground`

### Badge / Chip

```
px-2 py-0.5 rounded-full text-xs font-medium bg-muted
```

- Active state: `bg-primary text-white`

---

## Layout

### Container
- Primary max-width: `max-w-4xl` (896px)
- Form/modal max-width: `max-w-md` (448px)
- Centered: `mx-auto`

### Breakpoint
- Desktop: `768px` (`--breakpoint-desktop`)
- Mobile-first approach

### Page Structure
```
<div class="max-w-4xl mx-auto px-4 py-8">
  <!-- page content -->
</div>
```

---

## Conventions

1. **Semantic tokens over raw values** — use `bg-card`, `text-muted-foreground`, `border-border` instead of hex/oklch
2. **Borders for depth, not shadows** — shadows only for overlays
3. **rounded-full for interactive chips** — rounded-xl for containers
4. **Consistent interactive feedback** — `hover:bg-muted/10 transition-colors` on clickable cards
5. **Mobile-first** — single breakpoint at 768px desktop

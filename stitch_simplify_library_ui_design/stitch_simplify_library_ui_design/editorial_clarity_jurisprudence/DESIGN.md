---
name: Editorial Clarity & Jurisprudence
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#464554'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#777586'
  outline-variant: '#c7c4d7'
  surface-tint: '#5148d7'
  primary: '#2a14b4'
  on-primary: '#ffffff'
  primary-container: '#4338ca'
  on-primary-container: '#c1beff'
  inverse-primary: '#c3c0ff'
  secondary: '#a73a00'
  on-secondary: '#ffffff'
  secondary-container: '#fd651e'
  on-secondary-container: '#571a00'
  tertiary: '#00423c'
  on-tertiary: '#ffffff'
  tertiary-container: '#005c54'
  on-tertiary-container: '#69d6c9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#100069'
  on-primary-fixed-variant: '#372abf'
  secondary-fixed: '#ffdbce'
  secondary-fixed-dim: '#ffb599'
  on-secondary-fixed: '#370e00'
  on-secondary-fixed-variant: '#7f2b00'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: 0em
  body-reading-lg:
    fontFamily: Source Serif 4
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 34px
    letterSpacing: 0.005em
  body-reading-md:
    fontFamily: Source Serif 4
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0.005em
  body-ui:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-ui-semibold:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: 0em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-statute:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.06em
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4.5rem
  container-reader: 44rem
  container-catalog: 75rem
  sidebar-toc-width: 18rem
---

## Brand & Style

This design system translates the dense, intimidating architecture of Indonesian jurisprudence into an approachable, structured digital reading experience. Rooted in the ethos of *"Sederhanakan narasi, percepat pemahaman,"* the design language bridges the gap between academic authority and digital consumer efficiency.

The target audience spans law students digesting thick statutory treatises, legal practitioners reviewing regulatory summaries on tight timelines, and citizens seeking legal literacy. The UI evokes:
- **Intellectual Clarity:** Removing cognitive weight through clear spatial hierarchies (Buku &rarr; Bab &rarr; Sub-bab).
- **Institutional Gravitas:** Avoiding childish abstractions; retaining the solemnity and trustworthiness expected of legal texts.
- **Serenity & Focus:** A distraction-free reading canvas reminiscent of premium physical print paired with responsive modern affordances.

### Design Movement: Contemporary Editorial Modernism
The visual system blends clean modern SaaS principles (neutral frames, crisp line markers, balanced white space) with classical editorial craftsmanship (measured line lengths, deliberate typographic rhythm, warm paper-tinted reading surfaces). It rejects both cold hyper-utilitarian wireframes and archaic, leather-bound legal clichés.

## Colors

The palette balances legal solemnity with vibrant navigational clarity. Every tone is calibrated against pure white (`#FFFFFF`) and paper backgrounds (`#FAFAF9`) to surpass WCAG 2.1 AA requirements (maintaining minimum contrast ratios of 4.5:1 for body copy and 3:1 for interactive states).

### Color Roles

- **Primary (`#4338CA` - Deep Regal Indigo):** Represents legal authority, insight, and navigational grounding. Applied to primary actions, active navigation tabs, parent chapter headers, and high-level milestones.
- **Secondary (`#EA580C` - Warm Juridical Amber):** Drives directional focus, key takeaways, highlighted precedent notes (*"Poin Kunci"*), bookmarks, and primary conversion triggers.
- **Tertiary (`#0D9488` - Crisp Legal Mint/Teal):** Used for taxonomy metadata, statute verification indicators, pass/fail judicial statuses, validated constitutional articles (*"Pasal Berlaku"*), and progress completion badges.
- **Neutral Surface Palette:**
  - **Base Canvas (`#FAFAF9`):** A soft, unbleached paper warm tone that minimizes eye strain during extended reading sessions.
  - **Elevated Canvas (`#FFFFFF`):** Pure white container surfaces for floating summaries, reader drawers, and structured flashcards.
  - **Border & Dividers (`#E2E8F0`):** Hairline slate dividers representing the spine and structural boundaries of codified laws.
  - **Deep Ink Neutral (`#0F172A` / `#1E293B`):** High-density charcoal ink avoiding the harshness of pure black `#000000`, optimized for long-form Indonesian syntax.

## Typography

The typographic strategy pairs **Plus Jakarta Sans** (an ergonomic, geometric sans-serif engineered for Indonesian and Latin clarity in navigational UI) with **Source Serif 4** (a workhorse editorial serif designed for uninterrupted optical flow across extended analytical narratives).

### Typographic Roles & Rules
- **Structural Framing (Plus Jakarta Sans):** Applied to book catalogs, breadcrumbs, chapter outlines (*Bab/Sub-bab*), UI buttons, and legal badges. Its clear apertures preserve legibility even at micro sizes (`label-statute`).
- **Deep Reading Canvas (Source Serif 4):** Reserved exclusively for reading panels, summary distillations, statutory interpretations, and commentary. Line-height is intentionally generous (1.6x to 1.7x) to allow effortless parsing of compound Indonesian legal sentences.
- **Reading Measure Constraint:** Long-form reader body lines must not exceed 68 characters per line (`max-w-prose` / ~680px) to prevent cognitive fatigue.

## Layout & Spacing

The layout model uses an 8pt architectural rhythm structured around two distinct operational modes: **The Directory Layout** and **The Distraction-Free Reader**.

### Layout Systems

1. **Directory & Dashboard Grid (12-Column Responsive):**
   - **Desktop (&ge; 1280px):** 12 columns, 24px gutters, 40px outer margins. Max-width `1200px` (`container-catalog`).
   - **Tablet (768px - 1279px):** 8 columns, 16px gutters, 24px outer margins. Sidebar collapses into an overlay drawer.
   - **Mobile (&lt; 768px):** 4 columns, 12px gutters, 16px outer margins. Linear vertical stacking.

2. **Hierarchical 3-Pane Reader (Desktop):**
   - **Pane A (Spine/Outline):** Fixed at `18rem` (`sidebar-toc-width`). Shows Buku &rarr; Bab &rarr; Sub-bab hierarchical tree with progress pips.
   - **Pane B (Distilled Content Canvas):** Centered viewport with `44rem` (`container-reader`) max width, floating on `#FAFAF9` canvas with 48px vertical padding.
   - **Pane C (Contextual Drawer):** Collapsible drawer (320px) reserved for article cross-references (*"Rujukan Pasal"*), case notes, and flash definitions.

3. **Mobile Reader Reflow:**
   - Panes A and C convert into sliding bottom sheets triggered by an omnipresent, floating bottom bar containing reading progress percentage, table-of-contents trigger, and type-size controls.

## Elevation & Depth

This system avoids heavy drop shadows in favor of **tonal surface separation** and **delicate, tinted ambient depth** resembling premium bookbinding.

### Depth Hierarchy
- **Level 0 (Flat Paper Base - `#FAFAF9`):** Base canvas for application background and non-interactive areas.
- **Level 1 (Card & Section Surfaces - `#FFFFFF`):** High-clarity white surfaces bordered with a 1px hairline rule (`#E2E8F0`). Shadow: `0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)`.
- **Level 2 (Interactive Floating Modules & Chapter Cards):** Hovered book cards and active sub-chapter panels. Shadow: `0 10px 15px -3px rgba(67, 56, 202, 0.05), 0 4px 6px -4px rgba(15, 23, 42, 0.04)`, retaining a 1px border.
- **Level 3 (Overlays, Drawers & Reading Bottom Sheets):** Fixed table-of-contents navigation and statute preview modals. Surface utilizes 95% opacity with an 8px backdrop blur (`backdrop-blur-md`) over reading material. Shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.06)`.

## Shapes

The interface balances precision and warmth through controlled curvature. Elements rely primarily on `rounded-xl` (12px to 16px) for cards, modals, and preview containers, giving the platform an inviting, modern personality that counteracts dry legal statutes.

- **Primary Cards & Panels:** `rounded-xl` (1rem / 16px) creates a polished, framed presentation for book overviews and chapter cards.
- **Form Controls & Action Buttons:** `rounded-lg` (0.75rem / 12px) provides an ergonomic touch target while signaling clickable utility.
- **Status Pills & Statute Badges:** Fully rounded `rounded-full` pills encapsulate tags (*"Hukum Pidana"*, *"UU No. 1 Tahun 2023"*, *"Ringkasan 5 Menit"*) to immediately distinguish them from functional content blocks.

## Components

### 1. Buttons
- **Primary Action:** Solid Deep Regal Indigo (`#4338CA`) background, `#FFFFFF` text, `rounded-lg`, subtle active scale down (`0.98`). Hover introduces an elevated indigo tint (`#3730A3`).
- **Secondary / Highlight Action:** Solid Warm Amber (`#EA580C`) background, `#FFFFFF` text. Reserved strictly for primary reader CTAs: *"Baca Ringkasan"*, *"Beli Ringkasan"*, or *"Simpan Catatan"*.
- **Ghost / Outline Button:** 1px border (`#E2E8F0`), neutral text (`#334155`), transparent background. On hover: `#F1F5F9` surface with `#0F172A` text.
- **Icon Button:** 40x40px square with `rounded-lg` for reader utilities (font-size toggle, night shift, bookmark).

### 2. Category & Statute Badges (Chips)
- **Legal Topic Chip:** Subtle tinted backgrounds with contrasting text. For example, Criminal Law uses Indigo Tint (`bg-indigo-50 text-indigo-800`), Civil Law uses Slate (`bg-slate-100 text-slate-700`).
- **Statute Verification Pill:** Crisp Mint background (`#CCFBF1`), dark teal text (`#0F766E`), 1px border (`#99F6E4`). Displays official legal codes (*e.g., "KUHP Baru"*).

### 3. Hierarchical Chapter Cards (Buku &rarr; Bab &rarr; Sub-bab)
- **Book Summary Card:** Elevated white card with 1px border (`#E2E8F0`), `rounded-xl`. Displays book cover ratio (1:1.4), reading time, verified status tag, and a 3-tier outline counter (*"12 Bab • 48 Sub-bab"*).
- **Sub-chapter Accordion Item:** Nestable row component. Uses an indicator bar on the left edge: active reading node flashes Regal Indigo, unread is `#E2E8F0`, completed is Crisp Mint (`#0D9488`).

### 4. Reading Canvas Callouts (Poin Kunci & Catatan Kritis)
- **"Poin Kunci" (Key Takeaways):** Bordered card with a 4px left accent border in Warm Amber (`#EA580C`), pale amber tinted surface (`#FFFBEB`), accompanied by a mini lightning or beacon icon. Text rendered in medium-weight sans-serif for rapid scanning.
- **"Dasar Hukum" (Statutory Citation Box):** Pale teal tinted surface (`#F0FDFA`) with a 1px border (`#5EEAD4`), displaying referenced articles in monospaced or structured typography for exact citations.

### 5. Input Fields & Search
- **Search Bar (Global Statutory Search):** Sits high on the screen with `rounded-xl`, high contrast icon prefix, `#FFFFFF` surface, and 1px border (`#CBD5E1`). Focus ring highlights with Regal Indigo outline (`ring-2 ring-indigo-500/20 border-indigo-600`).
- **Annotation & Highlighting Tools:** Selection menu appears directly above selected text inside the reader, styled in deep ink (`#0F172A`) containing: "Sorot Kuning", "Simpan Catatan", and "Salin Kutipan".
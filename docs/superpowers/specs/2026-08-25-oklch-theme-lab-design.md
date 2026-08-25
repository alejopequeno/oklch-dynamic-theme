# OKLCH Theme Lab — Design Specification

## Goal

Build a Next.js tool that turns one chosen color into a complete shadcn/ui theme. It must let a developer inspect Light and Dark themes together, tune their surface rules independently, and copy deterministic CSS tokens for `:root` and `.dark`.

The visual language should carry over the portfolio's restrained dark chrome and its color-exploration components. The chosen color, rather than the tool's shell, is the visual focus.

## Product direction

### Domain

The interface is a token laboratory: hue, chroma, lightness, gamut, contrast, and surfaces are the core concepts. It is not a general dashboard or a literal graphics editor.

### Signature interaction

Two live mini interfaces, Light and Dark, remain visible side by side. A floating inspector controls both. This makes the consequences of a token change immediately comparable without switching tabs.

### Explicit non-goals

- No HTML `<canvas>` element or visual scene/layer editor.
- No sidebar, metric-card dashboard, or fake data workspace.
- No preset persistence, accounts, sharing, or server state in v1.
- No dependency on the full shadcn component package; local preview components consume the same token names.

## Layout and responsive behavior

```tsx
<main>
  <header />
  <section className="preview-grid">
    <ThemePreview mode="light" />
    <ThemePreview mode="dark" />
  </section>
  <ThemeInspector />
</main>
```

Desktop uses a normal CSS layout with a central preview grid and a right-aligned floating inspector. The inspector overlays the viewport with a bounded width and must not be implemented with `<canvas>`. On narrower screens, the previews stack and the inspector becomes a drawer so controls preserve a usable touch target.

Each preview renders a small but real component set: a navigation row, card, buttons, input, select, badge, popover, and alert. The preview applies generated custom properties locally, so the two color modes coexist without changing document-level theme state.

The shell follows the portfolio's compact type, muted borders, concentric radii, and controlled visual density. Motion is reserved for tactile controls and copy feedback: property-specific transitions and a subtle press scale, with no entrance animation on initial load.

## Inspector and user flow

The right-side inspector is grouped into three sections.

1. **Base color**: accepts a color through the portfolio-inspired color controls, with HEX/OKLCH input, hue selection, and global vividness.
2. **Light mode** and **Dark mode**: independent advanced sections for the frozen lightness values and chroma budgets of each shadcn surface. These are collapsed by default; opening them exposes option-C-level control without hiding the immediate one-color experience.
3. **Export**: displays the generated stylesheet and provides a Copy action plus ephemeral copied feedback. Reset restores the documented initial configuration.

Any accepted change updates both previews and the export text synchronously. Input values are clamped to their configured safe ranges. The tool surfaces warnings when key foreground/background pairs have insufficient readable contrast, but does not prevent exploration.

## Theme model

The implementation uses a pure theme engine based on the portfolio article's model:

- Lightness is an explicit per-mode, per-surface control.
- The shared hue comes from the chosen base color.
- Chroma is computed from `vividness × surfaceBudget × maxChroma(lightness, hue)` so generated values remain inside displayable gamut.
- The engine produces semantic shadcn/ui token pairs such as `background`/`foreground`, `primary`/`primary-foreground`, `card`/`card-foreground`, `popover`/`popover-foreground`, `secondary`, `muted`, `accent`, `border`, `input`, `ring`, `destructive`, and their foreground tokens.

Light and Dark each retain an independent surface configuration. Shared base hue and vividness provide a coherent color family, while separate lightness and chroma budgets allow both modes to be tuned correctly.

## Component boundaries

| Unit | Responsibility | Depends on |
| --- | --- | --- |
| `theme-config` | Initial Light/Dark configs, token descriptors, value limits | Types only |
| `theme-engine` | Gamut-safe token calculation, validation helpers, `oklch()` formatting | `theme-config` types |
| `css-export` | Deterministic `:root` and `.dark` CSS serialization | Computed themes |
| `theme-lab` | Client state and orchestration of shared and per-mode configuration | Engine and UI components |
| `theme-inspector` | Accessible controls, advanced groups, reset and copy affordances | State callbacks and descriptors |
| `theme-preview` | Local CSS-variable scope and preview component composition | Computed theme |
| preview components | Render shadcn-like controls using semantic variables only | Local theme scope |

No UI component will reproduce color math. No color utility mutates React state or the DOM.

## Export format

The export is directly pasteable into a Tailwind v4/shadcn stylesheet:

```css
:root {
  --background: oklch(...);
  /* remaining light tokens */
}

.dark {
  --background: oklch(...);
  /* remaining dark tokens */
}
```

All generated colors use `oklch()` with normalized precision. The same configuration must always serialize in the same token order and value format.

## Accessibility and interaction requirements

- Every label is associated with its control; sliders expose current numeric values.
- Interactive controls have at least 44 by 44 CSS pixels of touch target on mobile.
- The input font size remains at least 16px on mobile.
- Preview text uses the generated foreground tokens, not hard-coded colors.
- Key contrast pairs produce non-blocking warning states when below their readable threshold.
- Copy feedback is announced accessibly.
- Controls use precise transitions only; never `transition: all`.

## Verification strategy

Tests are written before the production engine and cover:

- complete, correctly named token output for each mode;
- color calculation that honors the configured chroma limits;
- independent Light and Dark configurations yielding independent token sets;
- deterministic CSS serialization into `:root` and `.dark`;
- input clamping and contrast-warning behavior.

Final verification runs the focused test suite, the full test suite, ESLint, and the production Next.js build. Visual verification checks the dual previews, inspector behavior, copied stylesheet, mobile layout, and absence of initial-load animation.

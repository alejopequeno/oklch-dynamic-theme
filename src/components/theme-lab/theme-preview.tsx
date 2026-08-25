import type { CSSProperties } from "react";

import type { ComputedTheme, ThemeMode, ThemeToken } from "../../lib/theme/theme-types";

import { PreviewComponents } from "./preview-components";

export interface ThemePreviewProps {
  mode: ThemeMode;
  theme: ComputedTheme;
}

type LocalThemeStyle = CSSProperties &
  Record<`--${ThemeToken}`, string> & {
    color: "inherit";
  };

export function toCssVariables(
  tokens: Record<ThemeToken, string>,
): Record<`--${ThemeToken}`, string> {
  return {
    "--background": tokens.background,
    "--foreground": tokens.foreground,
    "--card": tokens.card,
    "--card-foreground": tokens["card-foreground"],
    "--popover": tokens.popover,
    "--popover-foreground": tokens["popover-foreground"],
    "--primary": tokens.primary,
    "--primary-foreground": tokens["primary-foreground"],
    "--secondary": tokens.secondary,
    "--secondary-foreground": tokens["secondary-foreground"],
    "--muted": tokens.muted,
    "--muted-foreground": tokens["muted-foreground"],
    "--accent": tokens.accent,
    "--accent-foreground": tokens["accent-foreground"],
    "--destructive": tokens.destructive,
    "--destructive-foreground": tokens["destructive-foreground"],
    "--border": tokens.border,
    "--input": tokens.input,
    "--ring": tokens.ring,
  };
}

/**
 * React's CSSProperties does not expose CSS custom properties. The known `color`
 * property lets this narrow, typed adapter carry the local theme token record
 * without an unsafe assertion.
 */
function toLocalThemeStyle(tokens: Record<ThemeToken, string>): LocalThemeStyle {
  return {
    color: "inherit",
    ...toCssVariables(tokens),
  };
}

export function ThemePreview({ mode, theme }: ThemePreviewProps) {
  const title = mode === "light" ? "Light mode" : "Dark mode";

  return (
    <article className="theme-preview" data-mode={mode} style={toLocalThemeStyle(theme.tokens)}>
      <div className="theme-preview-label">
        <span>Local tokens</span>
        <h2>{title}</h2>
      </div>
      <PreviewComponents />
    </article>
  );
}

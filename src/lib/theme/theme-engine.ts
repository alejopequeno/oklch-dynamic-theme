import { clampChroma, wcagContrast } from "culori";

import { MODE_LIMITS, TOKEN_DESCRIPTORS } from "./theme-config";
import type {
  ComputedTheme,
  SurfaceSettings,
  ThemeMode,
  ThemeParameters,
  ThemeSettings,
  ThemeToken,
  ThemeWarning,
} from "./theme-types";

const MINIMUM_READABLE_CONTRAST = 4.5;
const MAXIMUM_CHROMA_SAMPLE = 0.4;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function clampSurfaceSettings(settings: SurfaceSettings): SurfaceSettings {
  return {
    lightness: clamp(settings.lightness, MODE_LIMITS.lightness.min, MODE_LIMITS.lightness.max),
    chromaBudget: clamp(settings.chromaBudget, MODE_LIMITS.chromaBudget.min, MODE_LIMITS.chromaBudget.max),
  };
}

function clampThemeSettings(settings: ThemeSettings): ThemeSettings {
  return Object.fromEntries(
    TOKEN_DESCRIPTORS.map(({ name }) => [name, clampSurfaceSettings(settings[name])]),
  ) as ThemeSettings;
}

function maxChroma(lightness: number, hue: number): number {
  const color = clampChroma(
    { mode: "oklch", l: lightness, c: MAXIMUM_CHROMA_SAMPLE, h: hue },
    "oklch",
  );

  return color.c ?? 0;
}

function formatOklch(lightness: number, chroma: number, hue: number): string {
  return `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} ${hue})`;
}

export function clampParameters(parameters: ThemeParameters): ThemeParameters {
  return {
    hue: clamp(parameters.hue, MODE_LIMITS.hue.min, MODE_LIMITS.hue.max),
    vividness: clamp(parameters.vividness, MODE_LIMITS.vividness.min, MODE_LIMITS.vividness.max),
    light: clampThemeSettings(parameters.light),
    dark: clampThemeSettings(parameters.dark),
  };
}

export function buildTheme(parameters: ThemeParameters, mode: ThemeMode): ComputedTheme {
  const normalized = clampParameters(parameters);
  const settings = normalized[mode];
  const tokens = Object.fromEntries(
    TOKEN_DESCRIPTORS.map(({ name }) => {
      const surface = settings[name];
      const chroma =
        normalized.vividness * surface.chromaBudget * maxChroma(surface.lightness, normalized.hue);

      return [name, formatOklch(surface.lightness, chroma, normalized.hue)];
    }),
  ) as Record<ThemeToken, string>;

  return { mode, tokens };
}

export function getThemeWarnings(theme: ComputedTheme): ThemeWarning[] {
  return TOKEN_DESCRIPTORS.flatMap(({ name: foreground, foregroundOf: background }) => {
    if (background === undefined) {
      return [];
    }

    const contrast = wcagContrast(theme.tokens[foreground], theme.tokens[background]);
    if (contrast >= MINIMUM_READABLE_CONTRAST) {
      return [];
    }

    return [
      {
        foreground,
        background,
        contrast,
        message: `${foreground} does not meet ${MINIMUM_READABLE_CONTRAST}:1 contrast against ${background}.`,
      },
    ];
  });
}

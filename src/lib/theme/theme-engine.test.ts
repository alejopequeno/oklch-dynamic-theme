import { inGamut } from "culori";

import { DEFAULT_THEME_PARAMETERS } from "./theme-config";
import { buildTheme, clampParameters, getThemeWarnings } from "./theme-engine";

test("builds every semantic token with the requested shared hue", () => {
  const theme = buildTheme({ ...DEFAULT_THEME_PARAMETERS, hue: 255 }, "light");

  expect(Object.keys(theme.tokens)).toHaveLength(Object.keys(DEFAULT_THEME_PARAMETERS.light).length);
  expect(theme.tokens.primary).toMatch(/^oklch\(0\.480 0\.118 255\)$/);
});

test("uses normalized hue and vividness when calculating colors", () => {
  const theme = buildTheme(
    {
      ...DEFAULT_THEME_PARAMETERS,
      hue: 999,
      vividness: 2,
    },
    "light",
  );

  expect(theme.tokens.background).toMatch(/^oklch\(0\.985 0\.000 360\)$/);
});

test("keeps light and dark calculations independent", () => {
  const light = buildTheme(DEFAULT_THEME_PARAMETERS, "light");
  const dark = buildTheme(DEFAULT_THEME_PARAMETERS, "dark");

  expect(light.tokens.background).not.toBe(dark.tokens.background);
});

test("clamps values outside supported control limits without mutating settings", () => {
  const parameters = {
    ...DEFAULT_THEME_PARAMETERS,
    hue: 999,
    vividness: -1,
    light: {
      ...DEFAULT_THEME_PARAMETERS.light,
      primary: { lightness: 2, chromaBudget: -1 },
    },
  };

  const normalized = clampParameters(parameters);

  expect(normalized).toMatchObject({
    hue: 360,
    vividness: 0,
    light: { primary: { lightness: 1, chromaBudget: 0 } },
  });
  expect(parameters.light.primary).toEqual({ lightness: 2, chromaBudget: -1 });
});

test("normalizes non-finite controls to safe values", () => {
  const normalized = clampParameters({
    ...DEFAULT_THEME_PARAMETERS,
    hue: Number.NaN,
    vividness: Number.POSITIVE_INFINITY,
    light: {
      ...DEFAULT_THEME_PARAMETERS.light,
      primary: { lightness: Number.NEGATIVE_INFINITY, chromaBudget: Number.NaN },
    },
    dark: {
      ...DEFAULT_THEME_PARAMETERS.dark,
      secondary: { lightness: Number.POSITIVE_INFINITY, chromaBudget: Number.NEGATIVE_INFINITY },
    },
  });

  expect(normalized).toMatchObject({
    hue: 0,
    vividness: 0,
    light: { primary: { lightness: 0, chromaBudget: 0 } },
    dark: { secondary: { lightness: 0, chromaBudget: 0 } },
  });
});

test("keeps serialized theme tokens inside the sRGB gamut", () => {
  const theme = buildTheme(DEFAULT_THEME_PARAMETERS, "light");
  const isInSrgb = inGamut("rgb");

  expect(Object.values(theme.tokens).every(isInSrgb)).toBe(true);
});

test("truncates high-chroma serialized tokens to the gamut boundary", () => {
  const theme = buildTheme(
    {
      ...DEFAULT_THEME_PARAMETERS,
      hue: 0,
      vividness: 1,
      light: {
        ...DEFAULT_THEME_PARAMETERS.light,
        primary: { lightness: 0.1, chromaBudget: 1 },
      },
    },
    "light",
  );

  expect(theme.tokens.primary).toBe("oklch(0.100 0.040 0)");
  expect(inGamut("rgb")(theme.tokens.primary)).toBe(true);
});

test("does not warn at the WCAG AA contrast threshold", () => {
  const theme = buildTheme(DEFAULT_THEME_PARAMETERS, "light");
  const thresholdTheme = {
    ...theme,
    tokens: {
      ...theme.tokens,
      background: "color(srgb 1 1 1)",
      foreground: "color(srgb 0.46531904698148846 0.46531904698148846 0.46531904698148846)",
    },
  };

  expect(getThemeWarnings(thresholdTheme)).not.toEqual(
    expect.arrayContaining([expect.objectContaining({ foreground: "foreground", background: "background" })]),
  );
});

test("warns below the WCAG AA contrast threshold", () => {
  const theme = buildTheme(DEFAULT_THEME_PARAMETERS, "light");
  const lowContrastTheme = {
    ...theme,
    tokens: {
      ...theme.tokens,
      background: "color(srgb 1 1 1)",
      foreground: "color(srgb 0.466 0.466 0.466)",
    },
  };

  expect(getThemeWarnings(lowContrastTheme)).toEqual(
    expect.arrayContaining([expect.objectContaining({ foreground: "foreground", background: "background" })]),
  );
});

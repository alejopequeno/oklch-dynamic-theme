import { DEFAULT_THEME_PARAMETERS } from "./theme-config";
import { buildTheme, clampParameters, getThemeWarnings } from "./theme-engine";

test("builds every semantic token with the requested shared hue", () => {
  const theme = buildTheme({ ...DEFAULT_THEME_PARAMETERS, hue: 255 }, "light");

  expect(Object.keys(theme.tokens)).toHaveLength(Object.keys(DEFAULT_THEME_PARAMETERS.light).length);
  expect(theme.tokens.primary).toMatch(/^oklch\(0\.480 0\.119 255\)$/);
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

test("warns when a semantic foreground and background are too close", () => {
  const theme = buildTheme(
    {
      ...DEFAULT_THEME_PARAMETERS,
      light: {
        ...DEFAULT_THEME_PARAMETERS.light,
        background: { lightness: 0.5, chromaBudget: 0 },
        foreground: { lightness: 0.5, chromaBudget: 0 },
      },
    },
    "light",
  );

  expect(getThemeWarnings(theme)).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ foreground: "foreground", background: "background", contrast: 1 }),
    ]),
  );
});

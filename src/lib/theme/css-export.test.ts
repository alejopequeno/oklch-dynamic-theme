import { DEFAULT_THEME_PARAMETERS, TOKEN_DESCRIPTORS } from "./theme-config";
import { buildTheme } from "./theme-engine";
import { serializeThemeCss } from "./css-export";

test("serializes light and dark themes in stable shadcn blocks", () => {
  const lightTheme = buildTheme(DEFAULT_THEME_PARAMETERS, "light");
  const darkTheme = buildTheme(DEFAULT_THEME_PARAMETERS, "dark");

  const css = serializeThemeCss(lightTheme, darkTheme);
  const lightTokenLines = TOKEN_DESCRIPTORS.map(
    ({ name }) => `  --${name}: ${lightTheme.tokens[name]};`,
  );
  const darkTokenLines = TOKEN_DESCRIPTORS.map(
    ({ name }) => `  --${name}: ${darkTheme.tokens[name]};`,
  );

  expect(css).toBe([
    ":root {",
    ...lightTokenLines,
    "}",
    "",
    ".dark {",
    ...darkTokenLines,
    "}",
  ].join("\n"));
});

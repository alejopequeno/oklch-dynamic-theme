import { TOKEN_DESCRIPTORS } from "./theme-config";
import type { ComputedTheme } from "./theme-types";

function serializeBlock(selector: string, theme: ComputedTheme): string {
  const tokenLines = TOKEN_DESCRIPTORS.map(
    ({ name }) => `  --${name}: ${theme.tokens[name]};`,
  );

  return [`${selector} {`, ...tokenLines, "}"].join("\n");
}

export function serializeThemeCss(lightTheme: ComputedTheme, darkTheme: ComputedTheme): string {
  return [serializeBlock(":root", lightTheme), "", serializeBlock(".dark", darkTheme)].join("\n");
}

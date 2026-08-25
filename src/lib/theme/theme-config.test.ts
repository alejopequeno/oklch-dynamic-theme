import { DEFAULT_THEME_PARAMETERS, TOKEN_DESCRIPTORS } from "./theme-config";

test("defines complete independent initial settings for light and dark", () => {
  expect(DEFAULT_THEME_PARAMETERS.light).not.toBe(DEFAULT_THEME_PARAMETERS.dark);
  expect(TOKEN_DESCRIPTORS.map(({ name }) => name)).toEqual(
    expect.arrayContaining([
      "background",
      "foreground",
      "primary",
      "primary-foreground",
      "card",
      "border",
      "ring",
      "destructive",
    ]),
  );
});

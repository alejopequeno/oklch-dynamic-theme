export const THEME_TOKENS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
] as const;

export type ThemeToken = (typeof THEME_TOKENS)[number];
export type ThemeMode = "light" | "dark";

export interface SurfaceSettings {
  lightness: number;
  chromaBudget: number;
}

export type ThemeSettings = Record<ThemeToken, SurfaceSettings>;

export interface ThemeParameters {
  hue: number;
  vividness: number;
  light: ThemeSettings;
  dark: ThemeSettings;
}

export interface TokenDescriptor {
  name: ThemeToken;
  label: string;
  foregroundOf?: ThemeToken;
}

export interface ComputedTheme {
  mode: ThemeMode;
  tokens: Record<ThemeToken, string>;
}

export interface ThemeWarning {
  foreground: ThemeToken;
  background: ThemeToken;
  contrast: number;
  message: string;
}

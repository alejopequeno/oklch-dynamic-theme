import type { ThemeParameters, ThemeSettings, TokenDescriptor } from "./theme-types";

export const MODE_LIMITS = {
  hue: { min: 0, max: 360, step: 1 },
  vividness: { min: 0, max: 1, step: 0.01 },
  lightness: { min: 0, max: 1, step: 0.01 },
  chromaBudget: { min: 0, max: 1, step: 0.01 },
} as const;

export const TOKEN_DESCRIPTORS: readonly TokenDescriptor[] = [
  { name: "background", label: "Background" },
  { name: "foreground", label: "Foreground", foregroundOf: "background" },
  { name: "card", label: "Card" },
  { name: "card-foreground", label: "Card foreground", foregroundOf: "card" },
  { name: "popover", label: "Popover" },
  { name: "popover-foreground", label: "Popover foreground", foregroundOf: "popover" },
  { name: "primary", label: "Primary" },
  { name: "primary-foreground", label: "Primary foreground", foregroundOf: "primary" },
  { name: "secondary", label: "Secondary" },
  { name: "secondary-foreground", label: "Secondary foreground", foregroundOf: "secondary" },
  { name: "muted", label: "Muted" },
  { name: "muted-foreground", label: "Muted foreground", foregroundOf: "muted" },
  { name: "accent", label: "Accent" },
  { name: "accent-foreground", label: "Accent foreground", foregroundOf: "accent" },
  { name: "destructive", label: "Destructive" },
  { name: "destructive-foreground", label: "Destructive foreground", foregroundOf: "destructive" },
  { name: "border", label: "Border" },
  { name: "input", label: "Input" },
  { name: "ring", label: "Ring" },
] as const;

const lightSettings = {
  background: { lightness: 0.985, chromaBudget: 0.05 },
  foreground: { lightness: 0.18, chromaBudget: 0.5 },
  card: { lightness: 0.97, chromaBudget: 0.04 },
  "card-foreground": { lightness: 0.18, chromaBudget: 0.5 },
  popover: { lightness: 0.98, chromaBudget: 0.04 },
  "popover-foreground": { lightness: 0.18, chromaBudget: 0.5 },
  primary: { lightness: 0.48, chromaBudget: 1 },
  "primary-foreground": { lightness: 0.985, chromaBudget: 0.05 },
  secondary: { lightness: 0.94, chromaBudget: 0.22 },
  "secondary-foreground": { lightness: 0.25, chromaBudget: 0.45 },
  muted: { lightness: 0.93, chromaBudget: 0.12 },
  "muted-foreground": { lightness: 0.5, chromaBudget: 0.25 },
  accent: { lightness: 0.9, chromaBudget: 0.42 },
  "accent-foreground": { lightness: 0.22, chromaBudget: 0.45 },
  destructive: { lightness: 0.55, chromaBudget: 0.95 },
  "destructive-foreground": { lightness: 0.985, chromaBudget: 0.05 },
  border: { lightness: 0.86, chromaBudget: 0.16 },
  input: { lightness: 0.86, chromaBudget: 0.16 },
  ring: { lightness: 0.55, chromaBudget: 0.85 },
} satisfies ThemeSettings;

const darkSettings = {
  background: { lightness: 0.16, chromaBudget: 0.2 },
  foreground: { lightness: 0.95, chromaBudget: 0.16 },
  card: { lightness: 0.21, chromaBudget: 0.24 },
  "card-foreground": { lightness: 0.95, chromaBudget: 0.16 },
  popover: { lightness: 0.23, chromaBudget: 0.24 },
  "popover-foreground": { lightness: 0.95, chromaBudget: 0.16 },
  primary: { lightness: 0.72, chromaBudget: 0.9 },
  "primary-foreground": { lightness: 0.2, chromaBudget: 0.25 },
  secondary: { lightness: 0.29, chromaBudget: 0.3 },
  "secondary-foreground": { lightness: 0.93, chromaBudget: 0.16 },
  muted: { lightness: 0.27, chromaBudget: 0.2 },
  "muted-foreground": { lightness: 0.7, chromaBudget: 0.18 },
  accent: { lightness: 0.34, chromaBudget: 0.45 },
  "accent-foreground": { lightness: 0.95, chromaBudget: 0.16 },
  destructive: { lightness: 0.67, chromaBudget: 0.82 },
  "destructive-foreground": { lightness: 0.2, chromaBudget: 0.25 },
  border: { lightness: 0.35, chromaBudget: 0.16 },
  input: { lightness: 0.35, chromaBudget: 0.16 },
  ring: { lightness: 0.72, chromaBudget: 0.84 },
} satisfies ThemeSettings;

export const DEFAULT_THEME_PARAMETERS: ThemeParameters = {
  hue: 255,
  vividness: 0.75,
  light: lightSettings,
  dark: darkSettings,
};

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";

import { DEFAULT_THEME_PARAMETERS } from "../../lib/theme/theme-config";

import { ThemeLab } from "./theme-lab";

afterEach(() => {
  vi.restoreAllMocks();
});

test("renders isolated light and dark component previews", () => {
  render(<ThemeLab />);

  expect(screen.getByRole("heading", { name: "Light mode" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Dark mode" })).toBeVisible();
  expect(screen.getAllByRole("button", { name: "Continue" })).toHaveLength(2);
});

test("scopes distinct local token variables to previews with unique labelled headings", () => {
  render(<ThemeLab />);

  const lightPreview = screen.getByRole("heading", { name: "Light mode" }).closest("article");
  const darkPreview = screen.getByRole("heading", { name: "Dark mode" }).closest("article");
  const previewHeadings = screen.getAllByRole("heading", {
    name: "Good systems make room for better ideas.",
  });

  if (lightPreview === null || darkPreview === null) {
    throw new Error("Expected both preview articles to be rendered.");
  }

  expect(lightPreview.style.getPropertyValue("--background")).toMatch(/^oklch\(/);
  expect(darkPreview.style.getPropertyValue("--background")).toMatch(/^oklch\(/);
  expect(lightPreview.style.getPropertyValue("--background")).not.toBe(
    darkPreview.style.getPropertyValue("--background"),
  );
  expect(new Set(previewHeadings.map((heading) => heading.id)).size).toBe(2);
  expect(previewHeadings[0]?.parentElement).toHaveAttribute("aria-labelledby", previewHeadings[0]?.id);
  expect(previewHeadings[1]?.parentElement).toHaveAttribute("aria-labelledby", previewHeadings[1]?.id);
});

test("renders semantic controls in each local preview", () => {
  render(<ThemeLab />);

  expect(screen.getAllByLabelText("Project name")).toHaveLength(2);
  expect(screen.getAllByLabelText("Workspace")).toHaveLength(2);
  expect(screen.getAllByText("Live")).toHaveLength(2);
  expect(screen.getAllByRole("alert")).toHaveLength(2);
});

test("edits dark lightness without changing the light configuration", async () => {
  const user = userEvent.setup();
  render(<ThemeLab />);

  await user.click(screen.getByRole("button", { name: "Light mode" }));
  const lightControl = screen.getByLabelText("Light background lightness") as HTMLInputElement;
  const before = lightControl.value;

  await user.click(screen.getByRole("button", { name: "Dark mode" }));
  const darkControl = screen.getByLabelText("Dark background lightness");
  await user.clear(darkControl);
  await user.type(darkControl, "0.18");

  expect((screen.getByLabelText("Dark background lightness") as HTMLInputElement).value).toBe("0.18");
  expect(lightControl.value).toBe(before);
});

test("keeps the last valid value when a surface control receives invalid input", async () => {
  const user = userEvent.setup();
  render(<ThemeLab />);

  await user.click(screen.getByRole("button", { name: "Light mode" }));
  const control = screen.getByLabelText("Light background lightness") as HTMLInputElement;
  const before = control.value;

  await user.clear(control);
  await user.type(control, "not-a-number");
  await user.tab();

  expect(control.value).toBe(before);
});

test("resets edited values to the documented defaults", async () => {
  const user = userEvent.setup();
  render(<ThemeLab />);

  const hueControl = screen.getByLabelText("Hue") as HTMLInputElement;
  await user.clear(hueControl);
  await user.type(hueControl, "120");
  await user.click(screen.getByRole("button", { name: "Reset theme" }));

  expect((screen.getByLabelText("Hue") as HTMLInputElement).value).toBe(
    String(DEFAULT_THEME_PARAMETERS.hue),
  );
});

test("chooses the base hue through an accessible color wheel", async () => {
  const user = userEvent.setup();
  render(<ThemeLab />);

  const wheel = screen.getByRole("slider", { name: "Choose hue" });
  await user.keyboard("{ArrowRight}");

  expect(wheel).toHaveAttribute("aria-valuemin", "0");
  expect(wheel).toHaveAttribute("aria-valuemax", "360");
});

test("increments a numeric control with its stepper", async () => {
  const user = userEvent.setup();
  render(<ThemeLab />);

  const hue = screen.getByLabelText("Hue") as HTMLInputElement;
  const initialValue = Number(hue.value);
  await user.click(screen.getByRole("button", { name: "Increase Hue" }));

  expect(Number(hue.value)).toBe(initialValue + 1);
});

test("starts advanced mode controls collapsed", () => {
  render(<ThemeLab />);

  expect(screen.queryByLabelText("Light background lightness")).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Dark background lightness")).not.toBeInTheDocument();
});

test("copies the generated stylesheet and announces feedback", async () => {
  const user = userEvent.setup();
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  render(<ThemeLab />);

  await user.click(screen.getByRole("button", { name: "Copy CSS" }));

  expect(writeText).toHaveBeenCalledTimes(1);
  expect(await screen.findByRole("status")).toHaveTextContent("Copied CSS");
});

test("announces when clipboard access is unavailable", async () => {
  const user = userEvent.setup();
  Object.defineProperty(navigator, "clipboard", {
    value: undefined,
    configurable: true,
  });
  render(<ThemeLab />);

  await user.click(screen.getByRole("button", { name: "Copy CSS" }));

  expect(await screen.findByRole("status")).toHaveTextContent("Clipboard unavailable");
});

"use client";

import { useState } from "react";

import { MODE_LIMITS, TOKEN_DESCRIPTORS } from "../../lib/theme/theme-config";
import type {
  SurfaceSettings,
  ThemeMode,
  ThemeParameters,
  ThemeToken,
  ThemeWarning,
} from "../../lib/theme/theme-types";

type SurfaceField = keyof SurfaceSettings;

interface NumericRange {
  min: number;
  max: number;
  step: number;
}

interface NumberFieldProps {
  label: string;
  range: NumericRange;
  value: number;
  onChange: (value: number) => void;
}

export interface ThemeInspectorProps {
  copyStatus: string | null;
  css: string;
  onCopy: () => Promise<void>;
  onParametersChange: (parameters: ThemeParameters) => void;
  onReset: () => void;
  onSurfaceChange: (mode: ThemeMode, token: ThemeToken, field: SurfaceField, value: number) => void;
  parameters: ThemeParameters;
  resetVersion: number;
  warnings: ThemeWarning[];
}

function clamp(value: number, range: NumericRange): number {
  return Math.min(Math.max(value, range.min), range.max);
}

function formatNumber(value: number): string {
  return String(value);
}

function isCompleteNumber(value: string): boolean {
  return /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(value);
}

function NumberField({ label, range, value, onChange }: NumberFieldProps) {
  const [draft, setDraft] = useState(() => formatNumber(value));

  function commit(valueAsText: string): void {
    const parsed = Number(valueAsText);
    if (!isCompleteNumber(valueAsText.trim()) || !Number.isFinite(parsed)) {
      return;
    }

    const nextValue = clamp(parsed, range);
    setDraft(formatNumber(nextValue));
    onChange(nextValue);
  }

  return (
    <label>
      <span>{label}</span>
      <input
        aria-label={label}
        inputMode="decimal"
        max={range.max}
        min={range.min}
        onBlur={() => setDraft(formatNumber(value))}
        onChange={(event) => {
          setDraft(event.target.value);
          commit(event.target.value);
        }}
        step={range.step}
        type="text"
        value={draft}
      />
    </label>
  );
}

function modeControlLabel(mode: ThemeMode, token: ThemeToken, descriptorLabel: string, field: SurfaceField): string {
  const modeLabel = mode === "light" ? "Light" : "Dark";
  return `${modeLabel} ${descriptorLabel.toLowerCase()} ${field}`;
}

interface ModeControlsProps {
  mode: ThemeMode;
  onSurfaceChange: ThemeInspectorProps["onSurfaceChange"];
  resetVersion: number;
  settings: ThemeParameters[ThemeMode];
}

function ModeControls({ mode, onSurfaceChange, resetVersion, settings }: ModeControlsProps) {
  return (
    <div>
      {TOKEN_DESCRIPTORS.map(({ label, name }) => (
        <fieldset key={name}>
          <legend>{label}</legend>
          <NumberField
            key={`${name}-lightness-${resetVersion}`}
            label={modeControlLabel(mode, name, label, "lightness")}
            onChange={(value) => onSurfaceChange(mode, name, "lightness", value)}
            range={MODE_LIMITS.lightness}
            value={settings[name].lightness}
          />
          <NumberField
            key={`${name}-chroma-budget-${resetVersion}`}
            label={modeControlLabel(mode, name, label, "chromaBudget")}
            onChange={(value) => onSurfaceChange(mode, name, "chromaBudget", value)}
            range={MODE_LIMITS.chromaBudget}
            value={settings[name].chromaBudget}
          />
        </fieldset>
      ))}
    </div>
  );
}

export function ThemeInspector({
  copyStatus,
  css,
  onCopy,
  onParametersChange,
  onReset,
  onSurfaceChange,
  parameters,
  resetVersion,
  warnings,
}: ThemeInspectorProps) {
  const [expandedModes, setExpandedModes] = useState<Record<ThemeMode, boolean>>({
    light: false,
    dark: false,
  });

  function setBaseParameter(field: "hue" | "vividness", value: number): void {
    onParametersChange({ ...parameters, [field]: value });
  }

  function toggleMode(mode: ThemeMode): void {
    setExpandedModes((currentModes) => ({ ...currentModes, [mode]: !currentModes[mode] }));
  }

  return (
    <aside aria-label="Theme inspector">
      <section aria-labelledby="base-color-heading">
        <h2 id="base-color-heading">Base color</h2>
        <NumberField
          key={`hue-${resetVersion}`}
          label="Hue"
          onChange={(value) => setBaseParameter("hue", value)}
          range={MODE_LIMITS.hue}
          value={parameters.hue}
        />
        <NumberField
          key={`vividness-${resetVersion}`}
          label="Vividness"
          onChange={(value) => setBaseParameter("vividness", value)}
          range={MODE_LIMITS.vividness}
          value={parameters.vividness}
        />
      </section>

      {(["light", "dark"] as const).map((mode) => {
        const label = mode === "light" ? "Light mode" : "Dark mode";
        const isExpanded = expandedModes[mode];

        return (
          <section key={mode}>
            <button aria-expanded={isExpanded} onClick={() => toggleMode(mode)} type="button">
              {label}
            </button>
            {isExpanded ? (
              <ModeControls
                mode={mode}
                onSurfaceChange={onSurfaceChange}
                resetVersion={resetVersion}
                settings={parameters[mode]}
              />
            ) : null}
          </section>
        );
      })}

      <section aria-labelledby="export-heading">
        <h2 id="export-heading">Export</h2>
        <textarea aria-label="Generated CSS" readOnly value={css} />
        <button onClick={() => void onCopy()} type="button">
          Copy CSS
        </button>
        <button onClick={onReset} type="button">
          Reset theme
        </button>
        {copyStatus === null ? null : <p role="status">{copyStatus}</p>}
      </section>

      {warnings.length === 0 ? null : (
        <section aria-label="Contrast warnings">
          <h2>Contrast warnings</h2>
          <ul>
            {warnings.map((warning) => (
              <li key={`${warning.foreground}-${warning.background}-${warning.contrast}`}>
                {warning.message}
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}

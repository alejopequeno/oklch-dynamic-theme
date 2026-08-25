"use client";

import { clampChroma } from "culori";
import { useMemo, useRef, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { MODE_LIMITS, TOKEN_DESCRIPTORS } from "../../lib/theme/theme-config";
import type {
  SurfaceSettings,
  ThemeMode,
  ThemeParameters,
  ThemeToken,
  ThemeWarning,
} from "../../lib/theme/theme-types";
import { NumberField as ReuiNumberField, NumberFieldDecrement, NumberFieldGroup, NumberFieldIncrement, NumberFieldInput } from "../reui/number-field";

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

function NumberField({ label, range, value, onChange }: NumberFieldProps) {
  return (
    <label>
      <span>{label}</span>
      <ReuiNumberField max={range.max} min={range.min} onValueChange={(nextValue) => { if (nextValue !== null) { onChange(clamp(nextValue, range)); } }} step={range.step} value={value}>
        <NumberFieldGroup className="theme-number-field">
          <NumberFieldInput aria-label={label} />
          <span className="theme-number-field-actions">
            <NumberFieldIncrement aria-label={`Increase ${label}`}><ChevronUpIcon /></NumberFieldIncrement>
            <NumberFieldDecrement aria-label={`Decrease ${label}`}><ChevronDownIcon /></NumberFieldDecrement>
          </span>
        </NumberFieldGroup>
      </ReuiNumberField>
    </label>
  );
}

function maxChroma(lightness: number, hue: number): number {
  return clampChroma({ mode: "oklch", l: lightness, c: 0.4, h: hue }, "oklch").c ?? 0;
}

function HueWheel({ hue, onChange }: { hue: number; onChange: (hue: number) => void }) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const ring = useMemo(() => {
    const stops = Array.from({ length: 61 }, (_, index) => {
      const stopHue = index * 6;
      const chroma = maxChroma(0.65, stopHue) * 0.72;
      return `oklch(0.65 ${chroma.toFixed(3)} ${stopHue}) ${stopHue}deg`;
    });
    return `conic-gradient(from 0deg, ${stops.join(", ")})`;
  }, []);
  const selectHue = (x: number, y: number) => {
    const box = wheelRef.current?.getBoundingClientRect();
    if (!box) return;
    onChange((Math.atan2(x - (box.left + box.width / 2), -(y - (box.top + box.height / 2))) * 180 / Math.PI + 360) % 360);
  };
  const radians = hue * Math.PI / 180;
  const ringCenterline = 41.667;
  const handleX = 50 + ringCenterline * Math.sin(radians);
  const handleY = 50 - ringCenterline * Math.cos(radians);
  const color = `oklch(0.65 ${Math.min(0.16, maxChroma(0.65, hue)).toFixed(3)} ${hue})`;
  return <div ref={wheelRef} aria-label="Choose hue" aria-valuemax={360} aria-valuemin={0} aria-valuenow={Math.round(hue)} className="hue-wheel" onKeyDown={(event) => { if (["ArrowRight", "ArrowUp"].includes(event.key)) { event.preventDefault(); onChange((hue + 1) % 360); } if (["ArrowLeft", "ArrowDown"].includes(event.key)) { event.preventDefault(); onChange((hue + 359) % 360); } }} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setDragging(true); selectHue(event.clientX, event.clientY); }} onPointerMove={(event) => dragging && selectHue(event.clientX, event.clientY)} onPointerUp={() => setDragging(false)} role="slider" style={{ background: ring }} tabIndex={0}><span className="hue-wheel-center" style={{ backgroundColor: color }} /><span className="hue-wheel-handle" style={{ backgroundColor: color, left: `${handleX}%`, top: `${handleY}%` }} /></div>;
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
        <HueWheel hue={parameters.hue} onChange={(value) => setBaseParameter("hue", value)} />
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

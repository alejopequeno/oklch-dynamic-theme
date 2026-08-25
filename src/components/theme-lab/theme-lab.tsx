"use client";

import { useCallback, useMemo, useState } from "react";

import { DEFAULT_THEME_PARAMETERS } from "../../lib/theme/theme-config";
import { serializeThemeCss } from "../../lib/theme/css-export";
import { buildTheme, getThemeWarnings } from "../../lib/theme/theme-engine";
import type {
  SurfaceSettings,
  ThemeMode,
  ThemeParameters,
  ThemeToken,
} from "../../lib/theme/theme-types";

import { ThemeInspector } from "./theme-inspector";
import { ThemePreview } from "./theme-preview";

type SurfaceField = keyof SurfaceSettings;

function cloneParameters(parameters: ThemeParameters): ThemeParameters {
  return {
    hue: parameters.hue,
    vividness: parameters.vividness,
    light: Object.fromEntries(
      Object.entries(parameters.light).map(([token, settings]) => [token, { ...settings }]),
    ) as ThemeParameters["light"],
    dark: Object.fromEntries(
      Object.entries(parameters.dark).map(([token, settings]) => [token, { ...settings }]),
    ) as ThemeParameters["dark"],
  };
}

export function ThemeLab() {
  const [parameters, setParameters] = useState<ThemeParameters>(() => cloneParameters(DEFAULT_THEME_PARAMETERS));
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [resetVersion, setResetVersion] = useState(0);
  const lightTheme = useMemo(() => buildTheme(parameters, "light"), [parameters]);
  const darkTheme = useMemo(() => buildTheme(parameters, "dark"), [parameters]);
  const css = useMemo(() => serializeThemeCss(lightTheme, darkTheme), [lightTheme, darkTheme]);
  const warnings = useMemo(
    () => [...getThemeWarnings(lightTheme), ...getThemeWarnings(darkTheme)],
    [darkTheme, lightTheme],
  );

  const onSurfaceChange = useCallback(
    (mode: ThemeMode, token: ThemeToken, field: SurfaceField, value: number) => {
      setParameters((currentParameters) => ({
        ...currentParameters,
        [mode]: {
          ...currentParameters[mode],
          [token]: {
            ...currentParameters[mode][token],
            [field]: value,
          },
        },
      }));
    },
    [],
  );

  const onCopy = useCallback(async () => {
    if (navigator.clipboard === undefined) {
      setCopyStatus("Clipboard unavailable");
      return;
    }

    try {
      await navigator.clipboard.writeText(css);
      setCopyStatus("Copied CSS");
    } catch {
      setCopyStatus("Could not copy CSS");
    }
  }, [css]);

  const onReset = useCallback(() => {
    setParameters(cloneParameters(DEFAULT_THEME_PARAMETERS));
    setResetVersion((currentVersion) => currentVersion + 1);
  }, []);

  return (
    <div className="theme-lab">
      <header className="lab-header">
        <div>
          <p className="lab-kicker">Color system study</p>
          <h1>OKLCH Theme Lab</h1>
        </div>
        <p className="lab-intro">
          Tune a single palette and compare its semantic roles in two isolated interfaces.
        </p>
      </header>

      <main className="lab-main">
        <section aria-label="Theme previews" className="preview-grid">
          <ThemePreview mode="light" theme={lightTheme} />
          <ThemePreview mode="dark" theme={darkTheme} />
        </section>
      </main>

      <div className="theme-inspector">
        <ThemeInspector
          copyStatus={copyStatus}
          css={css}
          onCopy={onCopy}
          onParametersChange={setParameters}
          onReset={onReset}
          onSurfaceChange={onSurfaceChange}
          parameters={parameters}
          resetVersion={resetVersion}
          warnings={warnings}
        />
      </div>
    </div>
  );
}

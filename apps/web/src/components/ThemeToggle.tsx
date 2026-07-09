import { useTheme } from "../lib/theme";
import { IconSun, IconMoon, IconSystem } from "./icons";

const ICON: Record<string, JSX.Element> = {
  light: <IconSun />,
  dark: <IconMoon />,
  system: <IconSystem />,
};

const LABEL: Record<string, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

export const ThemeToggle = ({ full = false }: { full?: boolean }) => {
  const { theme, cycleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={cycleTheme}
      title={`Theme: ${LABEL[theme]} (click to change)`}
      style={{
        width: full ? "100%" : 34,
        height: 34,
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
      }}
    >
      {ICON[theme]}
      {full && <span>{LABEL[theme]}</span>}
    </button>
  );
};

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size={collapsed ? "icon" : "default"}
      onClick={toggleTheme}
      className="w-full justify-start gap-3 px-3 py-2.5 hover:bg-muted transition-colors"
    >
      {isDark ? (
        <Sun className="h-5 w-5 shrink-0" />
      ) : (
        <Moon className="h-5 w-5 shrink-0" />
      )}
      {!collapsed && <span>{isDark ? "Light Mode" : "Dark Mode"}</span>}
    </Button>
  );
}

"use client";

import { Toggle } from "@radix-ui/react-toggle";
import { Volume2, VolumeX, Sun, Moon } from "lucide-react";
import { useEffect } from "react";

interface SettingsPanelProps {
  audioEnabled: boolean;
  setAudioEnabled: (val: boolean) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export function SettingsPanel({
  audioEnabled,
  setAudioEnabled,
  darkMode,
  setDarkMode,
}: SettingsPanelProps) {
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="flex items-center gap-2 z-50">
      {/* Audio Toggle */}
      <Toggle
        pressed={audioEnabled}
        onPressedChange={setAudioEnabled}
        aria-label="Toggle audio"
      >
        {audioEnabled ? (
          <Volume2 className="h-4 w-4 text-neutral-900 dark:text-neutral-50" />
        ) : (
          <VolumeX className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
        )}
      </Toggle>

      {/* Dark Mode Toggle */}
      <Toggle
        pressed={darkMode}
        onPressedChange={setDarkMode}
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          <Moon className="h-4 w-4 text-neutral-50" />
        ) : (
          <Sun className="h-4 w-4 text-neutral-900" />
        )}
      </Toggle>
    </div>
  );
}

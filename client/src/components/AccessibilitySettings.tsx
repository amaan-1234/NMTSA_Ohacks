import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Sun, Moon, Palette, Type, RotateCcw, Accessibility } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type AccessibilityState = {
  brightness: number;
  darkMode: boolean;
  colorInvert: boolean;
  textSize: number; // 0 = small, 1 = medium, 2 = large, 3 = extra large
};

const DEFAULT_SETTINGS: AccessibilityState = {
  brightness: 100,
  darkMode: false,
  colorInvert: false,
  textSize: 1, // medium by default
};

export function AccessibilitySettings() {
  const [settings, setSettings] = useState<AccessibilityState>(DEFAULT_SETTINGS);
  const [open, setOpen] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("accessibility-settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
        applySettings(parsed);
      } catch (error) {
        console.error("Failed to parse accessibility settings:", error);
      }
    }
  }, []);

  // Apply settings to the DOM
  const applySettings = (newSettings: AccessibilityState) => {
    const root = document.documentElement;
    
    // Apply brightness
    root.style.setProperty("--brightness", `${newSettings.brightness}%`);
    
    // Apply dark mode
    if (newSettings.darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    
    // Apply color invert
    if (newSettings.colorInvert) {
      root.classList.add("invert-colors");
    } else {
      root.classList.remove("invert-colors");
    }
    
    // Apply text size
    const textSizeMap = {
      0: "0.875rem", // small (14px)
      1: "1rem",     // medium (16px - default)
      2: "1.125rem", // large (18px)
      3: "1.25rem",  // extra large (20px)
    };
    root.style.setProperty("--base-text-size", textSizeMap[newSettings.textSize as keyof typeof textSizeMap]);
  };

  // Update settings and save to localStorage
  const updateSettings = (partial: Partial<AccessibilityState>) => {
    const newSettings = { ...settings, ...partial };
    setSettings(newSettings);
    applySettings(newSettings);
    localStorage.setItem("accessibility-settings", JSON.stringify(newSettings));
  };

  // Reset to defaults
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    applySettings(DEFAULT_SETTINGS);
    localStorage.removeItem("accessibility-settings");
  };

  const textSizeLabels = ["Small", "Medium", "Large", "Extra Large"];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          title="Accessibility Settings"
        >
          <Accessibility className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Accessibility className="h-5 w-5" />
              Accessibility Settings
            </CardTitle>
            <CardDescription>
              Customize your viewing experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Brightness Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Brightness
                </Label>
                <span className="text-sm text-muted-foreground">
                  {settings.brightness}%
                </span>
              </div>
              <Slider
                value={[settings.brightness]}
                onValueChange={(value) => updateSettings({ brightness: value[0] })}
                min={50}
                max={150}
                step={5}
                className="w-full"
              />
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="flex items-center gap-2 cursor-pointer">
                {settings.darkMode ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                Dark Mode
              </Label>
              <Switch
                id="dark-mode"
                checked={settings.darkMode}
                onCheckedChange={(checked) => updateSettings({ darkMode: checked })}
              />
            </div>

            {/* Color Invert Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="color-invert" className="flex items-center gap-2 cursor-pointer">
                <Palette className="h-4 w-4" />
                Invert Colors
              </Label>
              <Switch
                id="color-invert"
                checked={settings.colorInvert}
                onCheckedChange={(checked) => updateSettings({ colorInvert: checked })}
              />
            </div>

            {/* Text Size Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Text Size
                </Label>
                <span className="text-sm text-muted-foreground">
                  {textSizeLabels[settings.textSize]}
                </span>
              </div>
              <Slider
                value={[settings.textSize]}
                onValueChange={(value) => updateSettings({ textSize: value[0] })}
                min={0}
                max={3}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>Small</span>
                <span>Medium</span>
                <span>Large</span>
                <span>XL</span>
              </div>
            </div>

            {/* Reset Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={resetSettings}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}


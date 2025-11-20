import { useState, useEffect } from "react";
import { Keyboard, Save, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

interface ShortcutConfig {
  id: string;
  label: string;
  defaultKey: string;
  customKey: string;
}

const defaultShortcuts: ShortcutConfig[] = [
  { id: "goBack", label: "Go Back", defaultKey: "Escape", customKey: "Escape" },
  { id: "goHome", label: "Go to Home", defaultKey: "Alt+H", customKey: "Alt+H" },
  { id: "studyRooms", label: "Go to Study Rooms", defaultKey: "Alt+S", customKey: "Alt+S" },
  { id: "profile", label: "Go to Profile", defaultKey: "Alt+P", customKey: "Alt+P" },
  { id: "chat", label: "Go to AI Chat", defaultKey: "Alt+C", customKey: "Alt+C" },
  { id: "timetable", label: "Go to Timetable", defaultKey: "Alt+T", customKey: "Alt+T" },
  { id: "commandPalette", label: "Command Palette", defaultKey: "Ctrl+K", customKey: "Ctrl+K" },
];

const KeyboardShortcutsSettings = () => {
  const [shortcuts, setShortcuts] = useState<ShortcutConfig[]>(defaultShortcuts);
  const { toast } = useToast();

  useEffect(() => {
    // Load custom shortcuts from localStorage
    const saved = localStorage.getItem("customKeyboardShortcuts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setShortcuts(parsed);
      } catch (error) {
        console.error("Error loading shortcuts:", error);
      }
    }
  }, []);

  const handleShortcutChange = (id: string, value: string) => {
    setShortcuts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, customKey: value } : s))
    );
  };

  const handleSave = () => {
    localStorage.setItem("customKeyboardShortcuts", JSON.stringify(shortcuts));
    toast({
      title: "Shortcuts saved",
      description: "Your custom keyboard shortcuts have been saved.",
    });
  };

  const handleReset = () => {
    setShortcuts(defaultShortcuts);
    localStorage.removeItem("customKeyboardShortcuts");
    toast({
      title: "Shortcuts reset",
      description: "All shortcuts have been reset to defaults.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Keyboard className="w-8 h-8" />
          Keyboard Shortcuts
        </h1>
        <p className="text-muted-foreground mt-1">
          Customize keyboard shortcuts to match your workflow
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Custom Shortcuts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6">
            {shortcuts.map((shortcut) => (
              <div key={shortcut.id} className="space-y-2">
                <Label htmlFor={shortcut.id}>{shortcut.label}</Label>
                <div className="flex gap-2">
                  <Input
                    id={shortcut.id}
                    value={shortcut.customKey}
                    onChange={(e) => handleShortcutChange(shortcut.id, e.target.value)}
                    placeholder="e.g., Ctrl+Shift+S"
                    className="font-mono"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShortcutChange(shortcut.id, shortcut.defaultKey)}
                  >
                    Default
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Default: <kbd className="px-1 bg-muted rounded">{shortcut.defaultKey}</kbd>
                </p>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
            <Button onClick={handleReset} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </Button>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-2">
            <p className="font-medium">💡 Tips for setting shortcuts:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Use modifiers like Ctrl, Alt, Shift, or Cmd (Mac)</li>
              <li>Combine modifiers with letters or function keys</li>
              <li>Avoid conflicts with browser shortcuts</li>
              <li>Keep shortcuts memorable and easy to reach</li>
            </ul>
          </div>

          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm">
            <p className="font-medium text-yellow-700 dark:text-yellow-400 mb-1">
              ⚠️ Note
            </p>
            <p className="text-muted-foreground">
              Custom shortcuts will take effect after saving. Some shortcuts may require a page
              refresh to work properly.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KeyboardShortcutsSettings;

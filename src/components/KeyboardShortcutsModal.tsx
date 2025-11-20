import { Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const KeyboardShortcutsModal = ({ open, onOpenChange }: ShortcutsModalProps) => {
  const shortcuts = [
    { category: "Navigation", key: "Esc", action: "Go back" },
    { category: "Navigation", key: "Alt + H", action: "Go to Home/Dashboard" },
    { category: "Navigation", key: "Alt + S", action: "Go to Study Rooms" },
    { category: "Navigation", key: "Alt + P", action: "Go to Profile" },
    { category: "Navigation", key: "Alt + C", action: "Go to AI Chat" },
    { category: "Navigation", key: "Alt + T", action: "Go to Timetable" },
    { category: "Quick Actions", key: "Ctrl/Cmd + K", action: "Open command palette" },
    { category: "Quick Actions", key: "?", action: "Show keyboard shortcuts" },
    { category: "Gestures", key: "Swipe Left", action: "Go back (touchpad)" },
    { category: "Gestures", key: "Swipe Right", action: "Go forward (touchpad)" },
  ];

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof shortcuts>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {Object.entries(groupedShortcuts).map(([category, items]) => (
            <div key={category}>
              <h3 className="font-semibold mb-3">{category}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Shortcut</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">
                          {item.key}
                        </kbd>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.action}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <p className="font-medium mb-1">💡 Pro Tip:</p>
          <p>Customize your shortcuts in Settings → Keyboard Shortcuts</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { Clock, X, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigationHistory } from "@/hooks/useNavigationHistory";

export const NavigationHistory = () => {
  const { history, clearHistory } = useNavigationHistory();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Clock className="w-5 h-5" />
          {history.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
              {history.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Navigation History
            </span>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearHistory}
                className="h-8 w-8"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)] mt-6">
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No navigation history yet</p>
              <p className="text-sm mt-2">Visit pages to see them here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item, index) => (
                <Link
                  key={`${item.path}-${item.timestamp}`}
                  to={item.path}
                  className="block p-3 rounded-lg hover:bg-muted/50 transition-colors border border-border/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.path}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="absolute bottom-4 left-4 right-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
          <p className="font-medium mb-1">Keyboard Shortcuts:</p>
          <ul className="space-y-1">
            <li><kbd className="px-1 bg-background rounded">Esc</kbd> Go back</li>
            <li><kbd className="px-1 bg-background rounded">Alt+H</kbd> Home</li>
            <li><kbd className="px-1 bg-background rounded">Alt+S</kbd> Study Rooms</li>
            <li><kbd className="px-1 bg-background rounded">Alt+P</kbd> Profile</li>
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
};

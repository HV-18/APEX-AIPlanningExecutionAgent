import { useState, useEffect } from "react";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { BackButton } from "@/components/BackButton";

type TimetableEvent = {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  category?: string;
};

const TimetablePage = () => {
  const [events, setEvents] = useState<TimetableEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    category: "study",
  });

  useEffect(() => {
    loadEvents();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('timetable-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timetable_events' }, () => loadEvents())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("timetable_events")
        .select("*")
        .eq("user_id", user.id)
        .order("start_time", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error loading events:", error);
      toast({
        title: "Error",
        description: "Failed to load timetable events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async () => {
    if (!newEvent.title || !newEvent.start_time || !newEvent.end_time) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("timetable_events").insert({
        user_id: user.id,
        title: newEvent.title,
        description: newEvent.description,
        start_time: newEvent.start_time,
        end_time: newEvent.end_time,
        category: newEvent.category,
      });

      if (error) throw error;

      toast({
        title: "Event added! 📅",
        description: "Your timetable has been updated",
      });

      setNewEvent({ title: "", description: "", start_time: "", end_time: "", category: "study" });
      setIsOpen(false);
      loadEvents();
    } catch (error) {
      console.error("Error adding event:", error);
      toast({
        title: "Error",
        description: "Failed to add event",
        variant: "destructive",
      });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase.from("timetable_events").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Event deleted",
        description: "Event removed from your timetable",
      });

      loadEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const getCategoryColor = (category?: string) => {
    const colors = {
      study: "bg-primary/10 text-primary border-primary/20",
      exam: "bg-destructive/10 text-destructive border-destructive/20",
      break: "bg-secondary/10 text-secondary border-secondary/20",
      class: "bg-accent/10 text-accent border-accent/20",
    };
    return colors[category as keyof typeof colors] || colors.study;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            Smart Timetable
          </h1>
          <p className="text-muted-foreground mt-1">
            Organize your schedule and deadlines
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Timetable Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Title *</Label>
                <Input
                  placeholder="e.g., Math Class, Study Session"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Additional details..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label>Category</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                >
                  <option value="study">Study</option>
                  <option value="class">Class</option>
                  <option value="exam">Exam</option>
                  <option value="break">Break</option>
                </select>
              </div>
              <div>
                <Label>Start Time *</Label>
                <Input
                  type="datetime-local"
                  value={newEvent.start_time}
                  onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                />
              </div>
              <div>
                <Label>End Time *</Label>
                <Input
                  type="datetime-local"
                  value={newEvent.end_time}
                  onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                />
              </div>
              <Button onClick={addEvent} className="w-full">
                Add to Timetable
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading timetable...</p>
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No events scheduled</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start by adding your classes, study sessions, or deadlines
            </p>
            <Button onClick={() => setIsOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Card key={event.id} className={`border-2 ${getCategoryColor(event.category)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteEvent(event.id)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Start:</span>{" "}
                    <span className="font-medium">
                      {format(new Date(event.start_time), "MMM d, h:mm a")}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">End:</span>{" "}
                    <span className="font-medium">
                      {format(new Date(event.end_time), "MMM d, h:mm a")}
                    </span>
                  </div>
                  {event.category && (
                    <div className="ml-auto">
                      <span className="text-xs px-2 py-1 rounded-full bg-background/50">
                        {event.category}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimetablePage;

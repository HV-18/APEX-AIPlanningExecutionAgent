import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  type: "event" | "project" | "session";
}

const WorkspaceCalendar = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [workspace, setWorkspace] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dayEvents, setDayEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    if (workspaceId) {
      loadWorkspace();
      loadEvents();
    }
  }, [workspaceId]);

  const loadWorkspace = async () => {
    const { data } = await supabase
      .from("workspaces")
      .select("*")
      .eq("id", workspaceId)
      .single();

    if (data) setWorkspace(data);
  };

  const loadEvents = async () => {
    const calendarEvents: CalendarEvent[] = [];

    // Load timetable events
    const { data: timetableData } = await supabase
      .from("timetable_events")
      .select("*")
      .eq("workspace_id", workspaceId);

    if (timetableData) {
      timetableData.forEach((event) => {
        calendarEvents.push({
          id: event.id,
          title: event.title,
          start: new Date(event.start_time),
          type: "event",
        });
      });
    }

    // Load project deadlines
    const { data: projectsData } = await supabase
      .from("learning_projects")
      .select("*")
      .eq("workspace_id", workspaceId)
      .not("deadline", "is", null);

    if (projectsData) {
      projectsData.forEach((project) => {
        if (project.deadline) {
          calendarEvents.push({
            id: project.id,
            title: `${project.title} (Deadline)`,
            start: new Date(project.deadline),
            type: "project",
          });
        }
      });
    }

    // Load study sessions
    const { data: sessionsData } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("workspace_id", workspaceId)
      .not("created_at", "is", null)
      .limit(100);

    if (sessionsData) {
      sessionsData.forEach((session) => {
        calendarEvents.push({
          id: session.id,
          title: `${session.subject}`,
          start: new Date(session.created_at),
          type: "session",
        });
      });
    }

    setEvents(calendarEvents);
  };

  useEffect(() => {
    if (selectedDate) {
      const filtered = events.filter((event) => {
        const eventDate = event.start;
        return (
          eventDate.getDate() === selectedDate.getDate() &&
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getFullYear() === selectedDate.getFullYear()
        );
      });
      setDayEvents(filtered);
    }
  }, [selectedDate, events]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/workspaces")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-8 h-8" />
            {workspace.name} Calendar
          </h1>
          <p className="text-muted-foreground mt-1">
            View all events, deadlines, and study sessions
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Events on {selectedDate?.toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{event.title}</p>
                    <Badge
                      variant="secondary"
                      className={
                        event.type === "event"
                          ? "bg-blue-500/20"
                          : event.type === "project"
                          ? "bg-pink-500/20"
                          : "bg-green-500/20"
                      }
                    >
                      {event.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {event.start.toLocaleTimeString()}
                  </p>
                </div>
              ))}
              {dayEvents.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No events on this date
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#3b82f6" }} />
          <span className="text-sm">Timetable Events</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#ec4899" }} />
          <span className="text-sm">Project Deadlines</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#10b981" }} />
          <span className="text-sm">Study Sessions</span>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceCalendar;

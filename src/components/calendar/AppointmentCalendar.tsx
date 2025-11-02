import { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import moment from "moment";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock } from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: any;
}

export const AppointmentCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    checkUserRole();
    fetchAppointments();
    updatePastAppointments();
  }, []);

  const checkUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (data) {
      setUserRoles(data.map(r => r.role));
    }
  };

  const updatePastAppointments = async () => {
    const today = new Date().toISOString().split("T")[0];
    
    const { error } = await supabase
      .from("appointments")
      .update({ status: "completed" })
      .eq("status", "pending")
      .lt("appointment_date", today);

    if (error) {
      console.error("Error updating past appointments:", error);
    }
  };

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select("*");

    if (error) {
      toast({ title: "Error loading appointments", variant: "destructive" });
      return;
    }

    const calendarEvents: CalendarEvent[] = (data || []).map((apt) => {
      const [hours, minutes] = apt.appointment_time.split(":").map(Number);
      const startDate = new Date(apt.appointment_date);
      startDate.setHours(hours, minutes);
      const endDate = new Date(startDate);
      endDate.setHours(hours + 1, minutes);

      return {
        id: apt.id,
        title: `${apt.reason || "Appointment"}`,
        start: startDate,
        end: endDate,
        resource: apt,
      };
    });

    setEvents(calendarEvents);
  };

  const handleEventDrop = async ({ event, start, end }: any) => {
    const newDate = start.toISOString().split("T")[0];
    const newTime = `${start.getHours().toString().padStart(2, "0")}:${start.getMinutes().toString().padStart(2, "0")}`;

    const { error } = await supabase
      .from("appointments")
      .update({
        appointment_date: newDate,
        appointment_time: newTime,
      })
      .eq("id", event.id);

    if (error) {
      toast({
        title: "Error updating appointment",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Appointment Updated",
        description: "The appointment has been rescheduled.",
      });
      fetchAppointments();
    }
  };

  const updateAppointmentStatus = async (
    appointmentId: string, 
    status: "cancelled" | "completed" | "confirmed" | "pending"
  ) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", appointmentId);

    if (error) {
      toast({
        title: "Error updating status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status Updated",
        description: `Appointment ${status} successfully.`,
      });
      setSelectedEvent(null);
      fetchAppointments();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const canManageAppointments = userRoles.includes("admin") || 
                                 userRoles.includes("dentist") || 
                                 userRoles.includes("receptionist");

  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <div className="h-[600px] bg-card p-4 rounded-lg">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onEventDrop={handleEventDrop}
            onSelectEvent={(event) => setSelectedEvent(event)}
            draggableAccessor={() => canManageAppointments}
            defaultView={Views.WEEK}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            style={{ height: "100%" }}
          />
        </div>
      </DndProvider>

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              View and manage appointment information
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reason</p>
                <p className="text-base">{selectedEvent.resource.reason || "N/A"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
                <p className="text-base">
                  {moment(selectedEvent.start).format("MMMM DD, YYYY [at] h:mm A")}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge className={getStatusColor(selectedEvent.resource.status)}>
                  {selectedEvent.resource.status}
                </Badge>
              </div>

              {selectedEvent.resource.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-base">{selectedEvent.resource.notes}</p>
                </div>
              )}

              {canManageAppointments && selectedEvent.resource.status === "pending" && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => updateAppointmentStatus(selectedEvent.id, "confirmed")}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Accept
                  </Button>
                  <Button
                    onClick={() => updateAppointmentStatus(selectedEvent.id, "cancelled")}
                    variant="destructive"
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}

              {canManageAppointments && selectedEvent.resource.status === "confirmed" && (
                <Button
                  onClick={() => updateAppointmentStatus(selectedEvent.id, "completed")}
                  className="w-full"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Mark as Completed
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

import { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import moment from "moment";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, []);

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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-[600px] bg-card p-4 rounded-lg">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onEventDrop={handleEventDrop}
          draggableAccessor={() => true}
          defaultView={Views.WEEK}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          style={{ height: "100%" }}
        />
      </div>
    </DndProvider>
  );
};

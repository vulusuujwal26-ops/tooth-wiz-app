import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { bookingSchema } from "@/lib/validation";
import { z } from "zod";

const Booking = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState({
    reason: "",
    time: "",
  });
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
    } else {
      toast.error("Please sign in to book an appointment");
      navigate("/auth");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate input
      const validatedData = bookingSchema.parse({
        time: formData.time,
        reason: formData.reason,
        date: date,
      });

      if (!user) {
        toast.error("Please sign in to book an appointment");
        navigate("/auth");
        return;
      }

      setLoading(true);

      const { error } = await supabase.from("appointments").insert([
        {
          patient_id: user.id,
          appointment_date: validatedData.date.toISOString().split('T')[0],
          appointment_time: validatedData.time,
          reason: validatedData.reason || null,
          status: "pending",
        },
      ]);

      if (error) throw error;

      toast.success("Appointment request submitted successfully!");
      
      setFormData({
        reason: "",
        time: "",
      });
      setDate(new Date());
      
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
      } else {
        toast.error(error.message || "Error submitting appointment");
      }
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <Card className="p-8 shadow-elevated border-2">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Book an Appointment</h1>
          <p className="text-muted-foreground mb-8">
            Schedule your dental visit with ease. Select your preferred date and time below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {user && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">Booking for: <strong>{user.email}</strong></p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="time">Preferred Time *</Label>
                <select
                  id="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  <option value="">Select a time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Visit (Optional)</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Brief description of your dental concerns..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Select Appointment Date *</Label>
              <div className="flex justify-center border rounded-lg p-4 bg-card">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md"
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full shadow-elevated hover:scale-[1.02] transition-transform" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Request Appointment
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Booking;
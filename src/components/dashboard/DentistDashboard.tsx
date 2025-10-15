import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Check, X, Edit, Calendar, Video } from "lucide-react";

interface DentistDashboardProps {
  userId: string;
}

const DentistDashboard = ({ userId }: DentistDashboardProps) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTreatment, setEditingTreatment] = useState<string | null>(null);
  const [dentistNotes, setDentistNotes] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appointmentsData, treatmentsData] = await Promise.all([
        supabase
          .from("appointments")
          .select("*, profiles!appointments_patient_id_fkey(full_name, email)")
          .order("appointment_date", { ascending: true }),
        supabase
          .from("treatments")
          .select("*, profiles!treatments_patient_id_fkey(full_name)")
          .order("created_at", { ascending: false }),
      ]);

      if (appointmentsData.error) throw appointmentsData.error;
      if (treatmentsData.error) throw treatmentsData.error;

      setAppointments(appointmentsData.data || []);
      setTreatments(treatmentsData.data || []);
    } catch (error: any) {
      toast.error("Error loading data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (id: string, status: "confirmed" | "cancelled" | "pending" | "completed") => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast.success("Appointment updated");
      fetchData();
    } catch (error: any) {
      toast.error("Error updating appointment");
    }
  };

  const updateTreatment = async (id: string, status: "approved" | "modified" | "recommended" | "rejected") => {
    try {
      const { error } = await supabase
        .from("treatments")
        .update({
          status,
          dentist_notes: dentistNotes,
          final_treatment: status === "approved" ? null : dentistNotes,
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Treatment updated");
      setEditingTreatment(null);
      setDentistNotes("");
      fetchData();
    } catch (error: any) {
      toast.error("Error updating treatment");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Dentist Dashboard</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = "/calendar"}>
            <Calendar className="mr-2 h-4 w-4" />
            Calendar
          </Button>
          <Button variant="outline" onClick={() => window.location.href = "/video-consultation"}>
            <Video className="mr-2 h-4 w-4" />
            Video Call
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Appointments</CardTitle>
            <CardDescription>Review and confirm appointments</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="space-y-4">
                {appointments
                  .filter((apt) => apt.status === "pending")
                  .map((apt) => (
                    <div key={apt.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{apt.profiles?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {apt.appointment_date} at {apt.appointment_time}
                          </p>
                          {apt.reason && (
                            <p className="text-sm mt-1">{apt.reason}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateAppointmentStatus(apt.id, "confirmed")}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAppointmentStatus(apt.id, "cancelled")}
                        >
                          <X className="mr-1 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Treatment Recommendations</CardTitle>
            <CardDescription>Review and approve AI suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="space-y-4">
                {treatments
                  .filter((t) => t.status === "recommended")
                  .slice(0, 5)
                  .map((treatment) => (
                    <div key={treatment.id} className="border rounded-lg p-4 space-y-2">
                      <p className="font-medium">{treatment.profiles?.full_name}</p>
                      <p className="text-sm"><strong>Symptoms:</strong> {treatment.symptoms}</p>
                      <p className="text-sm"><strong>AI Recommendation:</strong> {treatment.ai_recommendation.slice(0, 150)}...</p>
                      
                      {editingTreatment === treatment.id ? (
                        <div className="space-y-2 mt-3">
                          <Textarea
                            placeholder="Add your notes or modifications..."
                            value={dentistNotes}
                            onChange={(e) => setDentistNotes(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateTreatment(treatment.id, "approved")}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateTreatment(treatment.id, "modified")}
                            >
                              Save Modified
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingTreatment(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => updateTreatment(treatment.id, "approved")}
                          >
                            <Check className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingTreatment(treatment.id);
                              setDentistNotes(treatment.ai_recommendation);
                            }}
                          >
                            <Edit className="mr-1 h-4 w-4" />
                            Modify
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DentistDashboard;
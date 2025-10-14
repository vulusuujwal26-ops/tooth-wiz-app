import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Bell, Clock, FileHeart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import NotificationPanel from "./NotificationPanel";
import { ReviewForm } from "@/components/reviews/ReviewForm";

interface PatientDashboardProps {
  userId: string;
}

const PatientDashboard = ({ userId }: PatientDashboardProps) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const [appointmentsData, treatmentsData, reviewsData] = await Promise.all([
        supabase
          .from("appointments")
          .select("*")
          .eq("patient_id", userId)
          .order("appointment_date", { ascending: false }),
        supabase
          .from("treatments")
          .select("*")
          .eq("patient_id", userId)
          .order("created_at", { ascending: false }),
        supabase
          .from("reviews")
          .select("*")
          .eq("patient_id", userId)
          .order("created_at", { ascending: false }),
      ]);

      if (appointmentsData.error) throw appointmentsData.error;
      if (treatmentsData.error) throw treatmentsData.error;
      if (reviewsData.error) throw reviewsData.error;

      setAppointments(appointmentsData.data || []);
      setTreatments(treatmentsData.data || []);
      setReviews(reviewsData.data || []);
    } catch (error: any) {
      toast.error("Error loading data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.appointment_date) >= new Date() && apt.status === 'confirmed'
  );

  const completedAppointmentsWithoutReview = appointments.filter(
    (apt) => 
      apt.status === 'completed' && 
      !reviews.some(review => review.appointment_id === apt.id)
  ).slice(0, 1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">My Dashboard</h2>
        <div className="flex flex-wrap gap-2">
          <Link to="/booking">
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Book Appointment
            </Button>
          </Link>
          <Link to="/symptom-checker">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Check Symptoms
            </Button>
          </Link>
          <Link to="/medical-records">
            <Button variant="secondary">
              <FileHeart className="mr-2 h-4 w-4" />
              Medical Records
            </Button>
          </Link>
        </div>
      </div>

      <NotificationPanel userId={userId} />

      {completedAppointmentsWithoutReview.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Rate Your Recent Visit
            </CardTitle>
            <CardDescription>
              Help us improve by sharing your experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReviewForm
              appointmentId={completedAppointmentsWithoutReview[0].id}
              dentistId={completedAppointmentsWithoutReview[0].dentist_id}
              onReviewSubmitted={fetchData}
            />
          </CardContent>
        </Card>
      )}

      {upcomingAppointments.length > 0 && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Appointments
            </CardTitle>
            <CardDescription>You'll receive reminders 24h and 1h before</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-2 rounded">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      {new Date(apt.appointment_date).toLocaleDateString()}
                    </span>
                    <span className="text-sm text-muted-foreground">at {apt.appointment_time}</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                    Confirmed
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Appointments</CardTitle>
            <CardDescription>View and manage your appointments</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : appointments.length === 0 ? (
              <p className="text-muted-foreground">No appointments yet</p>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 5).map((apt) => (
                  <div
                    key={apt.id}
                    className="flex justify-between items-center p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{apt.appointment_date}</p>
                      <p className="text-sm text-muted-foreground">{apt.appointment_time}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        apt.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : apt.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Treatment Recommendations</CardTitle>
            <CardDescription>AI-powered treatment analysis</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : treatments.length === 0 ? (
              <p className="text-muted-foreground">No recommendations yet</p>
            ) : (
              <div className="space-y-3">
                {treatments.slice(0, 3).map((treatment) => (
                  <div
                    key={treatment.id}
                    className="p-3 border rounded-lg"
                  >
                    <p className="text-sm font-medium mb-2">{treatment.symptoms.slice(0, 60)}...</p>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        treatment.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : treatment.status === "recommended"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {treatment.status}
                    </span>
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

export default PatientDashboard;
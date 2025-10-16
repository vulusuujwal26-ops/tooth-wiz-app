import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsData {
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  totalPatients: number;
  totalRevenue: number;
  activePrescriptions: number;
  waitlistCount: number;
}

export const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    totalPatients: 0,
    totalRevenue: 0,
    activePrescriptions: 0,
    waitlistCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch appointments data
      const { data: appointments } = await supabase
        .from("appointments")
        .select("status");

      // Fetch payments data
      const { data: payments } = await supabase
        .from("payments")
        .select("amount, status");

      // Fetch prescriptions data
      const { data: prescriptions } = await supabase
        .from("prescriptions")
        .select("status");

      // Fetch waitlist data
      const { data: waitlist } = await supabase
        .from("waitlist")
        .select("status");

      // Fetch unique patients
      const { count: patientsCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      setAnalytics({
        totalAppointments: appointments?.length || 0,
        pendingAppointments: appointments?.filter((a) => a.status === "pending").length || 0,
        completedAppointments: appointments?.filter((a) => a.status === "completed").length || 0,
        totalPatients: patientsCount || 0,
        totalRevenue: payments
          ?.filter((p) => p.status === "completed")
          .reduce((sum, p) => sum + Number(p.amount), 0) || 0,
        activePrescriptions: prescriptions?.filter((p) => p.status === "active").length || 0,
        waitlistCount: waitlist?.filter((w) => w.status === "waiting").length || 0,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load analytics data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading analytics...</div>;

  const metrics = [
    {
      title: "Total Appointments",
      value: analytics.totalAppointments,
      description: "All time appointments",
    },
    {
      title: "Pending Appointments",
      value: analytics.pendingAppointments,
      description: "Awaiting confirmation",
    },
    {
      title: "Completed Appointments",
      value: analytics.completedAppointments,
      description: "Successfully completed",
    },
    {
      title: "Total Patients",
      value: analytics.totalPatients,
      description: "Registered patients",
    },
    {
      title: "Total Revenue",
      value: `$${analytics.totalRevenue.toFixed(2)}`,
      description: "From completed payments",
    },
    {
      title: "Active Prescriptions",
      value: analytics.activePrescriptions,
      description: "Currently active",
    },
    {
      title: "Waitlist",
      value: analytics.waitlistCount,
      description: "Patients waiting",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

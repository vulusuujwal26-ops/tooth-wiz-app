import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Users, Calendar, FileText, Activity, Shield, Settings } from "lucide-react";
import { Link } from "react-router-dom";

interface AdminDashboardProps {
  userId: string;
}

const AdminDashboard = ({ userId }: AdminDashboardProps) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAppointments: 0,
    totalTreatments: 0,
    pendingAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profilesData, appointmentsData, treatmentsData] = await Promise.all([
        supabase.from("profiles").select("id"),
        supabase.from("appointments").select("id, status"),
        supabase.from("treatments").select("id"),
      ]);

      if (profilesData.error) throw profilesData.error;
      if (appointmentsData.error) throw appointmentsData.error;
      if (treatmentsData.error) throw treatmentsData.error;

      setStats({
        totalUsers: profilesData.data.length,
        totalAppointments: appointmentsData.data.length,
        totalTreatments: treatmentsData.data.length,
        pendingAppointments: appointmentsData.data.filter((a) => a.status === "pending").length,
      });
    } catch (error: any) {
      toast.error("Error loading data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const promoteToAdmin = async (email: string) => {
    try {
      const { error } = await supabase.rpc('promote_user_to_admin', { user_email: email });
      if (error) throw error;
      toast.success("User promoted to admin successfully");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Error promoting user to admin");
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Admin Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Quick overview and essential admin functions
        </p>
      </div>

      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Promote User to Admin
          </CardTitle>
          <CardDescription>Enter email address of existing user to grant admin access</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const email = formData.get('email') as string;
            if (email) {
              promoteToAdmin(email);
              e.currentTarget.reset();
            }
          }} className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="admin-email">User Email</Label>
              <Input
                id="admin-email"
                name="email"
                type="email"
                placeholder="user@example.com"
                required
              />
            </div>
            <Button type="submit">Promote to Admin</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Appointments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAppointments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Treatment Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTreatments}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Advanced Management</CardTitle>
          <CardDescription>
            Access the full admin control panel for comprehensive system management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The Admin Control Panel provides access to:
            </p>
            <ul className="text-sm space-y-2 ml-4">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                Advanced user role management with multiple role assignments
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                Detailed analytics and system metrics
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                Waitlist and appointment management
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                Quick access to all system features
              </li>
            </ul>
            <Link to="/admin" className="block">
              <Button variant="default" size="lg" className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                Open Admin Control Panel
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
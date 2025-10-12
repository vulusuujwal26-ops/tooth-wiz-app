import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Users, Calendar, FileText, Activity, Shield } from "lucide-react";

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
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profilesData, appointmentsData, treatmentsData, userRolesData] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email"),
        supabase.from("appointments").select("id, status"),
        supabase.from("treatments").select("id"),
        supabase.from("user_roles").select("user_id, role"),
      ]);

      if (profilesData.error) throw profilesData.error;
      if (appointmentsData.error) throw appointmentsData.error;
      if (treatmentsData.error) throw treatmentsData.error;
      if (userRolesData.error) throw userRolesData.error;

      const usersWithRoles = profilesData.data.map((profile) => ({
        ...profile,
        role: userRolesData.data.find((r) => r.user_id === profile.id)?.role || "patient",
      }));

      setUsers(usersWithRoles);
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

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // Delete existing role
      await supabase.from("user_roles").delete().eq("user_id", userId);

      // Insert new role
      const { error } = await supabase
        .from("user_roles")
        .insert([{ user_id: userId, role: newRole as "admin" | "dentist" | "patient" }]);

      if (error) throw error;

      toast.success("User role updated");
      fetchData();
    } catch (error: any) {
      toast.error("Error updating role");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Admin Dashboard</h2>

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

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Select
                    value={user.role}
                    onValueChange={(value) => updateUserRole(user.id, value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="dentist">Dentist</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
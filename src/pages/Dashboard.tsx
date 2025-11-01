import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PatientDashboard from "@/components/dashboard/PatientDashboard";
import DentistDashboard from "@/components/dashboard/DentistDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [primaryRole, setPrimaryRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchUserRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    await fetchUserRole(session.user.id);
  };

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) throw error;
      
      const userRoles = data?.map(r => r.role) || [];
      setRoles(userRoles);
      
      // Determine primary role based on hierarchy: admin > dentist > manager > nurse > receptionist > patient
      if (userRoles.includes('admin')) {
        setPrimaryRole('admin');
      } else if (userRoles.includes('dentist')) {
        setPrimaryRole('dentist');
      } else if (userRoles.includes('manager')) {
        setPrimaryRole('manager');
      } else if (userRoles.includes('nurse')) {
        setPrimaryRole('nurse');
      } else if (userRoles.includes('receptionist')) {
        setPrimaryRole('receptionist');
      } else if (userRoles.includes('patient')) {
        setPrimaryRole('patient');
      }
    } catch (error) {
      console.error("Error fetching role:", error);
      toast.error("Error loading dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">
            DentalCare AI Dashboard
          </h1>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {primaryRole === "admin" && <AdminDashboard userId={user.id} />}
        {primaryRole === "dentist" && <DentistDashboard userId={user.id} />}
        {(primaryRole === "patient" || primaryRole === "receptionist" || primaryRole === "nurse" || primaryRole === "manager") && <PatientDashboard userId={user.id} />}
      </main>
    </div>
  );
};

export default Dashboard;
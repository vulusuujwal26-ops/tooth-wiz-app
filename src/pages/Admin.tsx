import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { WaitlistManager } from "@/components/waitlist/WaitlistManager";
import { PrescriptionForm } from "@/components/prescriptions/PrescriptionForm";
import { 
  ArrowLeft, 
  BarChart3, 
  Users, 
  Calendar, 
  MessageSquare, 
  FileText, 
  CreditCard,
  ListChecks,
  ClipboardList,
  Video,
  Settings
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Admin() {
  const [userId, setUserId] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, [navigate]);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      setUserId(user.id);

      // Check if user has admin role
      const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (error || !roleData) {
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const quickLinks = [
    {
      title: "Analytics Dashboard",
      description: "View system-wide analytics and metrics",
      icon: BarChart3,
      href: "/analytics",
      color: "text-blue-500"
    },
    {
      title: "User Management",
      description: "Manage user roles and permissions",
      icon: Users,
      href: "/admin",
      color: "text-indigo-500"
    },
    {
      title: "Calendar Management",
      description: "Manage all appointments and schedules",
      icon: Calendar,
      href: "/calendar",
      color: "text-green-500"
    },
    {
      title: "Waitlist Management",
      description: "Review and manage patient waitlist",
      icon: ListChecks,
      href: "/waitlist",
      color: "text-cyan-500"
    },
    {
      title: "Video Consultations",
      description: "Monitor and manage video calls",
      icon: Video,
      href: "/video-consultation",
      color: "text-purple-500"
    },
    {
      title: "Messages",
      description: "View all system messages",
      icon: MessageSquare,
      href: "/chat",
      color: "text-orange-500"
    },
    {
      title: "Medical Records",
      description: "Access all patient medical records",
      icon: FileText,
      href: "/medical-records",
      color: "text-pink-500"
    },
    {
      title: "Payment Management",
      description: "View all payments and transactions",
      icon: CreditCard,
      href: "/payments",
      color: "text-yellow-500"
    },
    {
      title: "Prescriptions",
      description: "Manage all prescriptions",
      icon: ClipboardList,
      href: "/prescriptions",
      color: "text-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Settings className="h-8 w-8 text-primary" />
                  Admin Control Panel
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your dental clinic system
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Quick Links Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Navigate to different admin sections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickLinks.map((link) => (
                <Link key={link.href} to={link.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <link.icon className={`h-5 w-5 mt-1 ${link.color}`} />
                        <div>
                          <h3 className="font-semibold">{link.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {link.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Admin Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
                <CardDescription>
                  Quick overview of clinic operations and statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminDashboard userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user roles and permissions for staff and patients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminDashboard userId={userId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  View detailed system analytics and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="waitlist" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Waitlist Management</CardTitle>
                <CardDescription>
                  Manage patient waitlist entries and appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WaitlistManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Management</CardTitle>
                <CardDescription>
                  View and manage all clinic appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Access the full calendar view to manage appointments
                  </p>
                  <Button asChild>
                    <Link to="/calendar">
                      <Calendar className="h-4 w-4 mr-2" />
                      Open Calendar
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

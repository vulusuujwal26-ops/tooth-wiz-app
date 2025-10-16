import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { WaitlistForm } from "@/components/waitlist/WaitlistForm";
import { WaitlistManager } from "@/components/waitlist/WaitlistManager";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";

export default function Waitlist() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Waitlist</h1>
        </div>

        <Tabs defaultValue="join" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="join">Join Waitlist</TabsTrigger>
            <TabsTrigger value="manage">Manage Waitlist</TabsTrigger>
          </TabsList>
          <TabsContent value="join">
            <WaitlistForm />
          </TabsContent>
          <TabsContent value="manage">
            <WaitlistManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

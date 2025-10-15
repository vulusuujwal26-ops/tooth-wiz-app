import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { VideoCall } from "@/components/video/VideoCall";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function VideoConsultation() {
  const [consultationId, setConsultationId] = useState<string>("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const id = searchParams.get("id");
      if (id) {
        setConsultationId(id);
      } else {
        // Create a demo consultation
        const { data } = await supabase
          .from("consultations")
          .insert({
            appointment_id: "00000000-0000-0000-0000-000000000000",
            dentist_id: user.id,
            patient_id: user.id,
            status: "scheduled",
          })
          .select()
          .single();

        if (data) {
          setConsultationId(data.id);
        }
      }
    };

    checkAuth();
  }, [navigate, searchParams]);

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
          <h1 className="text-3xl font-bold">Video Consultation</h1>
        </div>

        {consultationId && <VideoCall consultationId={consultationId} />}
      </div>
    </div>
  );
}

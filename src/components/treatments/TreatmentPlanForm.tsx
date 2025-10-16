import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface TreatmentPlanFormProps {
  patientId: string;
  appointmentId?: string;
  onSuccess?: () => void;
}

export const TreatmentPlanForm = ({ patientId, appointmentId, onSuccess }: TreatmentPlanFormProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    symptoms: "",
    ai_recommendation: "",
    dentist_notes: "",
    final_treatment: "",
    estimated_cost: "",
    currency: "USD",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("treatments").insert({
        patient_id: patientId,
        appointment_id: appointmentId,
        symptoms: formData.symptoms,
        ai_recommendation: formData.ai_recommendation,
        dentist_notes: formData.dentist_notes,
        final_treatment: formData.final_treatment,
        estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
        currency: formData.currency,
        status: "recommended",
      });

      if (error) throw error;

      toast({
        title: "Treatment Plan Created",
        description: "The treatment plan has been successfully created.",
      });

      setFormData({
        symptoms: "",
        ai_recommendation: "",
        dentist_notes: "",
        final_treatment: "",
        estimated_cost: "",
        currency: "USD",
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create treatment plan.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Treatment Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Symptoms</Label>
            <Textarea
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              placeholder="Describe patient symptoms"
              required
            />
          </div>

          <div>
            <Label>AI Recommendation</Label>
            <Textarea
              value={formData.ai_recommendation}
              onChange={(e) => setFormData({ ...formData, ai_recommendation: e.target.value })}
              placeholder="AI-generated recommendation"
              required
            />
          </div>

          <div>
            <Label>Dentist Notes</Label>
            <Textarea
              value={formData.dentist_notes}
              onChange={(e) => setFormData({ ...formData, dentist_notes: e.target.value })}
              placeholder="Additional notes and observations"
            />
          </div>

          <div>
            <Label>Final Treatment Plan</Label>
            <Textarea
              value={formData.final_treatment}
              onChange={(e) => setFormData({ ...formData, final_treatment: e.target.value })}
              placeholder="Final recommended treatment"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Estimated Cost</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.estimated_cost}
                onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Currency</Label>
              <Input
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                placeholder="USD"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Treatment Plan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

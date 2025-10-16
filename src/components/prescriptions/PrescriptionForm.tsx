import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface PrescriptionFormProps {
  patientId: string;
  appointmentId?: string;
  onSuccess?: () => void;
}

export const PrescriptionForm = ({ patientId, appointmentId, onSuccess }: PrescriptionFormProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    medication_name: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("prescriptions").insert({
        patient_id: patientId,
        dentist_id: user.id,
        appointment_id: appointmentId,
        ...formData,
      });

      if (error) throw error;

      toast({
        title: "Prescription Created",
        description: "The prescription has been successfully created.",
      });

      setFormData({
        medication_name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create prescription.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Prescription</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Medication Name</Label>
            <Input
              value={formData.medication_name}
              onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Dosage</Label>
              <Input
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="e.g., 500mg"
                required
              />
            </div>
            <div>
              <Label>Frequency</Label>
              <Input
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                placeholder="e.g., Twice daily"
                required
              />
            </div>
          </div>

          <div>
            <Label>Duration</Label>
            <Input
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="e.g., 7 days"
              required
            />
          </div>

          <div>
            <Label>Special Instructions</Label>
            <Textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Additional instructions for the patient"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Prescription"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

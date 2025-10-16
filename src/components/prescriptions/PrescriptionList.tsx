import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Prescription {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  prescribed_date: string;
  status: string;
}

export const PrescriptionList = ({ patientId }: { patientId?: string }) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPrescriptions();
  }, [patientId]);

  const fetchPrescriptions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from("prescriptions")
        .select("*")
        .order("prescribed_date", { ascending: false });

      if (patientId) {
        query = query.eq("patient_id", patientId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPrescriptions(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load prescriptions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("prescriptions")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: "Prescription status has been updated.",
      });

      fetchPrescriptions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  if (loading) return <div>Loading prescriptions...</div>;

  return (
    <div className="space-y-4">
      {prescriptions.map((prescription) => (
        <Card key={prescription.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{prescription.medication_name}</CardTitle>
              <Badge
                variant={
                  prescription.status === "active"
                    ? "default"
                    : prescription.status === "completed"
                    ? "secondary"
                    : "outline"
                }
              >
                {prescription.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-semibold">Dosage:</span> {prescription.dosage}
              </div>
              <div>
                <span className="font-semibold">Frequency:</span> {prescription.frequency}
              </div>
              <div>
                <span className="font-semibold">Duration:</span> {prescription.duration}
              </div>
              <div>
                <span className="font-semibold">Date:</span>{" "}
                {new Date(prescription.prescribed_date).toLocaleDateString()}
              </div>
            </div>
            {prescription.instructions && (
              <div className="text-sm">
                <span className="font-semibold">Instructions:</span> {prescription.instructions}
              </div>
            )}
            {prescription.status === "active" && (
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateStatus(prescription.id, "completed")}
                >
                  Mark Completed
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateStatus(prescription.id, "cancelled")}
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {prescriptions.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No prescriptions found
          </CardContent>
        </Card>
      )}
    </div>
  );
};

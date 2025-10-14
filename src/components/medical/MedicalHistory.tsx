import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save, FileText } from "lucide-react";

export const MedicalHistory = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    allergies: "",
    current_medications: "",
    past_dental_procedures: "",
    medical_conditions: "",
    blood_type: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    insurance_provider: "",
    insurance_policy_number: "",
    has_heart_disease: false,
    has_diabetes: false,
    has_high_blood_pressure: false,
    is_pregnant: false,
    is_smoker: false,
  });

  useEffect(() => {
    fetchMedicalHistory();
  }, []);

  const fetchMedicalHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('medical_history')
        .select('*')
        .eq('patient_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setFormData({
          allergies: data.allergies || "",
          current_medications: data.current_medications || "",
          past_dental_procedures: data.past_dental_procedures || "",
          medical_conditions: data.medical_conditions || "",
          blood_type: data.blood_type || "",
          emergency_contact_name: data.emergency_contact_name || "",
          emergency_contact_phone: data.emergency_contact_phone || "",
          insurance_provider: data.insurance_provider || "",
          insurance_policy_number: data.insurance_policy_number || "",
          has_heart_disease: data.has_heart_disease || false,
          has_diabetes: data.has_diabetes || false,
          has_high_blood_pressure: data.has_high_blood_pressure || false,
          is_pregnant: data.is_pregnant || false,
          is_smoker: data.is_smoker || false,
        });
      }
    } catch (error: any) {
      console.error("Error fetching medical history:", error);
      toast.error("Failed to load medical history");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      const { error } = await supabase
        .from('medical_history')
        .upsert({
          patient_id: user.id,
          ...formData,
        });

      if (error) throw error;

      toast.success("Medical history saved successfully");
    } catch (error: any) {
      console.error("Error saving medical history:", error);
      toast.error(error.message || "Failed to save medical history");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FileText className="h-6 w-6" />
        Medical History
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea
              id="allergies"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              placeholder="List any allergies..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_medications">Current Medications</Label>
            <Textarea
              id="current_medications"
              value={formData.current_medications}
              onChange={(e) => setFormData({ ...formData, current_medications: e.target.value })}
              placeholder="List medications you're taking..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medical_conditions">Medical Conditions</Label>
            <Textarea
              id="medical_conditions"
              value={formData.medical_conditions}
              onChange={(e) => setFormData({ ...formData, medical_conditions: e.target.value })}
              placeholder="List any medical conditions..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="past_dental_procedures">Past Dental Procedures</Label>
            <Textarea
              id="past_dental_procedures"
              value={formData.past_dental_procedures}
              onChange={(e) => setFormData({ ...formData, past_dental_procedures: e.target.value })}
              placeholder="List past dental work..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="blood_type">Blood Type</Label>
            <Input
              id="blood_type"
              value={formData.blood_type}
              onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
              placeholder="e.g., O+, A-, AB+"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
            <Input
              id="emergency_contact_name"
              value={formData.emergency_contact_name}
              onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
              placeholder="Full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
            <Input
              id="emergency_contact_phone"
              type="tel"
              value={formData.emergency_contact_phone}
              onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
              placeholder="Phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="insurance_provider">Insurance Provider</Label>
            <Input
              id="insurance_provider"
              value={formData.insurance_provider}
              onChange={(e) => setFormData({ ...formData, insurance_provider: e.target.value })}
              placeholder="Insurance company name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="insurance_policy_number">Insurance Policy Number</Label>
            <Input
              id="insurance_policy_number"
              value={formData.insurance_policy_number}
              onChange={(e) => setFormData({ ...formData, insurance_policy_number: e.target.value })}
              placeholder="Policy/member ID"
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-semibold">Health Conditions</Label>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_heart_disease"
                checked={formData.has_heart_disease}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, has_heart_disease: checked as boolean })
                }
              />
              <Label htmlFor="has_heart_disease" className="font-normal">
                Heart Disease
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_diabetes"
                checked={formData.has_diabetes}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, has_diabetes: checked as boolean })
                }
              />
              <Label htmlFor="has_diabetes" className="font-normal">
                Diabetes
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_high_blood_pressure"
                checked={formData.has_high_blood_pressure}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, has_high_blood_pressure: checked as boolean })
                }
              />
              <Label htmlFor="has_high_blood_pressure" className="font-normal">
                High Blood Pressure
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_pregnant"
                checked={formData.is_pregnant}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, is_pregnant: checked as boolean })
                }
              />
              <Label htmlFor="is_pregnant" className="font-normal">
                Pregnant
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_smoker"
                checked={formData.is_smoker}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, is_smoker: checked as boolean })
                }
              />
              <Label htmlFor="is_smoker" className="font-normal">
                Smoker
              </Label>
            </div>
          </div>
        </div>

        <Button type="submit" disabled={saving} className="w-full" size="lg">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Medical History
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};

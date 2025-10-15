import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface PaymentFormProps {
  appointmentId: string;
  amount: number;
}

export const PaymentForm = ({ appointmentId, amount }: PaymentFormProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("payments").insert({
        patient_id: user.id,
        appointment_id: appointmentId,
        amount: amount,
        status: "completed",
      });

      if (error) throw error;

      toast({
        title: "Payment Successful",
        description: "Your payment has been processed.",
      });
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Amount</Label>
          <Input value={`$${amount}`} disabled />
        </div>
        
        <div>
          <Label>Card Number</Label>
          <Input placeholder="1234 5678 9012 3456" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Expiry Date</Label>
            <Input placeholder="MM/YY" />
          </div>
          <div>
            <Label>CVV</Label>
            <Input placeholder="123" type="password" maxLength={3} />
          </div>
        </div>

        <Button 
          onClick={handlePayment} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "Processing..." : "Pay Now"}
        </Button>
      </CardContent>
    </Card>
  );
};

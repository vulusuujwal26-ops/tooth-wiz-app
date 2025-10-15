import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Payments() {
  const [payments, setPayments] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      fetchPayments(user.id);
    };

    checkAuth();
  }, [navigate]);

  const fetchPayments = async (userId: string) => {
    const { data } = await supabase
      .from("payments")
      .select(`
        *,
        appointments (
          appointment_date,
          appointment_time,
          reason
        )
      `)
      .eq("patient_id", userId)
      .order("created_at", { ascending: false });

    setPayments(data || []);
  };

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
          <h1 className="text-3xl font-bold">Payment History</h1>
        </div>

        <div className="grid gap-4">
          {payments.map((payment) => (
            <Card key={payment.id}>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>${payment.amount}</span>
                  <span className={`text-sm ${
                    payment.status === "completed" ? "text-green-600" : "text-yellow-600"
                  }`}>
                    {payment.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {payment.appointments?.reason || "Appointment"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(payment.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}

          {payments.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No payment history available
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

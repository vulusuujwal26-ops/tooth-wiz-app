import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface WaitlistEntry {
  id: string;
  preferred_date: string;
  preferred_time: string;
  reason: string;
  priority: string;
  status: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export const WaitlistManager = () => {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const fetchWaitlist = async () => {
    try {
      const { data: waitlistData, error } = await supabase
        .from("waitlist")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profile data separately
      const enrichedData = await Promise.all(
        (waitlistData || []).map(async (entry) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", entry.patient_id)
            .single();

          return {
            ...entry,
            profiles: profileData || { full_name: "Unknown", email: "" },
          };
        })
      );

      setEntries(enrichedData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load waitlist.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("waitlist")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: "Waitlist entry has been updated.",
      });

      fetchWaitlist();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  if (loading) return <div>Loading waitlist...</div>;

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <Card key={entry.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">
                  {entry.profiles?.full_name || "Unknown Patient"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{entry.profiles?.email}</p>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant={
                    entry.priority === "urgent"
                      ? "destructive"
                      : entry.priority === "high"
                      ? "default"
                      : "secondary"
                  }
                >
                  {entry.priority}
                </Badge>
                <Badge variant="outline">{entry.status}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <span className="font-semibold">Reason:</span> {entry.reason}
            </div>
            {entry.preferred_date && (
              <div className="text-sm">
                <span className="font-semibold">Preferred Date:</span>{" "}
                {new Date(entry.preferred_date).toLocaleDateString()}
                {entry.preferred_time && ` at ${entry.preferred_time}`}
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              Added: {new Date(entry.created_at).toLocaleString()}
            </div>
            {entry.status === "waiting" && (
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={() => updateStatus(entry.id, "contacted")}
                >
                  Mark Contacted
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateStatus(entry.id, "scheduled")}
                >
                  Schedule
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateStatus(entry.id, "cancelled")}
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {entries.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No waitlist entries
          </CardContent>
        </Card>
      )}
    </div>
  );
};

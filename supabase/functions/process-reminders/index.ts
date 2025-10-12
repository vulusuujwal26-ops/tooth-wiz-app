import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Processing reminders...');

    // Get all unsent reminders that are due
    const { data: reminders, error: fetchError } = await supabase
      .from('reminders')
      .select(`
        id,
        reminder_type,
        scheduled_for,
        patient_id,
        appointment_id,
        appointments (
          appointment_date,
          appointment_time,
          reason
        ),
        profiles (
          full_name,
          email
        )
      `)
      .eq('sent', false)
      .lte('scheduled_for', new Date().toISOString());

    if (fetchError) {
      console.error('Error fetching reminders:', fetchError);
      throw fetchError;
    }

    if (!reminders || reminders.length === 0) {
      console.log('No reminders to process');
      return new Response(
        JSON.stringify({ message: 'No reminders to process', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${reminders.length} reminders to process`);

    // Process each reminder
    const processedReminders = [];
    for (const reminder of reminders) {
      try {
        // In a production system, you would send an actual email/SMS here
        // For now, we'll just log the reminder details
        const appointmentData = reminder.appointments as any;
        const profileData = reminder.profiles as any;
        
        console.log(`Sending ${reminder.reminder_type} reminder to ${profileData.email}`);
        console.log(`Appointment: ${appointmentData.appointment_date} at ${appointmentData.appointment_time}`);
        
        // Mark reminder as sent
        const { error: updateError } = await supabase
          .from('reminders')
          .update({ sent: true })
          .eq('id', reminder.id);

        if (updateError) {
          console.error(`Error marking reminder ${reminder.id} as sent:`, updateError);
        } else {
          processedReminders.push(reminder.id);
          console.log(`Reminder ${reminder.id} marked as sent`);
        }
      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Reminders processed successfully',
        count: processedReminders.length,
        processed: processedReminders
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: any) {
    console.error('Error in process-reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

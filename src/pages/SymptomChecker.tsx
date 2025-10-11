import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState("");
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!symptoms.trim()) {
      toast.error("Please describe your symptoms");
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis with a delay
    setTimeout(() => {
      const mockRecommendation = generateMockRecommendation(symptoms);
      setRecommendation(mockRecommendation);
      setIsAnalyzing(false);
      toast.success("Analysis complete");
    }, 2000);
  };

  const generateMockRecommendation = (symptomText: string): string => {
    const lowerSymptoms = symptomText.toLowerCase();
    
    if (lowerSymptoms.includes("pain") || lowerSymptoms.includes("ache")) {
      return "Based on your symptoms, you may be experiencing dental sensitivity or early signs of a cavity. We recommend:\n\n• Schedule a dental examination within the next week\n• Avoid very hot or cold foods temporarily\n• Use a toothpaste designed for sensitive teeth\n• Maintain regular brushing and flossing\n\nNote: This is a preliminary assessment. Please consult with a dentist for proper diagnosis.";
    }
    
    if (lowerSymptoms.includes("bleed") || lowerSymptoms.includes("gum")) {
      return "Your symptoms suggest possible gum inflammation (gingivitis). We recommend:\n\n• Schedule a dental cleaning and checkup\n• Use an antiseptic mouthwash\n• Brush gently but thoroughly twice daily\n• Floss carefully once per day\n• Consider a softer toothbrush\n\nNote: This is a preliminary assessment. Please consult with a dentist for proper diagnosis.";
    }
    
    return "Based on your description, we recommend:\n\n• Schedule a comprehensive dental examination\n• Continue with regular oral hygiene practices\n• Monitor your symptoms and note any changes\n• Avoid self-medication\n\nA professional evaluation will help determine the exact cause and appropriate treatment.\n\nNote: This is a preliminary assessment. Please consult with a dentist for proper diagnosis.";
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <Card className="p-8 shadow-elevated border-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-accent/10 w-12 h-12 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-accent" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">AI Symptom Checker</h1>
          </div>
          
          <p className="text-muted-foreground mb-8">
            Describe your dental symptoms and get preliminary AI-powered treatment recommendations. 
            This tool provides guidance but does not replace professional dental diagnosis.
          </p>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="symptoms">Describe Your Symptoms</Label>
              <Textarea
                id="symptoms"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Example: I have a sharp pain in my upper left molar when eating cold foods. The pain started two days ago and has been getting worse..."
                rows={6}
                className="resize-none"
              />
            </div>

            <Button 
              onClick={handleAnalyze} 
              size="lg" 
              className="w-full shadow-elevated hover:scale-[1.02] transition-transform"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Analyze Symptoms
                </>
              )}
            </Button>

            {recommendation && (
              <Card className="p-6 bg-accent/5 border-2 border-accent/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  AI Recommendation
                </h3>
                <div className="prose prose-sm max-w-none text-foreground whitespace-pre-line">
                  {recommendation}
                </div>
                <div className="mt-6 pt-6 border-t border-border">
                  <Link to="/booking">
                    <Button className="w-full shadow-card hover:scale-[1.02] transition-transform">
                      Book an Appointment
                    </Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              <strong>Disclaimer:</strong> This AI tool provides preliminary guidance only and should not be used as a substitute 
              for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified dentist 
              with any questions you may have regarding a dental condition.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SymptomChecker;

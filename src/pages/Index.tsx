import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Brain, Bell, ClipboardCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-24 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            AI-Powered Dental Care
          </h1>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
            Smart appointment scheduling, AI-assisted treatment recommendations, and seamless practice management—all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            <Link to="/booking">
              <Button size="lg" variant="secondary" className="text-lg px-8 shadow-elevated hover:scale-105 transition-transform">
                Book Appointment <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/symptom-checker">
              <Button size="lg" variant="outline" className="text-lg px-8 border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 shadow-elevated hover:scale-105 transition-transform">
                Try AI Symptom Checker
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-4 text-foreground">
            Comprehensive Dental Solutions
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg max-w-2xl mx-auto">
            Our platform combines cutting-edge AI with intuitive design to streamline every aspect of dental care.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-2">
              <div className="rounded-full bg-primary/10 w-14 h-14 flex items-center justify-center mb-4">
                <Calendar className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                Smart Scheduling
              </h3>
              <p className="text-muted-foreground">
                Book appointments instantly with real-time availability and automated reminders.
              </p>
            </Card>

            <Card className="p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-2">
              <div className="rounded-full bg-accent/10 w-14 h-14 flex items-center justify-center mb-4">
                <Brain className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                AI Treatment Recommendations
              </h3>
              <p className="text-muted-foreground">
                Get preliminary treatment suggestions based on symptoms and dental history.
              </p>
            </Card>

            <Card className="p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-2">
              <div className="rounded-full bg-secondary/10 w-14 h-14 flex items-center justify-center mb-4">
                <Bell className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                Automated Reminders
              </h3>
              <p className="text-muted-foreground">
                Never miss an appointment with SMS and email notifications.
              </p>
            </Card>

            <Card className="p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-2">
              <div className="rounded-full bg-primary/10 w-14 h-14 flex items-center justify-center mb-4">
                <ClipboardCheck className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                Practice Integration
              </h3>
              <p className="text-muted-foreground">
                Seamlessly connect with existing practice management systems.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Ready to Transform Your Dental Practice?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of dental practices using AI to improve patient care and operational efficiency.
          </p>
          <Link to="/booking">
            <Button size="lg" className="text-lg px-8 shadow-elevated hover:scale-105 transition-transform">
              Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;

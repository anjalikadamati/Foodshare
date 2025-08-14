import { Card, CardContent } from "@/components/ui/card";
import { Upload, Search, Handshake, Heart } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "List Your Food",
    description: "Food providers post available meals with details about quantity, pickup time, and location.",
    color: "text-primary"
  },
  {
    icon: Search,
    title: "Discover Opportunities",
    description: "Donors browse nearby food listings and find meals that match their capacity and schedule.",
    color: "text-warm"
  },
  {
    icon: Handshake,
    title: "Connect & Coordinate",
    description: "Direct communication between providers and donors to arrange safe, timely pickup.",
    color: "text-success"
  },
  {
    icon: Heart,
    title: "Make an Impact",
    description: "Food reaches those who need it, reducing waste and strengthening community bonds.",
    color: "text-primary-glow"
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our simple four-step process makes food sharing effortless and impactful
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="relative group hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="relative mb-6">
                  <div className={`inline-flex p-4 rounded-full bg-gradient-to-br from-primary/10 to-primary-glow/10 ${step.color}`}>
                    <step.icon className="h-8 w-8" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-primary text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
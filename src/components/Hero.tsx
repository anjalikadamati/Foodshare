import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Users, Utensils } from "lucide-react";
import heroImage from "@/assets/hero-food-sharing.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Turn Food Waste Into
            <span className="bg-gradient-to-r from-primary-glow to-warm bg-clip-text text-transparent"> Community Care</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed">
            Connect food providers with those in need. Reduce waste, fight hunger, and build stronger communities one meal at a time.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="hero" size="lg" className="text-lg px-8 py-4">
              Share Food <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-white/10 border-white/30 text-white hover:bg-white/20">
              Find Food <Heart className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Utensils className="h-12 w-12 text-primary-glow" />
              </div>
              <h3 className="text-3xl font-bold mb-2">10,000+</h3>
              <p className="text-gray-300">Meals Shared</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Users className="h-12 w-12 text-primary-glow" />
              </div>
              <h3 className="text-3xl font-bold mb-2">500+</h3>
              <p className="text-gray-300">Active Members</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Heart className="h-12 w-12 text-primary-glow" />
              </div>
              <h3 className="text-3xl font-bold mb-2">50+</h3>
              <p className="text-gray-300">Partner NGOs</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
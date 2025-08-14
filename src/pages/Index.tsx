import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, MapPin, Users, ChefHat, Leaf, Clock, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-food-sharing-community.jpg";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user && !loading) {
      // Fetch user profile to determine user type
      const fetchUserProfile = async () => {
        const { data } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', user.id)
          .single();
        
        setUserProfile(data);
        
        // Only auto-redirect on initial load, not when navigating back to home
        const hasAutoRedirected = sessionStorage.getItem('hasAutoRedirected');
        if (data?.user_type && !hasAutoRedirected) {
          sessionStorage.setItem('hasAutoRedirected', 'true');
          if (data.user_type === 'food_provider') {
            navigate('/provider');
          } else if (data.user_type === 'food_donor') {
            navigate('/donor');
          }
        }
      };
      
      fetchUserProfile();
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Share Food,
              <span className="bg-gradient-to-r from-primary-glow to-warm bg-clip-text text-transparent"> Share Hope</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed">
              Connect food providers with those in need. Together, we can eliminate food waste and fight hunger in our communities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/auth">
                <Button size="lg" className="text-lg px-8 py-6 bg-white/10 border border-white/30 text-white hover:bg-white/20 transform hover:scale-105 transition-all duration-200">
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={() => {
                const howItWorksSection = document.getElementById('how-it-works');
                howItWorksSection?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Mission Section */}
      <section className="py-16 px-6 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">The Problem We're Solving</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every year, billions of pounds of food go to waste while millions face hunger. It's time to bridge this gap.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-2xl font-bold mb-2">1.3 Billion Tons</h3>
                <p className="text-muted-foreground">of food wasted globally each year</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-warning" />
                </div>
                <h3 className="text-2xl font-bold mb-2">828 Million</h3>
                <p className="text-muted-foreground">people face hunger worldwide</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">1 Solution</h3>
                <p className="text-muted-foreground">connecting surplus with need</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">Our Mission</h3>
              <p className="text-lg text-muted-foreground mb-6">
                FoodShare creates a seamless platform where restaurants, grocery stores, and food providers can instantly connect with food banks, shelters, and communities in need.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Real-time food availability updates</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Location-based matching system</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Safe and verified transactions</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=600&h=400" 
                alt="Food sharing community" 
                className="rounded-lg shadow-xl w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">How FoodShare Works</h2>
            <p className="text-xl text-muted-foreground">Simple steps to make a big difference</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Food Providers */}
            <Card className="p-8 border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <ChefHat className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">For Food Providers</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                    <div>
                      <h4 className="font-semibold">List Available Food</h4>
                      <p className="text-muted-foreground">Post details about surplus food with photos, quantities, and pickup times</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                    <div>
                      <h4 className="font-semibold">Receive Requests</h4>
                      <p className="text-muted-foreground">Get notified when nearby organizations need your food donations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                    <div>
                      <h4 className="font-semibold">Coordinate Pickup</h4>
                      <p className="text-muted-foreground">Arrange convenient pickup times and help feed the community</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Food Recipients */}
            <Card className="p-8 border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-warm/10 rounded-full flex items-center justify-center mb-6">
                  <Heart className="h-8 w-8 text-warm" />
                </div>
                <h3 className="text-2xl font-bold mb-4">For Food Recipients</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-warm rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                    <div>
                      <h4 className="font-semibold">Browse Available Food</h4>
                      <p className="text-muted-foreground">Search for available donations near your location in real-time</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-warm rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                    <div>
                      <h4 className="font-semibold">Request Food Items</h4>
                      <p className="text-muted-foreground">Submit requests for the food your organization needs most</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-warm rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                    <div>
                      <h4 className="font-semibold">Collect & Distribute</h4>
                      <p className="text-muted-foreground">Pick up confirmed donations and distribute to those in need</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-primary via-primary-glow to-warm text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of organizations already fighting food waste and hunger</p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 transform hover:scale-105 transition-all duration-200">
              Start Sharing Food Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

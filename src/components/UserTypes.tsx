import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Heart, CheckCircle, Users, Building, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const UserTypes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = async (userType: string) => {
    if (user) {
      // If logged in, check actual user type from database
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', user.id)
          .single();
        
        if (!error && userData) {
          if (userData.user_type === 'food_provider') {
            navigate("/provider");
          } else if (userData.user_type === 'food_donor') {
            navigate("/donor");
          } else {
            navigate("/auth");
          }
        } else {
          navigate("/auth");
        }
      } catch (error) {
        navigate("/auth");
      }
    } else {
      // If not logged in, redirect to auth page
      navigate("/auth");
    }
  };
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Join Our Community</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Whether you have food to share or can help distribute it, there's a place for you
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Food Providers */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-primary/10 to-primary-glow/10 rounded-full">
                <Store className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-3xl mb-4">Food Providers</CardTitle>
              <p className="text-lg text-muted-foreground">
                Share your surplus food and make a difference
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { icon: Building, text: "Restaurants & Canteens" },
                  { icon: Home, text: "Hostels & Events" },
                  { icon: Users, text: "Individuals & Families" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-4">
                <h4 className="font-semibold mb-3">What you can do:</h4>
                <ul className="space-y-2">
                  {[
                    "List surplus food with pickup details",
                    "Connect with verified donors",
                    "Track your impact and contributions",
                    "Reduce waste while helping others"
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Button variant="hero" className="w-full mt-6" onClick={() => handleGetStarted("provider")}>
                Start Sharing Food
              </Button>
            </CardContent>
          </Card>
          
          {/* Food Donors */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-warm/20">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto mb-6 p-4 bg-gradient-to-br from-warm/10 to-warm/20 rounded-full">
                <Heart className="h-12 w-12 text-warm" />
              </div>
              <CardTitle className="text-3xl mb-4">Food Donors</CardTitle>
              <p className="text-lg text-muted-foreground">
                Help distribute food to those who need it most
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { icon: Heart, text: "NGOs & Charities" },
                  { icon: Users, text: "Community Groups" },
                  { icon: Building, text: "Individual Volunteers" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5 text-warm flex-shrink-0" />
                    <span className="text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-4">
                <h4 className="font-semibold mb-3">What you can do:</h4>
                <ul className="space-y-2">
                  {[
                    "Browse available food listings",
                    "Request food for your community",
                    "Coordinate safe food pickup",
                    "Make direct impact on hunger"
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Button variant="warm" className="w-full mt-6" onClick={() => handleGetStarted("donor")}>
                Start Helping Others
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default UserTypes;
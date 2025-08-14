import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Leaf } from "lucide-react";

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      // Check user type and redirect to appropriate dashboard
      const checkUserTypeAndRedirect = async () => {
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
              navigate("/");
            }
          } else {
            navigate("/");
          }
        } catch (error) {
          navigate("/");
        }
      };
      
      checkUserTypeAndRedirect();
    }
  }, [user, navigate]);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    email: "",
    password: "",
    name: "",
    userType: "food_donor" as "food_provider" | "food_donor",
    organizationName: "",
    address: "",
    contactNumber: "",
    contactPerson: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (error) throw error;

      // Check user type and redirect appropriately
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      
      if (!userError && userData) {
        if (userData.user_type === 'food_provider') {
          navigate("/provider");
        } else if (userData.user_type === 'food_donor') {
          navigate("/donor");
        } else {
          navigate("/");
        }
      } else {
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile in our users table
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: signupForm.email,
            name: signupForm.name,
            user_type: signupForm.userType,
            organization_name: signupForm.organizationName || null,
            address: signupForm.address,
            contact_number: signupForm.contactNumber,
            contact_person: signupForm.contactPerson || null,
          });

        if (profileError) {
          console.error("Profile creation error:", profileError);
        }
      }

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
      
      // Redirect based on user type
      if (signupForm.userType === 'food_provider') {
        navigate("/provider");
      } else if (signupForm.userType === 'food_donor') {
        navigate("/donor");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "An error occurred during signup.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="p-3 bg-gradient-to-r from-primary to-primary-glow rounded-xl">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground ml-3">FoodShare</h1>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>
                  Sign in to your FoodShare account
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create account</CardTitle>
                <CardDescription>
                  Join FoodShare to start reducing food waste
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      required
                    />
                  </div>
                   <div className="space-y-4">
                     <Label className="text-base font-semibold">Choose Your Role</Label>
                     <RadioGroup
                       value={signupForm.userType}
                       onValueChange={(value: "food_provider" | "food_donor") => 
                         setSignupForm({ ...signupForm, userType: value })
                       }
                       className="space-y-4"
                     >
                       <div className="border rounded-lg p-4 hover:border-primary transition-colors">
                         <div className="flex items-start space-x-3">
                           <RadioGroupItem value="food_provider" id="provider" className="mt-1" />
                           <div className="flex-1">
                             <Label htmlFor="provider" className="font-semibold text-primary cursor-pointer">
                               Provide Food
                             </Label>
                             <p className="text-sm text-muted-foreground mt-1">
                               I have surplus food to share (Restaurant, Hostel, Catering, Event Organizer)
                             </p>
                           </div>
                         </div>
                       </div>
                       <div className="border rounded-lg p-4 hover:border-primary transition-colors">
                         <div className="flex items-start space-x-3">
                           <RadioGroupItem value="food_donor" id="donor" className="mt-1" />
                           <div className="flex-1">
                             <Label htmlFor="donor" className="font-semibold text-primary cursor-pointer">
                               Receive Food
                             </Label>
                             <p className="text-sm text-muted-foreground mt-1">
                               I need food donations for my organization (NGO, Shelter, Food Bank, Individual)
                             </p>
                           </div>
                         </div>
                       </div>
                     </RadioGroup>
                   </div>
                  {signupForm.userType === "food_provider" && (
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization Name (Optional)</Label>
                      <Input
                        id="organization"
                        value={signupForm.organizationName}
                        onChange={(e) => setSignupForm({ ...signupForm, organizationName: e.target.value })}
                      />
                    </div>
                  )}
                  {signupForm.userType === "food_donor" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="organization">Organization Name (Optional)</Label>
                        <Input
                          id="organization"
                          value={signupForm.organizationName}
                          onChange={(e) => setSignupForm({ ...signupForm, organizationName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-person">Contact Person (Optional)</Label>
                        <Input
                          id="contact-person"
                          value={signupForm.contactPerson}
                          onChange={(e) => setSignupForm({ ...signupForm, contactPerson: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={signupForm.address}
                      onChange={(e) => setSignupForm({ ...signupForm, address: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact Number</Label>
                    <Input
                      id="contact"
                      type="tel"
                      value={signupForm.contactNumber}
                      onChange={(e) => setSignupForm({ ...signupForm, contactNumber: e.target.value })}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthPage;
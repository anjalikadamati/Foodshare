import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Clock, Heart, Package, Users, Home, FileText, User, LogOut, Bell } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import RequestFoodDialog from "@/components/RequestFoodDialog";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";

interface FoodListing {
  id: string;
  food_item_name: string;
  quantity: string;
  expiry_datetime: string;
  pickup_address: string;
  pickup_instructions?: string;
  contact_person_name: string;
  contact_person_phone: string;
  status: string;
  created_at: string;
  provider_id: string;
}

interface DonationRequest {
  id: string;
  requested_quantity: string;
  message_to_provider: string;
  status: string;
  created_at: string;
  food_listing_id: string;
  food_listings: {
    food_item_name: string;
    pickup_address: string;
    contact_person_name: string;
  };
}

const DonorDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { profile } = useUserProfile();
  const [availableListings, setAvailableListings] = useState<FoodListing[]>([]);
  const [myRequests, setMyRequests] = useState<DonationRequest[]>([]);
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAvailableListings();
      fetchMyRequests();
    }
  }, [user]);

  const fetchAvailableListings = async () => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('food_listings')
        .select('*')
        .eq('status', 'available')
        .neq('provider_id', user?.id) // Don't show user's own listings
        .gt('expiry_datetime', now) // Only show non-expired listings
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvailableListings(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch available food listings",
        variant: "destructive",
      });
    }
  };

  const fetchMyRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('donation_requests')
        .select(`
          *,
          food_listings(food_item_name, pickup_address, contact_person_name)
        `)
        .eq('donor_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyRequests(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch your requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestFood = (listing: FoodListing) => {
    setSelectedListing(listing);
    setIsRequestDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      accepted: "default",
      rejected: "destructive",
    } as const;

    const colors = {
      pending: "text-orange",
      accepted: "text-green-500",
      rejected: "text-red-500",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status}
      </Badge>
    );
  };

  const getTimeLeft = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffHours = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Less than 1 hour";
    if (diffHours < 24) return `${diffHours} hours`;
    return `${Math.ceil(diffHours / 24)} days`;
  };

  const filteredListings = availableListings.filter(listing =>
    listing.food_item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.pickup_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar userType="food_donor" />
      
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  ✨ Hello, {profile?.name || 'Food Receiver'}! 🤝
                </h1>
                <p className="text-muted-foreground mt-2">
                  Discover available food and make donation requests
                </p>
              </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Input 
                  placeholder="Search food items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500 rounded-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-emerald-700">{myRequests.filter(r => r.status === 'accepted').length}</p>
                  <p className="text-sm text-emerald-600 font-medium">Total</p>
                  <p className="text-xs text-emerald-500">Donations Received</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-700">150</p>
                  <p className="text-sm text-blue-600 font-medium">Kg</p>
                  <p className="text-xs text-blue-500">Food Quantity</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500 rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-orange-700">{myRequests.filter(r => r.status === 'pending').length}</p>
                  <p className="text-sm text-orange-600 font-medium">Pending</p>
                  <p className="text-xs text-orange-500">Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-purple-700">{myRequests.filter(r => r.status === 'accepted').length}</p>
                  <p className="text-sm text-purple-600 font-medium">Upcoming</p>
                  <p className="text-xs text-purple-500">Pickups</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

          <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">Nearby Food Listings</TabsTrigger>
            <TabsTrigger value="requests">My Recent Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by food type or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {filteredListings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchTerm ? "No matching listings found" : "No available food listings"}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? "Try adjusting your search terms" : "Check back later for new food donations"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <Card key={listing.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-card/80 overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-semibold line-clamp-2 text-foreground">{listing.food_item_name}</CardTitle>
                        <Badge 
                          variant="secondary" 
                          className="ml-2 flex-shrink-0 bg-primary/10 text-primary border-primary/20"
                        >
                          {getTimeLeft(listing.expiry_datetime)} left
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Package className="h-4 w-4" />
                        <span className="font-medium">{listing.quantity}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-sm line-clamp-2 text-foreground">{listing.pickup_address}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-warning" />
                          <p className="text-sm">Expires: {new Date(listing.expiry_datetime).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      {listing.pickup_instructions && (
                        <div className="bg-primary/5 p-3 rounded-lg border-l-2 border-l-primary">
                          <p className="text-sm font-medium text-primary mb-1">Pickup Instructions:</p>
                          <p className="text-sm text-muted-foreground">{listing.pickup_instructions}</p>
                        </div>
                      )}
                      
                      <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                        <p className="text-sm"><span className="font-medium">Contact:</span> {listing.contact_person_name}</p>
                        <p className="text-sm"><span className="font-medium">Phone:</span> {listing.contact_person_phone}</p>
                      </div>
                      
                      <Button 
                        onClick={() => handleRequestFood(listing)}
                        className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary transition-all duration-300"
                      >
                        🤝 Request This Food
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            {myRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No requests yet</h3>
                  <p className="text-muted-foreground">Your food donation requests will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {myRequests.map((request) => (
                  <Card key={request.id} className={`hover:shadow-lg transition-all duration-300 ${
                    request.status === 'pending' ? 'border-l-4 border-l-warning bg-warning/5' : 
                    request.status === 'accepted' ? 'border-l-4 border-l-success bg-success/5' : 
                    'border-l-4 border-l-destructive bg-destructive/5'
                  }`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            {request.status === 'accepted' && '🎉'}
                            {request.status === 'pending' && '⏳'}
                            {request.status === 'rejected' && '❌'}
                            {request.food_listings.food_item_name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Requested: {request.requested_quantity || 'Full quantity available'}
                          </CardDescription>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-primary mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">Pickup Location:</p>
                              <p className="text-sm text-muted-foreground">{request.food_listings.pickup_address}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-sm font-medium">Contact: {request.food_listings.contact_person_name}</p>
                              <p className="text-sm text-muted-foreground">
                                Requested: {new Date(request.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {request.message_to_provider && (
                        <div className="bg-primary/5 p-4 rounded-lg border-l-2 border-l-primary">
                          <p className="text-sm font-medium mb-2 text-primary">Your message to provider:</p>
                          <p className="text-sm text-muted-foreground italic">
                            "{request.message_to_provider}"
                          </p>
                        </div>
                      )}
                      
                      {request.status === 'accepted' && (
                        <div className="bg-success/10 p-4 rounded-lg border border-success/20">
                          <p className="text-sm font-medium text-success mb-1">✅ Request Accepted!</p>
                          <p className="text-sm text-muted-foreground">
                            Your donation request has been approved. You can proceed with the pickup.
                          </p>
                        </div>
                      )}
                      
                      {request.status === 'rejected' && (
                        <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                          <p className="text-sm font-medium text-destructive mb-1">❌ Request Declined</p>
                          <p className="text-sm text-muted-foreground">
                            Unfortunately, this request was not approved. Please try other available listings.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          </Tabs>
        </div>
      </div>

      <RequestFoodDialog
        listing={selectedListing} 
        open={isRequestDialogOpen} 
        onOpenChange={setIsRequestDialogOpen}
        onSuccess={() => {
          setIsRequestDialogOpen(false);
          fetchMyRequests();
        }}
      />
    </div>
  );
};

export default DonorDashboard;
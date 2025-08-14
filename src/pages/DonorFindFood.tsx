import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Clock, Package, Phone, User } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import RequestFoodDialog from "@/components/RequestFoodDialog";
import { useToast } from "@/hooks/use-toast";

interface FoodListing {
  id: string;
  food_item_name: string;
  quantity: string;
  expiry_datetime: string;
  pickup_address: string;
  contact_person_name: string;
  contact_person_phone: string;
  status: string;
  created_at: string;
  pickup_instructions?: string;
}

const DonorFindFood = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('food_listings')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch available food listings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(listing =>
    listing.food_item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.pickup_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRequestFood = (listing: FoodListing) => {
    setSelectedListing(listing);
    setIsRequestDialogOpen(true);
  };

  const getTimeLeft = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffInHours = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 0) return { text: "Expired", color: "text-red-600" };
    if (diffInHours < 24) return { text: `${diffInHours}h left`, color: "text-red-600" };
    if (diffInHours < 48) return { text: `${Math.floor(diffInHours / 24)}d left`, color: "text-yellow-600" };
    return { text: `${Math.floor(diffInHours / 24)}d left`, color: "text-green-600" };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      <Sidebar userType="food_donor" />
      
      <div className="flex-1">
        <div className="bg-white border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Search className="h-8 w-8 text-emerald-600" />
                Find Food
              </h1>
              <p className="text-gray-600 mt-1">Discover available food donations near you</p>
            </div>
          </div>
          
          <div className="relative mt-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search by food type or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full max-w-md"
            />
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100">Available Now</p>
                    <p className="text-3xl font-bold">{listings.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-emerald-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Expiring Soon</p>
                    <p className="text-3xl font-bold">
                      {listings.filter(l => {
                        const hours = Math.floor((new Date(l.expiry_datetime).getTime() - new Date().getTime()) / (1000 * 60 * 60));
                        return hours < 48 && hours > 0;
                      }).length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Nearby</p>
                    <p className="text-3xl font-bold">{Math.floor(listings.length * 0.7)}</p>
                  </div>
                  <MapPin className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {filteredListings.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No food listings found</h3>
                <p className="text-gray-600">
                  {searchTerm ? "No listings match your search criteria" : "Check back later for new food donations"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredListings.map((listing) => {
                const timeLeft = getTimeLeft(listing.expiry_datetime);
                return (
                  <Card key={listing.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white group">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                            {listing.food_item_name}
                          </CardTitle>
                          <CardDescription className="text-gray-600 mt-1 flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            {listing.quantity}
                          </CardDescription>
                        </div>
                        <Badge className={`${timeLeft.color} bg-white border font-medium`}>
                          <Clock className="h-3 w-3 mr-1" />
                          {timeLeft.text}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          Pickup Location
                        </h4>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p className="font-medium">{listing.pickup_address}</p>
                          {listing.pickup_instructions && (
                            <p className="text-xs bg-blue-100 p-2 rounded border-l-2 border-blue-400">
                              <span className="font-medium">Instructions:</span> {listing.pickup_instructions}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-600" />
                          Contact Person
                        </h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="font-medium">{listing.contact_person_name}</p>
                          <p className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {listing.contact_person_phone}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button 
                          onClick={() => handleRequestFood(listing)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 transition-all duration-200 hover:scale-[1.02]"
                        >
                          Request This Food
                        </Button>
                      </div>

                      <div className="text-xs text-gray-400 text-center">
                        Listed {new Date(listing.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <RequestFoodDialog
        open={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
        listing={selectedListing}
        onSuccess={() => {
          setIsRequestDialogOpen(false);
          fetchListings();
        }}
      />
    </div>
  );
};

export default DonorFindFood;
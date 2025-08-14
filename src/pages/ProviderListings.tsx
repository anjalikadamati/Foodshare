import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PlusCircle, Package, Clock, MapPin, Search, Trash2, Edit, Eye } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import CreateFoodListingDialog from "@/components/CreateFoodListingDialog";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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

const ProviderListings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchListings();
    }
  }, [user]);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('food_listings')
        .select('*')
        .eq('provider_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch food listings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('food_listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;

      toast({
        title: "Listing deleted",
        description: "Food listing has been successfully deleted",
      });

      fetchListings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete food listing",
        variant: "destructive",
      });
    }
  };

  const filteredListings = listings.filter(listing =>
    listing.food_item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.pickup_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      available: "default",
      completed: "secondary",
      delivered: "secondary",
      expired: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status}
      </Badge>
    );
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
      <Sidebar userType="food_provider" />
      
      <div className="flex-1">
        <div className="bg-white border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Food Listings</h1>
              <p className="text-gray-600 mt-1">Manage all your food donations and track their status</p>
            </div>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
              size="lg"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Add New Listing
            </Button>
          </div>
          
          <div className="relative mt-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search by food item or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full max-w-md"
            />
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Listings</p>
                    <p className="text-3xl font-bold">{listings.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100">Available</p>
                    <p className="text-3xl font-bold">{listings.filter(l => l.status === 'available').length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-emerald-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Completed</p>
                    <p className="text-3xl font-bold">{listings.filter(l => l.status === 'completed' || l.status === 'delivered').length}</p>
                  </div>
                  <Package className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {filteredListings.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No listings found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? "No listings match your search criteria" : "Create your first food listing to start sharing with the community"}
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                  Create Your First Listing
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredListings.map((listing) => (
                <Card key={listing.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">{listing.food_item_name}</CardTitle>
                        <CardDescription className="text-gray-600 mt-1">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Quantity: {listing.quantity}
                          </div>
                        </CardDescription>
                      </div>
                      {getStatusBadge(listing.status)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Expires</p>
                          <p className="text-gray-600">{new Date(listing.expiry_datetime).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Created</p>
                          <p className="text-gray-600">{new Date(listing.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Pickup Details
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium">Address:</span> {listing.pickup_address}</p>
                        <p><span className="font-medium">Contact:</span> {listing.contact_person_name}</p>
                        <p><span className="font-medium">Phone:</span> {listing.contact_person_phone}</p>
                        {listing.pickup_instructions && (
                          <p><span className="font-medium">Instructions:</span> {listing.pickup_instructions}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="text-gray-600 hover:bg-gray-50">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                      
                      {(listing.status === 'completed' || listing.status === 'delivered') && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Food Listing</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this completed food listing? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteListing(listing.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateFoodListingDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          fetchListings();
          setIsCreateDialogOpen(false);
        }}
      />
    </div>
  );
};

export default ProviderListings;
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Package, Clock, CheckCircle, Users, Trash2, Bell, MapPin, Calendar, Phone, AlertTriangle } from "lucide-react";
import CreateFoodListingDialog from "@/components/CreateFoodListingDialog";
import EditFoodListingDialog from "@/components/EditFoodListingDialog";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Sidebar from "@/components/Sidebar";
import { useUserProfile } from "@/hooks/useUserProfile";

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
}

interface DonationRequest {
  id: string;
  requested_quantity: string;
  message_to_provider: string;
  status: string;
  created_at: string;
  food_listing_id: string;
  donor_id: string;
  food_listings: {
    food_item_name: string;
  };
}

const ProviderDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { profile } = useUserProfile();
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchListings();
      fetchRequests();
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
    }
  };

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('donation_requests')
        .select(`
          *,
          food_listings!inner(food_item_name, provider_id)
        `)
        .eq('food_listings.provider_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch donation requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('donation_requests')
        .update({ status: action })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: `Request ${action}`,
        description: `Donation request has been ${action}`,
      });

      fetchRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to ${action} request`,
        variant: "destructive",
      });
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

  const handleEditListing = (listing: FoodListing) => {
    setSelectedListing(listing);
    setIsEditDialogOpen(true);
  };

  const handleMarkAsDelivered = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('food_listings')
        .update({ status: 'delivered' })
        .eq('id', listingId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: "Food listing marked as delivered",
      });

      fetchListings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update listing status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      available: "default",
      pending: "secondary",
      accepted: "default",
      rejected: "destructive",
      completed: "default",
      delivered: "default",
    } as const;

    const colors = {
      available: "bg-emerald-100 text-emerald-800 border-emerald-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      accepted: "bg-blue-100 text-blue-800 border-blue-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      delivered: "bg-purple-100 text-purple-800 border-purple-200",
    } as const;

    return (
      <Badge className={`${colors[status as keyof typeof colors] || colors.pending} font-medium`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const isExpiringToday = (expiryDate: string) => {
    const today = new Date().toDateString();
    const expiry = new Date(expiryDate).toDateString();
    return today === expiry;
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

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

  const activeListings = listings.filter(l => l.status === 'available');
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const acceptedRequests = requests.filter(r => r.status === 'accepted');
  const totalDonated = requests.filter(r => r.status === 'accepted' || r.status === 'completed').length;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar userType="food_provider" />
      
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  ✨ Welcome back, {profile?.name || 'Food Provider'}! 🍎
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage your food listings and help reduce waste
                </p>
              </div>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)} 
              className="bg-success hover:bg-success/90 text-white"
              size="lg"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Add Food Listing
            </Button>
          </div>
        </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-emerald-700">{listings.length}</p>
                  <p className="text-sm text-emerald-600 font-medium">Total</p>
                  <p className="text-xs text-emerald-500">Food Listings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-700">{pendingRequests.length}</p>
                  <p className="text-sm text-blue-600 font-medium">Pending</p>
                  <p className="text-xs text-blue-500">Active Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-purple-700">{totalDonated}</p>
                  <p className="text-sm text-purple-600 font-medium">Donations</p>
                  <p className="text-xs text-purple-500">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-orange-700">245</p>
                  <p className="text-sm text-orange-600 font-medium">Points</p>
                  <p className="text-xs text-orange-500">Impact Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                ⭐ Quick Actions
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-all duration-300 cursor-pointer group" 
                    onClick={() => setIsCreateDialogOpen(true)}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <PlusCircle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-emerald-700">Add Food Listing</h3>
                  <p className="text-sm text-emerald-600">List surplus food for donation</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Bell className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-purple-700">Donation Requests</h3>
                  <p className="text-sm text-purple-600">Check requests from food recipients</p>
                  {pendingRequests.length > 0 && (
                    <Badge className="mt-2 bg-purple-500 text-white">{pendingRequests.length} pending</Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Your Active Listings */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <Package className="h-6 w-6 text-primary" />
                    Your Food Listings
                  </CardTitle>
                  <CardDescription>Manage your food donations and track their status</CardDescription>
                </div>
              </div>
            </CardHeader>
          <CardContent>
            {activeListings.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No active listings</h3>
                <p className="text-muted-foreground mb-6">Create your first food listing to start sharing with the community</p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Your First Listing
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.slice(0, 6).map((listing) => (
                  <Card key={listing.id} className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/80 relative overflow-hidden">
                    {isExpiringToday(listing.expiry_datetime) && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-warning text-white animate-pulse">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Expires Today
                        </Badge>
                      </div>
                    )}
                    {isExpired(listing.expiry_datetime) && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-destructive text-white">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Expired
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {listing.food_item_name}
                        </CardTitle>
                        {getStatusBadge(listing.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          <span className="font-medium">{listing.quantity}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(listing.expiry_datetime).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <p className="text-muted-foreground">{listing.pickup_address}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <p className="text-muted-foreground">{listing.contact_person_name} • {listing.contact_person_phone}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(listing.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          {listing.status === 'available' && !isExpired(listing.expiry_datetime) && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-3"
                                onClick={() => handleEditListing(listing)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="h-8 px-3"
                                onClick={() => handleMarkAsDelivered(listing.id)}
                              >
                                Mark Delivered
                              </Button>
                            </>
                          )}
                          {(listing.status === 'delivered' || isExpired(listing.expiry_datetime)) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="h-8 w-8 p-0 opacity-70 hover:opacity-100">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Food Listing</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this {isExpired(listing.expiry_datetime) ? 'expired' : 'completed'} food listing? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteListing(listing.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Donation Requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <Bell className="h-6 w-6 text-warm" />
                  Recent Donation Requests
                </CardTitle>
                <CardDescription>Latest requests from organizations and food banks</CardDescription>
              </div>
              <Button variant="outline" onClick={() => window.location.href = '/provider/requests'}>
                View All Requests
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No donation requests yet</h3>
                <p className="text-muted-foreground">Requests for your food listings will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.slice(0, 5).map((request) => (
                  <Card key={request.id} className="bg-gradient-to-r from-card to-card/80 hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-lg">{request.food_listings.food_item_name}</h4>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p><span className="font-medium">Requested Quantity:</span> {request.requested_quantity}</p>
                            {request.message_to_provider && (
                              <p><span className="font-medium">Message:</span> {request.message_to_provider}</p>
                            )}
                            <p><span className="font-medium">Request Date:</span> {new Date(request.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {request.status === 'pending' && (
                          <div className="flex gap-2 ml-4">
                            <Button 
                              size="sm" 
                              onClick={() => handleRequestAction(request.id, 'accepted')}
                              className="bg-success hover:bg-success/90 text-white"
                            >
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleRequestAction(request.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
          </Card>
        </div>
      </div>

      <CreateFoodListingDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          fetchListings();
        }}
      />

      <EditFoodListingDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen}
        listing={selectedListing}
        onSuccess={() => {
          setIsEditDialogOpen(false);
          fetchListings();
        }}
      />
    </div>
  );
};

export default ProviderDashboard;
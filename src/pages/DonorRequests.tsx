import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Search, Clock, CheckCircle, XCircle, MessageSquare, Package, MapPin } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";

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
    contact_person_phone: string;
  };
}

const DonorRequests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('donation_requests')
        .select(`
          *,
          food_listings(food_item_name, pickup_address, contact_person_name, contact_person_phone)
        `)
        .eq('donor_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch your donation requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request =>
    request.food_listings.food_item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.message_to_provider?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { 
        color: "bg-yellow-100 text-yellow-800 border-yellow-300", 
        icon: Clock,
        emoji: "⏳"
      },
      accepted: { 
        color: "bg-green-100 text-green-800 border-green-300", 
        icon: CheckCircle,
        emoji: "✅"
      },
      rejected: { 
        color: "bg-red-100 text-red-800 border-red-300", 
        icon: XCircle,
        emoji: "❌"
      },
    };

    const config = variants[status as keyof typeof variants];
    const Icon = config?.icon || Clock;

    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${config?.color || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
        <span className="text-lg">{config?.emoji}</span>
        <Icon className="h-4 w-4" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
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
      <Sidebar userType="food_donor" />
      
      <div className="flex-1">
        <div className="bg-white border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                My Requests
              </h1>
              <p className="text-gray-600 mt-1">Track all your food donation requests</p>
            </div>
          </div>
          
          <div className="relative mt-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search by food item or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full max-w-md"
            />
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100">Pending</p>
                    <p className="text-3xl font-bold">{requests.filter(r => r.status === 'pending').length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100">Accepted</p>
                    <p className="text-3xl font-bold">{requests.filter(r => r.status === 'accepted').length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-emerald-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Requests</p>
                    <p className="text-3xl font-bold">{requests.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {filteredRequests.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No requests found</h3>
                <p className="text-gray-600">
                  {searchTerm ? "No requests match your search criteria" : "You haven't made any donation requests yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredRequests.map((request) => (
                <Card key={request.id} className={`hover:shadow-lg transition-all duration-300 border-l-4 ${
                  request.status === 'pending' ? 'border-l-yellow-500 bg-yellow-50/30' : 
                  request.status === 'accepted' ? 'border-l-emerald-500 bg-emerald-50/30' : 
                  'border-l-red-500 bg-red-50/30'
                } bg-white shadow-md`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          <Package className="h-5 w-5 text-blue-600" />
                          {request.food_listings.food_item_name}
                        </CardTitle>
                        <CardDescription className="mt-2 text-gray-600">
                          Requested: {request.requested_quantity || 'Full quantity available'}
                        </CardDescription>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {request.message_to_provider && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                          <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-blue-900 mb-1">Your message to provider:</p>
                            <p className="text-blue-800 italic">"{request.message_to_provider}"</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {request.status === 'accepted' && (
                      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Pickup Information
                        </h4>
                        <div className="space-y-2 text-sm text-emerald-800">
                          <p><span className="font-medium">Address:</span> {request.food_listings.pickup_address}</p>
                          <p><span className="font-medium">Contact:</span> {request.food_listings.contact_person_name}</p>
                          <p><span className="font-medium">Phone:</span> {request.food_listings.contact_person_phone}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                      <span className="text-gray-500 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Requested on: {new Date(request.created_at).toLocaleDateString()}
                      </span>
                      
                      {request.status === 'accepted' && (
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Ready for pickup!
                        </span>
                      )}
                      
                      {request.status === 'rejected' && (
                        <span className="text-red-600 font-medium flex items-center gap-1">
                          <XCircle className="h-4 w-4" />
                          Request declined
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorRequests;
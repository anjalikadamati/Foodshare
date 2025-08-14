import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Bell, Search, Clock, CheckCircle, XCircle, MessageSquare, User } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";

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

const ProviderRequests = () => {
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

  const filteredRequests = requests.filter(request =>
    request.food_listings.food_item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.message_to_provider?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800", icon: Clock },
      accepted: { variant: "default" as const, color: "bg-green-100 text-green-800", icon: CheckCircle },
      rejected: { variant: "destructive" as const, color: "bg-red-100 text-red-800", icon: XCircle },
    };

    const config = variants[status as keyof typeof variants];
    const Icon = config?.icon || Clock;

    return (
      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config?.color || 'bg-gray-100 text-gray-800'}`}>
        <Icon className="h-4 w-4" />
        {status}
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
      <Sidebar userType="food_provider" />
      
      <div className="flex-1">
        <div className="bg-white border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Bell className="h-8 w-8 text-blue-600" />
                Donation Requests
              </h1>
              <p className="text-gray-600 mt-1">Manage incoming requests from food donors</p>
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

            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100">Rejected</p>
                    <p className="text-3xl font-bold">{requests.filter(r => r.status === 'rejected').length}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {filteredRequests.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No requests found</h3>
                <p className="text-gray-600">
                  {searchTerm ? "No requests match your search criteria" : "Donation requests will appear here when donors are interested in your listings"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredRequests.map((request) => (
                <Card key={request.id} className={`hover:shadow-lg transition-all duration-300 border-l-4 ${
                  request.status === 'pending' ? 'border-l-yellow-500' : 
                  request.status === 'accepted' ? 'border-l-emerald-500' : 
                  'border-l-red-500'
                } bg-white shadow-md`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          <User className="h-5 w-5 text-blue-600" />
                          Request for {request.food_listings.food_item_name}
                        </CardTitle>
                        <CardDescription className="mt-2 text-gray-600">
                          Requested Quantity: {request.requested_quantity || 'Full quantity available'}
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
                            <p className="font-medium text-blue-900 mb-1">Message from donor:</p>
                            <p className="text-blue-800 italic">"{request.message_to_provider}"</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Requested on: {new Date(request.created_at).toLocaleDateString()}
                      </span>
                      {request.status !== 'pending' && (
                        <span className={`font-medium flex items-center gap-1 ${
                          request.status === 'accepted' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {request.status === 'accepted' ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Accepted
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4" />
                              Rejected
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    
                    {request.status === 'pending' && (
                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <Button
                          onClick={() => handleRequestAction(request.id, 'accepted')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept Request
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleRequestAction(request.id, 'rejected')}
                          className="border-red-600 text-red-600 hover:bg-red-50 flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
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

export default ProviderRequests;
import { useState } from 'react';
import { MapPin, Navigation, Phone, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FoodListing {
  id: string;
  food_item_name: string;
  quantity: string;
  expiry_datetime: string;
  pickup_address: string;
  contact_person_name: string;
  contact_person_phone: string;
  latitude?: number;
  longitude?: number;
}

interface MapComponentProps {
  listings: FoodListing[];
  onListingClick?: (listing: FoodListing) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
  showDirections?: boolean;
}

const MapComponent = ({ 
  listings, 
  onListingClick, 
  center = [-74.006, 40.7128], 
  zoom = 12,
  height = "400px",
  showDirections = false
}: MapComponentProps) => {
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);

  const getTimeLeft = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffInHours = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 0) return { text: "Expired", color: "text-red-600" };
    if (diffInHours < 24) return { text: `${diffInHours}h left`, color: "text-red-600" };
    if (diffInHours < 48) return { text: `${Math.floor(diffInHours / 24)}d left`, color: "text-yellow-600" };
    return { text: `${Math.floor(diffInHours / 24)}d left`, color: "text-green-600" };
  };

  const handleDirections = (listing: FoodListing) => {
    if (listing.pickup_address) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.pickup_address)}`;
      window.open(url, '_blank');
    }
  };

  // For now, show a simplified list view instead of actual map
  // In production, you would integrate with Google Maps or Mapbox
  return (
    <div className={`w-full bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg`} style={{ height }}>
      <div className="p-6 h-full overflow-auto">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Food Locations</h3>
        </div>
        
        {listings.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No food listings with locations available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((listing) => (
              <Card 
                key={listing.id} 
                className="cursor-pointer hover:shadow-md transition-all duration-200"
                onClick={() => {
                  setSelectedListing(listing);
                  onListingClick?.(listing);
                }}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-foreground">{listing.food_item_name}</h4>
                      <span className={`text-xs font-medium ${getTimeLeft(listing.expiry_datetime).color}`}>
                        <Clock className="h-3 w-3 inline mr-1" />
                        {getTimeLeft(listing.expiry_datetime).text}
                      </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <strong>Quantity:</strong> {listing.quantity}
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{listing.pickup_address}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{listing.contact_person_name}</span>
                      </div>
                      
                      {showDirections && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDirections(listing);
                          }}
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          Directions
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;
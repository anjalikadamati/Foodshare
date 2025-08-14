import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Clock, Package, User, Phone, Camera } from "lucide-react";

interface FoodListing {
  id: string;
  food_item_name: string;
  quantity: string;
  expiry_datetime: string;
  pickup_address: string;
  pickup_instructions?: string;
  contact_person_name: string;
  contact_person_phone: string;
  image_url?: string;
  status: string;
}

interface EditFoodListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  listing: FoodListing | null;
}

const EditFoodListingDialog = ({ open, onOpenChange, onSuccess, listing }: EditFoodListingDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    foodItemName: "",
    quantity: "",
    expiryDate: "",
    expiryTime: "",
    pickupAddress: "",
    pickupInstructions: "",
    contactPersonName: "",
    contactPersonPhone: "",
    imageUrl: "",
    status: "available",
  });

  useEffect(() => {
    if (listing) {
      const expiryDate = new Date(listing.expiry_datetime);
      setForm({
        foodItemName: listing.food_item_name,
        quantity: listing.quantity,
        expiryDate: expiryDate.toISOString().split('T')[0],
        expiryTime: expiryDate.toTimeString().slice(0, 5),
        pickupAddress: listing.pickup_address,
        pickupInstructions: listing.pickup_instructions || "",
        contactPersonName: listing.contact_person_name,
        contactPersonPhone: listing.contact_person_phone,
        imageUrl: listing.image_url || "",
        status: listing.status,
      });
    }
  }, [listing]);

  // Function to geocode address using a free service
  const geocodeAddress = async (address: string) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !listing) return;

    setLoading(true);
    try {
      // Combine date and time for expiry
      const expiryDateTime = new Date(`${form.expiryDate}T${form.expiryTime}`).toISOString();
      
      // Geocode the address if it changed
      const coordinates = await geocodeAddress(form.pickupAddress);
      
      const { error } = await supabase
        .from('food_listings')
        .update({
          food_item_name: form.foodItemName,
          quantity: form.quantity,
          expiry_datetime: expiryDateTime,
          pickup_address: form.pickupAddress,
          pickup_instructions: form.pickupInstructions || null,
          contact_person_name: form.contactPersonName,
          contact_person_phone: form.contactPersonPhone,
          image_url: form.imageUrl || null,
          status: form.status,
          latitude: coordinates?.latitude || null,
          longitude: coordinates?.longitude || null,
        })
        .eq('id', listing.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your food listing has been updated successfully.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update food listing",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Edit Food Listing
          </DialogTitle>
          <DialogDescription>
            Update your food listing details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="foodItemName" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Food Item Name *
            </Label>
            <Input
              id="foodItemName"
              value={form.foodItemName}
              onChange={(e) => setForm({ ...form, foodItemName: e.target.value })}
              placeholder="e.g., Vegetable Biryani, Fresh Bread"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder="e.g., 50 plates, 10 kg, 20 servings"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Expiry Date *
              </Label>
              <Input
                id="expiryDate"
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryTime">Expiry Time *</Label>
              <Input
                id="expiryTime"
                type="time"
                value={form.expiryTime}
                onChange={(e) => setForm({ ...form, expiryTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickupAddress" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Pickup Address *
            </Label>
            <Textarea
              id="pickupAddress"
              value={form.pickupAddress}
              onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
              placeholder="Full address where food can be picked up"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickupInstructions">Pickup Instructions (Optional)</Label>
            <Textarea
              id="pickupInstructions"
              value={form.pickupInstructions}
              onChange={(e) => setForm({ ...form, pickupInstructions: e.target.value })}
              placeholder="Special instructions for pickup (e.g., back entrance, call upon arrival)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPersonName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Contact Person Name *
            </Label>
            <Input
              id="contactPersonName"
              value={form.contactPersonName}
              onChange={(e) => setForm({ ...form, contactPersonName: e.target.value })}
              placeholder="Person to contact for pickup"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPersonPhone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Phone Number *
            </Label>
            <Input
              id="contactPersonPhone"
              type="tel"
              value={form.contactPersonPhone}
              onChange={(e) => setForm({ ...form, contactPersonPhone: e.target.value })}
              placeholder="Phone number for coordination"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Image URL (Optional)
            </Label>
            <Input
              id="imageUrl"
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://example.com/food-image.jpg"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Updating..." : "Update Listing"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditFoodListingDialog;
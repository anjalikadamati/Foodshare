import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface FoodListing {
  id: string;
  food_item_name: string;
  quantity: string;
  pickup_address: string;
  contact_person_name: string;
  contact_person_phone: string;
}

interface RequestFoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: FoodListing | null;
  onSuccess: () => void;
}

const RequestFoodDialog = ({ open, onOpenChange, listing, onSuccess }: RequestFoodDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    requested_quantity: "",
    message_to_provider: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !listing) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('donation_requests')
        .insert({
          food_listing_id: listing.id,
          donor_id: user.id,
          requested_quantity: formData.requested_quantity,
          message_to_provider: formData.message_to_provider,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: "Request sent!",
        description: "Your donation request has been sent to the food provider",
      });

      // Reset form
      setFormData({
        requested_quantity: "",
        message_to_provider: "",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send donation request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!listing) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Request Food Donation</DialogTitle>
          <DialogDescription>
            Send a request to the food provider for "{listing.food_item_name}"
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
          <div><strong>Food Item:</strong> {listing.food_item_name}</div>
          <div><strong>Available Quantity:</strong> {listing.quantity}</div>
          <div><strong>Pickup Address:</strong> {listing.pickup_address}</div>
          <div><strong>Contact Person:</strong> {listing.contact_person_name}</div>
          <div><strong>Phone:</strong> {listing.contact_person_phone}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requested_quantity">Requested Quantity (Optional)</Label>
            <Input
              id="requested_quantity"
              value={formData.requested_quantity}
              onChange={(e) => handleInputChange("requested_quantity", e.target.value)}
              placeholder="e.g., Serves 10 people, 2kg, or leave blank for full quantity"
            />
            <p className="text-xs text-muted-foreground">
              Leave blank if you want the full available quantity
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message_to_provider">Message to Provider (Optional)</Label>
            <Textarea
              id="message_to_provider"
              value={formData.message_to_provider}
              onChange={(e) => handleInputChange("message_to_provider", e.target.value)}
              placeholder="e.g., We can pick up at 6 PM today. We're an NGO serving homeless people."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Include pickup timing, your organization details, or any special requirements
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RequestFoodDialog;
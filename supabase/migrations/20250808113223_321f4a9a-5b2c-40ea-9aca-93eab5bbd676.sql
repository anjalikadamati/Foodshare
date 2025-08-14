-- Create a function to automatically mark expired food listings
CREATE OR REPLACE FUNCTION mark_expired_food_listings()
RETURNS void AS $$
BEGIN
  UPDATE food_listings 
  SET status = 'expired' 
  WHERE expiry_datetime < now() 
  AND status = 'available';
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function to check expiry before select operations
CREATE OR REPLACE FUNCTION check_food_listing_expiry()
RETURNS trigger AS $$
BEGIN
  -- Mark expired listings when accessed
  UPDATE food_listings 
  SET status = 'expired' 
  WHERE expiry_datetime < now() 
  AND status = 'available';
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that runs before any select operation on food_listings
-- This ensures expired listings are automatically marked when accessed
CREATE OR REPLACE TRIGGER update_expired_listings_trigger
  BEFORE SELECT ON food_listings
  FOR EACH STATEMENT
  EXECUTE FUNCTION check_food_listing_expiry();
import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";

export default function ReceiverProfilePage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error) setProfile(data);
    };

    fetchProfile();
  }, []);

  if (!profile) {
    return <p className="p-6">Loading profile...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Profile (Receiver)</h1>
      <div className="bg-white shadow rounded-lg p-4">
        <p><strong>Name:</strong> {profile.full_name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Phone:</strong> {profile.phone || "Not set"}</p>
        <p><strong>Address:</strong> {profile.address || "Not set"}</p>
        <p><strong>Total Requests:</strong> {profile.total_requests || 0}</p>
      </div>
    </div>
  );
}

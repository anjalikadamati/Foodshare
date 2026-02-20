// services/providerApi.js
const API_URL = "http://127.0.0.1:5000";

function getAuthHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

export async function fetchProviderListings() {
  const res = await fetch(`${API_URL}/food/my-listings`, {
    headers: getAuthHeaders()
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch" }));
    throw new Error(err.error || "Failed to fetch provider listings");
  }

  return res.json();
}

export async function createFoodListing(formData) {
  const res = await fetch(`${API_URL}/food/create`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(formData)
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || "Failed to create listing");
  }
  return data;
}

export async function deleteFoodListing(listingId) {
  const res = await fetch(`${API_URL}/food/delete/${listingId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || "Failed to delete listing");
  }

  return data;
}

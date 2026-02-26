const API = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

export async function fetchProviderListings() {
  const res = await fetch(`${API}/food/my-listings`, {
    headers: getAuthHeaders()
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch" }));
    throw new Error(err.error || "Failed to fetch provider listings");
  }

  return res.json();
}

export async function createFoodListing(formData) {
  const res = await fetch(`${API}/food/create`, {
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
  const res = await fetch(`${API}/food/delete/${listingId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || "Failed to delete listing");
  }

  return data;
}

import { useEffect, useState } from "react";

export default function ProviderRequests({ refreshTrigger = 0, onRequestUpdate }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_URL;

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("access_token");

  const fetchRequests = () => {
    fetch(`${API}/provider/${user.id}/requests`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setRequests(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setRequests([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRequests();
  }, [refreshTrigger]);

  const updateRequest = async (requestId, status) => {
    try {
      const res = await fetch(`${API}/donation/request/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          request_id: requestId,
          action: status
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to update request");
        return;
      }

      alert("✅ Request updated!");
      fetchRequests();

      if (onRequestUpdate) {
        onRequestUpdate();
      }

    } catch (err) {
      alert("❌ Server error");
    }
  };

  return (
    <div className="dashboard-section">
      <h2>Food Requests 📩</h2>

      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p>No requests yet.</p>
      ) : (
        <div className="cards-grid">
          {requests.map(req => (
            <div key={req.request_id} className="food-card">
              <div className="card-header">
                <h3 className="food-name">{req.listing.food_item_name}</h3>
                <span className={`status-badge ${req.status.toLowerCase()}`}>
                  {req.status}
                </span>
              </div>

              <div className="card-content">
                <div className="card-details">
                  <div className="detail-item">
                    <span className="detail-label">Quantity:</span>
                    <span className="detail-value">{req.listing.quantity} servings</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Pickup:</span>
                    <span className="detail-value">{req.listing.pickup_address}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Requested By:</span>
                    <span className="detail-value">{req.receiver.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{req.receiver.email}</span>
                  </div>
                </div>

                {req.status === "Pending" && (
                  <div className="card-actions">
                    <button
                      className="btn-primary"
                      onClick={() => updateRequest(req.request_id, "accept")}
                    >
                      Approve ✅
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => updateRequest(req.request_id, "reject")}
                    >
                      Reject ❌
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

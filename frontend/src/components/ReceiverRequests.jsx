import { useEffect, useState } from "react";

export default function ReceiverRequests({ refreshTrigger = 0 }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access_token");

  const fetchRequests = () => {
    fetch("http://127.0.0.1:5000/receiver/my-requests", {
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

  return (
    <div className="dashboard-section">
      <h2>My Requests 🧾</h2>

      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <h3>No requests yet</h3>
          <p>Start requesting food from available listings 🍽️</p>
        </div>
      ) : (
        <div className="cards-grid">
          {requests.map(req => (
            <div key={req.request_id} className="food-card">
              <div className="card-content">
                <h3 className="food-name">{req.listing.food_item_name}</h3>

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
                    <span className="detail-label">Request Status:</span>
                    <span className="detail-value">
                      <span className={`status-badge ${req.status.toLowerCase()}`}>
                        {req.status}
                      </span>
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Food Status:</span>
                    <span className="detail-value">
                      <span className={`status-badge ${req.listing.status.toLowerCase()}`}>
                        {req.listing.status}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <small className="created-date">
                  Requested on {new Date(req.created_at).toLocaleString()}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

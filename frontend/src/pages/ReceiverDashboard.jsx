import DashboardLayout from "../components/DashboardLayout";
import ReceiverRequests from "../components/ReceiverRequests";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function ReceiverDashboard() {
  const [foodList, setFoodList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);


  const user = JSON.parse(localStorage.getItem("user"));

  const fetchFoodList = () => {
    const token = localStorage.getItem("access_token");

    fetch(
      `http://127.0.0.1:5000/food/available?search=${search}&sort=${sort}&page=${page}&limit=6`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
      .then(res => res.json())
      .then(data => {
        setFoodList(data.data || []);
        setPages(data.pages || 1);
        setLoading(false);
      })
      .catch(() => {
        setFoodList([]);
        setLoading(false);
      });
  };


  useEffect(() => {
    fetchFoodList();
  }, [refreshTrigger,search, page, sort]);

  const requestFood = async (listingId) => {
    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch("http://127.0.0.1:5000/donation/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ listing_id: listingId })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Request failed");
        return;
      }

      alert("Food request sent successfully ✅");
      fetchFoodList();

    } catch (err) {
      alert("Server error ❌");
    }
  };


  const isDashboard = location.pathname === '/receiver/dashboard';
  const isBrowseFood = location.pathname === '/receiver/browse-food';
  const isMyRequests = location.pathname === '/receiver/my-requests';

  return (
    <DashboardLayout user={user}>
      {(isDashboard || isBrowseFood) && (
        <div className="dashboard-section">
          <h2>Available Food Listings 🍱</h2>

          <div className="search-filter-row">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search food..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="filter-bar">
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="expiry">Expiring Soon</option>
              </select>
            </div>
          </div>




          {loading ? (
            <p>Loading...</p>
          ) : foodList.length === 0 ? (
            <p>No food available right now.</p>
          ) : (
            <div className="cards-grid">
              {foodList.map((item, index) => (
                <div
                  key={item.id}
                  className="food-card animate-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="card-header">
                    {item.status === "Expired" && (
                      <span className="status-badge expired">
                        Expired
                      </span>
                    )}
                  </div>

                  <div className="card-content">
                    <h3 className="food-name">{item.food_item_name}</h3>

                    <div className="card-details">
                      <div className="detail-item">
                        <span className="detail-label">Quantity:</span>
                        <span className="detail-value">{item.quantity} servings</span>
                      </div>

                      <div className="detail-item">
                        <span className="detail-label">Expires:</span>
                        <span className="detail-value">
                          {new Date(item.expiry_datetime).toLocaleDateString()} at{' '}
                          {new Date(item.expiry_datetime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <div className="detail-item">
                        <span className="detail-label">Pickup:</span>
                        <span className="detail-value">{item.pickup_address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-footer">
                    {item.status === "Expired" ? (
                      <button className="btn-disabled" disabled>
                        Expired ⏰
                      </button>
                    ) : item.status === "Donated" ? (
                      <button className="btn-disabled" disabled>
                        Donated ✅
                      </button>
                    ) : (
                      <button
                        className="btn-primary"
                        onClick={() => requestFood(item.id)}
                      >
                        Request Food 🍽️
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
            
          )}
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Prev
            </button>

            <span>Page {page} of {pages}</span>

            <button disabled={page === pages} onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        </div>
      )}
      {(isDashboard || isMyRequests) && (
        <ReceiverRequests refreshTrigger={refreshTrigger} />
      )}
    </DashboardLayout>
  );
}

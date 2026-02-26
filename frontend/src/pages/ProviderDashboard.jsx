import DashboardLayout from "../components/DashboardLayout";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {createFoodListing, deleteFoodListing } from "../services/providerApi";
import ProviderRequests from "../components/ProviderRequests";


export default function ProviderDashboard() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("latest");

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);


  const [editMode, setEditMode] = useState(false);
  const [currentListingId, setCurrentListingId] = useState(null);


  const [showModal, setShowModal] = useState(false);

  const API = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    food_item_name: "",
    quantity: "",
    expiry_datetime: "",
    pickup_address: "",
    pickup_instructions: "",
    contact_person_name: "",
    contact_person_phone: ""
  });


  const openEditModal = (item) => {
    setEditMode(true);
    setCurrentListingId(item.id);
    setFormData({
      food_item_name: item.food_item_name,
      quantity: item.quantity,
      expiry_datetime: item.expiry_datetime.slice(0, 16),
      pickup_address: item.pickup_address,
      pickup_instructions: item.pickup_instructions || "",
      contact_person_name: item.contact_person_name,
      contact_person_phone: item.contact_person_phone
    });
    setShowModal(true);
  };


  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();

  useEffect(() => {
    if (isListFood) {
      setShowModal(true);
    }
  }, [location.pathname]);


  const fetchListings = async () => {
    try {
      const res = await fetch(
        `${API}/food/my-listings?search=${search}&status=${statusFilter}&sort=${sort}&page=${page}&limit=6`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`
          }
        }
      );

      const data = await res.json();

      setListings(data.data || []);
      setPages(data.pages || 1);
    } catch (err) {
      console.error("🔥 fetchListings error:", err);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchListings();
  }, [search, page, statusFilter, sort]);



  const handleSubmit = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Token missing. Please login again.");
      return;
    }

    const requiredFields = ["food_item_name", "quantity", "expiry_datetime", "pickup_address", "contact_person_name", "contact_person_phone"];
    for (const field of requiredFields) {
        if (!formData[field] || formData[field].toString().trim() === "") {
            alert(`Please fill in the ${field.replace('_', ' ')} field.`);
            return;
        }
    }

    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
        alert("Quantity must be a positive number.");
        return;
    }

    const expiryDate = new Date(formData.expiry_datetime);
    if (isNaN(expiryDate.getTime())) {
        alert("Please enter a valid expiry date and time.");
        return;
    }
    if (expiryDate <= new Date()) {
        alert("Expiry date must be in the future.");
        return;
    }

    try {
      const res = await createFoodListing(formData);
      console.log("🔥 createFoodListing response:", res);

      const created = res?.listing;
      if (created) {
        setListings(prev => [created, ...prev]);
      } else {
        await fetchListings();
      }

      setShowModal(false);
      setFormData({
        food_item_name: "",
        quantity: "",
        expiry_datetime: "",
        pickup_address: "",
        pickup_instructions: "",
        contact_person_name: "",
        contact_person_phone: ""
      });

      alert("Food listing added successfully!");
    } catch (err) {
      console.error("🔥 create error:", err);
      alert(err.message || "Failed to add listing");
    }
  };

  const handleDelete = async (listingId) => {
    if (!window.confirm("Are you sure you want to delete this food listing?")) return;

    try {
      await deleteFoodListing(listingId);
      setListings(prev => prev.filter(item => item.id !== listingId));

      alert("Food listing deleted successfully!");
    } catch (err) {
      console.error("DELETE ERROR:", err);
      alert("Delete failed");
    }
  };




  const isDashboard = location.pathname === '/provider/dashboard';
  const isListFood = location.pathname === '/provider/list-food';
  const isRequests = location.pathname === '/provider/requests';

  return (
    <DashboardLayout user={user}>
      {(isDashboard || isListFood) && (
        <>
          {isDashboard && (
            <div className="dashboard-stats">
              <div className="stat-card">
                  <h4>Total Listings</h4>
                  <p>{listings.length}</p>
              </div>

              <div className="stat-card">
                  <h4>Available</h4>
                  <p>{listings.filter(l => l.status === "Available").length}</p>
              </div>

              <div className="stat-card">
                  <h4>Donated</h4>
                  <p>{listings.filter(l => l.status === "Donated").length}</p>
              </div>

              <div className="stat-card">
                  <h4>Expired</h4>
                  <p>{listings.filter(l => l.status === "Expired").length}</p>
              </div>
            </div>
          )}
          <button className="add-food-btn" onClick={() => setShowModal(true)}>
          + Add Food Listing
          </button>

          <div className="dashboard-section">
            <h2>Your Food Listings</h2>

            <div className="search-filter-row">
  
              {/* Search Box */}
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search your food..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              {/* Filters */}
              <div className="filter-bar">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Status</option>
                  <option value="Available">Available</option>
                  <option value="Donated">Donated</option>
                  <option value="Expired">Expired</option>
                </select>

                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                  <option value="expiry_soon">Expiry Soon</option>
                </select>
              </div>

            </div>




            {loading ? (
              <div className="loading-cards">
                <div className="card skeleton"></div>
                <div className="card skeleton"></div>
                <div className="card skeleton"></div>
              </div>
            ) : listings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🍽️</div>
                <h3>No food listings yet</h3>
                <p>Start sharing food by adding your first listing!</p>
              </div>
            ) : (
              <div className="cards-grid">
                {listings.map((item, index) => (
                  <div
                    key={item.id}
                    className="food-card animate-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="card-header">
                      <span className={`status-badge ${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>

                      <div className="action-buttons">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => openEditModal(item)}
                          title="Edit listing"
                        >
                          ✏️
                        </button>

                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(item.id)}
                          title="Delete listing"
                        >
                          <img src="https://thumbs.dreamstime.com/b/computer-generated-illustration-recycle-bin-icon-isolated-white-background-suitable-logo-delete-icon-button-175612353.jpg" 
                          width={35} height={40} />
                        </button>
                      </div>
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
                      <small className="created-date">
                        Added {new Date(item.created_at).toLocaleDateString()}
                      </small>
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
        </>
      )}

      {(isDashboard || isRequests) && (
        <ProviderRequests onRequestUpdate={fetchListings} />
      )}

      {showModal && (
          <div className="modal-overlay">
              <div className="modal">
              <h3>Add Food Listing</h3>

              <input
                  placeholder="Food Item Name"
                  value={formData.food_item_name}
                  onChange={e => setFormData({ ...formData, food_item_name: e.target.value })}
              />

              <input
                  type="number"
                  placeholder="Quantity (e.g. 10 meals)"
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: e.target.value })}
              />

              <input
                  type="datetime-local"
                  value={formData.expiry_datetime}
                  onChange={e => setFormData({ ...formData, expiry_datetime: e.target.value })}
              />

              <textarea
                  placeholder="Pickup Address"
                  value={formData.pickup_address}
                  onChange={e => setFormData({ ...formData, pickup_address: e.target.value })}
              />

              <textarea
                  placeholder="Pickup Instructions (optional)"
                  value={formData.pickup_instructions}
                  onChange={e => setFormData({ ...formData, pickup_instructions: e.target.value })}
              />

              <input
                  placeholder="Contact Person Name"
                  value={formData.contact_person_name}
                  onChange={e => setFormData({ ...formData, contact_person_name: e.target.value })}
              />

              <input
                  placeholder="Contact Phone Number"
                  value={formData.contact_person_phone}
                  onChange={e => setFormData({ ...formData, contact_person_phone: e.target.value })}
              />

              <div className="modal-actions">
                  <button className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                  </button>

                  <button className="btn-primary" onClick={handleSubmit}>
                  Submit
                  </button>
              </div>
              </div>
          </div>
      )}
    </DashboardLayout>
  );
}

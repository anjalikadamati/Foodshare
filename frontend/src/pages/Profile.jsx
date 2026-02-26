import { useEffect, useState } from "react";
import "../styles/profile.css";

export default function Profile() {
  const [data, setData] = useState(null);
  const token = localStorage.getItem("access_token");

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API}/user/profile-stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(result => {
        setData(result);
      })
      .catch(err => {
        console.error("Profile fetch error:", err);
      });
  }, []);

  if (!data) return <p className="loading">Loading profile...</p>;

  return (
    <div className="profile-container">
      <div className="profile-card">

        {/* HEADER */}
        <div className="profile-header">
          <div className="avatar">
            {data.name?.charAt(0).toUpperCase()}
          </div>

          <h2>{data.name}</h2>
          <span className="role-badge">{data.role}</span>
          <p>{data.email}</p>
        </div>

        {/* ✅ PROVIDER STATS */}
        {data.role === "provider" && (
          <div className="stats-row">
            <div className="stat">
              <h3>{data.stats.total}</h3>
              <span>Total Listings</span>
            </div>

            <div className="stat donated">
              <h3>{data.stats.donated}</h3>
              <span>Donated</span>
            </div>

            <div className="stat expired">
              <h3>{data.stats.expired}</h3>
              <span>Expired</span>
            </div>
          </div>
        )}

        {/* ✅ RECEIVER STATS */}
        {data.role === "receiver" && (
          <div className="stats-row">
            <div className="stat">
              <h3>{data.stats.total_requests}</h3>
              <span>Total Requests</span>
            </div>

            <div className="stat donated">
              <h3>{data.stats.accepted}</h3>
              <span>Accepted</span>
            </div>

            <div className="stat expired">
              <h3>{data.stats.rejected}</h3>
              <span>Rejected</span>
            </div>
          </div>
        )}

        {/* DETAILS */}
        <div className="details">

          {/* ✅ Provider Details */}
          {data.role === "provider" && (
            <>
              <div className="detail-item">
                <span>Phone</span>
                <p>{data.contact_number || "Not Provided"}</p>
              </div>

              <div className="detail-item">
                <span>Address</span>
                <p>{data.address || "Not Provided"}</p>
              </div>

              <div className="detail-item">
                <span>Organization</span>
                <p>{data.organization_name || "Not Provided"}</p>
              </div>
            </>
          )}

          {/* ✅ Receiver Details */}
          {data.role === "receiver" && (
            <>
              <div className="detail-item">
                <span>Name</span>
                <p>{data.name}</p>
              </div>

              <div className="detail-item">
                <span>Email</span>
                <p>{data.email}</p>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}

import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUtensils,
  FaHandsHelping,
  FaClipboardList,
  FaSignOutAlt
} from "react-icons/fa";
import "../styles/dashboard.css";

export default function Sidebar({ role }) {
  const menuItems = role === 'receiver' ? [
    { to: '/receiver/dashboard', icon: FaHome, label: 'Dashboard' },
    { to: '/receiver/browse-food', icon: FaUtensils, label: 'Browse Food' },
    { to: '/receiver/my-requests', icon: FaClipboardList, label: 'My Requests' },
    { to: '/receiver/impact', icon: FaHandsHelping, label: 'Impact' },
  ] : [
    { to: '/provider/dashboard', icon: FaHome, label: 'Dashboard' },
    { to: '/provider/list-food', icon: FaUtensils, label: 'List Food' },
    { to: '/provider/requests', icon: FaClipboardList, label: 'Requests' },
    { to: '/provider/impact', icon: FaHandsHelping, label: 'Impact' },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    alert("Logged out successfully 👋");
    window.location.href = "/"; 
  };


  return (
    <aside className="sidebar">
      {/* LOGO */}
      <div className="sidebar-logo">
        Food<span>Share</span>
      </div>

      {/* MENU */}
      <nav className="sidebar-menu">
        {menuItems.map((item, index) => (
          <NavLink key={index} to={item.to} className="menu-item">
            <item.icon />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* LOGOUT */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </aside>
  );
}

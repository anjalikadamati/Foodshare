import "../styles/dashboard.css";
import { useNavigate } from "react-router-dom";

export default function Topbar({ user }) {
  const navigate = useNavigate();

  return (
    <header className="topbar">
      {/* LEFT */}
      <div className="topbar-left">
        <h2>
          Welcome back,
          <span> {user?.name || "User"} 👋</span>
        </h2>
        <p className="topbar-subtext">
          Let’s make a difference today
        </p>
      </div>

      {/* RIGHT */}
      <div className="topbar-right">
        <div className="topbar-role">
          {user?.role || "provider"}
        </div>

        {/* ✅ Clickable Avatar */}
        <div 
          className="topbar-avatar clickable"
          onClick={() =>
            navigate(
              user?.role === "provider"
                ? "/provider/profile"
                : "/receiver/profile"
            )
          }
        >
          {user?.name?.charAt(0) || "U"}
        </div>
      </div>
    </header>
  );
}

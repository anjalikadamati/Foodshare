import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../styles/dashboard.css";

export default function DashboardLayout({ user, children }) {
  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <Sidebar role={user?.role} />

      {/* MAIN AREA */}
      <div className="dashboard-main">
        <Topbar user={user} />

        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}

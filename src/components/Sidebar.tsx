import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Package, Bell, User, LogOut, Search, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  userType: 'food_provider' | 'food_donor';
}

const Sidebar = ({ userType }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const providerLinks = [
    { title: "Dashboard", url: "/provider", icon: Home },
    { title: "My Listings", url: "/provider/listings", icon: Package },
    { title: "Donation Requests", url: "/provider/requests", icon: Bell },
    { title: "My Profile", url: "/provider/profile", icon: User },
  ];

  const donorLinks = [
    { title: "Dashboard", url: "/donor", icon: Home },
    { title: "Find Food", url: "/donor/find", icon: Search },
    { title: "My Requests", url: "/donor/requests", icon: FileText },
    { title: "My Profile", url: "/donor/profile", icon: User },
  ];

  const links = userType === 'food_provider' ? providerLinks : donorLinks;

  const isActive = (path: string) => location.pathname === path;

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div className={`bg-white border-r border-border transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} h-screen sticky top-0 flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogoClick}>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">FS</span>
            </div>
            <span className="font-bold text-foreground">FoodShare</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer" onClick={handleLogoClick}>
            <span className="text-white font-bold text-sm">FS</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.title}
              to={link.url}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive(link.url)
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{link.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          onClick={() => {
            signOut();
          }}
          className={`w-full justify-start text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive transition-all ${
            collapsed ? 'px-3' : ''
          }`}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
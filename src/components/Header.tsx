import { Button } from "@/components/ui/button";
import { Leaf, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate("/")}
        >
          <div className="p-2 bg-gradient-to-r from-primary to-primary-glow rounded-lg">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-foreground">FoodShare</h1>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            How it Works
          </a>
          <a href="#impact" className="text-muted-foreground hover:text-foreground transition-colors">
            Impact
          </a>
          <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(user ? "/provider" : "/auth")}
            className="text-muted-foreground hover:text-foreground"
          >
            Share Food
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(user ? "/donor" : "/auth")}
            className="text-muted-foreground hover:text-foreground"
          >
            Find Food
          </Button>
        </nav>

        <div className="flex items-center space-x-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Account
                </Button>
              </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/")}>
                  <Leaf className="h-4 w-4 mr-2" />
                  Home
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
              <Button variant="hero" size="sm" onClick={() => navigate("/auth")}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
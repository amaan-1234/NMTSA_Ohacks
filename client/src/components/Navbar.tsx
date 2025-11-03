import React from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useAuth } from "@/state/auth";
import { useCart } from "@/state/cart";
import { AccessibilitySettings } from "@/components/AccessibilitySettings";

const Navbar: React.FC = () => {
  const { authReady, isAuthenticated, getDisplayName, user, logout } = useAuth();
  const { count } = useCart();
  const [location, setLocation] = useLocation();

  const name = getDisplayName();
  const isAdmin = user?.role === "admin";

  // Function to handle navigation with scroll to top if same page
  const handleNavigation = (path: string) => {
    if (location === path) {
      // If already on the same page, scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Navigate to different page
      setLocation(path);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/40 shadow-sm">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => handleNavigation("/")}
            className="font-bold text-xl text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 cursor-pointer"
          >
            NMTSA
          </button>
          
          {/* Show different navigation based on role */}
          <nav className="hidden md:flex items-center gap-1">
            {!isAdmin ? (
              <>
                <button 
                  onClick={() => handleNavigation("/courses")}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer ${
                    location === "/courses" 
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30" 
                      : "text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
                  }`}
                >
                  <span className="relative z-10">Courses</span>
                  {location === "/courses" && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}
                </button>
                <button 
                  onClick={() => handleNavigation("/dashboard")}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer ${
                    location === "/dashboard" 
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30" 
                      : "text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
                  }`}
                >
                  <span className="relative z-10">Dashboard</span>
                  {location === "/dashboard" && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => handleNavigation("/admin")}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer ${
                    location === "/admin" 
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30" 
                      : "text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
                  }`}
                >
                  <span className="relative z-10">Admin</span>
                  {location === "/admin" && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}
                </button>
                <button 
                  onClick={() => handleNavigation("/admin/add-course")}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer ${
                    location === "/admin/add-course" 
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30" 
                      : "text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
                  }`}
                >
                  <span className="relative z-10">Add Course</span>
                  {location === "/admin/add-course" && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}
                </button>
                <button 
                  onClick={() => handleNavigation("/admin/content-category")}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer ${
                    location === "/admin/content-category" 
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30" 
                      : "text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
                  }`}
                >
                  <span className="relative z-10">Categories</span>
                  {location === "/admin/content-category" && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Right side */}
        {!authReady ? (
          <div className="w-[180px] h-8 bg-muted rounded-lg animate-pulse" />
        ) : isAuthenticated ? (
          <div className="flex items-center gap-3">
            {/* Only show cart for non-admin users */}
            {!isAdmin && (
              <button
                className="relative inline-flex items-center justify-center h-10 w-10 rounded-lg border border-border/50 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-300 hover:scale-105 group cursor-pointer"
                onClick={() => setLocation("/payments")}
                aria-label="Cart"
                title="Cart"
              >
                <ShoppingCart className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1.5 rounded-full bg-blue-600 dark:bg-blue-500 text-white text-[11px] leading-[20px] text-center font-semibold shadow-lg animate-fade-in">
                    {count}
                  </span>
                )}
              </button>
            )}

            {/* Accessibility Settings */}
            <div className="transition-all duration-300 hover:scale-105 cursor-pointer rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 p-1">
              <AccessibilitySettings />
            </div>
            
            <span className="text-sm hidden lg:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 transition-all duration-300 hover:bg-blue-100 dark:hover:bg-blue-950/40 cursor-default">
              Welcome, <span className="font-semibold text-blue-600 dark:text-blue-400">{name}</span>
            </span>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => logout()}
              className="border-blue-200 dark:border-blue-900/50 text-muted-foreground hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:hover:border-blue-600 transition-all duration-300 cursor-pointer"
            >
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* Accessibility Settings - always visible */}
            <div className="transition-all duration-300 hover:scale-105 cursor-pointer rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 p-1">
              <AccessibilitySettings />
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation("/auth/login")}
              className="text-muted-foreground hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 cursor-pointer"
            >
              Log in
            </Button>
            <Button 
              size="sm" 
              onClick={() => setLocation("/auth/signup")}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white transition-all duration-300 cursor-pointer hover:shadow-lg"
            >
              Sign up
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
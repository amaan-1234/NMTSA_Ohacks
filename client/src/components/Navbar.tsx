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

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/"><a className="font-semibold">NMTSA</a></Link>
          
          {/* Show different navigation based on role */}
          {!isAdmin ? (
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <Link href="/courses">
                <a className={location === "/courses" ? "font-medium" : ""}>Courses</a>
              </Link>
              <Link href="/dashboard">
                <a className={location === "/dashboard" ? "font-medium" : ""}>Dashboard</a>
              </Link>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <Link href="/admin">
                <a className={location === "/admin" ? "font-medium" : ""}>Admin</a>
              </Link>
              <Link href="/admin/add-course">
                <a className={location === "/admin/add-course" ? "font-medium" : ""}>Add Course</a>
              </Link>
              <Link href="/admin/content-category">
                <a className={location === "/admin/content-category" ? "font-medium" : ""}>Content Category</a>
              </Link>
            </nav>
          )}
        </div>

        {/* Right side */}
        {!authReady ? (
          <div className="w-[180px] h-8 bg-muted rounded animate-pulse" />
        ) : isAuthenticated ? (
          <div className="flex items-center gap-3">
            {/* Only show cart for non-admin users */}
            {!isAdmin && (
              <button
                className="relative inline-flex items-center justify-center h-9 w-9 rounded-md border hover:bg-muted"
                onClick={() => setLocation("/payments")}
                aria-label="Cart"
                title="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[11px] leading-[18px] text-center">
                    {count}
                  </span>
                )}
              </button>
            )}

            {/* Accessibility Settings */}
            <AccessibilitySettings />
            
            <span className="text-sm text-muted-foreground">
              Welcome, <span className="font-medium">{name}</span>
            </span>

            <Button variant="outline" size="sm" onClick={() => logout()}>Logout</Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* Accessibility Settings - always visible */}
            <AccessibilitySettings />
            
            <Button variant="ghost" size="sm" onClick={() => setLocation("/auth/login")}>Log in</Button>
            <Button size="sm" onClick={() => setLocation("/auth/signup")}>Sign up</Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, BookOpen, GraduationCap, MessageSquare, User } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useState } from "react";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-card-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/">
            <a className="flex items-center gap-2 hover-elevate active-elevate-2 px-3 py-2 rounded-md transition-colors" data-testid="link-home">
              <GraduationCap className="w-6 h-6 text-primary" />
              <span className="text-xl font-semibold font-[Poppins]">NMTSA</span>
            </a>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link href="/courses">
              <a data-testid="link-courses">
                <Button variant="ghost" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  Courses
                </Button>
              </a>
            </Link>
            <Link href="/dashboard">
              <a data-testid="link-dashboard">
                <Button variant="ghost">Dashboard</Button>
              </a>
            </Link>
            <Link href="/forums">
              <a data-testid="link-forums">
                <Button variant="ghost" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Forums
                </Button>
              </a>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>

            <Link href="/profile">
              <a data-testid="link-profile">
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </a>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link href="/courses">
              <a className="block" data-testid="link-courses-mobile">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <BookOpen className="w-4 h-4" />
                  Courses
                </Button>
              </a>
            </Link>
            <Link href="/dashboard">
              <a className="block" data-testid="link-dashboard-mobile">
                <Button variant="ghost" className="w-full justify-start">
                  Dashboard
                </Button>
              </a>
            </Link>
            <Link href="/forums">
              <a className="block" data-testid="link-forums-mobile">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Forums
                </Button>
              </a>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

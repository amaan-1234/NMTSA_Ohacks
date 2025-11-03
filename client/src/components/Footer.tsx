import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { EmailInput } from "@/components/ui/EmailInput";
import { GraduationCap, Award } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Footer() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const { toast } = useToast();

  // Newsletter subscription function
  const handleNewsletterSubscribe = async () => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (!isEmailValid) {
      toast({
        title: "Invalid Email",
        description: "Please enter a real, valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubscribing(true);
    try {
      console.log("Attempting to subscribe:", email);
      
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (data.success) {
        toast({
          title: "Success!",
          description: data.message,
        });
        setEmail(""); // Clear the input
      } else {
        toast({
          title: "Subscription Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  // Function to handle navigation to sections
  const handleSectionNavigation = (sectionId: string) => {
    // First navigate to home page
    setLocation("/");
    // Then scroll to section after a brief delay to ensure page loads
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  // Function to handle course tab navigation
  const handleCourseTabNavigation = (tab: string) => {
    if (tab === "all") {
      setLocation("/courses");
    } else {
      setLocation(`/courses?tab=${tab}`);
    }
  };
  return (
    <footer className="bg-card border-t border-card-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-primary" />
              <span className="text-xl font-semibold font-[Poppins]">NMTSA</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Professional education platform for Neurologic Music Therapy with 
              AMTA-approved continuing education credits.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Award className="w-4 h-4 text-chart-3" />
              <span className="text-muted-foreground">AMTA Certified Provider</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 font-[Poppins]">Courses</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleCourseTabNavigation("all")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Browse All Courses
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleCourseTabNavigation("free")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Free Resources
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleCourseTabNavigation("premium")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Premium Courses
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSectionNavigation("about")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  About NMT
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 font-[Poppins]">Support</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleSectionNavigation("about")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSectionNavigation("testimonials")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Testimonials
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleSectionNavigation("contact")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <a 
                  href="#accessibility"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    // Trigger accessibility settings popover
                    const accessibilityButton = document.querySelector('[title="Accessibility Settings"]') as HTMLElement;
                    if (accessibilityButton) {
                      accessibilityButton.click();
                    }
                  }}
                >
                  Accessibility
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 font-[Poppins]">Stay Updated</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to get updates on new courses and CE opportunities.
            </p>
                <div className="flex gap-2">
                  <EmailInput
                    value={email}
                    onChange={setEmail}
                    placeholder="Your email"
                    className="flex-1"
                    showValidation={true}
                    onValidationChange={setIsEmailValid}
                    disabled={isSubscribing}
                  />
                  <Button 
                    data-testid="button-newsletter-subscribe"
                    onClick={handleNewsletterSubscribe}
                    disabled={isSubscribing || !email || !isEmailValid}
                    className="self-start"
                  >
                    {isSubscribing ? "Subscribing..." : "Subscribe"}
                  </Button>
                </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 NMTSA. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <button 
              onClick={() => handleSectionNavigation("privacy")}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => handleSectionNavigation("terms")}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

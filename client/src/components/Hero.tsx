import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Award, Users } from "lucide-react";
import heroImage from "@assets/stock_images/music_notes_instrume_07962769.jpg";
import { useAuth } from "@/state/auth";
import { useLocation } from "wouter";

export default function Hero() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const isAdmin = user?.role === "admin";

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

  return (
    <section className="relative overflow-hidden min-h-[600px]">
      {/* Background with enhanced gradient */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Music therapy instruments and notes"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/85 via-purple-900/75 to-blue-800/70" />
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-blue-500/20 animate-pulse" style={{ animationDuration: '4s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="max-w-3xl">
          <div className="flex flex-wrap gap-3 mb-6 animate-fade-in">
            <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 backdrop-blur-sm shadow-lg hover:shadow-blue-500/50 transition-shadow">
              <Award className="w-3 h-3 mr-1" />
              AMTA Approved
            </Badge>
            <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 backdrop-blur-sm shadow-lg hover:shadow-purple-500/50 transition-shadow">
              <Users className="w-3 h-3 mr-1" />
              500+ Certified Professionals
            </Badge>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-[Poppins] mb-6">
            Professional Education for Neurologic Music Therapy
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
            Advance your career with AMTA-approved continuing education courses. 
            Expert-led training designed for healthcare professionals and families 
            navigating neurological conditions.
          </p>

          {!isAdmin && (
            <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-xl hover:shadow-blue-500/50 transition-all transform hover:scale-105"
                data-testid="button-browse-courses"
                onClick={() => setLocation("/courses")}
              >
                Browse Courses
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:border-white/50 shadow-lg transition-all transform hover:scale-105"
                data-testid="button-learn-more"
                onClick={() => handleSectionNavigation("features")}
              >
                Learn More
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

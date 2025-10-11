import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Award, Users } from "lucide-react";
import heroImage from "@assets/stock_images/healthcare_professio_952f6cf7.jpg";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Healthcare professional in therapy session"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/50" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="max-w-3xl">
          <div className="flex flex-wrap gap-3 mb-6">
            <Badge className="bg-primary/20 text-primary-foreground border-primary/30 backdrop-blur-sm">
              <Award className="w-3 h-3 mr-1" />
              AMTA Approved
            </Badge>
            <Badge className="bg-primary/20 text-primary-foreground border-primary/30 backdrop-blur-sm">
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

          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              className="gap-2 bg-primary text-primary-foreground border-primary-border"
              data-testid="button-browse-courses"
            >
              Browse Courses
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

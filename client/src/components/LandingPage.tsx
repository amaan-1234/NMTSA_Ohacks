import Hero from "./Hero";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Smartphone, Users } from "lucide-react";
import CourseCard from "./CourseCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import course1 from "@assets/stock_images/online_learning_educ_c7bf3739.jpg";
import course2 from "@assets/stock_images/medical_training_pro_24e28be1.jpg";
import course3 from "@assets/stock_images/online_learning_educ_fb9f3b00.jpg";
import instructor1 from "@assets/stock_images/professional_instruc_df26bc9c.jpg";
import instructor2 from "@assets/stock_images/professional_instruc_1e1ae0c4.jpg";

export default function LandingPage() {
  const features = [
    {
      icon: Award,
      title: "AMTA-Approved CE Credits",
      description: "Earn continuing education credits recognized by the American Music Therapy Association for professional development.",
    },
    {
      icon: Users,
      title: "Expert-Led Courses",
      description: "Learn from board-certified music therapists and neurologic specialists with decades of clinical experience.",
    },
    {
      icon: Smartphone,
      title: "Flexible Learning",
      description: "Access courses anytime, anywhere on any device. Perfect for busy healthcare professionals on the go.",
    },
  ];

  const featuredCourses = [
    {
      id: "1",
      title: "Fundamentals of Neurologic Music Therapy",
      instructor: "Dr. Sarah Mitchell",
      thumbnail: course1,
      duration: "8 hours",
      ceCredits: 8,
      isPremium: true,
      price: 199,
      level: "Beginner" as const,
    },
    {
      id: "2",
      title: "Advanced NMT for Stroke Rehabilitation",
      instructor: "Dr. James Chen",
      thumbnail: course2,
      duration: "12 hours",
      ceCredits: 12,
      isPremium: true,
      price: 299,
      level: "Advanced" as const,
    },
    {
      id: "3",
      title: "Family-Centered Music Therapy",
      instructor: "Lisa Thompson, MT-BC",
      thumbnail: course3,
      duration: "4 hours",
      level: "Beginner" as const,
    },
  ];

  const testimonials = [
    {
      name: "Dr. Jennifer Williams",
      role: "Music Therapist, MT-BC",
      avatar: instructor1,
      quote: "The NMT courses have transformed my clinical practice. The evidence-based approach and practical techniques have made a real difference for my patients.",
    },
    {
      name: "Michael Anderson",
      role: "Family Member",
      avatar: instructor2,
      quote: "These resources helped our family understand music therapy better and support our loved one's recovery journey. Incredibly valuable and accessible.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Hero />

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-[Poppins] mb-4">
              Why Choose NMTSA
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional development designed for modern healthcare professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-8 pb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold font-[Poppins] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-[Poppins] mb-2">
                Featured Courses
              </h2>
              <p className="text-muted-foreground">
                Start your learning journey with our most popular courses
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-[Poppins] mb-4">
              What Our Community Says
            </h2>
            <p className="text-muted-foreground">
              Trusted by professionals and families worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={testimonial.avatar} />
                      <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed italic">
                    "{testimonial.quote}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

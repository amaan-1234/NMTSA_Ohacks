import Hero from "./Hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Smartphone, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-[Poppins] mb-4">
                About NMTSA
              </h2>
            </div>

            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-[Poppins]">Our Vision</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      Unleashing the unique potential of individuals with disabilities.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-[Poppins]">Our Mission</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      NMTSA partners with those impacted by disability to change lives through using the brain's response to music, and optimizing body and brain connections. NMTSA assumes the competence of all.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-[Poppins]">Our Core Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">NMTSA believes in...</p>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span>the capability of all people to reach their goals and attain their full potential.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span>the competence of all people.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span>the valuable contribution every person has to offer through their unique person and abilities.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary mt-1">•</span>
                      <span>the connection of science and relationship, and the impact both have on every person.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-[Poppins]">Our Story</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Neurologic Music Therapy Services of Arizona's (NMTSA) vision is to unleash the unique potential of individuals with disabilities. NMTSA has provided services to persons with neurologic impairments (ages 18 months to 75+ years of age) and their families in the greater Phoenix area since 1982.
                  </p>
                  <p>
                    NMTSA is nationally recognized for its evidence-based approach to treatment with persons with neurological impairments, and children with autism specifically. The company and its staff maintain a close relationship with research staff from universities across the country (with emphasis in NMT®, competency-based communication, inclusion, and psychomotor regulation/movement disorders) in order to remain current with best practice approaches for the individuals served.
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-[Poppins]">Our Clinic</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground leading-relaxed">
                    <p>
                      NMTSA's clinic space was designed and built to be optimized for NMT activities. It contains eight individual therapy rooms, a large group room for group NMT sessions, administrative offices, a recording studio in which clients can make and produce their own music, and a waiting room. We are committed to providing a safe, fragrance-free environment for all our clients, and are sensitive to other client allergies and needs.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-[Poppins]">Our Therapists</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground leading-relaxed">
                    <p>
                      All of the therapists at NMTSA hold the national certification credential MT-BC issued by the Certification Board for Music Therapists. Additionally, all NMTSA therapists are required to obtain additional advanced clinical training in Neurologic Music Therapy (NMT)® through the Academy of Neurologic Music Therapy® and to maintain Fellowship status with the Academy of Neurologic Music Therapy.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
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

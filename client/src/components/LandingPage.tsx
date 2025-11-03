import Hero from "./Hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Smartphone, Users, BookOpen, Building2, GraduationCap } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-b from-background via-blue-50/30 to-background dark:from-background dark:via-blue-950/10 dark:to-background">
      <Hero />

      {/* Features Section with colorful cards */}
      <section id="features" className="py-20 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-background dark:from-blue-950/20 dark:via-purple-950/10 dark:to-background relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-[Poppins] bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Why Choose NMTSA
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Professional development designed for modern healthcare professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const colors = [
                { bg: "from-blue-500 to-blue-600", icon: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400", shadow: "hover:shadow-blue-200 dark:hover:shadow-blue-900/50" },
                { bg: "from-purple-500 to-purple-600", icon: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400", shadow: "hover:shadow-purple-200 dark:hover:shadow-purple-900/50" },
                { bg: "from-green-500 to-green-600", icon: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400", shadow: "hover:shadow-green-200 dark:hover:shadow-green-900/50" },
              ];
              const color = colors[index % colors.length];
              
              return (
                <Card 
                  key={index} 
                  className={`text-center transition-all duration-300 hover:scale-105 ${color.shadow} shadow-lg border-0 bg-white/80 dark:bg-card/80 backdrop-blur-sm`}
                >
                  <CardContent className="pt-8 pb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${color.icon} mb-6 shadow-md`}>
                      <feature.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold font-[Poppins] mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section with enhanced design */}
      <section id="about" className="py-20 bg-gradient-to-br from-purple-50/40 via-background to-blue-50/40 dark:from-purple-950/10 dark:via-background dark:to-blue-950/10 relative">
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold font-[Poppins] bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                About NMTSA
              </h2>
              <div className="w-24 h-1 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
            </div>

            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-purple-500/5 to-purple-600/5 dark:from-purple-500/10 dark:to-purple-600/10">
                  <CardHeader>
                    <CardTitle className="text-2xl font-[Poppins] flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                        V
                      </div>
                      Our Vision
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      Unleashing the unique potential of individuals with disabilities.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-500/5 to-blue-600/5 dark:from-blue-500/10 dark:to-blue-600/10">
                  <CardHeader>
                    <CardTitle className="text-2xl font-[Poppins] flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                        M
                      </div>
                      Our Mission
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      NMTSA partners with those impacted by disability to change lives through using the brain's response to music, and optimizing body and brain connections. NMTSA assumes the competence of all.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500/5 to-green-600/5 dark:from-green-500/10 dark:to-green-600/10">
                <CardHeader>
                  <CardTitle className="text-2xl font-[Poppins] flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xl font-bold">
                      ✓
                    </div>
                    Our Core Values
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6 text-lg font-medium">NMTSA believes in...</p>
                  <ul className="space-y-4 text-muted-foreground">
                    <li className="flex gap-3 group">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-bold flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">1</span>
                      <span className="leading-relaxed">the capability of all people to reach their goals and attain their full potential.</span>
                    </li>
                    <li className="flex gap-3 group">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white text-sm font-bold flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">2</span>
                      <span className="leading-relaxed">the competence of all people.</span>
                    </li>
                    <li className="flex gap-3 group">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white text-sm font-bold flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">3</span>
                      <span className="leading-relaxed">the valuable contribution every person has to offer through their unique person and abilities.</span>
                    </li>
                    <li className="flex gap-3 group">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-bold flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">4</span>
                      <span className="leading-relaxed">the connection of science and relationship, and the impact both have on every person.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500/5 via-orange-600/5 to-red-500/5 dark:from-orange-500/10 dark:via-orange-600/10 dark:to-red-500/10 hover:shadow-2xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-[Poppins] flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    Our Story
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
                  <div className="space-y-4 text-base">
                    <p className="pl-4 border-l-4 border-gradient-to-b from-orange-500 to-red-500 border-orange-500/50">
                      Neurologic Music Therapy Services of Arizona's (NMTSA) vision is to unleash the unique potential of individuals with disabilities. NMTSA has provided services to persons with neurologic impairments (ages 18 months to 75+ years of age) and their families in the greater Phoenix area since 1982.
                    </p>
                    <p className="pl-4 border-l-4 border-orange-500/50">
                      NMTSA is nationally recognized for its evidence-based approach to treatment with persons with neurological impairments, and children with autism specifically. The company and its staff maintain a close relationship with research staff from universities across the country (with emphasis in NMT®, competency-based communication, inclusion, and psychomotor regulation/movement disorders) in order to remain current with best practice approaches for the individuals served.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-4 text-sm font-semibold text-orange-600 dark:text-orange-400">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                    <span>Serving the Phoenix area since 1982</span>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-cyan-500/5 to-teal-600/5 dark:from-cyan-500/10 dark:to-teal-600/10 group">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-[Poppins] flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      Our Clinic
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground leading-relaxed">
                    <p className="text-base">
                      NMTSA's clinic space was designed and built to be optimized for NMT activities. It contains eight individual therapy rooms, a large group room for group NMT sessions, administrative offices, a recording studio in which clients can make and produce their own music, and a waiting room. We are committed to providing a safe, fragrance-free environment for all our clients, and are sensitive to other client allergies and needs.
                    </p>
                    <div className="flex items-center gap-2 mt-6 pt-4 border-t border-cyan-200/50 dark:border-cyan-800/50">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 border-2 border-white dark:border-gray-900 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">8</span>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 border-2 border-white dark:border-gray-900 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">+</span>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400">State-of-the-art facilities</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-indigo-500/5 to-violet-600/5 dark:from-indigo-500/10 dark:to-violet-600/10 group">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-[Poppins] flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                      Our Therapists
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground leading-relaxed">
                    <p className="text-base">
                      All of the therapists at NMTSA hold the national certification credential MT-BC issued by the Certification Board for Music Therapists. Additionally, all NMTSA therapists are required to obtain additional advanced clinical training in Neurologic Music Therapy (NMT)® through the Academy of Neurologic Music Therapy® and to maintain Fellowship status with the Academy of Neurologic Music Therapy.
                    </p>
                    <div className="flex items-center gap-2 mt-6 pt-4 border-t border-indigo-200/50 dark:border-indigo-800/50">
                      <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">MT-BC & NMT® Certified</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-blue-50/50 via-background to-purple-50/50 dark:from-blue-950/10 dark:via-background dark:to-purple-950/10 relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-[Poppins] bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              What Our Community Says
            </h2>
            <div className="w-24 h-1 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
            <p className="text-muted-foreground text-lg">
              Trusted by professionals and families worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => {
              const gradients = [
                "from-blue-500/10 to-blue-600/10",
                "from-purple-500/10 to-purple-600/10"
              ];
              return (
                <Card 
                  key={index} 
                  className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br ${gradients[index]}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4 mb-6">
                      <Avatar className="w-16 h-16 ring-2 ring-primary/20">
                        <AvatarImage src={testimonial.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xl font-bold">
                          {testimonial.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-lg">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute -top-2 -left-2 text-6xl text-primary/10 font-serif">"</div>
                      <p className="text-muted-foreground leading-relaxed italic pl-6">
                        {testimonial.quote}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-gray-50/50 via-background to-blue-50/50 dark:from-gray-950/10 dark:via-background dark:to-blue-950/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-[Poppins] bg-gradient-to-r from-gray-600 to-blue-600 bg-clip-text text-transparent">
              Contact Us
            </h2>
            <div className="w-24 h-1 mx-auto bg-gradient-to-r from-gray-500 to-blue-500 rounded-full" />
            <p className="text-muted-foreground text-lg">
              Get in touch with our team for support and inquiries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-500/5 to-gray-600/5 dark:from-gray-500/10 dark:to-gray-600/10">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">General Information</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>Email:</strong> info@nmtsa.org</p>
                  <p><strong>Phone:</strong> (602) 285-0880</p>
                  <p><strong>Address:</strong> Phoenix, Arizona</p>
                  <p><strong>Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM MST</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500/5 to-blue-600/5 dark:from-blue-500/10 dark:to-blue-600/10">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Course Support</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong>Technical Support:</strong> support@nmtsa.org</p>
                  <p><strong>Course Questions:</strong> courses@nmtsa.org</p>
                  <p><strong>CE Credits:</strong> credits@nmtsa.org</p>
                  <p><strong>Response Time:</strong> Within 24 hours</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy Policy Section */}
      <section id="privacy" className="py-20 bg-gradient-to-br from-green-50/50 via-background to-purple-50/50 dark:from-green-950/10 dark:via-background dark:to-purple-950/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-[Poppins] bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
              Privacy Policy
            </h2>
            <div className="w-24 h-1 mx-auto bg-gradient-to-r from-green-500 to-purple-500 rounded-full" />
            <p className="text-muted-foreground text-lg">
              Your privacy and data protection are important to us
            </p>
          </div>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500/5 to-purple-500/5 dark:from-green-500/10 dark:to-purple-500/10">
            <CardContent className="pt-6">
              <div className="space-y-6 text-muted-foreground">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">Information We Collect</h3>
                  <p>We collect information you provide directly to us, such as when you create an account, enroll in courses, or contact us for support.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">How We Use Your Information</h3>
                  <p>We use your information to provide, maintain, and improve our services, process transactions, and communicate with you about courses and updates.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">Data Security</h3>
                  <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">Contact Us</h3>
                  <p>If you have any questions about this Privacy Policy, please contact us at privacy@nmtsa.org</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Terms of Service Section */}
      <section id="terms" className="py-20 bg-gradient-to-br from-orange-50/50 via-background to-red-50/50 dark:from-orange-950/10 dark:via-background dark:to-red-950/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-[Poppins] bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Terms of Service
            </h2>
            <div className="w-24 h-1 mx-auto bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
            <p className="text-muted-foreground text-lg">
              Please read these terms carefully before using our services
            </p>
          </div>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500/5 to-red-500/5 dark:from-orange-500/10 dark:to-red-500/10">
            <CardContent className="pt-6">
              <div className="space-y-6 text-muted-foreground">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">Acceptance of Terms</h3>
                  <p>By accessing and using NMTSA's educational platform, you accept and agree to be bound by the terms and provision of this agreement.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">Course Access</h3>
                  <p>Course access is granted upon successful enrollment and payment. You may not share your login credentials or course materials with others.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">CE Credits</h3>
                  <p>Continuing Education credits are awarded upon successful completion of courses. Credits are subject to AMTA guidelines and requirements.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">Refund Policy</h3>
                  <p>Refunds are available within 30 days of purchase if no more than 25% of the course content has been accessed.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">Contact Us</h3>
                  <p>For questions about these terms, please contact us at legal@nmtsa.org</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

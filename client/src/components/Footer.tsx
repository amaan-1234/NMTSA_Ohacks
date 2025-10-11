import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, Award } from "lucide-react";

export default function Footer() {
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
                <Link href="/courses">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Browse All Courses
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/courses/free">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Free Resources
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/courses/premium">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Premium Courses
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/certification">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    NMT Certification
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 font-[Poppins]">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/help">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Help Center
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/forums">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Community Forums
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Contact Us
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/accessibility">
                  <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Accessibility
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 font-[Poppins]">Stay Updated</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to get updates on new courses and CE opportunities.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="flex-1"
                data-testid="input-newsletter-email"
              />
              <Button data-testid="button-newsletter-subscribe">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 NMTSA. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/privacy">
              <a className="hover:text-foreground transition-colors">Privacy Policy</a>
            </Link>
            <Link href="/terms">
              <a className="hover:text-foreground transition-colors">Terms of Service</a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

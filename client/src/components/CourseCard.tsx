import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Award, BookOpen } from "lucide-react";
import { useAuth } from "@/state/auth";
import { useCart } from "@/state/cart";
import { useLocation } from "wouter";

interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  duration: string;
  ceCredits?: number;
  isPremium?: boolean;
  price?: number;
  progress?: number;
  isEnrolled?: boolean;
  level?: "Beginner" | "Intermediate" | "Advanced";
}

export default function CourseCard({
  id,
  title,
  instructor,
  thumbnail,
  duration,
  ceCredits,
  isPremium = false,
  price,
  progress,
  isEnrolled = false,
  level = "Beginner",
}: CourseCardProps) {
  const { isAuthenticated } = useAuth();
  const { add, showToast } = useCart();
  const [, setLocation] = useLocation();

  const enrollOrAdd = () => {
    if (!isAuthenticated) {
      setLocation(`/auth/login?redirect=${encodeURIComponent("/courses?greet=1")}`);
      return;
    }
    // Add to cart for logged-in users
    const courseTitle = title || "Course";
    const coursePrice = price ?? null;
    add({ id: String(id), title: courseTitle, price: coursePrice }, 1);
    showToast("Item Added to Cart Successfully");
  };

  const onContinue = () => {
    setLocation(`/courses/${id}`);
  };
  return (
    <Card className="overflow-hidden hover-elevate transition-all duration-200 group" data-testid={`card-course-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="relative aspect-video overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {isPremium && (
            <Badge className="bg-primary/90 text-primary-foreground">Premium</Badge>
          )}
          {ceCredits && (
            <Badge className="bg-chart-3/90 text-white">
              <Award className="w-3 h-3 mr-1" />
              {ceCredits} CE Credits
            </Badge>
          )}
        </div>
        {level && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary">{level}</Badge>
          </div>
        )}
      </div>

      <CardHeader className="space-y-2 pb-3">
        <h3 className="font-semibold text-lg line-clamp-2 font-[Poppins]" data-testid="text-course-title">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">{instructor}</p>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>12 Lessons</span>
          </div>
        </div>

        {isEnrolled && typeof progress === "number" && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        {isEnrolled ? (
          <Button className="w-full" onClick={onContinue} data-testid="button-continue-learning">
            Continue Learning
          </Button>
        ) : (
          <div className="flex items-center justify-between w-full gap-3">
            {price !== undefined && (
              <span className="text-2xl font-bold text-primary" data-testid="text-course-price">
                ${price}
              </span>
            )}
            <Button
              className={price !== undefined ? "flex-1" : "w-full"}
              variant={price === undefined ? "default" : "default"}
              onClick={enrollOrAdd}
              data-testid="button-enroll"
            >
              {isAuthenticated ? "Add to Cart" : "Enroll Now"}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

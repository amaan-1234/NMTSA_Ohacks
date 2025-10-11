import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, BookOpen, Clock, TrendingUp } from "lucide-react";
import CourseCard from "./CourseCard";
import course1 from "@assets/stock_images/online_learning_educ_c7bf3739.jpg";
import course2 from "@assets/stock_images/medical_training_pro_24e28be1.jpg";

export default function Dashboard() {
  const stats = [
    { label: "Courses Enrolled", value: "4", icon: BookOpen, color: "text-primary" },
    { label: "Hours Learned", value: "32.5", icon: Clock, color: "text-chart-2" },
    { label: "Certificates Earned", value: "2", icon: Award, color: "text-chart-3" },
    { label: "CE Credits", value: "15", icon: TrendingUp, color: "text-chart-4" },
  ];

  const continueLearning = [
    {
      id: "1",
      title: "Fundamentals of Neurologic Music Therapy",
      instructor: "Dr. Sarah Mitchell",
      thumbnail: course1,
      duration: "8 hours",
      ceCredits: 8,
      isPremium: true,
      progress: 65,
      isEnrolled: true,
      level: "Beginner" as const,
    },
    {
      id: "2",
      title: "Advanced NMT Techniques for Stroke Rehabilitation",
      instructor: "Dr. James Chen",
      thumbnail: course2,
      duration: "12 hours",
      ceCredits: 12,
      isPremium: true,
      progress: 30,
      isEnrolled: true,
      level: "Advanced" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-[Poppins] mb-2">
            Welcome back, Alex!
          </h1>
          <p className="text-muted-foreground">
            Continue your learning journey and track your progress
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} data-testid={`card-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid={`text-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold font-[Poppins] mb-6">Continue Learning</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {continueLearning.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold font-[Poppins] mb-6">Recent Activity</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-chart-3 mt-2" />
                  <div className="flex-1">
                    <p className="font-medium">Completed "Assessment Techniques in NMT"</p>
                    <p className="text-sm text-muted-foreground">Earned 6 CE credits • 2 days ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    <p className="font-medium">Started "Advanced NMT Techniques"</p>
                    <p className="text-sm text-muted-foreground">4 days ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-chart-2 mt-2" />
                  <div className="flex-1">
                    <p className="font-medium">Participated in forum discussion</p>
                    <p className="text-sm text-muted-foreground">"Best practices for pediatric NMT" • 1 week ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

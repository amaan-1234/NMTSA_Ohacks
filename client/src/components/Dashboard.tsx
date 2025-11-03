import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Award, BookOpen, Clock, TrendingUp, Loader2, Download, CheckCircle } from "lucide-react";
import { useAuth } from "@/state/auth";
import { useLocation } from "wouter";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, doc } from "firebase/firestore";
import Certificate from "@/components/Certificate";

type UserCourse = {
  id: string;
  courseId: string;
  title: string;
  instructor: string;
  thumbnail: string;
  duration: string;
  ceCredits: number;
  price?: number;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
  purchasedAt: any;
  lastAccessedAt?: any;
  completed: boolean;
  level?: string;
};

export default function Dashboard() {
  const { isAuthenticated, getDisplayName, user, authReady } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [userCourses, setUserCourses] = useState<UserCourse[]>([]);
  const [showCertificate, setShowCertificate] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<UserCourse | null>(null);

  const displayName = getDisplayName();
  
  // Debug log to verify component is loading
  console.log("🔧 Dashboard component loaded - Browse More Courses button removed");

  // Fetch user's purchased courses
  useEffect(() => {
    const fetchUserCourses = async () => {
      // Wait for auth to be ready
      if (!authReady) {
        console.log("⏳ Dashboard: Waiting for auth to be ready...");
        return;
      }

      if (!user?.id) {
        console.log("🔒 Dashboard: User not authenticated");
        setLoading(false);
        return;
      }

      console.log("🔄 Dashboard: Fetching enrolled courses...");
      setLoading(true);

      try {
        const coursesRef = collection(db, "user_courses", user.id, "courses");
        const q = query(coursesRef);
        const snapshot = await getDocs(q);

        const courses: UserCourse[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as UserCourse[];

        // Sort by last accessed (most recent first)
        courses.sort((a, b) => {
          const aTime = a.lastAccessedAt?.toMillis?.() || a.purchasedAt?.toMillis?.() || 0;
          const bTime = b.lastAccessedAt?.toMillis?.() || b.purchasedAt?.toMillis?.() || 0;
          return bTime - aTime;
        });

        setUserCourses(courses);
        console.log(`✅ Dashboard: Loaded ${courses.length} enrolled courses`);
        if (courses.length > 0) {
          console.log("📚 Courses:", courses.map(c => c.title).join(", "));
        }
      } catch (error) {
        console.error("❌ Dashboard: Error fetching user courses:", error);
      } finally {
        setLoading(false);
      }
    };

    if (authReady) {
      fetchUserCourses();
    }
  }, [user?.id, authReady]);

  // Calculate stats from real data
  const stats = React.useMemo(() => {
    const completedCourses = userCourses.filter(c => c.completed);
    const totalCredits = completedCourses.reduce((sum, c) => sum + (c.ceCredits || 0), 0);

    return [
      { label: "Courses Enrolled", value: userCourses.length.toString(), icon: BookOpen, color: "text-blue-600" },
      { label: "Certificates Earned", value: completedCourses.length.toString(), icon: Award, color: "text-purple-600" },
      { label: "CE Credits Earned", value: totalCredits.toString(), icon: TrendingUp, color: "text-orange-600" },
    ];
  }, [userCourses]);

  const handleContinueLearning = (courseId: string) => {
    setLocation(`/course/${courseId}`);
  };

  const handleDownloadCertificate = async (course: UserCourse) => {
    setSelectedCourse(course);
    setShowCertificate(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Please log in to view your dashboard</p>
            <Button onClick={() => setLocation("/auth/login")}>Log In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-muted-foreground text-lg">
            Continue your learning journey and track your progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <Card 
              key={stat.label} 
              className="hover:shadow-lg transition-all duration-300 border-0 shadow-md"
              data-testid={`card-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className={`w-10 h-10 rounded-lg bg-${stat.color.split('-')[1]}-100 dark:bg-${stat.color.split('-')[1]}-950/30 flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div 
                  className="text-3xl font-bold" 
                  data-testid={`text-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Purchased Courses - Updated 2024 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold font-[Poppins]">My Courses</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-3 text-muted-foreground">Loading your courses...</span>
            </div>
          ) : userCourses.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="pt-12 pb-12 text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-xl font-semibold mb-2">No Courses Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  You haven't purchased any courses yet. Browse our catalog to get started on your learning journey!
                </p>
                <Button onClick={() => setLocation("/courses")} size="lg">
                  Browse Courses
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {userCourses.map((course) => (
                <Card 
                  key={course.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md group"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Thumbnail */}
                    <div className="relative md:w-1/3 aspect-video md:aspect-square overflow-hidden bg-muted">
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {course.completed && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-green-600 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        </div>
                      )}
                      {course.level && !course.completed && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="secondary">{course.level}</Badge>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 flex flex-col">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2 font-[Poppins]">
                          {course.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">{course.instructor}</p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{course.duration}</span>
                          </div>
                          {course.ceCredits > 0 && (
                            <div className="flex items-center gap-1">
                              <Award className="w-4 h-4" />
                              <span>{course.ceCredits} CE Credits</span>
                            </div>
                          )}
                        </div>

                        {/* Progress */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground font-medium">
                              {course.completed ? 'Completed' : 'Progress'}
                            </span>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                              {course.progress}%
                            </span>
                          </div>
                          <Progress 
                            value={course.progress} 
                            className={`h-2 ${course.completed ? 'bg-green-100' : ''}`}
                          />
                          <p className="text-xs text-muted-foreground">
                            {course.lessonsCompleted} of {course.totalLessons} lessons completed
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {course.completed ? (
                          <>
                            <Button 
                              onClick={() => handleDownloadCertificate(course)}
                              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download Certificate
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => handleContinueLearning(course.courseId)}
                            >
                              Review
                            </Button>
                          </>
                        ) : (
                          <Button 
                            onClick={() => handleContinueLearning(course.courseId)}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                          >
                            Continue Learning
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificate && selectedCourse && (
        <Certificate
          courseTitle={selectedCourse.title}
          instructor={selectedCourse.instructor}
          ceCredits={selectedCourse.ceCredits}
          completedDate={new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
          userName={displayName}
          onDownload={() => {
            setShowCertificate(false);
            setSelectedCourse(null);
          }}
        />
      )}
    </div>
  );
}

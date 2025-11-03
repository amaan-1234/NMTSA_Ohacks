import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Award, BookOpen, Download, CheckCircle, Circle, Play, Loader2, FileVideo, FileText } from "lucide-react";
import instructorImg from "@assets/stock_images/professional_instruc_df26bc9c.jpg";
import courseImg from "@assets/stock_images/medical_training_pro_24e28be1.jpg";
import { useAuth } from "@/state/auth";
import { useCart } from "@/state/cart";
import { useRoute, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { hasAccessToCourse, updateCourseProgress, updateLastAccessed, enrollUserInCourse } from "@/lib/courseProgress";
import { useToast } from "@/hooks/use-toast";
import { useAnalytics } from "@/hooks/useAnalytics";

type CourseMaterial = {
  name: string;
  url: string;
  type: string;
};

type CourseData = {
  id: string;
  title: string;
  instructor: string;
  description?: string;
  thumbnail: string;
  duration: string;
  ceCredits?: number;
  price?: number;
  isPremium?: boolean;
  level?: string;
  category?: string;
  materials?: CourseMaterial[];
};

export default function CourseDetail() {
  const [match, params] = useRoute("/course/:id");
  const courseId = params?.id!;
  const { isAuthenticated, user, authReady } = useAuth();
  const { add, showToast } = useCart();
  const [, setLocation] = useLocation();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [userProgress, setUserProgress] = useState({
    progress: 0,
    lessonsCompleted: 0,
    totalLessons: 12,
  });
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  const analytics = useAnalytics();
  
  // Debug log to verify component is loading
  console.log("🔧 CourseDetail component loaded - Button text fixed");

  // Fetch course data and user progress
  useEffect(() => {
    const fetchData = async () => {
      // Don't proceed until auth is ready
      if (!authReady) {
        console.log("⏳ Waiting for auth to be ready...");
        return;
      }

      setLoading(true);
      console.log("🔄 Fetching course data and enrollment status...");

      try {
        // Fetch course data
        const courseDoc = await getDoc(doc(db, "courses", courseId));
        if (!courseDoc.exists()) {
          console.log("❌ Course not found");
          setLoading(false);
          return;
        }

        const courseData = { id: courseDoc.id, ...courseDoc.data() } as CourseData;
        setCourse(courseData);
        console.log("✅ Course data loaded:", courseData.title);

        // Track course access
        analytics.trackCourseAccess(courseId);

        // Check if user has access and fetch progress
        if (user?.id) {
          console.log("👤 User authenticated, checking access...");
          let access = await hasAccessToCourse(user.id, courseId);
          console.log(`🔑 Access check result: ${access}`);

          // Auto-enroll in free courses
          if (!access && (!courseData.isPremium || courseData.price === 0)) {
            console.log("🆓 Auto-enrolling user in free course...");
            try {
              await enrollUserInCourse(user.id, courseId, {
                title: courseData.title,
                instructor: courseData.instructor,
                thumbnail: courseData.thumbnail,
                duration: courseData.duration,
                ceCredits: courseData.ceCredits || 0,
                price: courseData.price || 0,
                level: courseData.level,
              });
              
              // Track enrollment
              analytics.trackCourseEnrollment(courseId);
              
              // Wait for Firestore to propagate
              await new Promise(resolve => setTimeout(resolve, 500));
              
              toast({
                title: "Enrolled Successfully!",
                description: `You've been enrolled in ${courseData.title}`,
              });
              
              // Update access state immediately after enrollment
              access = true;
              setHasAccess(true);
              console.log("✅ Auto-enrollment complete, access granted");
            } catch (error) {
              console.error("❌ Error enrolling in free course:", error);
              toast({
                title: "Enrollment Error",
                description: "Failed to enroll in course. Please try again.",
                variant: "destructive",
              });
            }
          } else {
            setHasAccess(access);
          }

          // Fetch user's progress if they have access
          if (access) {
            console.log("📊 Loading user progress...");
            const userCourseDoc = await getDoc(doc(db, "user_courses", user.id, "courses", courseId));
            if (userCourseDoc.exists()) {
              const data = userCourseDoc.data();
              setUserProgress({
                progress: data.progress || 0,
                lessonsCompleted: data.lessonsCompleted || 0,
                totalLessons: data.totalLessons || 12,
              });
              console.log("📈 Progress loaded:", data.progress + "%");

              // Initialize completed lessons set
              const completed = new Set<number>();
              for (let i = 1; i <= (data.lessonsCompleted || 0); i++) {
                completed.add(i);
              }
              setCompletedLessons(completed);
            } else {
              console.log("📊 No progress data found yet");
            }

            // Update last accessed
            await updateLastAccessed(user.id, courseId);
          }
        } else {
          console.log("🔒 User not authenticated");
        }
      } catch (error) {
        console.error("❌ Error fetching course data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (courseId && authReady) {
      fetchData();
    }
  }, [courseId, user?.id, authReady, toast, refreshKey]);

  const enrollOrAdd = async () => {
    if (!isAuthenticated) return setLocation(`/auth/login?redirect=${encodeURIComponent("/courses?greet=1")}`);
    if (!course || !user?.id) return;
    
    // For free courses, enroll if not already enrolled
    if (!course.isPremium || course.price === 0) {
      if (hasAccess) {
        toast({
          title: "Already Enrolled!",
          description: "You have access to this free course. Start learning!",
        });
        return;
      }
      
      // Manual enrollment for free course
      try {
        setLoading(true);
        console.log("🎓 Starting manual enrollment process...");
        
        await enrollUserInCourse(user.id, courseId, {
          title: course.title,
          instructor: course.instructor,
          thumbnail: course.thumbnail,
          duration: course.duration,
          ceCredits: course.ceCredits || 0,
          price: course.price || 0,
          level: course.level,
        });
        
        // Track enrollment
        analytics.trackCourseEnrollment(courseId);
        
        console.log("✅ Enrollment complete, waiting for propagation...");
        
        // Wait a moment for Firestore to propagate
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Verify enrollment and fetch progress
        const userCourseDoc = await getDoc(doc(db, "user_courses", user.id, "courses", courseId));
        if (userCourseDoc.exists()) {
          const data = userCourseDoc.data();
          setUserProgress({
            progress: data.progress || 0,
            lessonsCompleted: data.lessonsCompleted || 0,
            totalLessons: data.totalLessons || 12,
          });
          console.log("📊 Progress loaded:", data.progress + "%");
          setHasAccess(true);
        } else {
          console.warn("⚠️ Enrollment document not found, triggering refresh...");
          // Trigger a full refresh to re-check enrollment
          setRefreshKey(prev => prev + 1);
        }
        
        toast({
          title: "Enrolled Successfully!",
          description: "You can now access all course materials and lessons.",
        });
        
        console.log("🎉 Enrollment complete! Access granted.");
      } catch (error) {
        console.error("❌ Error enrolling in course:", error);
        toast({
          title: "Enrollment Failed",
          description: "Please try again or contact support.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // Add to cart for paid courses
    add({ id: String(courseId), title: course.title, price: course.price || 0 }, 1);
    showToast("Item Added to Cart Successfully");
  };

  const lessons = [
    { id: 1, title: "Introduction to NMT Principles", duration: "45 min" },
    { id: 2, title: "Neurological Foundations", duration: "60 min" },
    { id: 3, title: "Assessment Methods", duration: "50 min" },
    { id: 4, title: "Treatment Planning", duration: "55 min" },
    { id: 5, title: "Case Studies", duration: "70 min" },
    { id: 6, title: "Clinical Applications", duration: "60 min" },
    { id: 7, title: "Patient Assessment Techniques", duration: "50 min" },
    { id: 8, title: "Treatment Documentation", duration: "40 min" },
    { id: 9, title: "Evidence-Based Practice", duration: "55 min" },
    { id: 10, title: "Working with Diverse Populations", duration: "50 min" },
    { id: 11, title: "Advanced Case Studies", duration: "65 min" },
    { id: 12, title: "Certification Preparation", duration: "60 min" },
  ];

  const handleLessonClick = async (lessonId: number) => {
    if (!hasAccess || !user?.id) {
      toast({
        title: "Enrollment Required",
        description: "Please purchase this course to access lessons",
        variant: "destructive",
      });
      return;
    }

    // Toggle lesson completion
    const newCompleted = new Set(completedLessons);
    const wasCompleted = newCompleted.has(lessonId);
    
    if (wasCompleted) {
      newCompleted.delete(lessonId);
    } else {
      newCompleted.add(lessonId);
      // Track lesson completion
      analytics.trackCourseProgress(courseId, Math.round((newCompleted.size / userProgress.totalLessons) * 100));
    }
    
    setCompletedLessons(newCompleted);

    // Update progress in Firestore
    try {
      await updateCourseProgress(
        user.id,
        courseId,
        newCompleted.size,
        userProgress.totalLessons
      );

      // Update local state
      const newProgress = Math.round((newCompleted.size / userProgress.totalLessons) * 100);
      setUserProgress({
        ...userProgress,
        progress: newProgress,
        lessonsCompleted: newCompleted.size,
      });

      toast({
        title: newCompleted.has(lessonId) ? "Lesson Completed!" : "Lesson Unmarked",
        description: newCompleted.has(lessonId)
          ? `Progress: ${newProgress}%`
          : "Lesson marked as incomplete",
      });

      // If all lessons completed, show congratulations
      if (newCompleted.size === userProgress.totalLessons) {
        // Track course completion
        analytics.trackCourseCompletion(courseId);
        
        toast({
          title: "🎉 Course Completed!",
          description: "Congratulations! You can now download your certificate from the dashboard.",
        });
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading course...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Course Not Found</h2>
          <Button onClick={() => setLocation("/courses")}>Back to Courses</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge className="bg-primary text-primary-foreground">Premium</Badge>
                <Badge className="bg-chart-3 text-white">
                  <Award className="w-3 h-3 mr-1" />
                  8 CE Credits
                </Badge>
                <Badge variant="secondary">Beginner</Badge>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold font-[Poppins] mb-4">
                Fundamentals of Neurologic Music Therapy
              </h1>

              <div className="flex items-center gap-6 mb-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>8 hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>12 Lessons</span>
                </div>
              </div>

              <div className="aspect-video rounded-lg overflow-hidden mb-6 bg-muted">
                <img src={courseImg} alt="Course preview" className="w-full h-full object-cover" />
              </div>

              {hasAccess && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Your Progress</span>
                    <span className="text-sm font-medium">{userProgress.progress}% Complete</span>
                  </div>
                  <Progress value={userProgress.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {userProgress.lessonsCompleted} of {userProgress.totalLessons} lessons completed
                  </p>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="font-[Poppins]">Course Instructor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={instructorImg} />
                      <AvatarFallback>SM</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">Dr. Sarah Mitchell</p>
                      <p className="text-sm text-muted-foreground">NMT-Fellow, MT-BC</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Board-certified music therapist with 15+ years of experience 
                    in neurologic rehabilitation.
                  </p>
                  {!hasAccess && (
                    <Button 
                      className={`w-full ${(!course?.isPremium || course?.price === 0) 
                        ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' 
                        : ''}`}
                      onClick={enrollOrAdd} 
                      data-testid="button-continue-course"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {!course?.isPremium || course?.price === 0 
                        ? (isAuthenticated ? "Enroll Free" : "Sign In to Enroll")
                        : (isAuthenticated ? "Add to Cart" : "Enroll Now")}
                    </Button>
                  )}
                  {hasAccess && (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        // Scroll to lessons section - Updated 2024
                        const lessonsTab = document.querySelector('[value="lessons"]') as HTMLElement;
                        lessonsTab?.click();
                        window.scrollTo({ top: 500, behavior: 'smooth' });
                      }}
                      data-testid="button-start-learning"
                    >
                    <Play className="w-4 h-4 mr-2" />
                      Start Learning
                  </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="lessons" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="lessons" data-testid="tab-lessons">Lessons</TabsTrigger>
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="resources" data-testid="tab-resources">Resources</TabsTrigger>
            <TabsTrigger value="discussions" data-testid="tab-discussions">Discussions</TabsTrigger>
          </TabsList>

          <TabsContent value="lessons">
            <Card>
              <CardContent className="p-6">
                {!hasAccess && (
                  <div className="text-center py-8 px-4 bg-muted/30 rounded-lg border-2 border-dashed mb-4">
                    <p className="text-muted-foreground mb-3">
                      {!course?.isPremium || course?.price === 0 
                        ? (isAuthenticated ? "Click below to enroll in this free course" : "Sign in to access this free course")
                        : "Purchase this course to access all lessons"}
                    </p>
                    <Button 
                      onClick={enrollOrAdd} 
                      size="sm"
                      className={(!course?.isPremium || course?.price === 0) 
                        ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' 
                        : ''}
                    >
                      {!course?.isPremium || course?.price === 0 
                        ? (isAuthenticated ? "Enroll Free" : "Sign In to Enroll")
                        : (isAuthenticated ? "Add to Cart" : "Enroll Now")}
                    </Button>
                  </div>
                )}
                <div className="space-y-2">
                  {lessons.map((lesson, index) => {
                    const isCompleted = completedLessons.has(lesson.id);
                    return (
                    <button
                      key={lesson.id}
                        onClick={() => handleLessonClick(lesson.id)}
                        disabled={!hasAccess}
                        className={`w-full flex items-center gap-4 p-4 rounded-md transition-all text-left ${
                          hasAccess
                            ? 'hover:bg-muted/50 hover:shadow-md cursor-pointer'
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                      data-testid={`button-lesson-${index + 1}`}
                    >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                          <p className={`font-medium ${isCompleted ? 'text-green-600' : ''}`}>
                            {lesson.title}
                          </p>
                        <p className="text-sm text-muted-foreground">{lesson.duration}</p>
                      </div>
                        {hasAccess && (
                      <Play className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                    </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview">
            <Card>
              <CardContent className="p-6 prose prose-sm max-w-none dark:prose-invert">
                <h3>Course Description</h3>
                <p>
                  This comprehensive course provides healthcare professionals with a solid 
                  foundation in Neurologic Music Therapy (NMT). Learn evidence-based techniques 
                  for working with patients experiencing neurological disorders.
                </p>
                <h3>What You'll Learn</h3>
                <ul>
                  <li>Fundamental principles of neurologic music therapy</li>
                  <li>Neurological foundations relevant to music therapy practice</li>
                  <li>Evidence-based assessment and treatment methods</li>
                  <li>Clinical applications across diverse populations</li>
                  <li>Best practices for documentation and treatment planning</li>
                </ul>
                <h3>Prerequisites</h3>
                <p>
                  Board certification in music therapy (MT-BC) or equivalent professional 
                  credential in a related healthcare field.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <Card>
              <CardContent className="p-6">
                {course.materials && course.materials.length > 0 ? (
                  <div className="space-y-3">
                    {course.materials.map((material, index) => {
                      const isVideo = material.type.includes('video');
                      const isPDF = material.type.includes('pdf');
                      
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-md border border-border hover-elevate transition-all"
                          data-testid={`resource-${index}`}
                        >
                          <div className="flex items-center gap-3">
                            {isVideo ? (
                              <FileVideo className="w-5 h-5 text-blue-500" />
                            ) : isPDF ? (
                              <FileText className="w-5 h-5 text-red-500" />
                            ) : (
                              <Download className="w-5 h-5 text-muted-foreground" />
                            )}
                            <div>
                              <p className="font-medium">{material.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {isVideo ? 'Video' : isPDF ? 'PDF Document' : 'File'}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {isVideo && (
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => window.open(material.url, '_blank')}
                                data-testid={`button-watch-${index}`}
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Watch
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(material.url, '_blank')}
                              data-testid={`button-download-${index}`}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No course materials available yet.</p>
                    <p className="text-sm mt-1">Check back later for videos and resources.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discussions">
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground py-8">
                  Discussion forum coming soon. Share insights and ask questions with fellow learners.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

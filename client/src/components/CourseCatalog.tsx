import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2 } from "lucide-react";
import CourseCard from "./CourseCard";
import WelcomeBar from "./WelcomeBar";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "@/state/auth";
import { hasAccessToCourse } from "@/lib/courseProgress";
import { useSearch } from "wouter";

type Course = {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  duration: string;
  ceCredits?: number;
  isPremium?: boolean;
  price?: number;
  level?: "Beginner" | "Intermediate" | "Advanced";
  description?: string;
  category?: string;
  isEnrolled?: boolean; // Added for enrollment status
  progress?: number; // Added for progress tracking
};

export default function CourseCatalog() {
  const { user, authReady } = useAuth();
  const search = useSearch();
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Get tab from URL query parameter
  const urlParams = new URLSearchParams(search);
  const defaultTab = urlParams.get('tab') || 'all';

  // Fetch courses from Firestore (only admin-added courses)
  useEffect(() => {
    const fetchCourses = async () => {
      // Wait for auth to be ready
      if (!authReady) return;
      
      try {
        // Simplified query - removed orderBy to avoid composite index requirement
        const q = query(
          collection(db, "courses"),
          where("status", "==", "published")
        );
        const snapshot = await getDocs(q);
        
        const fetchedCourses: Course[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Course[];

        // Sort by createdAt in JavaScript instead of Firestore
        const sortedCourses = fetchedCourses.sort((a: any, b: any) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;
          return bTime - aTime; // newest first
        });

        // Check enrollment status for each course if user is authenticated
        const coursesWithEnrollment = await Promise.all(
          sortedCourses.map(async (course) => {
            if (user?.id) {
              const enrolled = await hasAccessToCourse(user.id, course.id);
              return {
                ...course,
                isEnrolled: enrolled,
                progress: enrolled ? 100 : 0, // For now, assume completed if enrolled
              };
            }
            return {
              ...course,
              isEnrolled: false,
              progress: 0,
            };
          })
        );

        setCourses(coursesWithEnrollment);
        console.log(`✅ Loaded ${coursesWithEnrollment.length} published courses with enrollment status`);
      } catch (error: any) {
        console.error("❌ Error fetching courses:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [authReady, user?.id]);

  // Use only Firestore courses (admin-added)
  const allCourses = courses;

  // Filter courses based on search query
  const filteredCourses = allCourses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const freeCourses = filteredCourses.filter(course => !course.isPremium);
  const premiumCourses = filteredCourses.filter(course => course.isPremium);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary/5 to-background py-12 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold font-[Poppins] mb-4">
            Course Catalog
          </h1>
          <p className="text-muted-foreground mb-6 max-w-2xl">
            Discover AMTA-approved continuing education courses and free resources 
            for neurologic music therapy professionals and families.
          </p>
          
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-courses"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeBar />
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading courses...</span>
          </div>
            ) : (
              <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="all" data-testid="tab-all-courses">
                All Courses ({filteredCourses.length})
              </TabsTrigger>
              <TabsTrigger value="free" data-testid="tab-free-courses">
                Free Resources ({freeCourses.length})
              </TabsTrigger>
              <TabsTrigger value="premium" data-testid="tab-premium-courses">
                Premium Courses ({premiumCourses.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {filteredCourses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg">No courses found</p>
                  <p className="text-sm mt-2">Try adjusting your search query</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <CourseCard key={course.id} {...course} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="free">
              {freeCourses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg">No free courses available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {freeCourses.map((course) => (
                    <CourseCard key={course.id} {...course} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="premium">
              {premiumCourses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg">No premium courses available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {premiumCourses.map((course) => (
                    <CourseCard key={course.id} {...course} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

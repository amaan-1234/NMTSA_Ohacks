import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2 } from "lucide-react";
import CourseCard from "./CourseCard";
import WelcomeBar from "./WelcomeBar";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import course1 from "@assets/stock_images/online_learning_educ_c7bf3739.jpg";
import course2 from "@assets/stock_images/online_learning_educ_fb9f3b00.jpg";
import course3 from "@assets/stock_images/online_learning_educ_58ee1c85.jpg";
import course4 from "@assets/stock_images/medical_training_pro_24e28be1.jpg";
import course5 from "@assets/stock_images/medical_training_pro_2fca4782.jpg";

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
};

export default function CourseCatalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [firestoreCourses, setFirestoreCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Default courses (fallback/example courses)
  const defaultCourses: Course[] = [
    {
      id: "default-1",
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
      id: "default-2",
      title: "Music Therapy for Stroke Rehabilitation",
      instructor: "Dr. James Chen",
      thumbnail: course2,
      duration: "12 hours",
      ceCredits: 12,
      isPremium: true,
      price: 299,
      level: "Advanced" as const,
    },
    {
      id: "default-3",
      title: "Introduction to Rhythmic Auditory Stimulation",
      instructor: "Dr. Maria Rodriguez",
      thumbnail: course3,
      duration: "6 hours",
      ceCredits: 6,
      level: "Beginner" as const,
    },
    {
      id: "default-4",
      title: "Pediatric NMT Approaches",
      instructor: "Dr. Emily Parker",
      thumbnail: course4,
      duration: "10 hours",
      ceCredits: 10,
      isPremium: true,
      price: 249,
      level: "Intermediate" as const,
    },
    {
      id: "default-5",
      title: "Assessment Techniques in NMT",
      instructor: "Dr. David Kim",
      thumbnail: course5,
      duration: "6 hours",
      ceCredits: 6,
      level: "Intermediate" as const,
    },
    {
      id: "default-6",
      title: "Family-Centered Music Therapy Resources",
      instructor: "Lisa Thompson, MT-BC",
      thumbnail: course1,
      duration: "4 hours",
      level: "Beginner" as const,
    },
  ];

  // Fetch courses from Firestore
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const q = query(
          collection(db, "courses"),
          where("status", "==", "published"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        
        const courses: Course[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Course[];

        setFirestoreCourses(courses);
      } catch (error) {
        console.error("Error fetching courses:", error);
        // If there's an error or no courses, we'll still have the default courses
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Combine Firestore courses with default courses
  const allCourses = [...firestoreCourses, ...defaultCourses];

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
          <Tabs defaultValue="all" className="w-full">
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

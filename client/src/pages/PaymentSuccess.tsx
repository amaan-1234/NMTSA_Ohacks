import React, { useEffect, useState } from "react";
import { useCart } from "@/state/cart";
import { useAuth } from "@/state/auth";
import { useLocation } from "wouter";
import { enrollUserInCourse } from "@/lib/courseProgress";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

const PaymentSuccess: React.FC = () => {
  const { clear } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [enrolling, setEnrolling] = useState(true);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const analytics = useAnalytics();

  useEffect(() => {
    const enrollPurchasedCourses = async () => {
      if (!user?.uid) {
        setEnrolling(false);
        return;
      }

      try {
        // Get pending purchase items
        const pendingKey = `pending_purchase_${user.uid}`;
        const pendingData = localStorage.getItem(pendingKey);
        
        if (!pendingData) {
          console.log("ℹ️ No pending purchases found");
          setEnrolling(false);
          clear();
          return;
        }

        const purchasedItems = JSON.parse(pendingData);
        console.log(`📦 Processing ${purchasedItems.length} purchased courses...`);

        let enrolled = 0;
        for (const item of purchasedItems) {
          try {
            // Fetch full course data from Firestore
            const courseDoc = await getDoc(doc(db, "courses", item.id));
            
            if (courseDoc.exists()) {
              const courseData = courseDoc.data();
              
              // Enroll user in the course
              await enrollUserInCourse(user.uid, item.id, {
                title: courseData.title || item.title || "Untitled Course",
                instructor: courseData.instructor || "Unknown Instructor",
                thumbnail: courseData.thumbnail || "",
                duration: courseData.duration || "0 hours",
                ceCredits: courseData.ceCredits || 0,
                price: item.price || courseData.price,
                level: courseData.level,
              });
              
              // Track revenue transaction
              analytics.trackRevenueTransaction({
                courseId: item.id,
                amount: item.price || courseData.price || 0,
                currency: 'USD',
                paymentMethod: 'stripe',
                status: 'completed',
              });
              
              // Track enrollment
              analytics.trackCourseEnrollment(item.id);
              
              enrolled++;
              console.log(`✅ Enrolled in: ${courseData.title}`);
            } else {
              console.warn(`⚠️ Course not found: ${item.id}`);
            }
          } catch (err) {
            console.error(`❌ Failed to enroll in course ${item.id}:`, err);
          }
        }

        setEnrolledCount(enrolled);
        
        // Clean up
        localStorage.removeItem(pendingKey);
        clear(); // Clear cart
        
        console.log(`🎓 Successfully enrolled in ${enrolled} courses!`);
      } catch (err: any) {
        console.error("❌ Error during enrollment:", err);
        setError(err.message || "Failed to enroll in courses");
      } finally {
        setEnrolling(false);
      }
    };

    enrollPurchasedCourses();
  }, [user?.uid, clear]);

  if (enrolling) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-8">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <Loader2 className="h-16 w-16 mx-auto animate-spin text-blue-600" />
            <h2 className="text-xl font-semibold">Setting up your courses...</h2>
            <p className="text-muted-foreground">
              Please wait while we enroll you in your purchased courses.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-8">
        <Card className="max-w-md w-full border-red-200">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-16 w-16 mx-auto text-red-600" />
            <h2 className="text-xl font-semibold">Enrollment Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => setLocation("/dashboard")} variant="outline">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-8">
      <Card className="max-w-md w-full border-green-200">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Payment Successful!</h1>
            <p className="text-muted-foreground">
              {enrolledCount > 0 
                ? `You've been enrolled in ${enrolledCount} course${enrolledCount > 1 ? 's' : ''}!`
                : "Your payment was processed successfully."}
            </p>
            <p className="text-sm text-muted-foreground">
              You'll also receive an email receipt from Stripe.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={() => setLocation("/dashboard")}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Go to My Courses
            </Button>
            <Button 
              onClick={() => setLocation("/courses")}
              variant="outline"
              className="w-full"
            >
              Browse More Courses
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;

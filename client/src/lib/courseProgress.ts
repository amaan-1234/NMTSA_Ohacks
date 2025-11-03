import { db } from "./firebase";
import { doc, setDoc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";

export type UserCourseData = {
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

/**
 * Enroll a user in a course after purchase
 */
export async function enrollUserInCourse(
  userId: string,
  courseId: string,
  courseData: {
    title: string;
    instructor: string;
    thumbnail: string;
    duration: string;
    ceCredits?: number;
    price?: number;
    level?: string;
  }
): Promise<void> {
  try {
    const userCourseRef = doc(db, "user_courses", userId, "courses", courseId);

    const courseDoc: UserCourseData = {
      courseId,
      title: courseData.title,
      instructor: courseData.instructor,
      thumbnail: courseData.thumbnail,
      duration: courseData.duration,
      ceCredits: courseData.ceCredits || 0,
      price: courseData.price,
      level: courseData.level,
      progress: 0,
      lessonsCompleted: 0,
      totalLessons: 12, // Default value, can be updated based on actual course structure
      purchasedAt: serverTimestamp(),
      lastAccessedAt: serverTimestamp(),
      completed: false,
    };

    await setDoc(userCourseRef, courseDoc);
    console.log(`✅ User ${userId} enrolled in course ${courseId}`);
  } catch (error) {
    console.error("❌ Error enrolling user in course:", error);
    throw error;
  }
}

/**
 * Update course progress
 */
export async function updateCourseProgress(
  userId: string,
  courseId: string,
  lessonsCompleted: number,
  totalLessons: number
): Promise<void> {
  try {
    const userCourseRef = doc(db, "user_courses", userId, "courses", courseId);
    const progress = Math.round((lessonsCompleted / totalLessons) * 100);
    const completed = progress === 100;

    await updateDoc(userCourseRef, {
      lessonsCompleted,
      totalLessons,
      progress,
      completed,
      lastAccessedAt: serverTimestamp(),
    });

    console.log(`✅ Updated progress for course ${courseId}: ${progress}%`);
  } catch (error) {
    console.error("❌ Error updating course progress:", error);
    throw error;
  }
}

/**
 * Mark a lesson as completed
 */
export async function markLessonComplete(
  userId: string,
  courseId: string,
  lessonId: string
): Promise<void> {
  try {
    const userCourseRef = doc(db, "user_courses", userId, "courses", courseId);
    const courseSnap = await getDoc(userCourseRef);

    if (!courseSnap.exists()) {
      throw new Error("Course not found in user courses");
    }

    const courseData = courseSnap.data() as UserCourseData;
    const newLessonsCompleted = Math.min(
      courseData.lessonsCompleted + 1,
      courseData.totalLessons
    );

    await updateCourseProgress(
      userId,
      courseId,
      newLessonsCompleted,
      courseData.totalLessons
    );
  } catch (error) {
    console.error("❌ Error marking lesson complete:", error);
    throw error;
  }
}

/**
 * Update last accessed timestamp
 */
export async function updateLastAccessed(
  userId: string,
  courseId: string
): Promise<void> {
  try {
    const userCourseRef = doc(db, "user_courses", userId, "courses", courseId);
    await updateDoc(userCourseRef, {
      lastAccessedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("❌ Error updating last accessed:", error);
    // Don't throw, this is not critical
  }
}

/**
 * Check if user has access to a course
 */
export async function hasAccessToCourse(
  userId: string,
  courseId: string
): Promise<boolean> {
  try {
    const userCourseRef = doc(db, "user_courses", userId, "courses", courseId);
    const courseSnap = await getDoc(userCourseRef);
    return courseSnap.exists();
  } catch (error) {
    console.error("❌ Error checking course access:", error);
    return false;
  }
}


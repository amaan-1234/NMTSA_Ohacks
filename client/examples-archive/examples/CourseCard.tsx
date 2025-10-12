import CourseCard from '../CourseCard';
import courseImg from '@assets/stock_images/online_learning_educ_c7bf3739.jpg';

export default function CourseCardExample() {
  return (
    <div className="p-6 max-w-sm">
      <CourseCard
        id="1"
        title="Fundamentals of Neurologic Music Therapy"
        instructor="Dr. Sarah Mitchell"
        thumbnail={courseImg}
        duration="8 hours"
        ceCredits={8}
        isPremium={true}
        price={199}
        level="Beginner"
      />
    </div>
  );
}

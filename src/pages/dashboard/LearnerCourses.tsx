import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";

const LearnerCourses = () => {
  const { user } = useAuth();
  return (
    <DashboardLayout role="learner">
      <h1 className="text-2xl font-bold text-foreground mb-6">My Courses</h1>
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">You haven't enrolled in any courses yet.</p>
        <a href="/courses" className="text-primary hover:underline text-sm mt-2 inline-block">Browse courses</a>
      </div>
    </DashboardLayout>
  );
};
export default LearnerCourses;

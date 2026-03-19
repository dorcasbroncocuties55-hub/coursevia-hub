import DashboardLayout from "@/components/layouts/DashboardLayout";
const CoachReviews = () => (
  <DashboardLayout role="coach"><h1 className="text-2xl font-bold text-foreground mb-6">Reviews</h1>
    <div className="bg-card border border-border rounded-lg p-8 text-center"><p className="text-muted-foreground">Client reviews will appear here.</p></div>
  </DashboardLayout>
);
export default CoachReviews;

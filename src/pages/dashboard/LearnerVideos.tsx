import DashboardLayout from "@/components/layouts/DashboardLayout";
const LearnerVideos = () => (
  <DashboardLayout role="learner">
    <h1 className="text-2xl font-bold text-foreground mb-6">My Videos</h1>
    <div className="bg-card border border-border rounded-lg p-8 text-center">
      <p className="text-muted-foreground">You haven't purchased any videos yet.</p>
      <a href="/videos" className="text-primary hover:underline text-sm mt-2 inline-block">Browse videos</a>
    </div>
  </DashboardLayout>
);
export default LearnerVideos;

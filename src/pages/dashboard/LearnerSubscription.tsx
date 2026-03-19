import DashboardLayout from "@/components/layouts/DashboardLayout";
const LearnerSubscription = () => (
  <DashboardLayout role="learner">
    <h1 className="text-2xl font-bold text-foreground mb-6">Subscription</h1>
    <div className="bg-card border border-border rounded-lg p-8 text-center">
      <p className="text-muted-foreground mb-4">You don't have an active subscription.</p>
      <a href="/pricing" className="text-primary hover:underline text-sm">View pricing plans</a>
    </div>
  </DashboardLayout>
);
export default LearnerSubscription;

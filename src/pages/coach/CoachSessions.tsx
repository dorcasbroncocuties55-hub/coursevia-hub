import DashboardLayout from "@/components/layouts/DashboardLayout";
const CoachSessions = () => (
  <DashboardLayout role="coach"><h1 className="text-2xl font-bold text-foreground mb-6">Video Sessions</h1>
    <div className="bg-card border border-border rounded-lg p-8 text-center"><p className="text-muted-foreground">Upcoming and past sessions will appear here.</p></div>
  </DashboardLayout>
);
export default CoachSessions;

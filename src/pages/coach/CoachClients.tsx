import DashboardLayout from "@/components/layouts/DashboardLayout";
const CoachClients = () => (
  <DashboardLayout role="coach"><h1 className="text-2xl font-bold text-foreground mb-6">Clients</h1>
    <div className="bg-card border border-border rounded-lg p-8 text-center"><p className="text-muted-foreground">Your clients will appear here once they book sessions.</p></div>
  </DashboardLayout>
);
export default CoachClients;

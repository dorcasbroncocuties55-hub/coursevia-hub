import DashboardLayout from "@/components/layouts/DashboardLayout";
const CoachCalendar = () => (
  <DashboardLayout role="coach">
    <h1 className="text-2xl font-bold text-foreground mb-6">Calendar</h1>
    <div className="bg-card border border-border rounded-lg p-8 text-center">
      <p className="text-muted-foreground">Your availability and bookings calendar will appear here.</p>
    </div>
  </DashboardLayout>
);
export default CoachCalendar;

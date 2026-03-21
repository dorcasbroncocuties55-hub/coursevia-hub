import DashboardLayout from "@/components/layouts/DashboardLayout";

const TherapistDashboard = () => {
  return (
    <DashboardLayout role="therapist">
      <h1 className="text-2xl font-bold text-foreground mb-6">Therapist Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Clients", value: "0" },
          { label: "Sessions This Month", value: "0" },
          { label: "Earnings", value: "$0.00" },
          { label: "Rating", value: "N/A" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-lg p-5">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1 font-mono">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">Complete your verification to start accepting clients.</p>
      </div>
    </DashboardLayout>
  );
};

export default TherapistDashboard;

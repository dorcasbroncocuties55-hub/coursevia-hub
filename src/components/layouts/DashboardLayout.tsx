import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, BookOpen, Video, Calendar, MessageSquare,
  Bell, CreditCard, Heart, Settings, LogOut, User, Wallet,
  Users, Upload, BarChart3, FileText, Shield, Flag,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const learnerNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Courses", href: "/dashboard/courses", icon: BookOpen },
  { label: "My Videos", href: "/dashboard/videos", icon: Video },
  { label: "Bookings", href: "/dashboard/bookings", icon: Calendar },
  { label: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { label: "Subscription", href: "/dashboard/subscription", icon: FileText },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

const coachNav: NavItem[] = [
  { label: "Dashboard", href: "/coach/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/coach/profile", icon: User },
  { label: "Services", href: "/coach/services", icon: BookOpen },
  { label: "Calendar", href: "/coach/calendar", icon: Calendar },
  { label: "Bookings", href: "/coach/bookings", icon: Calendar },
  { label: "Clients", href: "/coach/clients", icon: Users },
  { label: "Sessions", href: "/coach/sessions", icon: Video },
  { label: "Messages", href: "/coach/messages", icon: MessageSquare },
  { label: "Wallet", href: "/coach/wallet", icon: Wallet },
  { label: "Withdrawals", href: "/coach/withdrawals", icon: CreditCard },
  { label: "Reviews", href: "/coach/reviews", icon: FileText },
];

const therapistNav: NavItem[] = [
  { label: "Dashboard", href: "/therapist/dashboard", icon: LayoutDashboard },
  { label: "Profile", href: "/therapist/profile", icon: User },
  { label: "Services", href: "/therapist/services", icon: BookOpen },
  { label: "Calendar", href: "/therapist/calendar", icon: Calendar },
  { label: "Bookings", href: "/therapist/bookings", icon: Calendar },
  { label: "Clients", href: "/therapist/clients", icon: Users },
  { label: "Sessions", href: "/therapist/sessions", icon: Video },
  { label: "Messages", href: "/therapist/messages", icon: MessageSquare },
  { label: "Wallet", href: "/therapist/wallet", icon: Wallet },
  { label: "Withdrawals", href: "/therapist/withdrawals", icon: CreditCard },
];

const creatorNav: NavItem[] = [
  { label: "Dashboard", href: "/creator/dashboard", icon: LayoutDashboard },
  { label: "Upload Course", href: "/creator/upload-course", icon: Upload },
  { label: "Upload Video", href: "/creator/upload-video", icon: Video },
  { label: "Content", href: "/creator/content", icon: BookOpen },
  { label: "Analytics", href: "/creator/analytics", icon: BarChart3 },
  { label: "Messages", href: "/creator/messages", icon: MessageSquare },
  { label: "Wallet", href: "/creator/wallet", icon: Wallet },
  { label: "Withdrawals", href: "/creator/withdrawals", icon: CreditCard },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Coaches", href: "/admin/coaches", icon: User },
  { label: "Creators", href: "/admin/creators", icon: User },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Wallet", href: "/admin/wallet", icon: Wallet },
  { label: "Transactions", href: "/admin/transactions", icon: FileText },
  { label: "Verifications", href: "/admin/verifications", icon: Shield },
  { label: "Reports", href: "/admin/reports", icon: Flag },
  { label: "Content", href: "/admin/content", icon: BookOpen },
  { label: "Categories", href: "/admin/categories", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

interface DashboardLayoutProps {
  children: ReactNode;
  role: "learner" | "coach" | "creator" | "therapist" | "admin";
}

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const navMap = { learner: learnerNav, coach: coachNav, creator: creatorNav, therapist: therapistNav, admin: adminNav };
  const nav = navMap[role];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 border-r border-border bg-card hidden lg:flex flex-col">
        <div className="p-4 border-b border-border">
          <Link to="/" className="text-lg font-bold text-primary">Coursevia</Link>
          <p className="text-xs text-muted-foreground capitalize mt-0.5">{role} Dashboard</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
              {profile?.full_name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {profile?.full_name || "User"}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary w-full transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/" className="text-lg font-bold text-primary">Coursevia</Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut size={18} />
          </Button>
        </div>
        <div className="flex overflow-x-auto px-2 pb-2 gap-1">
          {nav.slice(0, 6).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground"
                }`}
              >
                <item.icon size={14} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto lg:p-8 p-4 pt-28 lg:pt-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

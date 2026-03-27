import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingCart, LogOut, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { getPrimaryRole } from "@/lib/authRoles";
import ProfileAvatar from "@/components/shared/ProfileAvatar";

const navLinks = [
  { label: "Courses", href: "/courses" },
  { label: "Coaches", href: "/coaches" },
  { label: "Creators", href: "/creators" },
  { label: "Therapists", href: "/therapists" },
  { label: "Pricing", href: "/pricing" },
];

const roleDashboardMap: Record<string, string> = {
  admin: "/admin/dashboard",
  coach: "/coach/dashboard",
  creator: "/creator/dashboard",
  therapist: "/therapist/dashboard",
  learner: "/dashboard",
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, profile, roles, logout } = useAuth();
  const primaryRole = getPrimaryRole(roles ?? [], profile?.role);
  const dashboardHref = roleDashboardMap[primaryRole] || "/dashboard";

  const goProtected = (destinationPath: "/cart") => {
    if (user) {
      navigate(destinationPath);
    } else {
      navigate("/auth-gate", { state: { destinationPath } });
    }
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="container-wide flex h-16 items-center justify-between gap-4">
        <Link to="/" className="text-xl font-bold tracking-tight text-foreground">
          Coursevia
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" onClick={() => goProtected("/cart")}>
            <ShoppingCart size={16} className="mr-2" />
            Cart
          </Button>

          {user ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to={dashboardHref}>
                  <LayoutDashboard size={16} className="mr-2" />
                  Dashboard
                </Link>
              </Button>

              <Link
                to={dashboardHref}
                className="flex items-center gap-3 rounded-full border border-border bg-card px-2.5 py-1.5 transition hover:border-primary/40 hover:shadow-sm"
              >
                <ProfileAvatar
                  src={profile?.avatar_url}
                  name={profile?.full_name || user.email}
                  className="h-9 w-9"
                />
                <div className="hidden text-left lg:block">
                  <p className="max-w-[140px] truncate text-sm font-semibold text-foreground">
                    {profile?.full_name || user.email?.split("@")[0] || "My account"}
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {primaryRole}
                  </p>
                </div>
              </Link>

              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
                <LogOut size={18} />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log in</Link>
              </Button>

              <Button size="sm" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="text-foreground md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border bg-background md:hidden"
          >
            <div className="container-wide flex flex-col gap-3 py-4">
              {user ? (
                <Link
                  to={dashboardHref}
                  className="mb-1 flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3"
                  onClick={() => setMobileOpen(false)}
                >
                  <ProfileAvatar
                    src={profile?.avatar_url}
                    name={profile?.full_name || user.email}
                    className="h-11 w-11"
                  />
                  <div>
                    <p className="font-semibold text-foreground">
                      {profile?.full_name || user.email?.split("@")[0] || "My account"}
                    </p>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {primaryRole}
                    </p>
                  </div>
                </Link>
              ) : null}

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <Button variant="outline" size="sm" onClick={() => goProtected("/cart")}>
                <ShoppingCart size={16} className="mr-2" />
                Cart
              </Button>

              {user ? (
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link to={dashboardHref} onClick={() => setMobileOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                  <Button size="sm" className="flex-1" onClick={handleLogout}>
                    Log out
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link to="/login">Log in</Link>
                  </Button>

                  <Button size="sm" asChild className="flex-1">
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

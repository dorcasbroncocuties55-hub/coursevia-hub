import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Public pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import About from "./pages/public/About";
import Courses from "./pages/public/Courses";
import CourseDetails from "./pages/public/CourseDetails";
import Videos from "./pages/public/Videos";
import VideoDetails from "./pages/public/VideoDetails";
import Coaches from "./pages/public/Coaches";
import CoachDetails from "./pages/public/CoachDetails";
import Creators from "./pages/public/Creators";
import Pricing from "./pages/public/Pricing";
import FAQ from "./pages/public/FAQ";
import { Terms, Privacy, RefundPolicy, Blog, Contact, HelpCenter } from "./pages/public/StaticPages";

// Learner dashboard
import LearnerDashboard from "./pages/dashboard/LearnerDashboard";
import LearnerCourses from "./pages/dashboard/LearnerCourses";
import LearnerVideos from "./pages/dashboard/LearnerVideos";
import LearnerBookings from "./pages/dashboard/LearnerBookings";
import LearnerWishlist from "./pages/dashboard/LearnerWishlist";
import { LearnerMessages, CoachMessages, CreatorMessages } from "./pages/dashboard/Messages";
import LearnerPayments from "./pages/dashboard/LearnerPayments";
import LearnerSubscription from "./pages/dashboard/LearnerSubscription";
import LearnerNotifications from "./pages/dashboard/LearnerNotifications";
import { LearnerProfile, CoachProfileSettings, CreatorProfileSettings } from "./pages/dashboard/ProfileSettings";

// Coach dashboard
import CoachDashboard from "./pages/coach/CoachDashboard";
import CoachProfile from "./pages/coach/CoachProfile";
import CoachServices from "./pages/coach/CoachServices";
import CoachCalendar from "./pages/coach/CoachCalendar";
import CoachBookings from "./pages/coach/CoachBookings";
import CoachClients from "./pages/coach/CoachClients";
import CoachSessions from "./pages/coach/CoachSessions";
import CoachReviews from "./pages/coach/CoachReviews";
import { CoachWallet, CreatorWallet } from "./pages/dashboard/WalletPage";
import { CoachWithdrawals, CreatorWithdrawals } from "./pages/dashboard/WithdrawalsPage";

// Creator dashboard
import CreatorDashboard from "./pages/creator/CreatorDashboard";
import UploadCourse from "./pages/creator/UploadCourse";
import UploadVideo from "./pages/creator/UploadVideo";
import CreatorContent from "./pages/creator/CreatorContent";
import CreatorAnalytics from "./pages/creator/CreatorAnalytics";

// Admin
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCoaches from "./pages/admin/AdminCoaches";
import AdminCreators from "./pages/admin/AdminCreators";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminWallet from "./pages/admin/AdminWallet";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminVerifications from "./pages/admin/AdminVerifications";
import AdminReports from "./pages/admin/AdminReports";
import AdminContent from "./pages/admin/AdminContent";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:slug" element={<CourseDetails />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/videos/:slug" element={<VideoDetails />} />
            <Route path="/coaches" element={<Coaches />} />
            <Route path="/coaches/:id" element={<CoachDetails />} />
            <Route path="/creators" element={<Creators />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/help" element={<HelpCenter />} />

            {/* Onboarding */}
            <Route path="/onboarding" element={<ProtectedRoute requireOnboarding={false}><Onboarding /></ProtectedRoute>} />

            {/* Learner */}
            <Route path="/dashboard" element={<ProtectedRoute requiredRole="learner"><LearnerDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/courses" element={<ProtectedRoute requiredRole="learner"><LearnerCourses /></ProtectedRoute>} />
            <Route path="/dashboard/videos" element={<ProtectedRoute requiredRole="learner"><LearnerVideos /></ProtectedRoute>} />
            <Route path="/dashboard/bookings" element={<ProtectedRoute requiredRole="learner"><LearnerBookings /></ProtectedRoute>} />
            <Route path="/dashboard/wishlist" element={<ProtectedRoute requiredRole="learner"><LearnerWishlist /></ProtectedRoute>} />
            <Route path="/dashboard/messages" element={<ProtectedRoute requiredRole="learner"><LearnerMessages /></ProtectedRoute>} />
            <Route path="/dashboard/payments" element={<ProtectedRoute requiredRole="learner"><LearnerPayments /></ProtectedRoute>} />
            <Route path="/dashboard/subscription" element={<ProtectedRoute requiredRole="learner"><LearnerSubscription /></ProtectedRoute>} />
            <Route path="/dashboard/notifications" element={<ProtectedRoute requiredRole="learner"><LearnerNotifications /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute requiredRole="learner"><LearnerProfile /></ProtectedRoute>} />

            {/* Coach */}
            <Route path="/coach/dashboard" element={<ProtectedRoute requiredRole="coach"><CoachDashboard /></ProtectedRoute>} />
            <Route path="/coach/profile" element={<ProtectedRoute requiredRole="coach"><CoachProfile /></ProtectedRoute>} />
            <Route path="/coach/services" element={<ProtectedRoute requiredRole="coach"><CoachServices /></ProtectedRoute>} />
            <Route path="/coach/calendar" element={<ProtectedRoute requiredRole="coach"><CoachCalendar /></ProtectedRoute>} />
            <Route path="/coach/bookings" element={<ProtectedRoute requiredRole="coach"><CoachBookings /></ProtectedRoute>} />
            <Route path="/coach/clients" element={<ProtectedRoute requiredRole="coach"><CoachClients /></ProtectedRoute>} />
            <Route path="/coach/sessions" element={<ProtectedRoute requiredRole="coach"><CoachSessions /></ProtectedRoute>} />
            <Route path="/coach/messages" element={<ProtectedRoute requiredRole="coach"><CoachMessages /></ProtectedRoute>} />
            <Route path="/coach/wallet" element={<ProtectedRoute requiredRole="coach"><CoachWallet /></ProtectedRoute>} />
            <Route path="/coach/withdrawals" element={<ProtectedRoute requiredRole="coach"><CoachWithdrawals /></ProtectedRoute>} />
            <Route path="/coach/reviews" element={<ProtectedRoute requiredRole="coach"><CoachReviews /></ProtectedRoute>} />

            {/* Creator */}
            <Route path="/creator/dashboard" element={<ProtectedRoute requiredRole="creator"><CreatorDashboard /></ProtectedRoute>} />
            <Route path="/creator/upload-course" element={<ProtectedRoute requiredRole="creator"><UploadCourse /></ProtectedRoute>} />
            <Route path="/creator/upload-video" element={<ProtectedRoute requiredRole="creator"><UploadVideo /></ProtectedRoute>} />
            <Route path="/creator/content" element={<ProtectedRoute requiredRole="creator"><CreatorContent /></ProtectedRoute>} />
            <Route path="/creator/analytics" element={<ProtectedRoute requiredRole="creator"><CreatorAnalytics /></ProtectedRoute>} />
            <Route path="/creator/messages" element={<ProtectedRoute requiredRole="creator"><CreatorMessages /></ProtectedRoute>} />
            <Route path="/creator/wallet" element={<ProtectedRoute requiredRole="creator"><CreatorWallet /></ProtectedRoute>} />
            <Route path="/creator/withdrawals" element={<ProtectedRoute requiredRole="creator"><CreatorWithdrawals /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/coaches" element={<ProtectedRoute requiredRole="admin"><AdminCoaches /></ProtectedRoute>} />
            <Route path="/admin/creators" element={<ProtectedRoute requiredRole="admin"><AdminCreators /></ProtectedRoute>} />
            <Route path="/admin/payments" element={<ProtectedRoute requiredRole="admin"><AdminPayments /></ProtectedRoute>} />
            <Route path="/admin/wallet" element={<ProtectedRoute requiredRole="admin"><AdminWallet /></ProtectedRoute>} />
            <Route path="/admin/transactions" element={<ProtectedRoute requiredRole="admin"><AdminTransactions /></ProtectedRoute>} />
            <Route path="/admin/verifications" element={<ProtectedRoute requiredRole="admin"><AdminVerifications /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute requiredRole="admin"><AdminReports /></ProtectedRoute>} />
            <Route path="/admin/content" element={<ProtectedRoute requiredRole="admin"><AdminContent /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute requiredRole="admin"><AdminCategories /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

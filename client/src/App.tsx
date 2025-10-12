import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LandingPage from "@/components/LandingPage";
import CourseCatalog from "@/components/CourseCatalog";
import Dashboard from "@/components/Dashboard";
import CourseDetail from "@/components/CourseDetail";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/state/auth";
import { CartProvider } from "@/state/cart";
import CartToast from "@/components/CartToast";

// NEW
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import AdminPage from "@/pages/AdminPage";
import CaregiverPage from "@/pages/CaregiverPage";
import PendingPage from "@/pages/PendingPage";
import PaymentsPage from "@/pages/PaymentsPage";
import PaymentsCartPage from "@/pages/PaymentsCartPage";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentCancel from "@/pages/PaymentCancel";
import RequireRole from "@/routes/RequireRole";
import RequireAdmin from "@/routes/RequireAdmin";
import AddCoursePage from "@/pages/AddCoursePage";
import ContentCategoryPage from "@/pages/ContentCategoryPage";

function Router() {
  const [location] = useLocation();
  const isAuthPage = location.startsWith('/auth/');
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Switch>
          <Route path="/" component={LandingPage} />
          <Route path="/courses" component={CourseCatalog} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/course/:id" component={CourseDetail} />
          <Route path="/payments/:courseId" component={PaymentsPage} />
          <Route path="/payments" component={PaymentsCartPage} />
          <Route path="/payments/success" component={PaymentSuccess} />
          <Route path="/payments/cancel" component={PaymentCancel} />

          {/* NEW */}
          <Route path="/auth/login" component={LoginPage} />
          <Route path="/auth/signup" component={SignupPage} />
          <Route path="/pending" component={PendingPage} />
          <Route path="/admin" component={() => (
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          )} />
          <Route path="/admin/add-course" component={() => (
            <RequireAdmin>
              <AddCoursePage />
            </RequireAdmin>
          )} />
          <Route path="/admin/content-category" component={() => (
            <RequireAdmin>
              <ContentCategoryPage />
            </RequireAdmin>
          )} />
          <Route path="/caregiver">
            {() => (
              <RequireRole role="caregiver">
                <CaregiverPage />
              </RequireRole>
            )}
          </Route>

          <Route component={NotFound} />
        </Switch>
      </div>
      {!isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <CartProvider>
              <Router />
              <CartToast />
            </CartProvider>
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

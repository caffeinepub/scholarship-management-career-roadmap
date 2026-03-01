import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet, redirect } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Scholarships from './pages/Scholarships';
import ScholarshipDetail from './pages/ScholarshipDetail';
import ResumeBuilder from './pages/ResumeBuilder';
import Documents from './pages/Documents';
import Profile from './pages/Profile';
import MyApplications from './pages/MyApplications';
import Help from './pages/Help';
import LoginPage from './pages/LoginPage';
import ChatbotWidget from './components/ChatbotWidget';

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <ChatbotWidget />
      <Toaster richColors position="top-right" />
    </>
  ),
});

// Login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

// Help route (public)
const helpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/help',
  component: Help,
});

// Protected layout route
const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  component: () => <DashboardLayout><Outlet /></DashboardLayout>,
});

// Dashboard route
const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/',
  component: Dashboard,
});

// Scholarships route
const scholarshipsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/scholarships',
  component: Scholarships,
});

// Scholarship detail route
const scholarshipDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/scholarships/$id',
  component: ScholarshipDetail,
});

// Resume builder route
const resumeBuilderRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/resume-builder',
  component: ResumeBuilder,
});

// Documents route
const documentsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/documents',
  component: Documents,
});

// Profile route
const profileRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/profile',
  component: Profile,
});

// My Applications route
const myApplicationsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/my-applications',
  component: MyApplications,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  helpRoute,
  protectedRoute.addChildren([
    dashboardRoute,
    scholarshipsRoute,
    scholarshipDetailRoute,
    resumeBuilderRoute,
    documentsRoute,
    profileRoute,
    myApplicationsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppContent() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default AppContent;

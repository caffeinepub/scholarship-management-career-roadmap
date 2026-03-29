import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import React from "react";
import DashboardLayout from "./components/DashboardLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import ProfileSetupModal from "./components/ProfileSetupModal";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Help from "./pages/Help";
import LoginPage from "./pages/LoginPage";
import MyApplications from "./pages/MyApplications";
import Profile from "./pages/Profile";
import ResumeBuilder from "./pages/ResumeBuilder";
import Roadmap from "./pages/Roadmap";
import ScholarshipDetail from "./pages/ScholarshipDetail";
import Scholarships from "./pages/Scholarships";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

// Root layout
function RootLayout() {
  return (
    <>
      <Outlet />
      <ProfileSetupModal />
      <Toaster />
    </>
  );
}

// Route definitions
const rootRoute = createRootRoute({ component: RootLayout });

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "protected",
  component: DashboardLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/",
  component: Dashboard,
});

const scholarshipsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/scholarships",
  component: Scholarships,
});

const scholarshipDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/scholarships/$scholarshipId",
  component: ScholarshipDetail,
});

const documentsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/documents",
  component: Documents,
});

const applicationsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/applications",
  component: MyApplications,
});

const profileRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/profile",
  component: Profile,
});

const resumeRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/resume",
  component: ResumeBuilder,
});

const helpRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/help",
  component: Help,
});

const roadmapRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/roadmap",
  component: Roadmap,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  protectedRoute.addChildren([
    dashboardRoute,
    scholarshipsRoute,
    scholarshipDetailRoute,
    documentsRoute,
    applicationsRoute,
    profileRoute,
    resumeRoute,
    helpRoute,
    roadmapRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <RouterProvider router={router} />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RoleBasedRoute from "./components/RoleBasedRoute";

// Pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import ApiTest from "./pages/ApiTest";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/api-test" element={<ApiTest />} />
            
            {/* Protected routes for all authenticated users */}
            <Route element={<RoleBasedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            
            {/* Routes only for Admin and Manager */}
            <Route element={<RoleBasedRoute allowedRoles={['Admin', 'Gérant']} />}>
              <Route path="/users" element={<Users />} />
            </Route>

            {/* Routes for Admin, Manager and Project Manager */}
            <Route element={<RoleBasedRoute allowedRoles={['Admin', 'Gérant', 'Chef_Projet']} />}>
              <Route path="/reports" element={<Reports />} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

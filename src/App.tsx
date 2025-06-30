import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import Contests from "./pages/Contests";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import Problems from "./pages/Problems";
import Practice from "./pages/Practice";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Employers from "./pages/Employers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/editor/:problemId" element={<Editor />} />
            <Route path="/problems" element={<Problems />} />
            <Route path="/problems/:problemId" element={<Editor />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/contests" element={<Contests />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/employers" element={<Employers />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

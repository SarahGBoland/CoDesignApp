import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Pages
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import SessionPage from "@/pages/SessionPage";
import ProblemTreePage from "@/pages/tools/ProblemTreePage";
import EmpathyMapPage from "@/pages/tools/EmpathyMapPage";
import StoryMapPage from "@/pages/tools/StoryMapPage";
import IdeasBoardPage from "@/pages/tools/IdeasBoardPage";
import FeedbackPage from "@/pages/tools/FeedbackPage";
import ExpectationsPage from "@/pages/tools/ExpectationsPage";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/session/:sessionId" element={<ProtectedRoute><SessionPage /></ProtectedRoute>} />
      <Route path="/session/:sessionId/problem-tree" element={<ProtectedRoute><ProblemTreePage /></ProtectedRoute>} />
      <Route path="/session/:sessionId/empathy-map" element={<ProtectedRoute><EmpathyMapPage /></ProtectedRoute>} />
      <Route path="/session/:sessionId/story-map" element={<ProtectedRoute><StoryMapPage /></ProtectedRoute>} />
      <Route path="/session/:sessionId/ideas-board" element={<ProtectedRoute><IdeasBoardPage /></ProtectedRoute>} />
      <Route path="/session/:sessionId/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
      <Route path="/session/:sessionId/expectations" element={<ProtectedRoute><ExpectationsPage /></ProtectedRoute>} />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background noise-bg">
          <AppRoutes />
          <Toaster position="bottom-center" richColors />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

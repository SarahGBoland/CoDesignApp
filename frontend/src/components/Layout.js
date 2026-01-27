import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  LogOut, 
  Menu, 
  X, 
  User,
  TreePine,
  Heart,
  Map,
  Lightbulb,
  MessageSquare,
  Target,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';

// Design steps configuration
export const DESIGN_STEPS = [
  { 
    id: 0, 
    name: 'Manage Expectations', 
    path: 'expectations',
    icon: Target, 
    color: 'bg-amber-100 text-amber-800',
    description: 'Set goals for your project'
  },
  { 
    id: 1, 
    name: 'Problem Tree', 
    path: 'problem-tree',
    icon: TreePine, 
    color: 'bg-red-100 text-red-800',
    description: 'Find the main problem and its causes'
  },
  { 
    id: 2, 
    name: 'Empathy Map', 
    path: 'empathy-map',
    icon: Heart, 
    color: 'bg-pink-100 text-pink-800',
    description: 'Understand how people feel'
  },
  { 
    id: 3, 
    name: 'Story Map', 
    path: 'story-map',
    icon: Map, 
    color: 'bg-blue-100 text-blue-800',
    description: 'Plan the user journey'
  },
  { 
    id: 4, 
    name: 'Ideas Board', 
    path: 'ideas-board',
    icon: Lightbulb, 
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Collect and vote on ideas'
  },
  { 
    id: 5, 
    name: 'I Like, I Wish, What If', 
    path: 'feedback',
    icon: MessageSquare, 
    color: 'bg-green-100 text-green-800',
    description: 'Share feedback and suggestions'
  }
];

export const MainLayout = ({ children, pageHelp = "This is a page in Co-Design Connect" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and menu */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-12 w-12"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                data-testid="menu-toggle"
                aria-label="Toggle menu"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
              
              <Link 
                to="/dashboard" 
                className="flex items-center gap-2 text-xl font-heading font-bold text-primary"
                data-testid="logo-link"
              >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">CD</span>
                </div>
                <span className="hidden sm:inline">Co-Design</span>
              </Link>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <AccessibilityToolbar pageHelp={pageHelp} />
              
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-muted rounded-full">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full capitalize">
                  {user?.role?.replace('-', ' ')}
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-12 w-12 rounded-full"
                data-testid="logout-button"
                aria-label="Log out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      {/* Mobile navigation */}
      <nav 
        className={`fixed left-0 top-16 bottom-0 w-72 bg-card border-r border-border z-50 transform transition-transform duration-200 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-2">
          <Link
            to="/dashboard"
            className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
            data-testid="nav-dashboard"
          >
            <Home className="h-6 w-6" />
            <span>My Projects</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export const SessionLayout = ({ 
  children, 
  sessionId, 
  currentStep = 0,
  pageHelp = "This is a design tool"
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-card border-r border-border">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 text-xl font-heading font-bold text-primary"
            data-testid="sidebar-logo"
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">CD</span>
            </div>
            <span>Co-Design</span>
          </Link>
        </div>

        {/* Back button */}
        <div className="p-4 border-b border-border">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-12"
            onClick={() => navigate(`/session/${sessionId}`)}
            data-testid="back-to-session"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Back to Session</span>
          </Button>
        </div>

        {/* Steps navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="text-sm font-medium text-muted-foreground mb-4">Design Steps</p>
          {DESIGN_STEPS.map((step) => {
            const isActive = location.pathname.includes(step.path);
            const isCompleted = step.id < currentStep;
            const Icon = step.icon;
            
            return (
              <Link
                key={step.id}
                to={`/session/${sessionId}/${step.path}`}
                className={`nav-item ${isActive ? 'active' : ''} ${isCompleted ? 'opacity-80' : ''}`}
                data-testid={`nav-${step.path}`}
              >
                <div className={`p-2 rounded-lg ${step.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{step.name}</p>
                  {isCompleted && (
                    <p className="text-xs text-muted-foreground">Completed</p>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role?.replace('-', ' ')}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-10 w-10"
              data-testid="sidebar-logout"
              aria-label="Log out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-12 w-12"
              data-testid="mobile-menu-toggle"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            <span className="font-heading font-bold text-primary">Co-Design</span>
          </div>
          
          <AccessibilityToolbar pageHelp={pageHelp} />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside 
        className={`fixed left-0 top-16 bottom-0 w-72 bg-card border-r border-border z-50 transform transition-transform duration-200 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-border">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-12"
            onClick={() => {
              navigate(`/session/${sessionId}`);
              setSidebarOpen(false);
            }}
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Back to Session</span>
          </Button>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto">
          {DESIGN_STEPS.map((step) => {
            const isActive = location.pathname.includes(step.path);
            const Icon = step.icon;
            
            return (
              <Link
                key={step.id}
                to={`/session/${sessionId}/${step.path}`}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className={`p-2 rounded-lg ${step.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-medium">{step.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-0">
        <div className="pt-16 lg:pt-0 min-h-screen">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;

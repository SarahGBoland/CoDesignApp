import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Plus, 
  FolderOpen, 
  Calendar,
  MoreVertical,
  Trash2,
  Edit,
  Play,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MainLayout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { useTextToSpeech } from '@/hooks/useSpeech';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newSessionName, setNewSessionName] = useState('');
  const [creating, setCreating] = useState(false);
  const { user, isFacilitator } = useAuth();
  const navigate = useNavigate();
  const { speak, isSpeaking } = useTextToSpeech();

  const pageHelp = isFacilitator 
    ? "This is your dashboard. Here you can see all your co-design projects. Click the New Project button to create a new project. Click on a project to start a session."
    : "This is your dashboard. Here you can see projects you've joined. Click on a project to participate in a session.";

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Could not load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    setCreating(true);
    try {
      const response = await axios.post(`${API_URL}/projects`, {
        name: newProjectName,
        description: newProjectDesc
      });
      setProjects([...projects, response.data]);
      setCreateDialogOpen(false);
      setNewProjectName('');
      setNewProjectDesc('');
      toast.success('Project created!');
    } catch (error) {
      toast.error('Could not create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await axios.delete(`${API_URL}/projects/${projectId}`);
      setProjects(projects.filter(p => p.id !== projectId));
      toast.success('Project deleted');
    } catch (error) {
      toast.error('Could not delete project');
    }
  };

  const handleCreateSession = async () => {
    if (!newSessionName.trim() || !selectedProject) {
      toast.error('Please enter a session name');
      return;
    }

    setCreating(true);
    try {
      const response = await axios.post(`${API_URL}/sessions`, {
        project_id: selectedProject.id,
        name: newSessionName,
        description: ''
      });
      setSessionDialogOpen(false);
      setNewSessionName('');
      navigate(`/session/${response.data.id}`);
    } catch (error) {
      toast.error('Could not create session');
    } finally {
      setCreating(false);
    }
  };

  const openSessionDialog = (project) => {
    setSelectedProject(project);
    setSessionDialogOpen(true);
  };

  return (
    <MainLayout pageHelp={pageHelp}>
      <div className="space-y-8" data-testid="dashboard-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
              My Projects
            </h1>
            <p className="text-muted-foreground mt-1">
              {isFacilitator ? 'Create and manage your co-design projects' : 'Your co-design projects'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => speak(pageHelp)}
              className="gap-2 h-12"
              data-testid="dashboard-help"
            >
              <Volume2 className={`h-5 w-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">Help</span>
            </Button>

            {isFacilitator && (
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="gap-2 h-12 rounded-full" data-testid="new-project-button">
                    <Plus className="h-5 w-5" />
                    <span>New Project</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-heading text-xl">Create New Project</DialogTitle>
                    <DialogDescription>
                      Give your project a name and description
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-name">Project Name</Label>
                      <Input
                        id="project-name"
                        placeholder="e.g., Healthcare App Design"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        className="h-12"
                        data-testid="project-name-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project-desc">Description (optional)</Label>
                      <Textarea
                        id="project-desc"
                        placeholder="What is this project about?"
                        value={newProjectDesc}
                        onChange={(e) => setNewProjectDesc(e.target.value)}
                        rows={3}
                        data-testid="project-desc-input"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateProject}
                      disabled={creating}
                      data-testid="create-project-submit"
                    >
                      {creating ? 'Creating...' : 'Create Project'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card className="p-12">
            <div className="empty-state">
              <FolderOpen className="h-16 w-16 text-muted-foreground/50" />
              <h3 className="font-heading text-xl font-semibold">No projects yet</h3>
              <p className="max-w-sm">
                {isFacilitator 
                  ? 'Create your first project to start co-designing with your team.'
                  : 'You haven\'t joined any projects yet.'}
              </p>
              {isFacilitator && (
                <Button 
                  onClick={() => setCreateDialogOpen(true)} 
                  className="gap-2 mt-4"
                  data-testid="empty-new-project"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create First Project</span>
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <Card 
                key={project.id} 
                className="card-hover animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="font-heading text-lg">
                      {project.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description || 'No description'}
                    </p>
                  </div>
                  
                  {isFacilitator && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteProject(project.id)}
                          data-testid={`delete-project-${project.id}`}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Calendar className="h-4 w-4" />
                    <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <Button 
                    className="w-full gap-2" 
                    onClick={() => openSessionDialog(project)}
                    data-testid={`start-session-${project.id}`}
                  >
                    <Play className="h-4 w-4" />
                    Start Session
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Session Dialog */}
        <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">Start New Session</DialogTitle>
              <DialogDescription>
                {selectedProject?.name} - Create a new design session
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="session-name">Session Name</Label>
                <Input
                  id="session-name"
                  placeholder="e.g., Week 1 - Problem Discovery"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  className="h-12"
                  data-testid="session-name-input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSessionDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSession}
                disabled={creating}
                data-testid="create-session-submit"
              >
                {creating ? 'Creating...' : 'Start Session'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft,
  ArrowRight,
  Volume2,
  TreePine,
  Heart,
  Map,
  Lightbulb,
  MessageSquare,
  Target,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MainLayout, DESIGN_STEPS } from '@/components/Layout';
import { useTextToSpeech } from '@/hooks/useSpeech';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function SessionPage() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { speak, isSpeaking } = useTextToSpeech();

  const pageHelp = "This is your session overview. You can see all the design steps here. Click on a step to start working on it. Complete each step in order or choose the one you want.";

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const response = await axios.get(`${API_URL}/sessions/${sessionId}`);
      setSession(response.data);
      setCurrentStep(response.data.current_step || 0);
    } catch (error) {
      console.error('Failed to fetch session:', error);
      toast.error('Could not load session');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStepClick = (step) => {
    navigate(`/session/${sessionId}/${step.path}`);
  };

  const updateStep = async (newStep) => {
    try {
      await axios.put(`${API_URL}/sessions/${sessionId}/step?step=${newStep}`);
      setCurrentStep(newStep);
    } catch (error) {
      console.error('Failed to update step:', error);
    }
  };

  if (loading) {
    return (
      <MainLayout pageHelp={pageHelp}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading session...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout pageHelp={pageHelp}>
      <div className="space-y-8" data-testid="session-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              className="gap-2 mb-2 -ml-2"
              onClick={() => navigate('/dashboard')}
              data-testid="back-to-dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Projects</span>
            </Button>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
              {session?.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Follow the steps to complete your co-design session
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => speak(pageHelp)}
            className="gap-2 h-12"
            data-testid="session-help"
          >
            <Volume2 className={`h-5 w-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
            <span>Help Me</span>
          </Button>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border">
          <span className="text-sm font-medium text-muted-foreground">Your progress</span>
          <div className="flex items-center gap-2">
            {DESIGN_STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index < currentStep ? 'bg-primary' : 
                  index === currentStep ? 'bg-secondary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium">{currentStep} of {DESIGN_STEPS.length}</span>
        </div>

        {/* Steps Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DESIGN_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            
            return (
              <Card 
                key={step.id}
                className={`step-card cursor-pointer animate-fade-in ${
                  isCompleted ? 'completed' : ''
                } ${isCurrent ? 'active' : ''}`}
                onClick={() => handleStepClick(step)}
                style={{ animationDelay: `${index * 0.1}s` }}
                data-testid={`step-${step.path}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${step.color}`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    {isCompleted && (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    )}
                    {isCurrent && (
                      <span className="px-2 py-1 text-xs font-medium bg-secondary/20 text-secondary rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-heading text-xl font-semibold mb-2">
                    {step.name}
                  </h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                  
                  <Button 
                    variant={isCurrent ? "default" : "outline"}
                    className="w-full mt-4 gap-2"
                    data-testid={`start-${step.path}`}
                  >
                    {isCompleted ? 'Review' : isCurrent ? 'Continue' : 'Start'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick help cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <h3 className="font-heading font-semibold text-lg mb-2">Need Help?</h3>
              <p className="text-muted-foreground mb-4">
                Click the help button on any page to hear instructions. 
                You can also use the microphone to speak your ideas.
              </p>
              <Button variant="outline" onClick={() => speak("You can click the help button on any page to hear what to do. You can also use the microphone button to speak instead of typing.")}>
                <Volume2 className="h-4 w-4 mr-2" />
                Listen to this tip
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-secondary/5 border-secondary/20">
            <CardContent className="p-6">
              <h3 className="font-heading font-semibold text-lg mb-2">Take Your Time</h3>
              <p className="text-muted-foreground mb-4">
                There's no rush. You can save your work and come back anytime. 
                Every idea matters - share what you think!
              </p>
              <Button variant="outline" onClick={() => speak("Take your time. You can save your work and come back later. Every idea is important.")}>
                <Volume2 className="h-4 w-4 mr-2" />
                Listen to this tip
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

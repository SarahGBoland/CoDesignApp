import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Compass, 
  ArrowRight,
  TreePine,
  Heart,
  Map,
  Lightbulb,
  MessageSquare,
  Target,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTextToSpeech } from '@/hooks/useSpeech';

const FEATURES = [
  { icon: Target, title: 'Set Goals', description: 'Know what you want to achieve', color: 'bg-amber-100 text-amber-700' },
  { icon: TreePine, title: 'Find Problems', description: 'Understand the root cause', color: 'bg-red-100 text-red-700' },
  { icon: Heart, title: 'Feel Empathy', description: 'Understand how people feel', color: 'bg-pink-100 text-pink-700' },
  { icon: Map, title: 'Plan Journey', description: 'Map out the user experience', color: 'bg-blue-100 text-blue-700' },
  { icon: Lightbulb, title: 'Share Ideas', description: 'Collect and vote on solutions', color: 'bg-yellow-100 text-yellow-700' },
  { icon: MessageSquare, title: 'Give Feedback', description: 'Say what you like and wish for', color: 'bg-green-100 text-green-700' },
];

export default function LandingPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();
  const { speak, isSpeaking } = useTextToSpeech();

  const welcomeText = "Welcome to Co-Design Connect. This app helps people work together to design solutions. You can be a Co-Designer, someone who shares real life experience, or a Facilitator, someone who helps run sessions.";

  const handleContinue = () => {
    if (selectedRole) {
      navigate('/register', { state: { role: selectedRole } });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header with TTS */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full mb-6">
              <span className="font-medium">Design Together</span>
            </div>
            
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Co-Design Connect
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
              A simple app that helps people work together to design solutions. 
              Step by step, with tools everyone can use.
            </p>

            <Button
              variant="outline"
              size="lg"
              onClick={() => speak(welcomeText)}
              className="gap-2 h-14 px-6 rounded-full"
              data-testid="hero-tts-button"
            >
              <Volume2 className={`h-5 w-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
              {isSpeaking ? 'Speaking...' : 'Listen to this'}
            </Button>
          </div>

          {/* Role Selection */}
          <div className="mb-12">
            <h2 className="font-heading text-2xl md:text-3xl font-semibold text-center mb-8">
              Who are you?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Co-Designer Card */}
              <Card 
                className={`role-card ${selectedRole === 'co-designer' ? 'selected' : ''}`}
                onClick={() => setSelectedRole('co-designer')}
                data-testid="role-co-designer"
              >
                <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Users className="h-10 w-10 text-secondary" />
                </div>
                <h3 className="font-heading text-xl font-bold">Co-Designer</h3>
                <p className="text-muted-foreground text-center">
                  I have real-life experience to share. 
                  I want to help design solutions.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 text-left w-full">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    Share your ideas
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    Vote on solutions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    Give feedback
                  </li>
                </ul>
              </Card>

              {/* Facilitator Card */}
              <Card 
                className={`role-card ${selectedRole === 'facilitator' ? 'selected' : ''}`}
                onClick={() => setSelectedRole('facilitator')}
                data-testid="role-facilitator"
              >
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                  <Compass className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-bold">Facilitator</h3>
                <p className="text-muted-foreground text-center">
                  I run sessions and support co-designers. 
                  I help turn ideas into designs.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 text-left w-full">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    Plan sessions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    Guide activities
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    Review results
                  </li>
                </ul>
              </Card>
            </div>
          </div>

          {/* Continue Button */}
          <div className="text-center mb-16">
            <Button
              size="lg"
              disabled={!selectedRole}
              onClick={handleContinue}
              className="h-16 px-10 text-lg rounded-full gap-2"
              data-testid="continue-button"
            >
              <span>Continue</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
            
            <p className="mt-4 text-muted-foreground">
              Already have an account?{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto text-primary"
                onClick={() => navigate('/login')}
                data-testid="login-link"
              >
                Sign in here
              </Button>
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-heading text-2xl md:text-3xl font-semibold text-center mb-4">
            What You Can Do
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Six simple tools to help you design together
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="p-6 card-hover animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-0 flex flex-col items-start gap-4">
                    <div className={`p-3 rounded-xl ${feature.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-lg mb-1">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Made for inclusive design. Everyone's voice matters.
          </p>
        </div>
      </footer>
    </div>
  );
}

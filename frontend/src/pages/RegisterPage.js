import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, ArrowLeft, Volume2, Users, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useTextToSpeech } from '@/hooks/useSpeech';
import { toast } from 'sonner';

export default function RegisterPage() {
  const location = useLocation();
  const initialRole = location.state?.role || 'co-designer';
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { speak, isSpeaking } = useTextToSpeech();

  const pageHelp = "This is the create account page. Enter your name, email, and choose a password. Also select if you are a Co-Designer or Facilitator.";

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name, role);
      toast.success('Account created! Welcome to Co-Design Connect.');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate('/')}
          data-testid="back-button"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">CD</span>
            </div>
            <div>
              <CardTitle className="font-heading text-2xl">Create Account</CardTitle>
              <CardDescription className="text-base mt-2">
                Join Co-Design Connect
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => speak(pageHelp)}
              className="gap-2"
              data-testid="register-help-tts"
            >
              <Volume2 className={`h-4 w-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
              {isSpeaking ? 'Speaking...' : 'Listen to help'}
            </Button>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">Your Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="What should we call you?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-14 text-lg"
                  data-testid="name-input"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 text-lg"
                  data-testid="email-input"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 text-lg pr-12"
                    data-testid="password-input"
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <Label className="text-base">I am a...</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={role === 'co-designer' ? 'default' : 'outline'}
                    className={`h-auto py-4 flex flex-col gap-2 ${role === 'co-designer' ? 'bg-secondary hover:bg-secondary/90' : ''}`}
                    onClick={() => setRole('co-designer')}
                    data-testid="role-co-designer"
                  >
                    <Users className="h-6 w-6" />
                    <span>Co-Designer</span>
                  </Button>
                  <Button
                    type="button"
                    variant={role === 'facilitator' ? 'default' : 'outline'}
                    className={`h-auto py-4 flex flex-col gap-2 ${role === 'facilitator' ? 'bg-primary hover:bg-primary/90' : ''}`}
                    onClick={() => setRole('facilitator')}
                    data-testid="role-facilitator"
                  >
                    <Compass className="h-6 w-6" />
                    <span>Facilitator</span>
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg rounded-full gap-2"
                disabled={loading}
                data-testid="register-submit"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Creating account...
                  </span>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    <span>Create Account</span>
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-primary font-medium hover:underline"
                  data-testid="login-link"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

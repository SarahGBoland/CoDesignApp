import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Plus, 
  Trash2, 
  Save,
  ArrowRight,
  ArrowLeft,
  TreePine,
  ChevronDown,
  ChevronUp,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SessionLayout } from '@/components/Layout';
import { TTSButton, STTButton } from '@/components/AccessibilityToolbar';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProblemTreePage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [coreProblem, setCoreProblem] = useState('');
  const [causes, setCauses] = useState([]);
  const [effects, setEffects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCause, setNewCause] = useState('');
  const [newEffect, setNewEffect] = useState('');

  const pageHelp = "This is the Problem Tree. First, write the main problem in the middle box. Then add causes below (why does this happen?) and effects above (what happens because of this?). This helps you understand the problem better.";

  useEffect(() => {
    fetchData();
  }, [sessionId]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/problem-trees/${sessionId}`);
      setCoreProblem(response.data.core_problem || '');
      setCauses(response.data.items?.filter(i => i.type === 'cause') || []);
      setEffects(response.data.items?.filter(i => i.type === 'effect') || []);
    } catch (error) {
      // No existing data, start fresh
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const items = [
        ...causes.map(c => ({ ...c, type: 'cause' })),
        ...effects.map(e => ({ ...e, type: 'effect' }))
      ];
      
      await axios.put(`${API_URL}/problem-trees/${sessionId}`, {
        session_id: sessionId,
        core_problem: coreProblem,
        items
      });
      toast.success('Saved!');
    } catch (error) {
      toast.error('Could not save');
    } finally {
      setSaving(false);
    }
  };

  const addCause = () => {
    if (!newCause.trim()) return;
    setCauses([...causes, { id: Date.now().toString(), text: newCause, type: 'cause' }]);
    setNewCause('');
  };

  const addEffect = () => {
    if (!newEffect.trim()) return;
    setEffects([...effects, { id: Date.now().toString(), text: newEffect, type: 'effect' }]);
    setNewEffect('');
  };

  const removeCause = (id) => {
    setCauses(causes.filter(c => c.id !== id));
  };

  const removeEffect = (id) => {
    setEffects(effects.filter(e => e.id !== id));
  };

  const handleSpeechResult = (setter) => (text) => {
    setter(text);
  };

  if (loading) {
    return (
      <SessionLayout sessionId={sessionId} pageHelp={pageHelp}>
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </SessionLayout>
    );
  }

  return (
    <SessionLayout sessionId={sessionId} currentStep={1} pageHelp={pageHelp}>
      <div className="space-y-6" data-testid="problem-tree-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-100 text-red-700">
              <TreePine className="h-8 w-8" />
            </div>
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold">Problem Tree</h1>
              <p className="text-muted-foreground">Find the main problem and its causes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <TTSButton text={pageHelp} />
            <Button onClick={handleSave} disabled={saving} className="gap-2" data-testid="save-button">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Help card */}
        <Card className="bg-red-50/50 border-red-200">
          <CardContent className="p-4 flex items-start gap-3">
            <Volume2 className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800">How to use this tool:</p>
              <p className="text-red-700 text-sm">Write the main problem in the center. Add causes below (why does it happen?) and effects above (what happens because of it?).</p>
            </div>
          </CardContent>
        </Card>

        {/* Effects Section (Top) */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <ChevronUp className="h-5 w-5" />
                Effects (What happens because of the problem?)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Type an effect or click the microphone..."
                value={newEffect}
                onChange={(e) => setNewEffect(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addEffect()}
                className="h-14 text-lg"
                data-testid="effect-input"
              />
              <STTButton onResult={handleSpeechResult(setNewEffect)} />
              <Button onClick={addEffect} size="lg" className="h-14 px-6" data-testid="add-effect">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="grid gap-3">
              {effects.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No effects added yet. What happens because of this problem?</p>
              ) : (
                effects.map((effect, index) => (
                  <div 
                    key={effect.id} 
                    className="tree-node effect animate-fade-in flex items-center justify-between"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <TTSButton text={effect.text} size="sm" />
                      <span className="text-lg">{effect.text}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeEffect(effect.id)}
                      className="h-10 w-10 text-red-500 hover:text-red-700"
                      data-testid={`remove-effect-${effect.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Core Problem (Center) */}
        <Card className="border-2 border-red-300 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-800 text-center">The Main Problem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="What is the main problem you want to solve?"
                value={coreProblem}
                onChange={(e) => setCoreProblem(e.target.value)}
                className="h-16 text-xl font-medium text-center border-red-200"
                data-testid="core-problem-input"
              />
              <STTButton onResult={handleSpeechResult(setCoreProblem)} />
            </div>
          </CardContent>
        </Card>

        {/* Causes Section (Bottom) */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <ChevronDown className="h-5 w-5" />
                Causes (Why does this problem happen?)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Type a cause or click the microphone..."
                value={newCause}
                onChange={(e) => setNewCause(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCause()}
                className="h-14 text-lg"
                data-testid="cause-input"
              />
              <STTButton onResult={handleSpeechResult(setNewCause)} />
              <Button onClick={addCause} size="lg" className="h-14 px-6" data-testid="add-cause">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="grid gap-3">
              {causes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No causes added yet. Why does this problem happen?</p>
              ) : (
                causes.map((cause, index) => (
                  <div 
                    key={cause.id} 
                    className="tree-node cause animate-fade-in flex items-center justify-between"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <TTSButton text={cause.text} size="sm" />
                      <span className="text-lg">{cause.text}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeCause(cause.id)}
                      className="h-10 w-10 text-red-500 hover:text-red-700"
                      data-testid={`remove-cause-${cause.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/session/${sessionId}/expectations`)}
            className="gap-2 h-12"
            data-testid="prev-step"
          >
            <ArrowLeft className="h-5 w-5" />
            Previous: Expectations
          </Button>
          <Button 
            onClick={() => {
              handleSave();
              navigate(`/session/${sessionId}/empathy-map`);
            }}
            className="gap-2 h-12"
            data-testid="next-step"
          >
            Next: Empathy Map
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </SessionLayout>
  );
}

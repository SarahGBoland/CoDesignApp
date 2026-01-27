import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Plus, 
  Trash2, 
  Save,
  ArrowRight,
  ArrowLeft,
  Heart,
  User,
  Volume2,
  MessageCircle,
  Brain,
  Hand,
  Smile
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SessionLayout } from '@/components/Layout';
import { TTSButton, STTButton } from '@/components/AccessibilityToolbar';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const QUADRANTS = [
  { key: 'says', icon: MessageCircle, label: 'Says', description: 'What do they say out loud?', color: 'says' },
  { key: 'thinks', icon: Brain, label: 'Thinks', description: 'What might they be thinking?', color: 'thinks' },
  { key: 'does', icon: Hand, label: 'Does', description: 'What actions do they take?', color: 'does' },
  { key: 'feels', icon: Smile, label: 'Feels', description: 'What emotions do they feel?', color: 'feels' },
];

export default function EmpathyMapPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [personaName, setPersonaName] = useState('User');
  const [data, setData] = useState({ says: [], thinks: [], does: [], feels: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inputs, setInputs] = useState({ says: '', thinks: '', does: '', feels: '' });

  const pageHelp = "This is the Empathy Map. Think about a person who has this problem. What do they say? What do they think? What do they do? How do they feel? This helps us understand their experience.";

  useEffect(() => {
    fetchData();
  }, [sessionId]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/empathy-maps/${sessionId}`);
      setPersonaName(response.data.persona_name || 'User');
      setData({
        says: response.data.says || [],
        thinks: response.data.thinks || [],
        does: response.data.does || [],
        feels: response.data.feels || []
      });
    } catch (error) {
      // No existing data
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/empathy-maps/${sessionId}`, {
        session_id: sessionId,
        persona_name: personaName,
        ...data
      });
      toast.success('Saved!');
    } catch (error) {
      toast.error('Could not save');
    } finally {
      setSaving(false);
    }
  };

  const addItem = (quadrant) => {
    const text = inputs[quadrant].trim();
    if (!text) return;
    setData({ ...data, [quadrant]: [...data[quadrant], text] });
    setInputs({ ...inputs, [quadrant]: '' });
  };

  const removeItem = (quadrant, index) => {
    const newItems = [...data[quadrant]];
    newItems.splice(index, 1);
    setData({ ...data, [quadrant]: newItems });
  };

  const handleSpeechResult = (quadrant) => (text) => {
    setInputs({ ...inputs, [quadrant]: text });
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
    <SessionLayout sessionId={sessionId} currentStep={2} pageHelp={pageHelp}>
      <div className="space-y-6" data-testid="empathy-map-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-pink-100 text-pink-700">
              <Heart className="h-8 w-8" />
            </div>
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold">Empathy Map</h1>
              <p className="text-muted-foreground">Understand how people feel</p>
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
        <Card className="bg-pink-50/50 border-pink-200">
          <CardContent className="p-4 flex items-start gap-3">
            <Volume2 className="h-5 w-5 text-pink-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-pink-800">How to use this tool:</p>
              <p className="text-pink-700 text-sm">Think about a person who has this problem. Fill in what they say, think, do, and feel. This helps us understand their experience.</p>
            </div>
          </CardContent>
        </Card>

        {/* Persona Name */}
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground">Who are you thinking about?</label>
                <Input
                  placeholder="e.g., A parent, A patient, A student..."
                  value={personaName}
                  onChange={(e) => setPersonaName(e.target.value)}
                  className="h-12 text-lg mt-1"
                  data-testid="persona-name-input"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Empathy Map Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {QUADRANTS.map((quadrant) => {
            const Icon = quadrant.icon;
            return (
              <Card key={quadrant.key} className={`empathy-quadrant ${quadrant.color}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className="h-5 w-5" />
                    {quadrant.label}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{quadrant.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder={`What do they ${quadrant.key.toLowerCase()}?`}
                      value={inputs[quadrant.key]}
                      onChange={(e) => setInputs({ ...inputs, [quadrant.key]: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && addItem(quadrant.key)}
                      className="h-12"
                      data-testid={`${quadrant.key}-input`}
                    />
                    <STTButton onResult={handleSpeechResult(quadrant.key)} />
                    <Button onClick={() => addItem(quadrant.key)} size="icon" className="h-12 w-12" data-testid={`add-${quadrant.key}`}>
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Items */}
                  <div className="space-y-2 min-h-[100px]">
                    {data[quadrant.key].length === 0 ? (
                      <p className="text-center text-muted-foreground py-4 text-sm">
                        No items yet
                      </p>
                    ) : (
                      data[quadrant.key].map((item, index) => (
                        <div 
                          key={index} 
                          className="flex items-center gap-2 p-3 bg-white/80 rounded-lg animate-fade-in"
                        >
                          <TTSButton text={item} size="sm" />
                          <span className="flex-1">{item}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeItem(quadrant.key, index)}
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/session/${sessionId}/problem-tree`)}
            className="gap-2 h-12"
            data-testid="prev-step"
          >
            <ArrowLeft className="h-5 w-5" />
            Previous: Problem Tree
          </Button>
          <Button 
            onClick={() => {
              handleSave();
              navigate(`/session/${sessionId}/story-map`);
            }}
            className="gap-2 h-12"
            data-testid="next-step"
          >
            Next: Story Map
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </SessionLayout>
  );
}

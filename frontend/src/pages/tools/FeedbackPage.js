import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Plus, 
  Trash2, 
  Save,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  Volume2,
  Heart,
  Star,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionLayout } from '@/components/Layout';
import { TTSButton, STTButton } from '@/components/AccessibilityToolbar';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const FEEDBACK_TYPES = [
  { 
    key: 'like', 
    icon: Heart, 
    label: 'I Like...', 
    description: 'What do you like? What works well?',
    placeholder: 'I like that...',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  { 
    key: 'wish', 
    icon: Star, 
    label: 'I Wish...', 
    description: 'What could be better? What do you wish for?',
    placeholder: 'I wish that...',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  { 
    key: 'whatif', 
    icon: Sparkles, 
    label: 'What If...', 
    description: 'Any new ideas? What if we tried something different?',
    placeholder: 'What if we...',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
];

export default function FeedbackPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('like');
  const [newItemText, setNewItemText] = useState('');

  const pageHelp = "This is the I Like, I Wish, What If tool. Share feedback in three ways: I Like - what works well; I Wish - what could be better; What If - new ideas to try. Every opinion matters!";

  useEffect(() => {
    fetchData();
  }, [sessionId]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/feedback/${sessionId}`);
      setItems(response.data.items || []);
    } catch (error) {
      // No existing data
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/feedback/${sessionId}`, {
        session_id: sessionId,
        items
      });
      toast.success('Saved!');
    } catch (error) {
      toast.error('Could not save');
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    if (!newItemText.trim()) return;
    const newItem = {
      id: Date.now().toString(),
      text: newItemText,
      type: activeTab
    };
    setItems([...items, newItem]);
    setNewItemText('');
  };

  const removeItem = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  const getItemsByType = (type) => items.filter(i => i.type === type);
  const currentType = FEEDBACK_TYPES.find(t => t.key === activeTab);

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
    <SessionLayout sessionId={sessionId} currentStep={5} pageHelp={pageHelp}>
      <div className="space-y-6" data-testid="feedback-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-green-100 text-green-700">
              <MessageSquare className="h-8 w-8" />
            </div>
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold">I Like, I Wish, What If</h1>
              <p className="text-muted-foreground">Share feedback and suggestions</p>
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
        <Card className="bg-green-50/50 border-green-200">
          <CardContent className="p-4 flex items-start gap-3">
            <Volume2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-800">How to use this tool:</p>
              <p className="text-green-700 text-sm">Share your feedback: <strong>I Like</strong> (what's good), <strong>I Wish</strong> (what could improve), <strong>What If</strong> (new ideas). Be honest - every opinion helps!</p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 h-auto p-1">
            {FEEDBACK_TYPES.map((type) => {
              const Icon = type.icon;
              const count = getItemsByType(type.key).length;
              return (
                <TabsTrigger 
                  key={type.key} 
                  value={type.key}
                  className="flex flex-col gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {count > 0 && (
                      <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">{count}</span>
                    )}
                  </div>
                  <span className="text-sm">{type.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {FEEDBACK_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <TabsContent key={type.key} value={type.key} className="mt-4">
                <Card className={`border-2 ${type.color.split(' ')[2]}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      {type.description}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder={type.placeholder}
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addItem()}
                        className="h-14 text-lg"
                        data-testid={`${type.key}-input`}
                      />
                      <STTButton onResult={(text) => setNewItemText(text)} />
                      <Button onClick={addItem} size="lg" className="h-14 px-6" data-testid={`add-${type.key}`}>
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                      {getItemsByType(type.key).length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          No "{type.label.replace('...', '')}" feedback yet. Share your thoughts!
                        </p>
                      ) : (
                        getItemsByType(type.key).map((item, index) => (
                          <div 
                            key={item.id}
                            className={`feedback-badge ${type.key} p-4 rounded-xl flex items-center gap-3 animate-fade-in w-full`}
                            style={{ animationDelay: `${index * 0.05}s` }}
                          >
                            <TTSButton text={item.text} size="sm" />
                            <span className="flex-1 text-lg">{item.text}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeItem(item.id)}
                              className="h-8 w-8 text-red-500"
                              data-testid={`remove-${item.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {FEEDBACK_TYPES.map((type) => {
                const Icon = type.icon;
                const typeItems = getItemsByType(type.key);
                return (
                  <div key={type.key} className={`p-4 rounded-xl ${type.color}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{type.label}</span>
                    </div>
                    <p className="text-2xl font-bold">{typeItems.length}</p>
                    <p className="text-sm opacity-80">
                      {typeItems.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/session/${sessionId}/ideas-board`)}
            className="gap-2 h-12"
            data-testid="prev-step"
          >
            <ArrowLeft className="h-5 w-5" />
            Previous: Ideas Board
          </Button>
          <Button 
            onClick={() => {
              handleSave();
              navigate(`/session/${sessionId}`);
            }}
            className="gap-2 h-12"
            data-testid="finish-session"
          >
            Finish Session
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </SessionLayout>
  );
}

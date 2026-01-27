import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Plus, 
  Trash2, 
  Save,
  ArrowRight,
  ArrowLeft,
  Target,
  Volume2,
  Flag,
  AlertTriangle,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionLayout } from '@/components/Layout';
import { TTSButton, STTButton } from '@/components/AccessibilityToolbar';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const EXPECTATION_TYPES = [
  { 
    key: 'goal', 
    icon: Flag, 
    label: 'Goals', 
    description: 'What do you want to achieve?',
    placeholder: 'We want to...',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  { 
    key: 'constraint', 
    icon: AlertTriangle, 
    label: 'Constraints', 
    description: 'What limitations do we have?',
    placeholder: 'We must consider...',
    color: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  { 
    key: 'success', 
    icon: Award, 
    label: 'Success Looks Like', 
    description: 'How will we know if we succeeded?',
    placeholder: 'Success means...',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
];

export default function ExpectationsPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('goal');
  const [newItemText, setNewItemText] = useState('');
  const [newItemPriority, setNewItemPriority] = useState(2);

  const pageHelp = "This is Manage Expectations. Start by setting clear goals - what do you want to achieve? Add constraints - what limitations exist? Define success - how will you know if it worked?";

  useEffect(() => {
    fetchData();
  }, [sessionId]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/expectations/${sessionId}`);
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
      await axios.put(`${API_URL}/expectations/${sessionId}`, {
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
      type: activeTab,
      priority: newItemPriority
    };
    setItems([...items, newItem]);
    setNewItemText('');
    setNewItemPriority(2);
  };

  const removeItem = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  const getItemsByType = (type) => items.filter(i => i.type === type);
  const currentType = EXPECTATION_TYPES.find(t => t.key === activeTab);

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 1: return 'High';
      case 2: return 'Medium';
      case 3: return 'Low';
      default: return 'Medium';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 1: return 'high';
      case 2: return 'medium';
      case 3: return 'low';
      default: return 'medium';
    }
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
    <SessionLayout sessionId={sessionId} currentStep={0} pageHelp={pageHelp}>
      <div className="space-y-6" data-testid="expectations-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-100 text-amber-700">
              <Target className="h-8 w-8" />
            </div>
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold">Manage Expectations</h1>
              <p className="text-muted-foreground">Set goals for your project</p>
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
        <Card className="bg-amber-50/50 border-amber-200">
          <CardContent className="p-4 flex items-start gap-3">
            <Volume2 className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800">How to use this tool:</p>
              <p className="text-amber-700 text-sm">Start with your goals (what you want to achieve), add constraints (things to consider), and define success (how you'll know it worked). This helps everyone understand what to expect.</p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 h-auto p-1">
            {EXPECTATION_TYPES.map((type) => {
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

          {EXPECTATION_TYPES.map((type) => {
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
                    </div>

                    {/* Priority selector */}
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">Priority:</span>
                      <div className="flex gap-2">
                        {[1, 2, 3].map((p) => (
                          <Button
                            key={p}
                            variant={newItemPriority === p ? "default" : "outline"}
                            size="sm"
                            onClick={() => setNewItemPriority(p)}
                            className={newItemPriority === p ? `priority-badge ${getPriorityClass(p)}` : ''}
                            data-testid={`priority-${p}`}
                          >
                            {getPriorityLabel(p)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Add button */}
                    <Button onClick={addItem} size="lg" className="w-full h-12 gap-2" data-testid={`add-${type.key}`}>
                      <Plus className="h-5 w-5" />
                      Add {type.label.slice(0, -1)}
                    </Button>

                    {/* Items */}
                    <div className="space-y-3 pt-4">
                      {getItemsByType(type.key).length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          No {type.label.toLowerCase()} added yet.
                        </p>
                      ) : (
                        getItemsByType(type.key)
                          .sort((a, b) => a.priority - b.priority)
                          .map((item, index) => (
                            <div 
                              key={item.id}
                              className={`p-4 rounded-xl ${type.color} flex items-center gap-3 animate-fade-in`}
                              style={{ animationDelay: `${index * 0.05}s` }}
                            >
                              <div className={`priority-badge ${getPriorityClass(item.priority)}`}>
                                {item.priority}
                              </div>
                              <TTSButton text={item.text} size="sm" />
                              <span className="flex-1 text-lg">{item.text}</span>
                              <span className="text-xs opacity-70">{getPriorityLabel(item.priority)}</span>
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
            <CardTitle>Expectations Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {EXPECTATION_TYPES.map((type) => {
                const Icon = type.icon;
                const typeItems = getItemsByType(type.key);
                const highPriority = typeItems.filter(i => i.priority === 1).length;
                return (
                  <div key={type.key} className={`p-4 rounded-xl ${type.color}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{type.label}</span>
                    </div>
                    <p className="text-2xl font-bold">{typeItems.length}</p>
                    <p className="text-sm opacity-80">
                      {highPriority > 0 && `${highPriority} high priority`}
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
            onClick={() => navigate(`/session/${sessionId}`)}
            className="gap-2 h-12"
            data-testid="back-to-session"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Session
          </Button>
          <Button 
            onClick={() => {
              handleSave();
              navigate(`/session/${sessionId}/problem-tree`);
            }}
            className="gap-2 h-12"
            data-testid="next-step"
          >
            Next: Problem Tree
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </SessionLayout>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Plus, 
  Trash2, 
  Save,
  ArrowRight,
  ArrowLeft,
  Map,
  Volume2,
  Footprints,
  CheckSquare,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionLayout } from '@/components/Layout';
import { TTSButton, STTButton } from '@/components/AccessibilityToolbar';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ITEM_TYPES = [
  { key: 'activity', icon: Footprints, label: 'Activities', description: 'Big things the user does', color: 'bg-blue-100 text-blue-800' },
  { key: 'task', icon: CheckSquare, label: 'Tasks', description: 'Smaller steps in each activity', color: 'bg-green-100 text-green-800' },
  { key: 'story', icon: BookOpen, label: 'Stories', description: 'Details and examples', color: 'bg-purple-100 text-purple-800' },
];

export default function StoryMapPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('User Journey');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('activity');
  const [newItemText, setNewItemText] = useState('');

  const pageHelp = "This is the Story Map. Start with big activities - what does the user need to do? Then add tasks - smaller steps in each activity. Finally add stories - specific details and examples. This shows the whole journey.";

  useEffect(() => {
    fetchData();
  }, [sessionId]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/story-maps/${sessionId}`);
      setTitle(response.data.title || 'User Journey');
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
      await axios.put(`${API_URL}/story-maps/${sessionId}`, {
        session_id: sessionId,
        title,
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
      column: items.filter(i => i.type === activeTab).length,
      row: ITEM_TYPES.findIndex(t => t.key === activeTab)
    };
    setItems([...items, newItem]);
    setNewItemText('');
  };

  const removeItem = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  const getItemsByType = (type) => items.filter(i => i.type === type);

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
    <SessionLayout sessionId={sessionId} currentStep={3} pageHelp={pageHelp}>
      <div className="space-y-6" data-testid="story-map-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-700">
              <Map className="h-8 w-8" />
            </div>
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold">Story Map</h1>
              <p className="text-muted-foreground">Plan the user journey</p>
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
        <Card className="bg-blue-50/50 border-blue-200">
          <CardContent className="p-4 flex items-start gap-3">
            <Volume2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-800">How to use this tool:</p>
              <p className="text-blue-700 text-sm">Map out the user's journey. Start with activities (big things), then tasks (smaller steps), then stories (specific details).</p>
            </div>
          </CardContent>
        </Card>

        {/* Title */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Journey Title:</label>
              <Input
                placeholder="e.g., Booking an Appointment, Ordering Food..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 text-lg"
                data-testid="title-input"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs for adding items */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 h-auto p-1">
            {ITEM_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <TabsTrigger 
                  key={type.key} 
                  value={type.key}
                  className="flex flex-col gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Icon className="h-5 w-5" />
                  <span>{type.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {ITEM_TYPES.map((type) => (
            <TabsContent key={type.key} value={type.key} className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{type.description}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Add a ${type.key}...`}
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

                  {/* Items list */}
                  <div className="flex flex-wrap gap-3">
                    {getItemsByType(type.key).length === 0 ? (
                      <p className="text-muted-foreground py-8 w-full text-center">
                        No {type.label.toLowerCase()} added yet
                      </p>
                    ) : (
                      getItemsByType(type.key).map((item, index) => (
                        <div 
                          key={item.id}
                          className={`sticky-note ${type.key === 'activity' ? 'yellow' : type.key === 'task' ? 'green' : 'pink'} animate-fade-in`}
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <TTSButton text={item.text} size="sm" />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeItem(item.id)}
                              className="h-6 w-6 text-red-500"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="mt-2">{item.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Visual Journey */}
        <Card>
          <CardHeader>
            <CardTitle>Your Journey Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Activities row */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Footprints className="h-4 w-4" /> Activities
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {getItemsByType('activity').length === 0 ? (
                    <div className="text-muted-foreground text-sm py-4 px-8 border-2 border-dashed rounded-lg">Add activities above</div>
                  ) : (
                    getItemsByType('activity').map((item) => (
                      <div key={item.id} className="sticky-note yellow min-w-[140px] flex-shrink-0">
                        <p className="text-sm font-medium">{item.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Tasks row */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" /> Tasks
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {getItemsByType('task').length === 0 ? (
                    <div className="text-muted-foreground text-sm py-4 px-8 border-2 border-dashed rounded-lg">Add tasks above</div>
                  ) : (
                    getItemsByType('task').map((item) => (
                      <div key={item.id} className="sticky-note green min-w-[140px] flex-shrink-0">
                        <p className="text-sm">{item.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Stories row */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Stories
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {getItemsByType('story').length === 0 ? (
                    <div className="text-muted-foreground text-sm py-4 px-8 border-2 border-dashed rounded-lg">Add stories above</div>
                  ) : (
                    getItemsByType('story').map((item) => (
                      <div key={item.id} className="sticky-note pink min-w-[140px] flex-shrink-0">
                        <p className="text-sm">{item.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/session/${sessionId}/empathy-map`)}
            className="gap-2 h-12"
            data-testid="prev-step"
          >
            <ArrowLeft className="h-5 w-5" />
            Previous: Empathy Map
          </Button>
          <Button 
            onClick={() => {
              handleSave();
              navigate(`/session/${sessionId}/ideas-board`);
            }}
            className="gap-2 h-12"
            data-testid="next-step"
          >
            Next: Ideas Board
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </SessionLayout>
  );
}

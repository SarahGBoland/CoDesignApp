import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Plus, 
  Trash2, 
  Save,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Volume2,
  ThumbsUp,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SessionLayout } from '@/components/Layout';
import { TTSButton, STTButton } from '@/components/AccessibilityToolbar';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const COLORS = [
  { name: 'Yellow', value: '#FFF9C4' },
  { name: 'Pink', value: '#F8BBD9' },
  { name: 'Blue', value: '#BBDEFB' },
  { name: 'Green', value: '#C8E6C9' },
  { name: 'Orange', value: '#FFE0B2' },
];

const CATEGORIES = ['All', 'General', 'Must Have', 'Nice to Have', 'Future'];

export default function IdeasBoardPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newIdeaText, setNewIdeaText] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [filterCategory, setFilterCategory] = useState('All');

  const pageHelp = "This is the Ideas Board. Share your ideas here! Type or speak your idea, pick a color, and add it to the board. You can vote for ideas you like by clicking the thumbs up button.";

  useEffect(() => {
    fetchData();
  }, [sessionId]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/ideas-boards/${sessionId}`);
      setIdeas(response.data.ideas || []);
    } catch (error) {
      // No existing data
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/ideas-boards/${sessionId}`, {
        session_id: sessionId,
        ideas
      });
      toast.success('Saved!');
    } catch (error) {
      toast.error('Could not save');
    } finally {
      setSaving(false);
    }
  };

  const addIdea = () => {
    if (!newIdeaText.trim()) return;
    const newIdea = {
      id: Date.now().toString(),
      text: newIdeaText,
      category: selectedCategory,
      color: selectedColor,
      votes: 0
    };
    setIdeas([...ideas, newIdea]);
    setNewIdeaText('');
  };

  const removeIdea = (id) => {
    setIdeas(ideas.filter(i => i.id !== id));
  };

  const voteIdea = (id) => {
    setIdeas(ideas.map(i => 
      i.id === id ? { ...i, votes: i.votes + 1 } : i
    ));
  };

  const filteredIdeas = filterCategory === 'All' 
    ? ideas 
    : ideas.filter(i => i.category === filterCategory);

  const sortedIdeas = [...filteredIdeas].sort((a, b) => b.votes - a.votes);

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
    <SessionLayout sessionId={sessionId} currentStep={4} pageHelp={pageHelp}>
      <div className="space-y-6" data-testid="ideas-board-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-yellow-100 text-yellow-700">
              <Lightbulb className="h-8 w-8" />
            </div>
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold">Ideas Board</h1>
              <p className="text-muted-foreground">Collect and vote on ideas</p>
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
        <Card className="bg-yellow-50/50 border-yellow-200">
          <CardContent className="p-4 flex items-start gap-3">
            <Volume2 className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-800">How to use this tool:</p>
              <p className="text-yellow-700 text-sm">Type or speak your idea, pick a color card, and add it. Vote for ideas you like! Ideas with more votes will appear first.</p>
            </div>
          </CardContent>
        </Card>

        {/* Add Idea Section */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Share Your Idea</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Text input */}
            <div className="flex gap-2">
              <Input
                placeholder="Type your idea here..."
                value={newIdeaText}
                onChange={(e) => setNewIdeaText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addIdea()}
                className="h-14 text-lg"
                data-testid="idea-input"
              />
              <STTButton onResult={(text) => setNewIdeaText(text)} />
            </div>

            {/* Color picker */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" /> Card Color:
              </span>
              <div className="flex gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-10 h-10 rounded-full border-2 transition-transform ${
                      selectedColor === color.value ? 'border-primary scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.value }}
                    aria-label={color.name}
                    data-testid={`color-${color.name.toLowerCase()}`}
                  />
                ))}
              </div>
            </div>

            {/* Category picker */}
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm font-medium">Category:</span>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.slice(1).map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    data-testid={`category-${cat.toLowerCase().replace(' ', '-')}`}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Add button */}
            <Button onClick={addIdea} size="lg" className="w-full h-14 gap-2" data-testid="add-idea">
              <Plus className="h-5 w-5" />
              Add Idea
            </Button>
          </CardContent>
        </Card>

        {/* Filter */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm font-medium">Show:</span>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={filterCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterCategory(cat)}
                data-testid={`filter-${cat.toLowerCase().replace(' ', '-')}`}
              >
                {cat}
              </Button>
            ))}
          </div>
          <span className="text-muted-foreground text-sm ml-auto">
            {filteredIdeas.length} idea{filteredIdeas.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Ideas Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedIdeas.length === 0 ? (
            <Card className="col-span-full p-12">
              <div className="empty-state">
                <Lightbulb className="h-16 w-16 text-muted-foreground/50" />
                <h3 className="font-heading text-xl font-semibold">No ideas yet</h3>
                <p>Be the first to share an idea!</p>
              </div>
            </Card>
          ) : (
            sortedIdeas.map((idea, index) => (
              <div 
                key={idea.id}
                className="idea-card animate-fade-in"
                style={{ backgroundColor: idea.color, animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-xs font-medium px-2 py-1 bg-black/10 rounded-full">
                    {idea.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <TTSButton text={idea.text} size="sm" />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeIdea(idea.id)}
                      className="h-8 w-8 text-red-500"
                      data-testid={`remove-idea-${idea.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-lg mb-4">{idea.text}</p>
                
                <div className="flex items-center justify-between mt-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => voteIdea(idea.id)}
                    className="vote-btn"
                    data-testid={`vote-idea-${idea.id}`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span className="font-bold">{idea.votes}</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/session/${sessionId}/story-map`)}
            className="gap-2 h-12"
            data-testid="prev-step"
          >
            <ArrowLeft className="h-5 w-5" />
            Previous: Story Map
          </Button>
          <Button 
            onClick={() => {
              handleSave();
              navigate(`/session/${sessionId}/feedback`);
            }}
            className="gap-2 h-12"
            data-testid="next-step"
          >
            Next: Feedback
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </SessionLayout>
  );
}

import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  BookOpen, Plus, Trash2, Settings, HelpCircle, Save, 
  ArrowLeft, Loader2, Edit3, ChevronRight, CheckCircle2 
} from "lucide-react";
import { PageShell } from "../components/layout/PageShell";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { 
  getModulesFn, updateModuleFn, getModuleTopicsFn, 
  addTopicFn, updateTopicFn, deleteTopicFn,
  getQuizQuestionsFn, updateQuizQuestionsFn 
} from "../lib/auth-functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/modules")({
  loader: async () => {
    const list = await getModulesFn();
    return { list };
  },
  component: AdminModulesManager,
});

type Module = {
  id: string;
  index: number;
  title: string;
  description: string;
  difficulty: string;
  time: string;
  accent: string;
};

type Topic = {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  timeToRead: string;
  index: number;
};

type Question = {
  id?: string;
  questionText: string;
  options: string; // JSON string
  correctAnswerIndex: number;
};

function AdminModulesManager() {
  const { list } = Route.useLoaderData();
  const router = useRouter();

  // Selected module state
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "topics" | "quiz">("details");

  // Loading states
  const [loadingContent, setLoadingContent] = useState(false);
  const [saving, setSaving] = useState(false);

  // Tab 1: Module Details Form State
  const [modTitle, setModTitle] = useState("");
  const [modDesc, setModDesc] = useState("");
  const [modDiff, setModDiff] = useState("");
  const [modTime, setModTime] = useState("");
  const [modAccent, setModAccent] = useState("");

  // Tab 2: Topics State
  const [topics, setTopics] = useState<Topic[]>([]);
  const [editingTopic, setEditingTopic] = useState<Partial<Topic> | null>(null);

  // Tab 3: Quiz State
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDesc, setQuizDesc] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);

  // Load module data when selected
  const handleSelectModule = async (mod: Module) => {
    setSelectedModule(mod);
    setActiveTab("details");
    
    // Set form state
    setModTitle(mod.title);
    setModDesc(mod.description);
    setModDiff(mod.difficulty);
    setModTime(mod.time);
    setModAccent(mod.accent);

    // Fetch topics and quiz questions
    setLoadingContent(true);
    try {
      const topicsRes = await getModuleTopicsFn({ data: { moduleId: mod.id } });
      setTopics(topicsRes.topics as Topic[]);

      const quizRes = await getQuizQuestionsFn({ data: { moduleId: mod.id } });
      setQuizTitle(quizRes.quiz?.title || `${mod.title} Quiz`);
      setQuizDesc(quizRes.quiz?.description || `Test your knowledge on ${mod.title}`);
      
      const parsedQuestions = quizRes.questions.map(q => ({
        ...q,
        options: typeof q.options === "string" ? q.options : JSON.stringify(q.options)
      }));
      setQuestions(parsedQuestions);
      setEditingTopic(null);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load module details.");
    } finally {
      setLoadingContent(false);
    }
  };

  // Tab 1 Handler: Update Module Details
  const handleUpdateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule) return;

    setSaving(true);
    try {
      await updateModuleFn({
        data: {
          id: selectedModule.id,
          title: modTitle,
          description: modDesc,
          difficulty: modDiff,
          time: modTime,
          accent: modAccent,
        }
      });
      toast.success("Module parameters updated!");
      router.invalidate();
      // Update selected module local state
      setSelectedModule({
        ...selectedModule,
        title: modTitle,
        description: modDesc,
        difficulty: modDiff,
        time: modTime,
        accent: modAccent
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to update module.");
    } finally {
      setSaving(false);
    }
  };

  // Tab 2 Handler: Save Topic (Create or Update)
  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule || !editingTopic || !editingTopic.title || !editingTopic.content) {
      toast.error("Please fill in topic title and content.");
      return;
    }

    setSaving(true);
    try {
      if (editingTopic.id) {
        // Update existing
        await updateTopicFn({
          data: {
            id: editingTopic.id,
            title: editingTopic.title,
            content: editingTopic.content,
            timeToRead: editingTopic.timeToRead || "10 mins",
            index: editingTopic.index || (topics.length + 1)
          }
        });
        toast.success("Topic content updated!");
      } else {
        // Create new
        await addTopicFn({
          data: {
            moduleId: selectedModule.id,
            title: editingTopic.title,
            content: editingTopic.content,
            timeToRead: editingTopic.timeToRead || "10 mins",
            index: editingTopic.index || (topics.length + 1)
          }
        });
        toast.success("Topic added to curriculum!");
      }
      
      // Reload topics list
      const res = await getModuleTopicsFn({ data: { moduleId: selectedModule.id } });
      setTopics(res.topics as Topic[]);
      setEditingTopic(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to save topic.");
    } finally {
      setSaving(false);
    }
  };

  // Tab 2 Handler: Delete Topic
  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm("Are you sure you want to delete this topic? All progress linked to it will be removed!")) return;

    try {
      await deleteTopicFn({ data: { id: topicId } });
      toast.success("Topic deleted.");
      setTopics(topics.filter(t => t.id !== topicId));
      if (editingTopic?.id === topicId) {
        setEditingTopic(null);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete topic.");
    }
  };

  // Tab 3 Handlers: Quiz Question Editor
  const handleAddQuestion = () => {
    const newQ: Question = {
      questionText: "New Question Text?",
      options: JSON.stringify(["Option A", "Option B", "Option C", "Option D"]),
      correctAnswerIndex: 0
    };
    setQuestions([...questions, newQ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionTextChange = (index: number, val: string) => {
    const updated = [...questions];
    updated[index].questionText = val;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, val: string) => {
    const updated = [...questions];
    const opts = JSON.parse(updated[qIndex].options);
    opts[optIndex] = val;
    updated[qIndex].options = JSON.stringify(opts);
    setQuestions(updated);
  };

  const handleCorrectAnswerChange = (qIndex: number, correctIdx: number) => {
    const updated = [...questions];
    updated[qIndex].correctAnswerIndex = correctIdx;
    setQuestions(updated);
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule) return;

    setSaving(true);
    try {
      await updateQuizQuestionsFn({
        data: {
          moduleId: selectedModule.id,
          quizTitle,
          quizDescription: quizDesc,
          questions: questions.map(q => ({
            id: q.id,
            questionText: q.questionText,
            options: q.options,
            correctAnswerIndex: q.correctAnswerIndex
          }))
        }
      });
      toast.success("Quiz configuration updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save quiz.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell 
      eyebrow="Grid Curriculum Terminal" 
      title="Curriculum Manager" 
      description="Edit modules, write lesson content (markdown), and set up quiz questionnaires."
      backUrl="/admin"
    >
      <div className="max-w-6xl mx-auto mt-6">
        
        {/* Module Selection / Back Nav Header */}
        {selectedModule ? (
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedModule(null)} 
              className="glass border-white/10 text-muted-foreground hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> All Modules
            </Button>
            <div>
              <span className="text-xs uppercase tracking-widest text-cyan">Editing Module {selectedModule.index}</span>
              <h2 className="text-2xl font-bold">{selectedModule.title}</h2>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-3">Power Grid Training Modules</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((m) => (
                <div 
                  key={m.id} 
                  onClick={() => handleSelectModule(m)} 
                  className="glass group hover:border-yellow-500/30 transition-all duration-300 rounded-3xl p-6 cursor-pointer border border-white/5 relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${m.accent}`} />
                  <div className="flex items-start justify-between pl-2">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Module {m.index}</span>
                      <h4 className="font-semibold text-lg mt-1 group-hover:text-yellow-400 transition-colors">{m.title}</h4>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{m.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-medium mt-4 pl-2">
                    Open Editor <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Module Detail Panel */}
        {selectedModule && (
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            
            {/* Left Sidebar Menu */}
            <div className="lg:col-span-3 flex flex-col gap-2">
              <button 
                onClick={() => { setActiveTab("details"); setEditingTopic(null); }}
                className={`flex items-center gap-3 w-full p-4 text-left rounded-2xl border transition-all ${
                  activeTab === "details" 
                    ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400 font-medium" 
                    : "glass border-white/5 hover:border-white/10 text-muted-foreground"
                }`}
              >
                <Settings className="w-5 h-5" /> Module Parameters
              </button>
              
              <button 
                onClick={() => { setActiveTab("topics"); setEditingTopic(null); }}
                className={`flex items-center gap-3 w-full p-4 text-left rounded-2xl border transition-all ${
                  activeTab === "topics" 
                    ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400 font-medium" 
                    : "glass border-white/5 hover:border-white/10 text-muted-foreground"
                }`}
              >
                <BookOpen className="w-5 h-5" /> Lessons ({topics.length})
              </button>
              
              <button 
                onClick={() => { setActiveTab("quiz"); setEditingTopic(null); }}
                className={`flex items-center gap-3 w-full p-4 text-left rounded-2xl border transition-all ${
                  activeTab === "quiz" 
                    ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400 font-medium" 
                    : "glass border-white/5 hover:border-white/10 text-muted-foreground"
                }`}
              >
                <HelpCircle className="w-5 h-5" /> Quiz Questionnaire ({questions.length})
              </button>
            </div>

            {/* Right Editor Area */}
            <div className="lg:col-span-9 glass rounded-3xl p-6 border border-white/5">
              {loadingContent ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-yellow-400 animate-spin mb-2" />
                  <p className="text-xs text-muted-foreground">Fetching database nodes...</p>
                </div>
              ) : (
                <>
                  {/* TAB 1: MODULE PARAMETERS */}
                  {activeTab === "details" && (
                    <form onSubmit={handleUpdateModule} className="space-y-4">
                      <h3 className="text-lg font-semibold border-b border-white/5 pb-3">Module Parameters</h3>
                      
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground">Module Title</label>
                          <Input 
                            type="text" 
                            value={modTitle} 
                            onChange={(e) => setModTitle(e.target.value)} 
                            className="glass" 
                            required 
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground">Estimated Study Time</label>
                          <Input 
                            type="text" 
                            value={modTime} 
                            onChange={(e) => setModTime(e.target.value)} 
                            className="glass" 
                            placeholder="e.g. 5h" 
                            required 
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground">Difficulty Level</label>
                          <select 
                            value={modDiff} 
                            onChange={(e) => setModDiff(e.target.value)} 
                            className="w-full h-10 px-3 rounded-md border border-white/10 bg-black/40 text-sm glass text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50"
                            required
                          >
                            <option value="Beginner" className="bg-neutral-900">Beginner</option>
                            <option value="Intermediate" className="bg-neutral-900">Intermediate</option>
                            <option value="Advanced" className="bg-neutral-900">Advanced</option>
                          </select>
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground">Gradient Accent CSS Classes</label>
                          <Input 
                            type="text" 
                            value={modAccent} 
                            onChange={(e) => setModAccent(e.target.value)} 
                            className="glass font-mono" 
                            placeholder="e.g. from-electric to-cyan" 
                            required 
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">Description Summary</label>
                        <textarea 
                          value={modDesc} 
                          onChange={(e) => setModDesc(e.target.value)} 
                          className="w-full min-h-[80px] p-3 rounded-md border border-white/10 bg-black/40 text-sm glass text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50"
                          required
                        />
                      </div>

                      <div className="flex justify-end pt-3 border-t border-white/5">
                        <Button 
                          type="submit" 
                          disabled={saving}
                          className="bg-yellow-500 hover:bg-yellow-600 text-neutral-950 font-medium"
                        >
                          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                          Save Module Details
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* TAB 2: LESSONS / TOPICS */}
                  {activeTab === "topics" && (
                    <div className="space-y-4">
                      {editingTopic ? (
                        /* Topic Editor Form */
                        <form onSubmit={handleSaveTopic} className="space-y-4">
                          <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <h3 className="text-lg font-semibold">
                              {editingTopic.id ? "Edit Lesson" : "Create New Lesson"}
                            </h3>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setEditingTopic(null)}
                              className="text-muted-foreground hover:text-white"
                            >
                              Cancel
                            </Button>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-3">
                            <div className="sm:col-span-2 space-y-1.5">
                              <label className="text-xs text-muted-foreground">Lesson Title</label>
                              <Input 
                                type="text" 
                                value={editingTopic.title || ""} 
                                onChange={(e) => setEditingTopic({...editingTopic, title: e.target.value})} 
                                className="glass" 
                                placeholder="e.g. RTU Protocol Configurations"
                                required 
                              />
                            </div>
                            
                            <div className="space-y-1.5">
                              <label className="text-xs text-muted-foreground">Read Time Estimation</label>
                              <Input 
                                type="text" 
                                value={editingTopic.timeToRead || ""} 
                                onChange={(e) => setEditingTopic({...editingTopic, timeToRead: e.target.value})} 
                                className="glass" 
                                placeholder="e.g. 15 mins"
                                required 
                              />
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-1.5">
                              <label className="text-xs text-muted-foreground">Order Index</label>
                              <Input 
                                type="number" 
                                value={editingTopic.index || ""} 
                                onChange={(e) => setEditingTopic({...editingTopic, index: parseInt(e.target.value) || 0})} 
                                className="glass" 
                                required 
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground flex justify-between">
                              <span>Lesson Content (Supports Markdown syntax)</span>
                              <span className="text-[10px] text-yellow-400/80">Tip: Use standard markdown like headers (#, ##), bullets, bold, and code blocks.</span>
                            </label>
                            <textarea 
                              value={editingTopic.content || ""} 
                              onChange={(e) => setEditingTopic({...editingTopic, content: e.target.value})} 
                              className="w-full min-h-[300px] p-4 font-mono text-xs rounded-md border border-white/10 bg-black/40 glass text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50"
                              placeholder="Write your markdown lesson text here..."
                              required
                            />
                          </div>

                          <div className="flex justify-end pt-3 border-t border-white/5">
                            <Button 
                              type="submit" 
                              disabled={saving}
                              className="bg-yellow-500 hover:bg-yellow-600 text-neutral-950 font-medium"
                            >
                              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                              Save Lesson
                            </Button>
                          </div>
                        </form>
                      ) : (
                        /* Topics list view */
                        <div>
                          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                            <h3 className="text-lg font-semibold">Lesson Curriculum</h3>
                            <Button 
                              size="sm" 
                              onClick={() => setEditingTopic({ title: "", content: "", timeToRead: "10 mins", index: topics.length + 1 })}
                              className="bg-yellow-500 hover:bg-yellow-600 text-neutral-950 font-medium"
                            >
                              <Plus className="w-4 h-4 mr-1.5" /> Add Lesson
                            </Button>
                          </div>

                          {topics.length === 0 ? (
                            <div className="text-center py-12 bg-white/5 rounded-2xl">
                              <p className="text-muted-foreground text-sm">No lessons exist in this module yet.</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {topics.map((t) => (
                                <div key={t.id} className="glass border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-white/10 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-semibold text-xs text-yellow-400 font-mono">
                                      {t.index}
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-sm">{t.title}</h4>
                                      <span className="text-[10px] text-muted-foreground">{t.timeToRead} · {t.content.length} chars</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => setEditingTopic(t)}
                                      className="h-8 w-8 p-0 text-muted-foreground hover:text-white"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => handleDeleteTopic(t.id)}
                                      className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: QUIZ QUESTIONNAIRE */}
                  {activeTab === "quiz" && (
                    <form onSubmit={handleSaveQuiz} className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <h3 className="text-lg font-semibold">Quiz Questionnaire</h3>
                        <Button 
                          type="submit" 
                          disabled={saving}
                          className="bg-yellow-500 hover:bg-yellow-600 text-neutral-950 font-medium"
                        >
                          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                          Save Quiz Setup
                        </Button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground">Quiz Title</label>
                          <Input 
                            type="text" 
                            value={quizTitle} 
                            onChange={(e) => setQuizTitle(e.target.value)} 
                            className="glass" 
                            required 
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground">Quiz Description Summary</label>
                          <Input 
                            type="text" 
                            value={quizDesc} 
                            onChange={(e) => setQuizDesc(e.target.value)} 
                            className="glass" 
                            required 
                          />
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold uppercase tracking-wider text-cyan">Question List</h4>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={handleAddQuestion}
                            className="glass border-white/10 text-xs"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add Question
                          </Button>
                        </div>

                        {questions.length === 0 ? (
                          <div className="text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10">
                            <p className="text-xs text-muted-foreground">No questions configured. Click "Add Question" above to start.</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {questions.map((q, qIdx) => {
                              let parsedOpts: string[] = ["", "", "", ""];
                              try {
                                parsedOpts = JSON.parse(q.options);
                              } catch(e) {
                                // Fallback
                              }

                              return (
                                <div key={qIdx} className="glass p-5 rounded-2xl border border-white/5 space-y-4 relative">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveQuestion(qIdx)}
                                    className="absolute top-4 right-4 text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/10 rounded-lg transition"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>

                                  <div className="space-y-1.5 pr-8">
                                    <label className="text-xs text-yellow-400 font-mono">Question {qIdx + 1}</label>
                                    <Input
                                      type="text"
                                      value={q.questionText}
                                      onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                                      className="glass"
                                      placeholder="e.g. Which communication protocol operates primarily over serial RS-485 connections?"
                                      required
                                    />
                                  </div>

                                  <div className="grid gap-3 sm:grid-cols-2">
                                    {parsedOpts.map((opt, optIdx) => (
                                      <div key={optIdx} className="flex items-center gap-2">
                                        <input
                                          type="radio"
                                          name={`correct-${qIdx}`}
                                          checked={q.correctAnswerIndex === optIdx}
                                          onChange={() => handleCorrectAnswerChange(qIdx, optIdx)}
                                          className="text-yellow-500 focus:ring-0 focus:ring-offset-0 shrink-0 cursor-pointer h-4 w-4"
                                          required
                                        />
                                        <Input
                                          type="text"
                                          value={opt}
                                          onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                                          className="glass text-xs h-9"
                                          placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                          required
                                        />
                                      </div>
                                    ))}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                                    Radio checks identify the correct answer choice.
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </PageShell>
  );
}

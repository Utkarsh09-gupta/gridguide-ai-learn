import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, CheckCircle2, Circle, Clock, BookOpen, 
  ChevronLeft, ChevronRight, Send, Sparkles, Lock, Bot, AlertCircle 
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { getModuleTopicsFn, completeTopicFn } from "@/lib/auth-functions";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Server RPC function to send a grounded message to Gemini
import { createServerFn } from "@tanstack/react-start";

export const sendGroundedAIMessageFn = createServerFn()
  .validator((data: any) => data as { 
    message: string; 
    lessonTitle: string; 
    lessonContent: string; 
    moduleTitle: string 
  })
  .handler(async ({ data }) => {
    if (!import.meta.env.SSR) throw new Error("Server execution only");
    const { message, lessonTitle, lessonContent, moduleTitle } = data;
    const { getSessionCookie } = await import("../lib/auth-cookies.server");
    const { decryptSession } = await import("../lib/auth");
    const fs = await import("fs");
    const path = await import("path");

    // 1. Auth check
    const session = await getSessionCookie();
    if (!session) throw new Error("Authentication required");
    const userId = decryptSession(session);
    if (!userId) throw new Error("Authentication required");

    // 2. Read GROQ_API_KEY from environment or .env
    let apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      try {
        const envPath = path.join(process.cwd(), ".env");
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, "utf-8");
          const match = envContent.match(/GROQ_API_KEY\s*=\s*(.+)/);
          if (match) {
            apiKey = match[1].trim().replace(/^['"]|['"]$/g, "");
          }
        }
      } catch (err) {
        // ignore
      }
    }

    if (!apiKey) {
      throw new Error("GROQ_API_KEY_MISSING");
    }

    // 3. Build system prompt & request body for Groq API
    const systemPrompt = `You are "GridGuide AI", an expert SCADA, EMS, Wide-Area Monitoring (WAMS), and electrical substation automation tutor.
You are teaching a professional operator or engineer.
Keep your answers highly accurate, structured, and use standard power utility terminology.

You must ground your answers in the following study material the user is currently reading:
---
Module: ${moduleTitle}
Lesson: ${lessonTitle}
Content:
${lessonContent}
---

Answer the user's question, using the study material above as your primary reference. If they ask questions beyond the lesson, you can answer them but relate them back to SCADA and grid operations where appropriate. Use clear markdown headers and bullet points in your response.`;

    const requestBody = {
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.2
    };

    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${errText}`);
      }

      const resData = await response.json();
      const aiText = resData.choices?.[0]?.message?.content;
      if (!aiText) {
        throw new Error("Empty response from Groq API.");
      }

      return { text: aiText };
    } catch (err: any) {
      console.error("Groq API Request Failed:", err);
      throw new Error(err.message || "Failed to communicate with AI Tutor.");
    }
  });

export const Route = createFileRoute("/learning-path/$moduleId")({
  loader: async ({ params }) => {
    try {
      console.log("learning-path.$moduleId loader called with moduleId:", params.moduleId);
      const data = await getModuleTopicsFn({ data: { moduleId: params.moduleId } });
      console.log("learning-path.$moduleId loader returned successfully:", !!data);
      return data;
    } catch (err) {
      console.error("LOADER ERROR IN ROUTE:", err);
      throw err;
    }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.module.title} — GridGuide AI` },
          { name: "description", content: loaderData.module.description },
        ]
      : [{ title: "Study Course — GridGuide AI" }],
  }),
  component: ModuleStudyPage,
});

interface AIChatMessage {
  role: "user" | "ai" | "system";
  text: string;
}

function ModuleStudyPage() {
  const { module, topics: loaderTopics, completedTopics: initialCompleted, progress: initialProgress } = Route.useLoaderData();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [topics, setTopics] = useState(loaderTopics);
  const [completedTopics, setCompletedTopics] = useState<string[]>(initialCompleted);
  const [progress, setProgress] = useState(initialProgress);
  const [activeTopicIndex, setActiveTopicIndex] = useState(0);
  const [aiPanelOpen, setAiPanelOpen] = useState(true);

  // AI Chat State
  const [chatMessages, setChatMessages] = useState<AIChatMessage[]>([
    { role: "ai", text: "Hello! Ask me any questions about this specific lesson. I am grounded directly in the text you are reading." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiErrorType, setAiErrorType] = useState<"none" | "missing_key" | "general">("none");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const activeTopic = topics[activeTopicIndex] || null;

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, aiLoading]);

  // Reset chat when switching lessons
  useEffect(() => {
    setChatMessages([
      { 
        role: "ai", 
        text: `Hello! I am ready. Ask me anything about "${activeTopic?.title || 'this lesson'}"!` 
      }
    ]);
    setAiErrorType("none");
  }, [activeTopicIndex]);

  // Handle Mark Complete toggle
  const handleToggleComplete = async (topicId: string) => {
    if (!user) {
      toast.error("Authentication required to save progress.");
      return;
    }

    const isCurrentlyCompleted = completedTopics.includes(topicId);
    try {
      const res = await completeTopicFn({
        data: {
          moduleId: module.id,
          topicId,
          completed: !isCurrentlyCompleted,
        }
      });
      if (res.success) {
        setCompletedTopics(res.completedTopics);
        setProgress(res.progress);
        toast.success(
          !isCurrentlyCompleted 
            ? "Topic marked complete!" 
            : "Topic marked incomplete."
        );
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update progress.");
    }
  };

  // Handle AI Message Submit
  const handleSendAIMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || aiLoading || !activeTopic) return;

    if (!user) {
      toast.error("Please log in to chat with the AI Tutor.");
      return;
    }

    const messageText = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: "user", text: messageText }]);
    setChatInput("");
    setAiLoading(true);
    setAiErrorType("none");

    try {
      const res = await sendGroundedAIMessageFn({
        data: {
          message: messageText,
          lessonTitle: activeTopic.title,
          lessonContent: activeTopic.content,
          moduleTitle: module.title
        }
      });
      setChatMessages((prev) => [...prev, { role: "ai", text: res.text }]);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("GROQ_API_KEY_MISSING")) {
        setAiErrorType("missing_key");
        setChatMessages((prev) => [
          ...prev, 
          { 
            role: "system", 
            text: "ERROR: Groq API Key is missing. Follow the steps below to configure it." 
          }
        ]);
      } else {
        setAiErrorType("general");
        toast.error(err.message || "AI Assistant error occurred.");
      }
    } finally {
      setAiLoading(false);
    }
  };

  // Simple custom Markdown to JSX parser
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    let inCodeBlock = false;
    let codeContent: string[] = [];

    return lines.map((line, idx) => {
      // Code block start/end
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          inCodeBlock = false;
          const codeText = codeContent.join("\n");
          codeContent = [];
          return (
            <pre key={idx} className="bg-navy-deep/80 border border-white/10 rounded-xl p-4 my-4 overflow-x-auto font-mono text-xs text-cyan">
              <code>{codeText}</code>
            </pre>
          );
        } else {
          inCodeBlock = true;
          return null;
        }
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return null;
      }

      // Headings
      if (line.startsWith("### ")) {
        return (
          <h3 key={idx} className="text-xl font-semibold mt-7 mb-3 text-cyan border-b border-white/5 pb-2">
            {line.replace("### ", "")}
          </h3>
        );
      }
      if (line.startsWith("#### ")) {
        return (
          <h4 key={idx} className="text-lg font-semibold mt-5 mb-2 text-white">
            {line.replace("#### ", "")}
          </h4>
        );
      }

      // Bullet items
      if (line.trim().startsWith("* ")) {
        return (
          <li key={idx} className="ml-6 list-disc text-sm text-muted-foreground my-1.5">
            {parseInlineMarkup(line.trim().replace("* ", ""))}
          </li>
        );
      }
      if (line.trim().startsWith("1. ") || line.trim().startsWith("2. ") || line.trim().startsWith("3. ")) {
        return (
          <li key={idx} className="ml-6 list-decimal text-sm text-muted-foreground my-1.5">
            {parseInlineMarkup(line.trim().replace(/^\d+\.\s+/, ""))}
          </li>
        );
      }

      // Dividers
      if (line.trim() === "---") {
        return <hr key={idx} className="my-6 border-white/10" />;
      }

      // Paragraph
      if (line.trim() === "") {
        return <div key={idx} className="h-3" />;
      }

      return (
        <p key={idx} className="text-sm text-muted-foreground leading-relaxed my-2.5">
          {parseInlineMarkup(line)}
        </p>
      );
    });
  };

  // Parse bold and inline code styling
  const parseInlineMarkup = (text: string) => {
    // Basic regex replacements for presentation
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={i} className="bg-white/5 border border-white/10 px-1 py-0.5 rounded font-mono text-xs text-cyan">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <PageShell 
      eyebrow={`Module ${module.index}`} 
      title={module.title} 
      description={module.description}
    >
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-6">
        <Link to="/learning-path">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to learning path
        </Link>
      </Button>

      {/* Main Grid Layout: Sidebar, Lesson Reader, AI Tutor Panel */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        
        {/* LEFT COLUMN: Sidebar Lesson list (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass rounded-2xl p-5 border border-white/10 relative overflow-hidden">
            <h4 className="font-semibold text-sm mb-2 text-white">Course Progress</h4>
            <div className="flex items-center justify-between text-xs mb-1.5 text-muted-foreground">
              <span>Lessons completed</span>
              <span className="font-semibold text-cyan">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 mb-2" />
            <div className="text-[10px] text-muted-foreground">
              {!user ? "Login to save your reading progress." : "Your progress is saved dynamically."}
            </div>
          </div>

          <div className="glass rounded-2xl p-4 space-y-1.5 max-h-[60vh] overflow-y-auto">
            <div className="px-2 pb-2 border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Lessons Checklist
            </div>
            {topics.length === 0 ? (
              <div className="text-xs text-muted-foreground p-3 text-center">No lessons in this module.</div>
            ) : (
              topics.map((t, idx) => {
                const isActive = idx === activeTopicIndex;
                const isCompleted = completedTopics.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTopicIndex(idx)}
                    className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition text-xs border ${
                      isActive 
                        ? "bg-white/5 border-cyan/30 text-white" 
                        : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-cyan" />
                      ) : (
                        <Circle className="w-4 h-4 text-white/20" />
                      )}
                    </span>
                    <div className="space-y-0.5">
                      <div className="font-medium line-clamp-2 leading-tight">{t.title}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {t.timeToRead}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* MIDDLE COLUMN: Lesson Content Reader (9 cols, or 6 cols if AI open) */}
        <div className={`transition-all duration-300 ${aiPanelOpen ? "lg:col-span-6" : "lg:col-span-9"}`}>
          {activeTopic ? (
            <div className="glass-strong rounded-3xl p-6 md:p-8 border border-white/10">
              
              {/* Header Toolbar */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6 flex-wrap gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-cyan font-mono bg-cyan/10 px-2 py-0.5 rounded">
                    Lesson {activeTopic.index}
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-1">{activeTopic.title}</h2>
                </div>

                {/* Progress Toggle */}
                <Button
                  onClick={() => handleToggleComplete(activeTopic.id)}
                  variant={completedTopics.includes(activeTopic.id) ? "default" : "outline"}
                  size="sm"
                  className={`glass ${
                    completedTopics.includes(activeTopic.id) 
                      ? "bg-cyan text-primary-foreground border-transparent hover:bg-cyan/90" 
                      : "border-white/15 text-cyan hover:bg-white/5"
                  }`}
                >
                  {completedTopics.includes(activeTopic.id) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Completed
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4 mr-1.5" /> Mark Complete
                    </>
                  )}
                </Button>
              </div>

              {/* Study Material Content */}
              <article className="prose prose-invert max-w-none text-muted-foreground min-h-[40vh]">
                {renderMarkdown(activeTopic.content)}
              </article>

              {/* Navigation Footer */}
              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between gap-4">
                <Button
                  disabled={activeTopicIndex === 0}
                  onClick={() => setActiveTopicIndex(activeTopicIndex - 1)}
                  variant="outline"
                  size="sm"
                  className="glass border-white/15 text-xs"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>

                {/* AI Toggle Button on smaller screens, always useful */}
                <Button
                  onClick={() => setAiPanelOpen(!aiPanelOpen)}
                  variant="outline"
                  size="sm"
                  className={`glass border-white/15 text-xs ${aiPanelOpen ? "text-cyan border-cyan/30" : ""}`}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" /> 
                  {aiPanelOpen ? "Close AI Tutor" : "Ask AI Tutor"}
                </Button>

                <Button
                  disabled={activeTopicIndex === topics.length - 1}
                  onClick={() => setActiveTopicIndex(activeTopicIndex + 1)}
                  variant="outline"
                  size="sm"
                  className="glass border-white/15 text-xs"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

            </div>
          ) : (
            <div className="glass rounded-3xl p-12 text-center text-muted-foreground">
              Select a lesson from the checklist to begin.
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Grounded AI Tutor panel (3 cols, toggleable) */}
        {aiPanelOpen && (
          <div className="lg:col-span-3">
            <div className="glass-strong rounded-3xl border border-white/10 flex flex-col h-[65vh] overflow-hidden relative">
              
              {/* AI Header */}
              <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-electric to-cyan grid place-items-center">
                    <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-white">Lesson AI Tutor</h4>
                    <span className="text-[9px] text-cyan block font-mono">Grounded mode active</span>
                  </div>
                </div>
              </div>

              {/* Guest Lock Screen */}
              {!user && (
                <div className="absolute inset-0 bg-navy-deep/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center">
                  <Lock className="w-10 h-10 text-cyan mb-3 animate-pulse" />
                  <h5 className="font-semibold text-sm text-white">Tutor Terminal Locked</h5>
                  <p className="text-xs text-muted-foreground mt-2 max-w-xs">
                    Please access the SCADA gateway and log in to consult the active learning assistant.
                  </p>
                  <Button asChild size="sm" className="mt-4 bg-gradient-to-r from-electric to-cyan text-primary-foreground border-0">
                    <Link to="/auth">Access Terminal</Link>
                  </Button>
                </div>
              )}

              {/* Chat Thread */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : ""}`}
                  >
                    {msg.role === "ai" && (
                      <div className="w-6 h-6 rounded bg-gradient-to-br from-electric to-cyan grid place-items-center text-[10px] shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-primary-foreground animate-pulse" />
                      </div>
                    )}
                    <div 
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                        msg.role === "user" 
                          ? "bg-electric text-primary-foreground" 
                          : msg.role === "system"
                          ? "bg-destructive/15 text-destructive border border-destructive/20 font-mono"
                          : "glass text-muted-foreground"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {aiLoading && (
                  <div className="flex gap-2.5">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-electric to-cyan grid place-items-center text-[10px] shrink-0">
                      <Bot className="w-3.5 h-3.5 text-primary-foreground animate-pulse" />
                    </div>
                    <div className="glass text-muted-foreground rounded-xl px-3 py-2 text-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}

                {/* API Key Missing Guidance Alert */}
                {aiErrorType === "missing_key" && (
                  <div className="glass border border-warning/30 bg-warning/5 rounded-xl p-3.5 space-y-2 mt-2">
                    <div className="flex items-center gap-2 text-warning text-xs font-semibold">
                      <AlertCircle className="w-4 h-4" />
                      Groq API Key Required
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-normal">
                      To activate the live AI tutor, you need to add your Groq API Key:
                    </p>
                    <ol className="text-[9px] text-muted-foreground list-decimal pl-4 space-y-1">
                      <li>Create a file named <code className="bg-white/5 px-1 py-0.5 rounded font-mono text-cyan">.env</code> in the root of the project.</li>
                      <li>Add the line: <code className="bg-white/5 px-1 py-0.5 rounded font-mono text-cyan">GROQ_API_KEY=your_actual_key</code></li>
                      <li>Restart the development server.</li>
                    </ol>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendAIMessage} className="p-3 border-t border-white/10 flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Ask about ${activeTopic?.title || "this lesson"}...`}
                  className="glass border-white/15 h-9 text-xs"
                  disabled={aiLoading}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="h-9 w-9 bg-gradient-to-r from-electric to-cyan text-primary-foreground border-0 shrink-0"
                  disabled={aiLoading}
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>

            </div>
          </div>
        )}

      </div>
    </PageShell>
  );
}

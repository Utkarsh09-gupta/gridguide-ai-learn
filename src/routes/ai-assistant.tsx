import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, User, AlertCircle, Loader2 } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "../hooks/useAuth";
import { sendGeneralAIMessageFn } from "../lib/auth-functions";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/ai-assistant")({
  head: () => ({ 
    meta: [
      { title: "AI Assistant — GridGuide AI" }, 
      { name: "description", content: "Ask your AI tutor about SCADA, EMS, protection and grid operations." }
    ] 
  }),
  component: AIAssistant,
});

const suggestions = [
  "Explain IEC 60870-5-104 in 2 lines",
  "How does AGC work?",
  "What is a PMU and why do we need it?",
  "Difference between CT and PT",
];

interface Msg { 
  role: "user" | "ai" | "system"; 
  text: string;
}

function AIAssistant() {
  const { user, loading: authLoading } = useAuth();
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "Hi! I'm your GridGuide AI tutor. Ask me anything about SCADA, EMS, protection, substation automation, or power grid operations." },
  ]);
  const [input, setInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiErrorType, setAiErrorType] = useState<"none" | "missing_key" | "general">("none");

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiLoading]);

  const send = async (text: string) => {
    if (!text.trim() || aiLoading) return;
    if (!user) {
      toast.error("Please log in to chat with the AI Tutor.");
      return;
    }

    const userMsg: Msg = { role: "user", text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setAiLoading(true);
    setAiErrorType("none");

    try {
      const res = await sendGeneralAIMessageFn({
        data: {
          messages: updatedMessages
        }
      });
      setMessages((prev) => [...prev, { role: "ai", text: res.text }]);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("GROQ_API_KEY_MISSING")) {
        setAiErrorType("missing_key");
        setMessages((prev) => [
          ...prev, 
          { 
            role: "system", 
            text: "ERROR: Groq API Key is missing. Follow the steps below to configure it." 
          }
        ]);
      } else {
        setAiErrorType("general");
        toast.error(err.message || "An error occurred while contacting the AI Assistant.");
      }
    } finally {
      setAiLoading(false);
    }
  };

  // Custom Markdown parser for rich text replies
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
            <pre key={idx} className="bg-navy-deep/80 border border-white/10 rounded-xl p-4 my-3 overflow-x-auto font-mono text-xs text-cyan">
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
          <h3 key={idx} className="text-base font-semibold mt-4 mb-2 text-cyan border-b border-white/5 pb-1">
            {line.replace("### ", "")}
          </h3>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={idx} className="text-lg font-bold mt-5 mb-3 text-cyan border-b border-white/5 pb-1">
            {line.replace("## ", "")}
          </h2>
        );
      }
      if (line.startsWith("# ")) {
        return (
          <h1 key={idx} className="text-xl font-extrabold mt-6 mb-4 text-cyan">
            {line.replace("# ", "")}
          </h1>
        );
      }

      // Unordered lists
      if (line.startsWith("- ") || line.startsWith("* ")) {
        const content = line.substring(2);
        return (
          <li key={idx} className="text-sm list-disc list-inside text-muted-foreground ml-2 my-1 leading-relaxed">
            {parseInlineStyles(content)}
          </li>
        );
      }

      // Normal lines
      if (line.trim() === "") {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-sm text-muted-foreground leading-relaxed my-1.5">
          {parseInlineStyles(line)}
        </p>
      );
    });
  };

  // Parse bold and inline code styling inside markdown text
  const parseInlineStyles = (text: string) => {
    // Escape markdown markers with styling tags
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={i} className="bg-white/5 px-1 py-0.5 rounded font-mono text-cyan text-xs">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <PageShell eyebrow="AI Tutor" title="Ask GridGuide AI" description="Available 24/7 · trained on power-system domain knowledge.">
      
      {authLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-cyan animate-spin mb-2" />
          <p className="text-xs text-muted-foreground">Authenticating credentials...</p>
        </div>
      ) : !user ? (
        <div className="text-center py-16 glass rounded-3xl p-8 max-w-md mx-auto border border-white/5">
          <Bot className="w-12 h-12 text-cyan mx-auto mb-4 animate-bounce" />
          <h3 className="font-semibold text-lg mb-2">Authentication Required</h3>
          <p className="text-xs text-muted-foreground mb-6">
            You must be logged into your account to interact with the GridGuide AI tutor.
          </p>
          <Button asChild className="bg-gradient-to-r from-electric to-cyan text-primary-foreground border-0 glow-primary">
            <Link to="/auth" search={{ redirect: "/ai-assistant" }}>Login to Account</Link>
          </Button>
        </div>
      ) : (
        <div className="glass-strong rounded-3xl p-4 md:p-6 flex flex-col h-[65vh]">
          
          {/* Messages Panel */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "ai" && (
                  <div className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-electric to-cyan shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                
                {m.role === "system" ? (
                  <div className="w-full text-center text-xs font-mono text-red-400 py-2 border-y border-red-500/10 bg-red-500/5 rounded-xl">
                    {m.text}
                  </div>
                ) : (
                  <div className={`max-w-xl rounded-2xl px-4 py-2.5 ${
                    m.role === "user" 
                      ? "bg-electric text-primary-foreground font-medium text-sm" 
                      : "glass border border-white/5 text-muted-foreground"
                  }`}>
                    {m.role === "user" ? m.text : renderMarkdown(m.text)}
                  </div>
                )}

                {m.role === "user" && (
                  <div className="grid place-items-center w-8 h-8 rounded-lg bg-white/10 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* AI Typing animation */}
            {aiLoading && (
              <div className="flex gap-3">
                <div className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-electric to-cyan shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground animate-pulse" />
                </div>
                <div className="glass border border-white/5 rounded-xl px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            {/* API Key Missing Alert */}
            {aiErrorType === "missing_key" && (
              <div className="glass border border-warning/30 bg-warning/5 rounded-2xl p-4 space-y-2 mt-2 max-w-md ml-11">
                <div className="flex items-center gap-2 text-warning text-xs font-semibold">
                  <AlertCircle className="w-4 h-4" />
                  Groq API Key Required
                </div>
                <p className="text-[10px] text-muted-foreground leading-normal">
                  To operate the live AI Assistant, you need to configure a Groq API Key:
                </p>
                <ol className="text-[9px] text-muted-foreground list-decimal pl-4 space-y-1">
                  <li>Create a file named <code className="bg-white/5 px-1 py-0.5 rounded font-mono text-cyan">.env</code> in the root of the project directory.</li>
                  <li>Add the line: <code className="bg-white/5 px-1 py-0.5 rounded font-mono text-cyan">GROQ_API_KEY=your_actual_key</code></li>
                  <li>Or add <code className="bg-white/5 px-1 py-0.5 rounded font-mono text-cyan">GROQ_API_KEY</code> on your Render settings page.</li>
                  <li>Restart the server environment.</li>
                </ol>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Footer with suggestions and input form */}
          <div className="pt-4 border-t border-white/10">
            {!aiLoading && messages.length <= 2 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {suggestions.map((s) => (
                  <button 
                    key={s} 
                    onClick={() => send(s)} 
                    className="text-xs glass rounded-full px-3 py-1.5 hover:border-electric/40 inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-cyan" /> {s}
                  </button>
                ))}
              </div>
            )}
            
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about SCADA polling, protection settings, load flow…"
                className="glass border-white/15 h-11 focus-visible:ring-cyan/50"
              />
              <Button 
                type="submit" 
                disabled={aiLoading}
                className="h-11 px-5 bg-gradient-to-r from-electric to-cyan text-primary-foreground border-0 glow-primary"
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </div>

        </div>
      )}
    </PageShell>
  );
}

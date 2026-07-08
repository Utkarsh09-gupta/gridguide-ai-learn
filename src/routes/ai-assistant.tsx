import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/ai-assistant")({
  head: () => ({ meta: [{ title: "AI Assistant — GridGuide AI" }, { name: "description", content: "Ask your AI tutor about SCADA, EMS, protection and grid operations." }] }),
  component: AIAssistant,
});

const suggestions = [
  "Explain IEC 60870-5-104 in 2 lines",
  "How does AGC work?",
  "What is a PMU and why do we need it?",
  "Difference between CT and PT",
];

interface Msg { role: "user" | "ai"; text: string }

function AIAssistant() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "Hi! I'm your GridGuide AI tutor. Ask me anything about SCADA, EMS, protection or grid operations." },
  ]);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }, { role: "ai", text: "(demo) I'd walk you through this concept step-by-step with diagrams and references." }]);
    setInput("");
  };

  return (
    <PageShell eyebrow="AI Tutor" title="Ask GridGuide AI" description="Available 24/7 · trained on power-system domain knowledge.">
      <div className="glass-strong rounded-3xl p-4 md:p-6 flex flex-col h-[65vh]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "ai" && (
                <div className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-electric to-cyan shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div className={`max-w-md rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-electric text-primary-foreground" : "glass"}`}>
                {m.text}
              </div>
              {m.role === "user" && (
                <div className="grid place-items-center w-8 h-8 rounded-lg bg-white/10 shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-white/10">
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestions.map((s) => (
              <button key={s} onClick={() => send(s)} className="text-xs glass rounded-full px-3 py-1.5 hover:border-electric/40 inline-flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan" /> {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about SCADA polling, protection settings, load flow…"
              className="glass border-white/15 h-11"
            />
            <Button type="submit" className="h-11 bg-gradient-to-r from-electric to-cyan text-primary-foreground border-0">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}

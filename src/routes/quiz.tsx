import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, XCircle, Trophy, RotateCcw } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/quiz")({
  head: () => ({ meta: [{ title: "Quiz — GridGuide AI" }, { name: "description", content: "Test yourself on SCADA, protection, EMS and grid operations." }] }),
  component: Quiz,
});

const questions = [
  {
    q: "Which protocol is commonly used between SCADA master and RTU over TCP/IP?",
    options: ["IEC 60870-5-101", "IEC 60870-5-104", "Modbus ASCII", "HART"],
    a: 1,
  },
  {
    q: "The primary purpose of a PMU is to measure:",
    options: ["Insulation resistance", "Synchrophasors", "Harmonic distortion only", "DC offset"],
    a: 1,
  },
  {
    q: "AGC in an EMS primarily regulates:",
    options: ["Voltage", "Frequency and tie-line flows", "Reactive power only", "Transformer tap"],
    a: 1,
  },
  {
    q: "IEC 61850 is a standard for:",
    options: ["Substation automation", "HVDC control", "PLCC modems", "Fire protection"],
    a: 0,
  },
];

function Quiz() {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[i];
  const next = () => {
    if (picked === null) return;
    const s = picked === q.a ? score + 1 : score;
    setScore(s);
    setPicked(null);
    if (i + 1 >= questions.length) setDone(true);
    else setI(i + 1);
  };
  const reset = () => { setI(0); setPicked(null); setScore(0); setDone(false); };

  return (
    <PageShell eyebrow="Test yourself" title="Quick Quiz" description="A short 4-question set on grid & SCADA fundamentals.">
      <div className="max-w-2xl mx-auto glass-strong rounded-3xl p-8">
        {!done ? (
          <>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Question {i + 1} of {questions.length}</span>
              <span>Score {score}</span>
            </div>
            <h2 className="mt-4 text-2xl font-semibold">{q.q}</h2>
            <div className="mt-6 space-y-3">
              {q.options.map((o, idx) => {
                const isPicked = picked === idx;
                const correct = picked !== null && idx === q.a;
                const wrong = picked !== null && isPicked && idx !== q.a;
                return (
                  <button
                    key={o}
                    disabled={picked !== null}
                    onClick={() => setPicked(idx)}
                    className={cn(
                      "w-full text-left glass rounded-xl px-4 py-3 border transition",
                      isPicked && "border-electric/60",
                      correct && "border-success/60 bg-success/10",
                      wrong && "border-destructive/60 bg-destructive/10",
                    )}
                  >
                    <span className="flex items-center justify-between">
                      <span>{o}</span>
                      {correct && <CheckCircle2 className="w-4 h-4 text-success" />}
                      {wrong && <XCircle className="w-4 h-4 text-destructive" />}
                    </span>
                  </button>
                );
              })}
            </div>
            <Button onClick={next} disabled={picked === null} className="mt-6 bg-gradient-to-r from-electric to-cyan text-primary-foreground border-0">
              {i + 1 === questions.length ? "Finish" : "Next"}
            </Button>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="mx-auto grid place-items-center w-16 h-16 rounded-2xl bg-gradient-to-br from-electric to-cyan glow-primary">
              <Trophy className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="mt-5 text-3xl font-semibold text-gradient">Nice work!</h2>
            <p className="mt-2 text-muted-foreground">You scored {score} / {questions.length}</p>
            <Button onClick={reset} variant="outline" className="mt-6 glass border-white/15">
              <RotateCcw className="w-4 h-4 mr-1.5" /> Try again
            </Button>
          </div>
        )}
      </div>
    </PageShell>
  );
}

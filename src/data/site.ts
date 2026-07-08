import { BookOpen, Bot, Cpu, Download, Home, ListChecks, User, Info } from "lucide-react";

export const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/learning-path", label: "Learning Path", icon: BookOpen },
  { to: "/equipment", label: "Equipment Explorer", icon: Cpu },
  { to: "/ai-assistant", label: "AI Assistant", icon: Bot },
  { to: "/quiz", label: "Quiz", icon: ListChecks },
  { to: "/downloads", label: "Downloads", icon: Download },
  { to: "/about", label: "About", icon: Info },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export const stats = [
  { value: "20+", label: "Learning Modules" },
  { value: "150+", label: "Engineering Topics" },
  { value: "100+", label: "Illustrations" },
  { value: "24/7", label: "AI Tutor" },
];

export const whyPoints = [
  { title: "One Platform", desc: "SCADA, EMS, protection, comms — everything in one place." },
  { title: "Interactive Learning", desc: "Animated flowcharts and hands-on modules." },
  { title: "Real Internship Images", desc: "Photos from LDCs and substations, not stock art." },
  { title: "AI Assistant", desc: "Ask any power-system question, get instant answers." },
  { title: "Practical Notes", desc: "Concise, exam-ready and interview-ready notes." },
  { title: "Interview Questions", desc: "Curated question bank from UPSLDC, PGCIL, RLDC." },
  { title: "Flowcharts", desc: "Visualize signal flow from CT/PT to control centre." },
  { title: "Quizzes", desc: "Test yourself with topic-wise MCQs and scores." },
];

export const recentLearning = [
  { title: "SCADA", progress: 65 },
  { title: "Communication", progress: 30 },
  { title: "Protection", progress: 10 },
];

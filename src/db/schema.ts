import { sqliteTable, text, integer, primaryKey, blob } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  organization: text("organization").default("UPSLDC"),
  role: text("role").default("user").notNull(), // 'user' | 'admin'
  streakCount: integer("streak_count").default(0).notNull(),
  lastActiveAt: integer("last_active_at"),
  createdAt: integer("created_at").notNull(),
});

export const modules = sqliteTable("modules", {
  id: text("id").primaryKey(),
  index: integer("index").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(), // 'Beginner' | 'Intermediate' | 'Advanced'
  time: text("time").notNull(),
  accent: text("accent").notNull(),
});

export const equipment = sqliteTable("equipment", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  full: text("full").notNull(),
  tag: text("tag").notNull(),
  description: text("description").notNull(),
  detailedContent: text("detailed_content"),
  standards: text("standards"),
  interfaces: text("interfaces"),
  imageUrl: text("image_url"),
});

export const userProgress = sqliteTable("user_progress", {
  userId: text("user_id").notNull().references(() => users.id),
  moduleId: text("module_id").notNull().references(() => modules.id),
  progress: integer("progress").default(0).notNull(),
  completedTopics: text("completed_topics").default("[]").notNull(), // JSON array string
  updatedAt: integer("updated_at").notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.moduleId] })
}));

export const quizzes = sqliteTable("quizzes", {
  id: text("id").primaryKey(),
  moduleId: text("module_id").notNull().references(() => modules.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
});

export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  quizId: text("quiz_id").notNull().references(() => quizzes.id),
  questionText: text("question_text").notNull(),
  options: text("options").notNull(), // JSON array string
  correctAnswerIndex: integer("correct_answer_index").notNull(),
});

export const userScores = sqliteTable("user_scores", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  quizId: text("quiz_id").notNull().references(() => quizzes.id),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  completedAt: integer("completed_at").notNull(),
});

export const chatHistory = sqliteTable("chat_history", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  role: text("role").notNull(), // 'user' | 'model'
  messageText: text("message_text").notNull(),
  timestamp: integer("timestamp").notNull(),
});

export const topics = sqliteTable("topics", {
  id: text("id").primaryKey(),
  moduleId: text("module_id").notNull().references(() => modules.id),
  index: integer("index").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(), // Detailed markdown content
  timeToRead: text("time_to_read").notNull(), // e.g. "15 mins"
});

export const internshipLogs = sqliteTable("internship_logs", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  tag: text("tag").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  content: text("content").notNull(),
});

export const downloads = sqliteTable("downloads", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  filename: text("filename").notNull(),
  size: text("size").notNull(),
  type: text("type").notNull(),
  topic: text("topic").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const attachments = sqliteTable("attachments", {
  id: text("id").primaryKey(),
  data: blob("data", { mode: "buffer" }).notNull(),
  mimeType: text("mime_type").notNull(),
  createdAt: integer("created_at").notNull(),
});


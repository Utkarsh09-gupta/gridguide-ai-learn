"use server";

import { createServerFn } from "@tanstack/react-start";

export const getCurrentUserFn = createServerFn()
  .handler(async () => {
    if (!import.meta.env.SSR) return null;
    const { getSessionCookie } = await import("./auth-cookies.server");
    const { decryptSession } = await import("./auth");
    const { db } = await import("../db/client");
    const { users } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");

    try {
      const session = await getSessionCookie();
      if (!session) return null;
      const userId = decryptSession(session);
      if (!userId) return null;
      
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) return null;
      
      const { passwordHash, ...safeUser } = user;
      return safeUser;
    } catch (e) {
      return null;
    }
  });

export const loginFn = createServerFn()
  .validator((data: any) => data as { email: string; password: string })
  .handler(async ({ data }) => {
    if (!import.meta.env.SSR) throw new Error("Server functions can only be executed on the server");
    const email = data.email.trim().toLowerCase();
    const { password } = data;
    const { setSessionCookie } = await import("./auth-cookies.server");
    const { db } = await import("../db/client");
    const { users } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    const { verifyPassword, encryptSession } = await import("./auth");

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) throw new Error("Invalid email or password");
    
    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) throw new Error("Invalid email or password");
    
    const token = encryptSession(user.id);
    await setSessionCookie(token);
    
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  });

export const signupFn = createServerFn()
  .validator((data: any) => data as { name: string; email: string; password: string; organization: string })
  .handler(async ({ data }) => {
    if (!import.meta.env.SSR) throw new Error("Server functions can only be executed on the server");
    const email = data.email.trim().toLowerCase();
    const { name, password, organization } = data;
    const { setSessionCookie } = await import("./auth-cookies.server");
    const { db } = await import("../db/client");
    const { users } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    const { hashPassword, encryptSession } = await import("./auth");
    const crypto = await import("crypto");

    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) throw new Error("Email already registered");
    
    const userId = crypto.randomUUID();
    const hashedPassword = hashPassword(password);
    
    await db.insert(users).values({
      id: userId,
      name,
      email,
      passwordHash: hashedPassword,
      organization: organization || "UPSLDC",
      streakCount: 1,
      lastActiveAt: Date.now(),
      createdAt: Date.now(),
    });
    
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const token = encryptSession(userId);
    await setSessionCookie(token);
    
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  });

export const logoutFn = createServerFn()
  .handler(async () => {
    if (!import.meta.env.SSR) return { success: true };
    const { deleteSessionCookie } = await import("./auth-cookies.server");
    await deleteSessionCookie();
    return { success: true };
  });

export const getUserProfileStatsFn = createServerFn()
  .handler(async () => {
    if (!import.meta.env.SSR) return null;
    const { getSessionCookie } = await import("./auth-cookies.server");
    const { decryptSession } = await import("./auth");
    const { db } = await import("../db/client");
    const { users, modules, userProgress, userScores } = await import("../db/schema");
    const { eq, sql } = await import("drizzle-orm");

    const session = await getSessionCookie();
    if (!session) return null;
    const userId = decryptSession(session);
    if (!userId) return null;

    // Get user details
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return null;

    // Get progress rows with module titles
    const progressRows = await db
      .select({
        title: modules.title,
        progress: userProgress.progress,
      })
      .from(userProgress)
      .innerJoin(modules, eq(userProgress.moduleId, modules.id))
      .where(eq(userProgress.userId, userId));

    const completedModulesCount = progressRows.filter((r) => r.progress === 100).length;

    // Get total quizzes taken
    const [scoreCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(userScores)
      .where(eq(userScores.userId, userId));

    return {
      user: {
        name: user.name,
        email: user.email,
        organization: user.organization,
        streakCount: user.streakCount,
      },
      progress: progressRows.length > 0 ? progressRows : [
        { title: "Power System Fundamentals", progress: 0 },
        { title: "SCADA", progress: 0 },
        { title: "Communication", progress: 0 }
      ],
      stats: {
        modulesCount: progressRows.length,
        completedModules: completedModulesCount,
        quizzesTaken: scoreCount?.count || 0,
      },
    };
  });

export const getModuleTopicsFn = createServerFn()
  .validator((data: any) => data as { moduleId: string })
  .handler(async ({ data }) => {
    if (!import.meta.env.SSR) return { module: null, topics: [], completedTopics: [], progress: 0 };
    const { moduleId } = data;
    console.log("getModuleTopicsFn handler executed. moduleId:", moduleId);
    const { db } = await import("../db/client");
    const { topics, modules, userProgress } = await import("../db/schema");
    const { eq, and } = await import("drizzle-orm");

    // Fetch module info
    const [mod] = await db.select().from(modules).where(eq(modules.id, moduleId));
    if (!mod) throw new Error("Module not found");

    // Fetch all topics/lessons in this module
    const moduleTopics = await db
      .select()
      .from(topics)
      .where(eq(topics.moduleId, moduleId))
      .orderBy(topics.index);

    // Fetch user progress if logged in
    let completedList: string[] = [];
    let progressPercent = 0;
    
    try {
      const { getSessionCookie } = await import("./auth-cookies.server");
      const { decryptSession } = await import("./auth");
      const session = await getSessionCookie();
      if (session) {
        const userId = decryptSession(session);
        if (userId) {
          const [prog] = await db
            .select()
            .from(userProgress)
            .where(and(eq(userProgress.userId, userId), eq(userProgress.moduleId, moduleId)));
          
          if (prog) {
            completedList = JSON.parse(prog.completedTopics);
            progressPercent = prog.progress;
          }
        }
      }
    } catch (e) {
      completedList = [];
      progressPercent = 0;
    }

    return {
      module: mod,
      topics: moduleTopics,
      completedTopics: completedList,
      progress: progressPercent,
    };
  });

export const completeTopicFn = createServerFn()
  .validator((data: any) => data as { moduleId: string; topicId: string; completed: boolean })
  .handler(async ({ data }) => {
    if (!import.meta.env.SSR) throw new Error("Server functions can only be executed on the server");
    const { moduleId, topicId, completed } = data;
    const { getSessionCookie } = await import("./auth-cookies.server");
    const { decryptSession } = await import("./auth");
    const { db } = await import("../db/client");
    const { topics, userProgress } = await import("../db/schema");
    const { eq, and } = await import("drizzle-orm");

    const session = await getSessionCookie();
    if (!session) throw new Error("Authentication required");
    const userId = decryptSession(session);
    if (!userId) throw new Error("Authentication required");

    // Fetch all topics in this module to compute percentage
    const allTopics = await db
      .select({ id: topics.id })
      .from(topics)
      .where(eq(topics.moduleId, moduleId));
    
    if (allTopics.length === 0) throw new Error("No topics in this module");

    // Fetch existing progress
    let completedList: string[] = [];
    const [prog] = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.moduleId, moduleId)));

    if (prog) {
      try {
        completedList = JSON.parse(prog.completedTopics);
      } catch (e) {
        completedList = [];
      }
    }

    // Update completed topics list
    if (completed) {
      if (!completedList.includes(topicId)) {
        completedList.push(topicId);
      }
    } else {
      completedList = completedList.filter((id) => id !== topicId);
    }

    // Compute progress percent
    const progressPercent = Math.round((completedList.length / allTopics.length) * 100);

    // Upsert user progress row
    if (prog) {
      await db
        .update(userProgress)
        .set({
          progress: progressPercent,
          completedTopics: JSON.stringify(completedList),
          updatedAt: Date.now(),
        })
        .where(and(eq(userProgress.userId, userId), eq(userProgress.moduleId, moduleId)));
    } else {
      await db
        .insert(userProgress)
        .values({
          userId,
          moduleId,
          progress: progressPercent,
          completedTopics: JSON.stringify(completedList),
          updatedAt: Date.now(),
        });
    }

    return {
      success: true,
      completedTopics: completedList,
      progress: progressPercent,
    };
  });

export const getEquipmentListFn = createServerFn()
  .handler(async () => {
    if (!import.meta.env.SSR) return [];
    const { db } = await import("../db/client");
    const { equipment } = await import("../db/schema");
    try {
      const list = await db.select().from(equipment);
      return list;
    } catch (e) {
      console.error("Error in getEquipmentListFn:", e);
      return [];
    }
  });

export const getEquipmentByIdFn = createServerFn()
  .validator((data: any) => data as { id: string })
  .handler(async ({ data }) => {
    if (!import.meta.env.SSR) return null;
    const { id } = data;
    const { db } = await import("../db/client");
    const { equipment } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    try {
      const [item] = await db.select().from(equipment).where(eq(equipment.id, id));
      return item || null;
    } catch (e) {
      console.error("Error in getEquipmentByIdFn:", e);
      return null;
    }
  });

export const getInternshipLogsFn = createServerFn()
  .handler(async () => {
    if (!import.meta.env.SSR) return [];
    const { db } = await import("../db/client");
    const { internshipLogs } = await import("../db/schema");
    try {
      const list = await db.select().from(internshipLogs);
      return list;
    } catch (e) {
      console.error("Error in getInternshipLogsFn:", e);
      return [];
    }
  });

export const getInternshipLogByIdFn = createServerFn()
  .validator((data: any) => data as { id: string })
  .handler(async ({ data }) => {
    if (!import.meta.env.SSR) return null;
    const { id } = data;
    const { db } = await import("../db/client");
    const { internshipLogs } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    try {
      const [item] = await db.select().from(internshipLogs).where(eq(internshipLogs.id, id));
      return item || null;
    } catch (e) {
      console.error("Error in getInternshipLogByIdFn:", e);
      return null;
    }
  });

async function getAdminUserOrThrow() {
  const { getSessionCookie } = await import("./auth-cookies.server");
  const { decryptSession } = await import("./auth");
  const { db } = await import("../db/client");
  const { users } = await import("../db/schema");
  const { eq } = await import("drizzle-orm");

  const session = await getSessionCookie();
  if (!session) throw new Error("Authentication required");
  const userId = decryptSession(session);
  if (!userId) throw new Error("Authentication required");

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user || user.role !== "admin") throw new Error("Admin authorization required");
  return user;
}

async function verifyAdminClearanceOrThrow() {
  const user = await getAdminUserOrThrow();
  const { getAdminClearanceCookie } = await import("./auth-cookies.server");
  const token = await getAdminClearanceCookie();
  if (!token) {
    throw new Error("Admin terminal clearance required. Please unlock the terminal first.");
  }
  return user;
}

export const uploadFileFn = createServerFn({ method: "POST" })
  .validator((data: any) => data as FormData)
  .handler(async ({ data }) => {
    if (!import.meta.env.SSR) throw new Error("Server execution only");
    await verifyAdminClearanceOrThrow();

    const file = data.get("file") as File;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${Date.now()}-${cleanName}`;

    const { db } = await import("../db/client");
    const { attachments } = await import("../db/schema");

    await db.insert(attachments).values({
      id: filename,
      data: buffer,
      mimeType: file.type || "application/octet-stream",
      createdAt: Date.now(),
    });

    return { filename, url: `/api/files/${filename}` };
  });

export const getDownloadsFn = createServerFn()
  .handler(async () => {
    if (!import.meta.env.SSR) return [];
    const { db } = await import("../db/client");
    const { downloads } = await import("../db/schema");
    try {
      const list = await db.select().from(downloads);
      return list;
    } catch (e) {
      console.error("Error fetching downloads:", e);
      return [];
    }
  });

export const addDownloadFn = createServerFn({ method: "POST" })
  .validator((data: any) => data as { title: string; filename: string; size: string; type: string; topic: string })
  .handler(async ({ data }) => {
    if (!import.meta.env.SSR) throw new Error("Server execution only");
    await verifyAdminClearanceOrThrow();
    const { db } = await import("../db/client");
    const { downloads } = await import("../db/schema");
    const crypto = await import("crypto");

    const id = crypto.randomUUID();
    await db.insert(downloads).values({
      id,
      title: data.title,
      filename: data.filename,
      size: data.size,
      type: data.type,
      topic: data.topic,
      createdAt: Date.now(),
    });
    return { success: true, id };
  });

export const deleteDownloadFn = createServerFn({ method: "POST" })
  .validator((data: any) => data as { id: string })
  .handler(async ({ data }) => {
    if (!import.meta.env.SSR) throw new Error("Server execution only");
    await verifyAdminClearanceOrThrow();
    const { db } = await import("../db/client");
    const { downloads } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    const fs = await import("fs/promises");
    const path = await import("path");

    const [item] = await db.select().from(downloads).where(eq(downloads.id, data.id));
    if (!item) throw new Error("Download resource not found");

    await db.delete(downloads).where(eq(downloads.id, data.id));

    try {
      const filePath = path.join(process.cwd(), "public", "downloads", item.filename);
      await fs.unlink(filePath);
    } catch (e) {
      console.warn(`File ${item.filename} could not be deleted from disk:`, e);
    }

    return { success: true };
  });

export const addInternshipLogFn = createServerFn({ method: "POST" })
  .validator((data: any) => data as { title: string; date: string; tag: string; description: string; imageUrl: string; content: string })
  .handler(async ({ data }) => {
    if (!import.meta.env.SSR) throw new Error("Server execution only");
    await verifyAdminClearanceOrThrow();
    const { db } = await import("../db/client");
    const { internshipLogs } = await import("../db/schema");
    const crypto = await import("crypto");

    const id = crypto.randomUUID();
    await db.insert(internshipLogs).values({
      id,
      title: data.title,
      date: data.date,
      tag: data.tag,
      description: data.description,
      imageUrl: data.imageUrl,
      content: data.content,
    });
    return { success: true, id };
  });

export const deleteInternshipLogFn = createServerFn({ method: "POST" })
  .validator((data: any) => data as { id: string })
  .handler(async ({ data }) => {
    if (!import.meta.env.SSR) throw new Error("Server execution only");
    await verifyAdminClearanceOrThrow();
    const { db } = await import("../db/client");
    const { internshipLogs } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    const fs = await import("fs/promises");
    const path = await import("path");

    const [item] = await db.select().from(internshipLogs).where(eq(internshipLogs.id, data.id));
    if (!item) throw new Error("Log entry not found");

    await db.delete(internshipLogs).where(eq(internshipLogs.id, data.id));

    if (item.imageUrl.startsWith("/images/logbook/")) {
      try {
        const relativePath = item.imageUrl.replace(/^\//, "");
        const filePath = path.join(process.cwd(), "public", relativePath);
        await fs.unlink(filePath);
      } catch (e) {
        console.warn(`File ${item.imageUrl} could not be deleted from disk:`, e);
      }
    }

    return { success: true };
  });

export const addEquipmentFn = createServerFn({ method: "POST" })
  .validator((data: any) => data as { id: string; name: string; full: string; tag: string; description: string; detailedContent: string; standards: string; interfaces: string; imageUrl: string })
  .handler(async ({ data }) => {
    if (!import.meta.env.SSR) throw new Error("Server execution only");
    await verifyAdminClearanceOrThrow();
    const { db } = await import("../db/client");
    const { equipment } = await import("../db/schema");

    await db.insert(equipment).values({
      id: data.id.trim().toLowerCase(),
      name: data.name,
      full: data.full,
      tag: data.tag,
      description: data.description,
      detailedContent: data.detailedContent,
      standards: data.standards,
      interfaces: data.interfaces,
      imageUrl: data.imageUrl,
    });
    return { success: true };
  });

export const updateEquipmentFn = createServerFn({ method: "POST" })
  .validator((data: any) => data as { id: string; name: string; full: string; tag: string; description: string; detailedContent: string; standards: string; interfaces: string; imageUrl: string })
  .handler(async ({ data }) => {
    if (!import.meta.env.SSR) throw new Error("Server execution only");
    await verifyAdminClearanceOrThrow();
    const { db } = await import("../db/client");
    const { equipment } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");

    await db.update(equipment).set({
      name: data.name,
      full: data.full,
      tag: data.tag,
      description: data.description,
      detailedContent: data.detailedContent,
      standards: data.standards,
      interfaces: data.interfaces,
      imageUrl: data.imageUrl,
    }).where(eq(equipment.id, data.id));
    return { success: true };
  });

export const deleteEquipmentFn = createServerFn({ method: "POST" })
  .validator((data: any) => data as { id: string })
  .handler(async ({ data }) => {
    if (!import.meta.env.SSR) throw new Error("Server execution only");
    await verifyAdminClearanceOrThrow();
    const { db } = await import("../db/client");
    const { equipment } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    const fs = await import("fs/promises");
    const path = await import("path");

    const [item] = await db.select().from(equipment).where(eq(equipment.id, data.id));
    if (!item) throw new Error("Equipment not found");

    await db.delete(equipment).where(eq(equipment.id, data.id));

    if (item.imageUrl && item.imageUrl.startsWith("/images/equipment/")) {
      try {
        const relativePath = item.imageUrl.replace(/^\//, "");
        const filePath = path.join(process.cwd(), "public", relativePath);
        await fs.unlink(filePath);
      } catch (e) {
        console.warn(`File ${item.imageUrl} could not be deleted from disk:`, e);
      }
    }

    return { success: true };
  });

export const verifyAdminKeyFn = createServerFn({ method: "POST" })
  .validator((data: any) => data as { key: string })
  .handler(async ({ data }) => {
    if (!import.meta.env.SSR) throw new Error("Server execution only");
    await getAdminUserOrThrow();

    if (data.key !== "gridcontrol2026") {
      throw new Error("Invalid Admin Terminal Access Key");
    }

    const { setAdminClearanceCookie } = await import("./auth-cookies.server");
    const crypto = await import("crypto");
    const clearanceToken = crypto.randomBytes(32).toString("hex");
    await setAdminClearanceCookie(clearanceToken);

    return { success: true };
  });

export const checkAdminClearanceFn = createServerFn()
  .handler(async () => {
    if (!import.meta.env.SSR) return { cleared: false };
    try {
      await getAdminUserOrThrow();
      const { getAdminClearanceCookie } = await import("./auth-cookies.server");
      const token = await getAdminClearanceCookie();
      return { cleared: !!token };
    } catch (e) {
      return { cleared: false };
    }
  });

export const getModulesFn = createServerFn()
  .handler(async () => {
    if (!import.meta.env.SSR) return [];
    const { db } = await import("../db/client");
    const { modules } = await import("../db/schema");
    try {
      const list = await db.select().from(modules).orderBy(modules.index);
      return list;
    } catch (e) {
      console.error("Error fetching modules:", e);
      return [];
    }
  });

export const updateModuleFn = createServerFn({ method: "POST" })
  .validator((data: any) => data as { id: string; title: string; description: string; difficulty: string; time: string; accent: string })
  .handler(async ({ data }) => {
    if (!import.meta.env.SSR) throw new Error("Server execution only");
    await verifyAdminClearanceOrThrow();
    const { db } = await import("../db/client");
    const { modules } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");

    await db.update(modules).set({
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      time: data.time,
      accent: data.accent,
    }).where(eq(modules.id, data.id));
    return { success: true };
  });

export const addTopicFn = createServerFn({ method: "POST" })
  .validator((data: any) => data as { moduleId: string; title: string; content: string; timeToRead: string; index: number })
  .handler(async ({ data }) => {
    if (!import.meta.env.SSR) throw new Error("Server execution only");
    await verifyAdminClearanceOrThrow();
    const { db } = await import("../db/client");
    const { topics } = await import("../db/schema");
    const crypto = await import("crypto");

    const id = crypto.randomUUID();
    await db.insert(topics).values({
      id,
      moduleId: data.moduleId,
      title: data.title,
      content: data.content,
      timeToRead: data.timeToRead,
      index: data.index,
    });
    return { success: true, id };
  });

export const updateTopicFn = createServerFn({ method: "POST" })
  .validator((data: any) => data as { id: string; title: string; content: string; timeToRead: string; index: number })
  .handler(async ({ data }) => {
    if (!import.meta.env.SSR) throw new Error("Server execution only");
    await verifyAdminClearanceOrThrow();
    const { db } = await import("../db/client");
    const { topics } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");

    await db.update(topics).set({
      title: data.title,
      content: data.content,
      timeToRead: data.timeToRead,
      index: data.index,
    }).where(eq(topics.id, data.id));
    return { success: true };
  });

export const deleteTopicFn = createServerFn({ method: "POST" })
  .validator((data: any) => data as { id: string })
  .handler(async ({ data }) => {
    if (!import.meta.env.SSR) throw new Error("Server execution only");
    await verifyAdminClearanceOrThrow();
    const { db } = await import("../db/client");
    const { topics } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");

    await db.delete(topics).where(eq(topics.id, data.id));
    return { success: true };
  });

export const getQuizQuestionsFn = createServerFn()
  .validator((data: any) => data as { moduleId: string })
  .handler(async ({ data }) => {
    if (!import.meta.env.SSR) return { quiz: null, questions: [] };
    const { moduleId } = data;
    const { db } = await import("../db/client");
    const { quizzes, questions } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");

    try {
      const [quiz] = await db.select().from(quizzes).where(eq(quizzes.moduleId, moduleId));
      if (!quiz) return { quiz: null, questions: [] };

      const qList = await db.select().from(questions).where(eq(questions.quizId, quiz.id));
      return { quiz, questions: qList };
    } catch (e) {
      console.error("Error fetching quiz questions:", e);
      return { quiz: null, questions: [] };
    }
  });

export const updateQuizQuestionsFn = createServerFn({ method: "POST" })
  .validator((data: any) => data as {
    moduleId: string;
    quizTitle: string;
    quizDescription: string;
    questions: Array<{
      id?: string;
      questionText: string;
      options: string;
      correctAnswerIndex: number;
    }>;
  })
  .handler(async ({ data }) => {
    if (!import.meta.env.SSR) throw new Error("Server execution only");
    await verifyAdminClearanceOrThrow();
    const { db } = await import("../db/client");
    const { quizzes, questions } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    const crypto = await import("crypto");

    let [quiz] = await db.select().from(quizzes).where(eq(quizzes.moduleId, data.moduleId));
    let quizId = quiz?.id;
    if (!quiz) {
      quizId = crypto.randomUUID();
      await db.insert(quizzes).values({
        id: quizId,
        moduleId: data.moduleId,
        title: data.quizTitle,
        description: data.quizDescription,
      });
    } else {
      await db.update(quizzes).set({
        title: data.quizTitle,
        description: data.quizDescription,
      }).where(eq(quizzes.id, quizId));
    }

    await db.delete(questions).where(eq(questions.quizId, quizId));

    for (const q of data.questions) {
      const qId = q.id || crypto.randomUUID();
      await db.insert(questions).values({
        id: qId,
        quizId: quizId,
        questionText: q.questionText,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
      });
    }

    return { success: true };
  });

export const sendGeneralAIMessageFn = createServerFn()
  .validator((data: any) => data as { 
    messages: { role: "user" | "ai"; text: string }[] 
  })
  .handler(async ({ data }) => {
    if (!import.meta.env.SSR) throw new Error("Server execution only");
    const { messages } = data;
    const { getSessionCookie } = await import("./auth-cookies.server");
    const { decryptSession } = await import("./auth");
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
Answer the user's question directly. Use clear markdown headers, bold text, and bullet points in your response.`;

    const groqMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.text
      }))
    ];

    const requestBody = {
      model: "llama-3.3-70b-versatile",
      messages: groqMessages,
      temperature: 0.3
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
      throw new Error(err.message || "Failed to communicate with AI Assistant.");
    }
  });

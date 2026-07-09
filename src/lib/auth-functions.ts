import { createServerFn } from "@tanstack/react-start";

export const getCurrentUserFn = createServerFn()
  .handler(async () => {
    const { getEvent, getCookie } = await import("vinxi/http");
    const { decryptSession } = await import("./auth");
    const { db } = await import("../db/client");
    const { users } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");

    const event = getEvent();
    const session = getCookie(event, "session");
    if (!session) return null;
    const userId = decryptSession(session);
    if (!userId) return null;
    
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return null;
    
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  });

export const loginFn = createServerFn()
  .validator((data: any) => data as { email: string; password: string })
  .handler(async ({ data }) => {
    const { email, password } = data;
    const { getEvent, setCookie } = await import("vinxi/http");
    const { db } = await import("../db/client");
    const { users } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    const { verifyPassword, encryptSession } = await import("./auth");

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) throw new Error("Invalid email or password");
    
    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) throw new Error("Invalid email or password");
    
    const event = getEvent();
    const token = encryptSession(user.id);
    setCookie(event, "session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  });

export const signupFn = createServerFn()
  .validator((data: any) => data as { name: string; email: string; password: string; organization: string })
  .handler(async ({ data }) => {
    const { name, email, password, organization } = data;
    const { getEvent, setCookie } = await import("vinxi/http");
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
    const event = getEvent();
    const token = encryptSession(userId);
    setCookie(event, "session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  });

export const logoutFn = createServerFn()
  .handler(async () => {
    const { getEvent, deleteCookie } = await import("vinxi/http");
    const event = getEvent();
    deleteCookie(event, "session", { path: "/" });
    return { success: true };
  });

export const getUserProfileStatsFn = createServerFn()
  .handler(async () => {
    const { getEvent, getCookie } = await import("vinxi/http");
    const { decryptSession } = await import("./auth");
    const { db } = await import("../db/client");
    const { users, modules, userProgress, userScores } = await import("../db/schema");
    const { eq, sql } = await import("drizzle-orm");

    const event = getEvent();
    const session = getCookie(event, "session");
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
    const { moduleId } = data;
    const { getEvent, getCookie } = await import("vinxi/http");
    const { decryptSession } = await import("./auth");
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
    
    const event = getEvent();
    const session = getCookie(event, "session");
    if (session) {
      const userId = decryptSession(session);
      if (userId) {
        const [prog] = await db
          .select()
          .from(userProgress)
          .where(and(eq(userProgress.userId, userId), eq(userProgress.moduleId, moduleId)));
        
        if (prog) {
          try {
            completedList = JSON.parse(prog.completedTopics);
            progressPercent = prog.progress;
          } catch (e) {
            completedList = [];
          }
        }
      }
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
    const { moduleId, topicId, completed } = data;
    const { getEvent, getCookie } = await import("vinxi/http");
    const { decryptSession } = await import("./auth");
    const { db } = await import("../db/client");
    const { topics, userProgress } = await import("../db/schema");
    const { eq, and } = await import("drizzle-orm");

    const event = getEvent();
    const session = getCookie(event, "session");
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

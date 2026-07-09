import { createFileRoute } from "@tanstack/react-router";
import { db } from "../db/client";
import { attachments } from "../db/schema";
import { eq } from "drizzle-orm";

export const Route = createFileRoute("/api/files/$filename")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { filename } = params;
        try {
          const [item] = await db.select().from(attachments).where(eq(attachments.id, filename));
          if (!item) {
            return new Response("File not found", { status: 404 });
          }

          return new Response(item.data as any, {
            headers: {
              "Content-Type": item.mimeType || "application/octet-stream",
              "Content-Disposition": `inline; filename="${filename.replace(/^\d+-/, "")}"`,
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        } catch (e: any) {
          return new Response(e.message || "Internal Server Error", { status: 500 });
        }
      },
    },
  },
});

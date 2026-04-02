import { z } from "zod";
import webpush from "web-push";
import { router, protectedProcedure, publicProcedure, adminProcedure, cmsProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { pushSubscriptions } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;
const VAPID_EMAIL = process.env.VAPID_EMAIL || "mailto:admin@oranjeapp.com.br";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// Auto-create the table if it doesn't exist (Railway DB)
(async () => {
  try {
    const db = await getDb();
    if (db) {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS push_subscriptions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          userId INT NULL,
          endpoint TEXT NOT NULL,
          p256dh TEXT NOT NULL,
          auth VARCHAR(255) NOT NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        )
      `);
    }
  } catch (e) {
    console.warn("[push] Table migration skipped:", (e as Error).message);
  }
})();

export const pushRouter = router({
  vapidPublicKey: publicProcedure.query(() => {
    return { publicKey: VAPID_PUBLIC_KEY || "" };
  }),

  subscribe: publicProcedure
    .input(z.object({
      endpoint: z.string(),
      p256dh: z.string(),
      auth: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const existing = await db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.endpoint, input.endpoint))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(pushSubscriptions).values({
          userId: ctx.user?.id ?? null,
          endpoint: input.endpoint,
          p256dh: input.p256dh,
          auth: input.auth,
        });
      }

      return { success: true };
    }),

  unsubscribe: publicProcedure
    .input(z.object({ endpoint: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, input.endpoint));
      return { success: true };
    }),

  sendAll: cmsProcedure
    .input(z.object({
      title: z.string().min(1).max(100),
      body: z.string().min(1).max(300),
      url: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const subs = await db.select().from(pushSubscriptions);

      const payload = JSON.stringify({
        title: input.title,
        body: input.body,
        icon: "https://d2xsxph8kpxj0f.cloudfront.net/310519663387178677/8rzdsSWs85gXVtjhEeBpLG/icon-192-SBArfE9rAW64F3Y8g9uv32.png",
        badge: "https://d2xsxph8kpxj0f.cloudfront.net/310519663387178677/8rzdsSWs85gXVtjhEeBpLG/icon-192-SBArfE9rAW64F3Y8g9uv32.png",
        url: input.url || "/app",
      });

      let sent = 0;
      let failed = 0;
      const stale: string[] = [];

      await Promise.allSettled(
        subs.map(async (sub) => {
          try {
            await webpush.sendNotification(
              { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
              payload
            );
            sent++;
          } catch (err: any) {
            failed++;
            if (err.statusCode === 404 || err.statusCode === 410) {
              stale.push(sub.endpoint);
            }
          }
        })
      );

      if (stale.length > 0) {
        await Promise.all(
          stale.map((ep) =>
            db!.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, ep))
          )
        );
      }

      return { sent, failed, staleRemoved: stale.length, total: subs.length };
    }),

  subscriberCount: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) return { count: 0 };
      const subs = await db.select({ id: pushSubscriptions.id }).from(pushSubscriptions);
      return { count: subs.length };
    } catch {
      return { count: 0 };
    }
  }),
});

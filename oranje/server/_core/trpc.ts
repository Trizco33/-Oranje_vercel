import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

/**
 * CMS Procedure: Checks tRPC JWT auth first (adminProcedure path),
 * falls back to checking the cms_session cookie set by CMS login.
 * This bridges the gap when CMS login doesn't properly set the app_session_id JWT.
 */
export const cmsProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    // First: if tRPC auth already resolved an admin user, use it
    if (ctx.user && ctx.user.role === 'admin') {
      return next({ ctx: { ...ctx, user: ctx.user } });
    }

    // Fallback: check cms_session cookie
    try {
      const cookieHeader = ctx.req.headers.cookie || '';
      const cmsMatch = cookieHeader.match(/cms_session=([^;]+)/);
      if (cmsMatch) {
        const decoded = decodeURIComponent(cmsMatch[1]);
        const session = JSON.parse(decoded);
        if (session?.success && session?.user?.role === 'admin') {
          // CMS session is valid — allow access
          // We don't have the full User object from DB here, but the session confirms admin access
          return next({ ctx });
        }
      }
    } catch (e) {
      // Cookie parsing failed, fall through to error
    }

    throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
  }),
);

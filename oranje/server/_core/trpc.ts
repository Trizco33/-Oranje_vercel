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
 * CMS Procedure: 3-layer auth check for CMS admin access.
 * 1. JWT cookie (app_session_id) — standard tRPC auth
 * 2. X-CMS-Token header — localStorage-based session (most reliable)
 * 3. cms_session cookie fallback
 */
export const cmsProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    // Layer 1: JWT cookie resolved an admin user
    if (ctx.user && ctx.user.role === 'admin') {
      return next({ ctx: { ...ctx, user: ctx.user } });
    }

    // Layer 2: X-CMS-Token header (localStorage-based, path-independent)
    try {
      const tokenHeader = ctx.req.headers['x-cms-token'];
      if (tokenHeader) {
        const session = JSON.parse(String(tokenHeader));
        if (session?.success && session?.user?.role === 'admin') {
          return next({ ctx });
        }
      }
    } catch (e) {
      // Header parsing failed, continue
    }

    // Layer 3: cms_session cookie fallback
    try {
      const cookieHeader = ctx.req.headers.cookie || '';
      const cmsMatch = cookieHeader.match(/cms_session=([^;]+)/);
      if (cmsMatch) {
        const decoded = decodeURIComponent(cmsMatch[1]);
        const session = JSON.parse(decoded);
        if (session?.success && session?.user?.role === 'admin') {
          return next({ ctx });
        }
      }
    } catch (e) {
      // Cookie parsing failed
    }

    throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
  }),
);

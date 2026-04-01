import { createTRPCReact } from "@trpc/react-query";
import type { appRouter } from "../../../server/routers";

export type AppRouter = typeof appRouter;

export const trpc = createTRPCReact<AppRouter>();

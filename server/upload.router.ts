import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { storagePut } from "./storage";

export const uploadRouter = router({
  uploadImage: protectedProcedure
    .input(z.object({
      file: z.string(), // base64
      fileName: z.string(),
      mimeType: z.string().default("image/jpeg"),
    }))
    .mutation(async ({ input }) => {
      try {
        const buffer = Buffer.from(input.file, "base64");
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const fileKey = `uploads/${Date.now()}-${randomSuffix}-${input.fileName}`;
        
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        return { success: true, url };
      } catch (error) {
        console.error("Upload error:", error);
        return { success: false, error: "Erro ao fazer upload" };
      }
    }),
});

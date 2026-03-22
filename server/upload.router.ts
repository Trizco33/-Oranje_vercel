import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { storagePut } from "./storage";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const uploadRouter = router({
  /** Upload image via base64 (tRPC). Works from any client. */
  uploadImage: protectedProcedure
    .input(
      z.object({
        file: z.string(), // base64 encoded
        fileName: z.string(),
        mimeType: z.string().default("image/jpeg"),
      })
    )
    .mutation(async ({ input }) => {
      // Validate mime type
      if (!ALLOWED_MIME_TYPES.includes(input.mimeType)) {
        return {
          success: false,
          error: `Tipo de arquivo não permitido. Use: JPG, PNG ou WebP`,
        };
      }

      const buffer = Buffer.from(input.file, "base64");

      // Validate size
      if (buffer.length > MAX_FILE_SIZE) {
        return {
          success: false,
          error: `Arquivo muito grande. Máximo: 5 MB`,
        };
      }

      try {
        // Sanitize filename
        const safeName = input.fileName
          .replace(/[^a-zA-Z0-9._-]/g, "_")
          .substring(0, 80);
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const fileKey = `uploads/${Date.now()}-${randomSuffix}-${safeName}`;

        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        return { success: true, url };
      } catch (error) {
        console.error("Upload error:", error);
        return { success: false, error: "Erro ao fazer upload da imagem" };
      }
    }),
});

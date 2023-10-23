import * as z from "zod";

export const transferUploadSchema = z.object({
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(1000).optional().default(""),
});

export const transferQuerySchema = z.object({
  transferId: z
    .string()
    .length(6)
    .refine((value) => /^[a-zA-Z0-9]+$/.test(value), {
      message: "Transfer ID can only contain letters and numbers.",
    }),
});

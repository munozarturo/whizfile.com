import * as z from "zod";

const sha256HashSchema = z.string().regex(/^[a-f0-9]{64}$/i, {
  message: "Invalid SHA-256 hash",
});

const blobOrFileSchema = z.custom((input) => input instanceof Blob || input instanceof File, {
  message: "Expected type Blob or File",
});

export const transferUploadSchema = z.object({
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(1000).optional().default(""),
});

export const fileUploadSchema = z.object({
  file: blobOrFileSchema,
});

export const transferQuerySchema = z.object({
  transferId: z
    .string()
    .length(6)
    .refine((value) => /^[a-zA-Z0-9]+$/.test(value), {
      message: "Transfer ID can only contain letters and numbers.",
    }),
});

export const fileQuerySchema = z.object({
  fileId: sha256HashSchema
});
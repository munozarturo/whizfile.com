import * as z from "zod";

const sha256HashSchema = z.string().regex(/^[a-f0-9]{64}$/i, {
    message: "Invalid SHA-256 hash",
});

const oneTimeCodeSchema = z.string().regex(/^[a-zA-Z0-9]{16}$/i, {
    message: "Invalid One Time Upload Code",
});

const transferIdSchema = z.string().regex(/^[a-zA-Z0-9]{6}$/i, {
    message: "Invalid transfer ID",
});

const blobOrFileSchema = z.custom(
    (input) => input instanceof Blob || input instanceof File,
    {
        message: "Expected type Blob or File",
    }
);

export const sendTransferSchema = z.object({
    title: z.string().min(1).max(100).optional().default(""),
    message: z.string().min(1).max(1000).optional().default(""),
});

export const fileUploadSchema = z.object({
    file: blobOrFileSchema,
    transferId: transferIdSchema,
    oneTimeCode: oneTimeCodeSchema,
});

export const transferQuerySchema = z.object({
    transferId: transferIdSchema,
});

export const fileQuerySchema = z.object({
    fileId: sha256HashSchema,
});

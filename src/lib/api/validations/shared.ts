import * as zod from "zod";

const SHA256Hash = zod
    .string()
    .refine((input) => /^[a-f0-9]{64}$/.test(input), {
        message: "Not a valid SHA-256 hash",
    });

export { SHA256Hash };

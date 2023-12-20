import * as zod from "zod";

const Hash = zod.string().refine((input) => /^[a-f0-9]{64}$/.test(input), {
    message: "Not a valid SHA-256 hash",
});

export { Hash };

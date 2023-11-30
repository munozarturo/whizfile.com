import * as zod from "zod";

const HTTPMethod = zod.enum([
    "GET",
    "HEAD",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "OPTIONS",
]);

const RequestSchema = zod.object({
    timestamp: zod.preprocess((input) => {
        if (typeof input === "string") {
            const parsed = Number(input);
            return isNaN(parsed) ? undefined : parsed;
        }
        return input;
    }, zod.number()),
    method: HTTPMethod,
    source: zod.string(),
    target: zod.string(),
    id: zod.string().optional(),
});

export { HTTPMethod, RequestSchema };

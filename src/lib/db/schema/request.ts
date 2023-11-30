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
    timestamp: zod.number(),
    method: HTTPMethod,
    source: zod.string(),
    target: zod.string(),
    id: zod.string().optional(),
});

export { HTTPMethod, RequestSchema };

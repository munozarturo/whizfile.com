import * as zod from "zod";

enum HTTPMethod {
    GET = "GET",
    HEAD = "HEAD",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    PATCH = "PATCH",
    OPTIONS = "OPTIONS",
}

const RequestsReq = zod.object({
    timestamp: zod.preprocess((input) => {
        if (typeof input === "string") {
            const parsed = Number(input);
            return isNaN(parsed) ? undefined : parsed;
        }
        return input;
    }, zod.number()),
    method: zod.nativeEnum(HTTPMethod),
    source: zod.string(),
    target: zod.string(),
    id: zod.string().optional(),
});

export { HTTPMethod, RequestsReq };

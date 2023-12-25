enum HTTPMethod {
    GET = "GET",
    HEAD = "HEAD",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    PATCH = "PATCH",
    OPTIONS = "OPTIONS",
}

type RequestSchema = {
    timestamp: number;
    method: HTTPMethod;
    source: string;
    target: string;
    id?: string;
};

export { HTTPMethod, type RequestSchema };

import * as zod from "zod";

interface ApiResponse {
    timestamp: number;
    message: string;
    data: Object | null;
}

function handleResponse(
    message: string,
    data: Object | null = null
): ApiResponse {
    return {
        timestamp: Date.now(),
        message: message,
        data: data,
    };
}

function handleError(e: any): ApiResponse {
    if (e instanceof Error) {
        console.error(e);
    } else if (e instanceof zod.ZodError) {
        console.log(e.message);
    } else {
        console.log("Unknown error.");
    }

    return handleResponse("Unknown error.");
}

export { handleResponse, handleError };

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
    var errorMessage;

    if (e instanceof zod.ZodError) {
        console.log(e.message);
        errorMessage = "Invalid contents.";
    } else if (e instanceof Error) {
        console.error(e);
        errorMessage = e.name;
    } else {
        console.log("Unknown error.");
        errorMessage = "Unknown error.";
    }

    return handleResponse(errorMessage);
}

export { handleResponse, handleError };

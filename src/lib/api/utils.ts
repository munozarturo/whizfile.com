interface ApiResponse {
    timestamp: number;
    message: string;
    data: Object | null;
}

export function apiResponse(
    message: string,
    data: Object | null = null
): ApiResponse {
    return {
        timestamp: Date.now(),
        message: message,
        data: data,
    };
}

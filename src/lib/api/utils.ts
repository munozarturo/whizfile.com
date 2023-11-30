interface handleResponse {
    timestamp: number;
    message: string;
    data: Object | null;
}

function handleResponse(
    message: string,
    data: Object | null = null
): handleResponse {
    return {
        timestamp: Date.now(),
        message: message,
        data: data,
    };
}

export { handleResponse };

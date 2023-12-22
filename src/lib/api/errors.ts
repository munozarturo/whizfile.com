class APIError extends Error {
    status: number;

    constructor(
        message: string | undefined,
        status: number = 500,
        options?: ErrorOptions | undefined
    ) {
        super(message, options);
        this.status = status;
    }
}

class InvalidRequestError extends APIError {}
class NonExistentTransferError extends APIError {}
class InfrastructureError extends APIError {}
class InactiveTransferError extends APIError {}

export {
    APIError,
    InvalidRequestError,
    NonExistentTransferError,
    InfrastructureError,
    InactiveTransferError,
};

import type { ZodError } from "zod";

function statusMessageFromZodError(e: ZodError): string {
	const errorMessages = e.issues.map((issue) => {
		const { path, message } = issue;
		return `${path.join(".")}: ${message}`;
	});

	const statusMessage = errorMessages.join(", ");

	return statusMessage;
}

export { statusMessageFromZodError };

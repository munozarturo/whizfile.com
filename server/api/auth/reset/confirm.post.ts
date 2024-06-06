import * as bcrypt from "bcrypt";

import { ZodError, z } from "zod";
import { zodLongToken, zodPassword, zodUUID } from "~/utils/validation/common";

import DB from "~/utils/db/actions";
import { statusMessageFromZodError } from "~/utils/errors/api";

const bodyParser = z.object({
	challengeId: zodUUID,
	token: zodLongToken,
	password: zodPassword,
});

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig();
	const body = await readBody(event);

	try {
		const { challengeId, token, password } = bodyParser.parse(body);
		const passwordHash = await bcrypt.hash(password, 10);

		const challenge = await DB.auth.getChallenge(challengeId);
		if (!challenge)
			return createError({
				statusCode: 404,
				statusMessage: "Challenge doesn't exist.",
			});

		if (challenge.used)
			return createError({
				statusCode: 410,
				statusMessage: "Challenge already used.",
			});

		if (challenge.type !== "password-reset")
			return createError({
				statusCode: 404,
				statusMessage: "Challenge purpose mismatch.",
			});

		if (
			new Date(Date.now()).getTime() >
			challenge.createdAt.getTime() + config.auth.resetCodeExpiryTimeMs
		) {
			return createError({
				statusCode: 410,
				statusMessage: "Verification token has expired.",
			});
		}

		if (!(await bcrypt.compare(token, challenge.tokenHash)))
			return createError({
				statusCode: 400,
				statusMessage: "Incorrect token.",
			});

		const userId = await DB.auth.attemptChallenge(challengeId);

		if (!userId)
			return createError({
				statusCode: 400,
				statusMessage: "Failed to defeat challenge.",
			});

		await DB.auth.resetPassword(userId, passwordHash);

		return {
			statusCode: 200,
			statusMessage: "Success.",
		};
	} catch (error: any) {
		console.log(error);

		if (error instanceof ZodError) {
			return createError({
				statusCode: 400,
				statusMessage: statusMessageFromZodError(error),
			});
		}

		return createError({
			statusCode: 500,
			statusMessage: "An error occurred. Please try again later.",
		});
	}
});

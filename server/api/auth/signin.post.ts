import * as bcrypt from "bcrypt";

import { ZodError, z } from "zod";
import { zodEmail, zodPassword } from "~/utils/validation/common";

import DB from "~/utils/db/actions";
import { statusMessageFromZodError } from "~/utils/errors/api";

const bodyParser = z.object({
	email: zodEmail,
	password: z.string(),
});

export default defineEventHandler(async (event) => {
	const NODE_ENV = process.env.NODE_ENV;
	if (!NODE_ENV)
		throw new Error("`NODE_ENV` environment variable is undefined.");

	const config = useRuntimeConfig();

	const body = await readBody(event);

	try {
		const { email, password } = bodyParser.parse(body);

		const user = await DB.auth.getUser({ email });
		if (!user || !(await bcrypt.compare(password, user.passwordHash)))
			return createError({
				statusCode: 400,
				statusMessage: "Incorrect email or password.",
			});

		if (!user.verified)
			return createError({
				statusCode: 403,
				statusMessage: "Account not verified.",
			});

		const oldSessionToken = getCookie(event, "session-token") || null;
		if (oldSessionToken) await DB.auth.closeSession(oldSessionToken);

		const sessionToken = await DB.auth.createSession({ userId: user.id });
		if (!sessionToken)
			return createError({
				statusCode: 500,
				statusMessage: "Authentication failed.",
			});

		setCookie(event, "session-token", sessionToken, {
			httpOnly: true,
			secure: NODE_ENV === "production",
			sameSite: "strict",
			maxAge: config.auth.sessionExpiryTimeMs / 1000,
		});

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

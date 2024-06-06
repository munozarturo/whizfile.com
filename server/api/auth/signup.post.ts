import * as bcrypt from "bcrypt";

import { ZodError, z } from "zod";
import { zodEmail, zodPassword } from "~/utils/validation/common";

import DB from "~/utils/db/actions";
import { statusMessageFromZodError } from "~/utils/errors/api";

const bodyParser = z.object({
	email: zodEmail,
	password: zodPassword.optional(),
});

export default defineEventHandler(async (event) => {
	const body = await readBody(event);

	try {
		const { email, password } = bodyParser.parse(body);

		const emailInUse = await DB.auth.getUser({ email });
		if (emailInUse)
			return createError({
				statusCode: 400,
				statusMessage: "Email unavailable.",
			});

		if (password) {
			const passwordHash = await bcrypt.hash(password, 10);
			await DB.auth.createUser({ email, passwordHash });
		}

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

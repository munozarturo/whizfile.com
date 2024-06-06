import * as bcrypt from "bcrypt";

import { ZodError, z } from "zod";

import DB from "~/utils/db/actions";
import { generateToken } from "~/utils/core";
import { sendEmail } from "~/utils/aws/ses";
import { statusMessageFromZodError } from "~/utils/errors/api";
import { useCompiler } from "#vue-email";
import { zodEmail } from "~/utils/validation/common";

const bodyParser = z.object({
	email: zodEmail,
	redirect: z.string().optional(),
});

export default defineEventHandler(async (event) => {
	const DOMAIN = process.env.DOMAIN;
	if (!DOMAIN) throw new Error("`DOMAIN` environment variable is undefined.");

	const NUXT_URL = process.env.NUXT_URL;
	if (!NUXT_URL)
		throw new Error("`NUXT_URL` environment variable is undefined.");

	const body = await readBody(event);

	try {
		const { email, redirect } = bodyParser.parse(body);

		const token = generateToken(64);
		const tokenHash = await bcrypt.hash(token, 10);

		const recentCommunications = await DB.auth.getCommunications({
			to: email,
			type: "password-reset-email",
			fromTimestamp: new Date(Date.now() - 1 * 60 * 1000),
		});
		if (recentCommunications.length > 0)
			return createError({
				statusCode: 429,
				statusMessage: "Too many requests, please wait.",
			});

		const user = await DB.auth.getUser({ email });
		if (!user)
			return createError({
				statusCode: 200,
				statusMessage: "Success.",
			});

		const challengeId = await DB.auth.createChallenge({
			type: "password-reset",
			userId: user.id,
			tokenHash: tokenHash,
		});

		const communicationId = await DB.auth.logCommunication({
			type: "password-reset-email",
			to: email,
		});

		const resetURL = () => {
			if (redirect)
				return `${NUXT_URL}/auth/reset?challenge=${challengeId}&token=${token}&redirect=${redirect}`;
			else
				return `${NUXT_URL}/auth/reset?challenge=${challengeId}&token=${token}`;
		};
		const emailBody: { html: string; text: string } = await useCompiler(
			"reset-password-email.vue",
			{
				props: {
					resetURL: resetURL(),
					communicationId,
				},
			}
		);

		await sendEmail({
			source: `${DOMAIN} <verification@auth.${DOMAIN}>`,
			destination: { to: email },
			subject: "Reset Your Password",
			body: emailBody,
			replyTo: `contact@${DOMAIN}`,
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

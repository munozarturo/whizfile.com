import * as bcrypt from "bcrypt";

import { ZodError, z } from "zod";

import DB from "~/utils/db/actions";
import { sendEmail } from "~/utils/aws/ses";
import { statusMessageFromZodError } from "~/utils/errors/api";
import { useCompiler } from "#vue-email";
import { zodEmail } from "~/utils/validation/common";

const bodyParser = z.object({
	email: zodEmail,
});

export default defineEventHandler(async (event) => {
	const DOMAIN = process.env.DOMAIN;
	if (!DOMAIN) throw new Error("`DOMAIN` environment variable is undefined.");

	const config = useRuntimeConfig();

	const body = await readBody(event);

	try {
		const { email } = bodyParser.parse(body);
		const token = Math.round(Math.random() * 1000000)
			.toString()
			.padStart(6, "0");
		const tokenHash = await bcrypt.hash(token, 10);

		const recentCommunications = await DB.auth.getCommunications({
			to: email,
			type: "verification-email",
			fromTimestamp: new Date(
				Date.now() - config.auth.verificationCommunicationRateLimitMs
			),
		});

		if (recentCommunications.length > 0)
			return createError({
				statusCode: 429,
				statusMessage: "Too many requests, please wait.",
			});

		const user = await DB.auth.getUser({ email });
		if (!user)
			return createError({
				statusCode: 400,
				statusMessage: "An account with this email does not exist.",
			});

		if (user.verified)
			return createError({
				statusCode: 409,
				statusMessage: "Account already verified.",
			});

		const challengeId = await DB.auth.createChallenge({
			type: "verification",
			userId: user.id,
			tokenHash: tokenHash,
		});

		const communicationId = await DB.auth.logCommunication({
			type: "verification-email",
			to: email,
		});

		const emailBody: { html: string; text: string } = await useCompiler(
			"verify-identity-email.vue",
			{
				props: {
					token,
					communicationId,
				},
			}
		);

		await sendEmail({
			source: `${DOMAIN} <verification@auth.${DOMAIN}>`,
			destination: { to: email },
			subject: "Verify Your Email Address",
			body: emailBody,
			replyTo: `contact@${DOMAIN}`,
		});

		return {
			statusCode: 200,
			statusMessage: "Success.",
			challengeId,
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

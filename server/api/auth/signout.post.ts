import DB from "~/utils/db/actions";

export default defineEventHandler(async (event) => {
	try {
		const sessionToken = getCookie(event, "session-token");

		if (!sessionToken)
			return createError({
				statusCode: 400,
				statusMessage: "No session to sign out of.",
			});

		await DB.auth.closeSession(sessionToken);

		deleteCookie(event, "session-token");

		return {
			statusCode: 200,
			statusMessage: "Success.",
		};
	} catch (error: any) {
		console.log(error);

		return createError({
			statusCode: 500,
			statusMessage: "An error occurred. Please try again later.",
		});
	}
});

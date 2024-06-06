import DB, { AuthContext } from "~/utils/db/actions";

// explicit type declaration event.context.auth
declare module "h3" {
	interface H3EventContext {
		auth: AuthContext;
	}
}

export default defineEventHandler(async (event) => {
	const NODE_ENV = process.env.NODE_ENV;
	if (!NODE_ENV)
		throw new Error("`NODE_ENV` environment variable is undefined.");

	event.context.auth = null;

	const config = useRuntimeConfig();

	const sessionToken: string | null | undefined = getCookie(
		event,
		"session-token"
	);

	if (!sessionToken) return;

	var context = await DB.auth.getSession(sessionToken);
	if (!context) {
		deleteCookie(event, "session-token");
		return;
	}
	var { user, session } = context;

	const currentTime = Date.now();
	if (
		currentTime >
		new Date(session.createdAt).getTime() + config.auth.sessionExpiryTimeMs
	) {
		DB.auth.closeSession(sessionToken);
		deleteCookie(event, "session-token");
		return;
	}

	if (
		currentTime >
		new Date(session.createdAt).getTime() +
			config.auth.sessionRefreshThresholdMs
	) {
		const refreshedSessionToken = await DB.auth.refreshSession(
			sessionToken
		);

		if (!refreshedSessionToken) return;

		var context = await DB.auth.getSession(refreshedSessionToken);
		if (!context) return;

		var { user, session } = context;

		setCookie(event, "session-token", sessionToken, {
			httpOnly: true,
			secure: NODE_ENV === "production",
			sameSite: "strict",
			maxAge: config.auth.sessionExpiryTimeMs / 1000,
		});
	}

	event.context.auth = {
		user,
		session,
	};
});

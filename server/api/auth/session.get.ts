import AuthContext from "~/server/middleware/auth";

export default defineEventHandler(async (event) => {
	return event.context.auth as unknown as typeof AuthContext;
});

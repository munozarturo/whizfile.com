import type { AuthContext } from "~/utils/db/auth-actions";
import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware(async () => {
	const authStore = useAuthStore();

	if (!authStore.context) {
		try {
			const res = await $fetch<AuthContext>("/api/auth/session");

			authStore.setAuthContext(res);
		} catch (error) {
			console.error("Failed to fetch auth context.", error);
		}
	}
});

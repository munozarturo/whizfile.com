export default defineNuxtRouteMiddleware(async (to, from) => {
	const authStore = useAuthStore();

	onNuxtReady(() => {
		if (!authStore.context) {
			return navigateTo(`/auth/signin?redirect=${to.fullPath}`);
		}
	});
});

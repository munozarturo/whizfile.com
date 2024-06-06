import { type AuthContext } from "~/utils/db/auth-actions";
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
	state: () => ({
		context: null as AuthContext,
	}),
	getters: {
		isAuthenticated: (state) => !!state.context,
	},
	actions: {
		setAuthContext(context: AuthContext) {
			this.context = context;
		},
	},
});

<template>
	<div v-if="authStore.context" class="flex items-center space-x-4">
		<div>
			<a href="/account" class="flex items-center space-x-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 text-gray-600"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span class="text-gray-600">{{
					authStore.context.user.email
				}}</span></a
			>
		</div>
		<button
			@click="signOut"
			class="bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800"
		>
			Sign Out
		</button>
	</div>
	<div v-else class="flex items-center space-x-4">
		<a href="/auth/signin" class="text-black font-bold">Sign In</a>
		<a
			href="/auth/signup"
			class="bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800"
			>Sign Up</a
		>
	</div>
</template>

<script lang="ts" setup>
import { useAuthStore } from "~/stores/auth";
import { useToasterStore } from "~/stores/toaster";

const router = useRouter();
const authStore = useAuthStore();
const toasterStore = useToasterStore();

const signOut = async () => {
	try {
		await $fetch("/api/auth/signout", {
			method: "POST",
		});

		authStore.setAuthContext(null);

		toasterStore.addMessage("Signed Out", "success");

		router.push("/");
	} catch (e: any) {
		const errorMessage = Object.hasOwn(e.data, "statusMessage")
			? e.data.statusMessage
			: "An unknown error occurred. Please try again.";

		toasterStore.addMessage(errorMessage, "error");
	}
};
</script>

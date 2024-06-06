<template>
	<div class="container mx-auto px-4 py-8">
		<div v-if="auth.context">
			<h1 class="text-4xl font-bold mb-8">Account Settings</h1>
			<ClientOnly class="bg-white shadow-md rounded-lg p-6">
				<div class="mb-6">
					<h2 class="text-2xl font-bold mb-2">User Information</h2>
					<p class="text-gray-600">
						<span class="font-bold">Email:</span>
						{{ auth.context.user.email }}
					</p>
					<p class="text-gray-600">
						<span class="font-bold">Verified:</span>
						{{ auth.context.user.verified ? "Yes" : "No" }}
					</p>
				</div>
				<div>
					<h2 class="text-2xl font-bold mb-2">Session Information</h2>
					<p class="text-gray-600">
						<span class="font-bold">Token:</span>
						{{ auth.context.session.token }}
					</p>
					<p class="text-gray-600">
						<span class="font-bold">Active:</span>
						{{ auth.context.session.active ? "Yes" : "No" }}
					</p>
					<p class="text-gray-600">
						<span class="font-bold">Created At:</span>
						{{
							formatDate(
								auth.context.session.createdAt.toString()
							)
						}}
					</p>
				</div>
			</ClientOnly>
		</div>
		<div v-else>Loading...</div>
	</div>
</template>

<script lang="ts" setup>
definePageMeta({
	middleware: "protected",
});

import { useAuthStore } from "~/stores/auth";

const auth = useAuthStore();

const formatDate = (dateString: string) => {
	const options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
	};
	return new Date(dateString).toLocaleDateString(undefined, options);
};
</script>

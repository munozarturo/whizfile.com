<template>
	<component :is="href ? 'a' : 'div'" :href="href" class="inline-block">
		<img
			class="w-auto h-4/5 object-contain"
			:src="
				type === 'long'
					? '/brand/httpsauth_logo_long.svg'
					: '/brand/httpsauth_logo_wide.svg'
			"
			alt="Logo"
		/>
	</component>
</template>

<script setup lang="ts">
defineProps({
	type: {
		type: String,
		default: "long",
		validator: (value: string) => ["long", "wide"].includes(value),
	},
	href: {
		type: String,
		default: "/",
	},
});
</script>

<template>
	<button :class="button({ look })" :disabled="isLoading">
		<span v-if="isLoading" class="inline-block animate-spin mr-2">
			<img class="h-full w-auto" src="/icons/spinner.svg" alt="" />
		</span>
		<span v-else><slot /></span>
	</button>
</template>

<script setup lang="ts">
import { cva, type VariantProps } from "class-variance-authority";

const button = cva("button", {
	variants: {
		look: {
			regular:
				"w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800 disabled:hover:bg-black",
			anchor: "text-sm text-gray-600 hover:text-gray-800",
		},
	},
	defaultVariants: {
		look: "regular",
	},
});

type ButtonProps = VariantProps<typeof button>;

withDefaults(defineProps<{ look: ButtonProps["look"]; isLoading: boolean }>(), {
	look: "regular",
	isLoading: false,
});
</script>

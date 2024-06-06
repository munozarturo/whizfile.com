<template>
	<transition-group
		name="toaster"
		tag="div"
		class="fixed bottom-4 right-4 z-50"
	>
		<div
			v-for="message in messages"
			:key="message.id"
			class="mb-4 rounded-lg bg-black text-white px-4 py-3 shadow-md cursor-pointer flex items-start max-w-xs"
			@mouseover="pauseTimer(message.id)"
			@mouseleave="resumeTimer(message.id)"
			@click="dismissMessage(message.id)"
		>
			<div class="mr-2 flex-shrink-0">
				<svg
					v-if="message.type === 'success'"
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M5 13l4 4L19 7"
					/>
				</svg>
				<svg
					v-else-if="message.type === 'error'"
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
				<svg
					v-else-if="message.type === 'info'"
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			</div>
			<div class="flex-1 break-words">
				<div v-html="message.message"></div>
			</div>
		</div>
	</transition-group>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useToasterStore } from "~/stores/toaster";
import { ref, watch } from "vue";

const toasterStore = useToasterStore();
const { messages } = storeToRefs(toasterStore);

const timers = ref<{ [key: number]: NodeJS.Timeout }>({});

const dismissMessage = (messageId: number) => {
	toasterStore.removeMessage(messageId);
};

const pauseTimer = (messageId: number) => {
	clearTimeout(timers.value[messageId]);
};

const resumeTimer = (messageId: number) => {
	timers.value[messageId] = setTimeout(() => {
		toasterStore.removeMessage(messageId);
	}, 3000);
};

watch(messages, (newMessages) => {
	newMessages.forEach((message) => {
		if (!timers.value[message.id]) {
			timers.value[message.id] = setTimeout(() => {
				toasterStore.removeMessage(message.id);
			}, 3000);
		}
	});
});
</script>

<style scoped>
.toaster-enter-active {
	transition: all 0.3s ease-out;
}

.toaster-leave-active {
	transition: all 0.5s ease-in;
}

.toaster-enter-from,
.toaster-leave-to {
	opacity: 0;
	transform: translateX(30px);
}
</style>

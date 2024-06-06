<template>
	<div class="flex justify-center space-x-1">
		<input
			v-for="(_, index) in 6"
			:key="index"
			v-model="tokenInputs[index]"
			:data-index="index"
			type="text"
			maxlength="1"
			class="w-12 h-12 text-center text-2xl border border-gray-300 rounded-md"
			@input="handleInput(index)"
			@keydown="handleKeyDown(index, $event)"
			@paste="handlePaste"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const props = defineProps({
	value: {
		type: String,
		default: "",
	},
});

const emit = defineEmits(["input", "complete"]);

const tokenInputs = ref(props.value.split(""));
const inputRefs = ref<Array<HTMLInputElement | null>>(Array(6).fill(null));

onMounted(() => {
	inputRefs.value = Array.from(
		document.querySelectorAll("[data-index]")
	) as HTMLInputElement[];
});

const handleInput = (index: number) => {
	if (tokenInputs.value[index].length === 1) {
		if (index < 5) {
			inputRefs.value[index + 1]?.focus();
		}

		if (tokenInputs.value.join("").length === 6) {
			emit("complete", { token: tokenInputs.value.join("") });
		}
	}
};

const handleKeyDown = (index: number, event: KeyboardEvent) => {
	if (
		event.key === "Backspace" &&
		tokenInputs.value[index].length === 0 &&
		index > 0
	) {
		inputRefs.value[index - 1]?.focus();
	}
};

const handlePaste = (event: ClipboardEvent) => {
	const pastedToken = event.clipboardData?.getData("text");
	if (pastedToken && /^\d{6}$/.test(pastedToken)) {
		tokenInputs.value = pastedToken.split("");
		inputRefs.value[5]?.focus();
		emit("complete", { token: pastedToken });
	}
	event.preventDefault();
};
</script>

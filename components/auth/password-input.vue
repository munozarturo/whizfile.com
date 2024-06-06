<template>
	<div class="relative">
		<Field
			:name="name"
			:type="showPassword ? 'text' : 'password'"
			:id="id"
			:value="value"
			@input="handleInput"
			class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
			:rules="rules"
		/>
		<span
			class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
			@click="togglePasswordVisibility"
		>
			<svg
				v-if="showPassword"
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5 text-gray-500"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
					clip-rule="evenodd"
				/>
				<path
					d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"
				/>
			</svg>
			<svg
				v-else
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5 text-gray-500"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
				<path
					fill-rule="evenodd"
					d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
					clip-rule="evenodd"
				/>
			</svg>
		</span>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Field } from "vee-validate";

const props = defineProps({
	id: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	value: {
		type: String,
		default: "",
	},
	rules: {
		type: String,
		default: "",
	},
});

const emit = defineEmits(["update:value"]);

const showPassword = ref(false);

const togglePasswordVisibility = () => {
	showPassword.value = !showPassword.value;
};

const handleInput = (event: Event) => {
	emit("update:value", (event.target as HTMLInputElement).value);
};
</script>

<template>
	<div class="flex flex-col space-y-4">
		<div>
			<div class="mb-4">
				<label :for="id" class="block text-gray-700 font-bold mb-2">{{
					label
				}}</label>
				<PasswordInput
					:id="id"
					:name="name"
					:value="value"
					@update:value="handleInput"
				/>
			</div>
			<div>
				<label
					:for="confirmPasswordId"
					class="block text-gray-700 font-bold mb-2"
					>Confirm {{ label }}</label
				>
				<PasswordInput
					:id="confirmPasswordId"
					:name="confirmPasswordName"
					:value="confirmPassword"
					@update:value="confirmPassword = $event"
				/>
			</div>
		</div>
		<ul class="mt-4 text-sm text-gray-600">
			<li
				v-for="(isValid, requirement) in passwordRequirements"
				:key="requirement"
			>
				<span class="inline-block w-4 h-4 mr-1">
					<svg
						v-if="isValid"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="text-green-500"
					>
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clip-rule="evenodd"
						/>
					</svg>
					<svg
						v-else
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="text-red-500"
					>
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
							clip-rule="evenodd"
						/>
					</svg>
				</span>
				{{ requirement }}
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps({
	id: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	label: {
		type: String,
		default: "Password",
	},
	value: {
		type: String,
		default: "",
	},
});

const emit = defineEmits(["update:value"]);

const confirmPassword = ref("");

const handleInput = (value: string) => {
	emit("update:value", value);
};

const confirmPasswordId = computed(() => `confirm-${props.id}`);
const confirmPasswordName = computed(() => `confirm-${props.name}`);

const passwordRequirements = computed(() => ({
	"At least 6 characters": /^.{6,}$/.test(props.value),
	"At least 1 uppercase letter": /[A-Z]/.test(props.value),
	"At least 1 lowercase letter": /[a-z]/.test(props.value),
	"At least 1 number": /[0-9]/.test(props.value),
	"At least 1 special character": /[^A-Za-z0-9]/.test(props.value),
	"Passwords match": confirmPassword.value === props.value,
}));
</script>

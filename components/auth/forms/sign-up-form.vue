<template>
	<div>
		<Form
			v-if="!showPasswordSection"
			@submit="submitUserForm"
			:validation-schema="userValidationSchema"
			class="space-y-2"
		>
			<div class="flex flex-col space-y-2">
				<div>
					<label
						for="email"
						class="block text-gray-700 font-bold mb-2"
						>Email</label
					>
					<Field
						type="email"
						id="email"
						name="email"
						v-model="email"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
					/>
					<ErrorMessage
						name="email"
						class="mt-2 px-2 py-2 rounded-md"
					/>
					<div v-if="errorMessage" class="mt-2 px-2 py-2 rounded-md">
						{{ errorMessage }}
					</div>
				</div>
				<CButton type="submit" look="regular" :is-loading="isLoading">
					Next
				</CButton>
				<div class="mt-6 flex items-center">
					<div class="border-t border-gray-300 flex-grow mr-3"></div>
					<div class="text-gray-600">or</div>
					<div class="border-t border-gray-300 flex-grow ml-3"></div>
				</div>
				<div class="mt-6 text-center">
					<a
						href="/auth/signin"
						class="text-black font-bold hover:underline"
						>Sign In</a
					>
				</div>
			</div>
		</Form>
		<Form
			v-else
			@submit="submitPasswordForm"
			:validation-schema="passwordValidationSchema"
			class="space-y-4"
		>
			<NewPasswordInput
				id="password"
				name="password"
				label="Password"
				:value="password"
				@update:value="password = $event"
			/>
			<div v-if="errorMessage" class="mt-2 px-2 py-2 rounded-md">
				{{ errorMessage }}
			</div>
			<div class="flex flex-row w-full">
				<button
					type="button"
					@click="showPasswordSection = false"
					class="w-1/2 text-black font-bold rounded-md"
				>
					Back
				</button>
				<CButton type="submit" look="regular" :is-loading="isLoading">
					Sign Up
				</CButton>
			</div>
		</Form>
	</div>
</template>

<script setup lang="ts">
import { Form, Field, ErrorMessage, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as zod from "zod";
import { useRouter } from "vue-router";
import { useToasterStore } from "~/stores/toaster";
import { zodEmail, zodPassword } from "~/utils/validation/common";

const toasterStore = useToasterStore();
const route = useRoute();
const router = useRouter();

const isLoading = ref<boolean>(false);

const errorMessage = ref<string>("");
const showPasswordSection = ref(false);

const redirect = ref<string>("");
redirect.value = route.query.redirect as string;

const userZodSchema = zod.object({ email: zodEmail });
const userValidationSchema = toTypedSchema(userZodSchema);
type UserFormValues = zod.infer<typeof userZodSchema>;

const email = ref<string>("");

const passwordZodSchema = zod.object({
	password: zodPassword,
});
const passwordValidationSchema = toTypedSchema(passwordZodSchema);
type PasswordFormValues = zod.infer<typeof passwordZodSchema>;

const { value: password } = useField<string>("password");

const submitUserForm = async (input: Record<string, unknown>) => {
	const form = input as UserFormValues;
	email.value = form.email;

	try {
		isLoading.value = true;

		await $fetch("/api/auth/signup", {
			method: "POST",
			body: {
				email: email.value,
			},
		});

		localStorage.setItem("email", form.email);
		showPasswordSection.value = true;

		errorMessage.value = "";
	} catch (e: any) {
		errorMessage.value = Object.hasOwn(e.data, "statusMessage")
			? e.data.statusMessage
			: "An unknown error occurred. Please try again.";
	} finally {
		isLoading.value = false;
	}
};

const submitPasswordForm = async (input: Record<string, unknown>) => {
	const form = input as PasswordFormValues;

	const verifyUrl = computed(() => {
		if (redirect.value)
			return `/auth/verify?email=${email.value}&redirect=${redirect.value}`;
		return `/auth/verify?email=${email.value}`;
	});

	try {
		isLoading.value = true;

		await $fetch("/api/auth/signup", {
			method: "POST",
			body: {
				email: email.value,
				password: form.password,
			},
		});

		toasterStore.addMessage("Account registered", "success");

		router.push(verifyUrl.value);
	} catch (e: any) {
		errorMessage.value = Object.hasOwn(e.data, "statusMessage")
			? e.data.statusMessage
			: "An unknown error occurred. Please try again.";
	} finally {
		isLoading.value = false;
	}
};
</script>

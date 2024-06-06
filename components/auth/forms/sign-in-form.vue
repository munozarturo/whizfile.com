<template>
	<div>
		<Form
			@submit="submitForm"
			:validation-schema="validationSchema"
			class="space-y-2"
		>
			<div>
				<label for="email" class="block text-gray-700 font-bold mb-2"
					>Email</label
				>
				<Field
					type="email"
					id="email"
					name="email"
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
				/>
				<ErrorMessage name="email" class="mt-2 px-2 py-2 rounded-md" />
			</div>
			<div>
				<label for="password" class="block text-gray-700 font-bold mb-2"
					>Password</label
				>
				<PasswordInput
					id="password"
					name="password"
					:value="password"
					@update:value="password = $event"
				/>
				<ErrorMessage
					name="password"
					class="mt-2 px-2 py-2 rounded-md"
				/>
			</div>
			<div v-if="errorMessage" class="mt-2 px-2 py-2 rounded-md">
				{{ errorMessage }}
			</div>
			<CButton type="submit" look="regular" :is-loading="isLoading"
				>Sign In
			</CButton>
			<div class="text-center mt-4">
				<a
					:href="resetUrl"
					class="text-sm text-gray-600 hover:text-gray-800"
				>
					Forgot Password?
				</a>
			</div>
		</Form>
		<Spacer>or</Spacer>
		<div class="mt-6 text-center">
			<a :href="signUpUrl" class="text-black font-bold hover:underline"
				>Sign Up</a
			>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Form, Field, ErrorMessage, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as zod from "zod";
import { useRouter } from "vue-router";
import { useToasterStore } from "~/stores/toaster";
import { zodEmail } from "~/utils/validation/common";

const toasterStore = useToasterStore();
const route = useRoute();
const router = useRouter();

const isLoading = ref<boolean>(false);

const errorMessage = ref<string>("");

const redirect = ref<string>("");
redirect.value = route.query.redirect as string;

const zodSchema = zod.object({
	email: zodEmail,
	password: zod.string(),
});
const validationSchema = toTypedSchema(zodSchema);
type FormValues = zod.infer<typeof zodSchema>;

const { value: password } = useField<string>("password");

const submitForm = async (input: Record<string, unknown>) => {
	const form = input as FormValues;

	const forwardUrl = computed(() => {
		if (redirect.value) return redirect.value;
		return "/";
	});

	const verifyUrl = computed(() => {
		if (redirect.value)
			return `/auth/verify?email=${form.email}&redirect=${redirect.value}`;
		return `/auth/verify?email=${form.email}`;
	});

	try {
		isLoading.value = true;

		await $fetch("/api/auth/signin", {
			method: "POST",
			body: form,
		});

		toasterStore.addMessage("Signed In", "success");

		router.push(forwardUrl.value);
	} catch (e: any) {
		errorMessage.value = Object.hasOwn(e.data, "statusMessage")
			? e.data.statusMessage
			: "An unknown error occurred. Please try again.";

		const statusCode: number | undefined = e.data.statusCode;
		if (statusCode == 403) router.push(verifyUrl.value);
	} finally {
		isLoading.value = false;
	}
};

const signUpUrl = computed(() => {
	if (redirect.value)
		return `/auth/signup?redirect=${encodeURIComponent(redirect.value)}`;
	return "/auth/signup";
});

const resetUrl = computed(() => {
	if (redirect.value)
		return `/auth/reset?redirect=${encodeURIComponent(redirect.value)}`;
	return "/auth/reset";
});
</script>

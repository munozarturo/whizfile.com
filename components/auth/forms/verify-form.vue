<template>
	<div v-if="!challenge">
		<p v-if="errorMessage" class="mt-4 text-center">
			{{ errorMessage }}
		</p>
		<p v-else-if="retryTimer > 0" class="mt-4 text-center text-gray-600">
			There has been an error, trying again in
			{{ retryTimer }} seconds.
		</p>
		<p v-else class="text-center text-gray-600">
			Sending Verification Token...
		</p>
	</div>
	<div v-else>
		<p class="text-left text-gray-700 mb-4">
			Enter the verification token sent to your email.
		</p>
		<Form
			@submit="submitForm"
			:validation-schema="validationSchema"
			class="space-y-2"
		>
			<Field name="token" v-slot="{ field }">
				<VerificationTokenInput
					v-model="field.value"
					@complete="submitForm"
				/>
			</Field>
			<ErrorMessage name="token" class="mt-2 text-center text-black" />
			<CButton type="submit" look="regular" :is-loading="isLoading">
				Verify
			</CButton>
		</Form>
		<p v-if="errorMessage" class="mt-4 text-center">
			{{ errorMessage }}
		</p>
		<div class="text-center mt-4">
			<button v-if="timer > 0" class="text-sm text-gray-600" disabled>
				Resend token in {{ timer }} seconds
			</button>
			<CButton
				v-else
				type="button"
				look="anchor"
				@click="resendVerificationToken"
			>
				Resend token?
			</CButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToasterStore } from "~/stores/toaster";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as zod from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { zodToken } from "~/utils/validation/common";

const toasterStore = useToasterStore();
const route = useRoute();
const router = useRouter();

const isLoading = ref<boolean>(false);

const email = ref<string>("");
const challenge = ref<string>("");
const errorMessage = ref<string>("");

const timer = ref<number>(0);
const timerInterval = ref<NodeJS.Timeout | null>(null);

const retryTimer = ref<number>(0);
const retryTimerInterval = ref<NodeJS.Timeout | null>(null);

const redirect = ref<string>("");
redirect.value = route.query.redirect as string;

const forwardUrl = computed(() => {
	if (redirect.value) return `/auth/signin?redirect=${redirect.value}`;
	return "/auth/signin";
});

const zodSchema = zod.object({
	token: zodToken,
});

const validationSchema = toTypedSchema(zodSchema);
type FormValues = zod.infer<typeof zodSchema>;

onMounted(async () => {
	email.value = route.query.email as string;
	if (email.value) {
		await sendVerificationToken();
	} else {
		challenge.value = route.query.challenge as string;
	}
});

const sendVerificationToken = async () => {
	try {
		isLoading.value = true;

		const res = await $fetch<{ challengeId: string }>("/api/auth/verify", {
			method: "POST",
			body: { email: email.value },
		});

		challenge.value = res.challengeId;
		router.replace({
			query: { challenge: challenge.value },
		});

		toasterStore.addMessage(
			"We sent a verification token to your email address",
			"info"
		);

		startTimer();
	} catch (e: any) {
		errorMessage.value = Object.hasOwn(e.data, "statusMessage")
			? e.data.statusMessage
			: "An unknown error occurred. Please try again.";

		const statusCode: number | undefined = e.data.statusCode;
		if (statusCode === 429) {
			startRetryTimer();
		} else if (statusCode === 409) {
			toasterStore.addMessage("Email already verified", "success");
			router.push(forwardUrl.value);
		}
	} finally {
		isLoading.value = false;
	}
};

const startTimer = () => {
	// auth.verificationCommunicationRateLimitMs
	timer.value = 60;
	timerInterval.value = setInterval(() => {
		timer.value--;
		if (timer.value === 0) {
			clearInterval(timerInterval.value!);
		}
	}, 1000);
};

const startRetryTimer = () => {
	// auth.verificationCommunicationRateLimitMs
	retryTimer.value = 60;
	retryTimerInterval.value = setInterval(() => {
		retryTimer.value--;
		if (retryTimer.value === 0) {
			clearInterval(retryTimerInterval.value!);
			resendVerificationToken();
		}
	}, 1000);
};

const resendVerificationToken = async () => {
	await sendVerificationToken();
};

const submitForm = async (input: Record<string, unknown>) => {
	const form = input as FormValues;

	try {
		isLoading.value = true;

		await $fetch("/api/auth/verify/confirm", {
			method: "POST",
			body: {
				challengeId: challenge.value,
				token: form.token,
			},
		});

		toasterStore.addMessage("Account verified", "success");

		router.push(forwardUrl.value);
	} catch (e: any) {
		errorMessage.value = Object.hasOwn(e.data, "statusMessage")
			? e.data.statusMessage
			: "An unknown error occurred. Please try again.";
	} finally {
		isLoading.value = false;
	}
};
</script>

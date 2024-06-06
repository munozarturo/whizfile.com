<script setup lang="ts">
interface Props {
	token?: string;
	communicationId?: string;
}

const props = withDefaults(defineProps<Props>(), {
	token: "XXXXXX",
	communicationId: "XXXXXXXX-TEST-XXXX-XXXX-XXXXXXXXXXXX",
});

const previewText = "Verify your email address";
</script>

<template>
	<ETailwind>
		<EHtml>
			<EHead />
			<EPreview>{{ previewText }}</EPreview>
			<EBody class="font-sans">
				<EContainer class="min-h-fit flex items-center justify-center">
					<div
						class="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto"
					>
						<EHeading class="text-2xl font-bold mb-6 text-center">
							Verify Your Email Address
						</EHeading>
						<EText class="text-gray-700 mb-6">
							Thank you for signing up! To complete your
							registration, please enter the verification code
							below:
						</EText>
						<div class="mb-6">
							<div
								class="bg-gray-100 p-4 rounded-md text-center text-2xl font-bold"
							>
								{{ token }}
							</div>
						</div>
						<EText class="text-gray-700 mb-6">
							If you did not sign up for an account, please ignore
							this email. If you have any questions or concerns,
							please contact our support team.
						</EText>
						<EHr class="border-t border-gray-300 my-6" />
						<EText class="text-gray-500 text-sm text-center">
							{{ communicationId }}
						</EText>
					</div>
				</EContainer>
			</EBody>
		</EHtml>
	</ETailwind>
</template>

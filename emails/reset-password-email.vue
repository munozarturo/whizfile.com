<script setup lang="ts">
interface Props {
	resetURL?: string;
	communicationId?: string;
}

const props = withDefaults(defineProps<Props>(), {
	resetURL: "https://example.com/reset-password",
	communicationId: "XXXXXXXX-TEST-XXXX-XXXX-XXXXXXXXXXXX",
});

const previewText = "Reset your password";
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
						<EHeading class="text-2xl font-bold mb-8 text-center">
							Reset Your Password
						</EHeading>
						<EText class="text-gray-700 mb-8 text-lg">
							You have requested to reset your password. Please
							click the button below to proceed:
						</EText>
						<div class="mb-8 text-center">
							<EButton
								:href="resetURL"
								class="bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded text-lg"
							>
								Reset Password
							</EButton>
						</div>
						<EText class="text-gray-700 mb-4 text-lg">
							If the button doesn't work, you can copy and paste
							the following URL into your browser:
						</EText>
						<div class="mb-8">
							<div class="bg-gray-100 p-4 rounded-md text-md">
								{{ resetURL }}
							</div>
						</div>
						<EText class="text-gray-700 mb-8 text-lg">
							If you did not request a password reset, please
							ignore this email. Your password will remain
							unchanged.
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

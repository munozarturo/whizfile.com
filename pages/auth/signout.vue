<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToasterStore } from "~/stores/toaster";

const toasterStore = useToasterStore();

const router = useRouter();

const signOut = async () => {
	try {
		await $fetch("/api/auth/signout", {
			method: "POST",
		});

		toasterStore.addMessage("Signed Out", "success");

		router.push("/");
	} catch (e: any) {
		const errorMessage = Object.hasOwn(e.data, "statusMessage")
			? e.data.statusMessage
			: "An unknown error occurred. Please try again.";

		toasterStore.addMessage(errorMessage, "error");
		router.push("/");
	}
};

onMounted(() => {
	signOut();
});
</script>

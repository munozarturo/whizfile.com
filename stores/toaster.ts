import { defineStore } from "pinia";

interface ToasterMessage {
	id: number;
	message: string;
	type: "success" | "error" | "info";
}

const useToasterStore = defineStore("toaster", {
	state: () => ({
		messages: [] as ToasterMessage[],
		lastId: Date.now(),
	}),
	actions: {
		addMessage(
			message: string,
			type: "success" | "error" | "info",
			duration: number = 10000
		) {
			const id = ++this.lastId;
			this.messages.push({ id, message, type });
			setTimeout(() => this.removeMessage(id), duration);
		},
		removeMessage(id: number) {
			this.messages = this.messages.filter(
				(message) => message.id !== id
			);
		},
	},
});

export { type ToasterMessage, useToasterStore };

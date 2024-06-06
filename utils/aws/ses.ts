import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

function getSESClient(): SESClient {
	const AWS_REGION = process.env.AWS_REGION;
	if (!AWS_REGION)
		throw new Error("`AWS_REGION` environment variable is undefined.");

	const AWS_KEY = process.env.AWS_KEY;
	if (!AWS_KEY)
		throw new Error("`AWS_KEY` environment variable is undefined.");

	const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
	if (!AWS_SECRET_ACCESS_KEY)
		throw new Error(
			"`AWS_SECRET_ACCESS_KEY` environment variable is undefined."
		);

	const client = new SESClient({
		region: AWS_REGION,
		credentials: {
			accessKeyId: AWS_KEY,
			secretAccessKey: AWS_SECRET_ACCESS_KEY,
		},
	});

	return client;
}

type EmailBody =
	| { html: string }
	| { text: string }
	| { html: string; text: string };

type Email = {
	source: string;
	replyTo?: string | string[];
	destination: {
		to: string | string[];
		cc?: string | string[];
		bcc?: string | string[];
	};
	subject: string;
	body: EmailBody;
};

async function sendEmail(email: Email) {
	const client = getSESClient();

	const input = {
		Source: email.source,
		Destination: {
			ToAddresses: Array.isArray(email.destination.to)
				? email.destination.to
				: [email.destination.to],
			CcAddresses: email.destination.cc
				? Array.isArray(email.destination.cc)
					? email.destination.cc
					: [email.destination.cc]
				: undefined,
			BccAddresses: email.destination.bcc
				? Array.isArray(email.destination.bcc)
					? email.destination.bcc
					: [email.destination.bcc]
				: undefined,
		},
		Message: {
			Subject: {
				Data: email.subject,
				Charset: "utf-8",
			},
			Body: {
				Text: {
					Data: "",
					Charset: "utf-8",
				},
				Html: {
					Data: "",
					Charset: "utf-8",
				},
			},
		},
		ReplyToAddresses: email.replyTo
			? Array.isArray(email.replyTo)
				? email.replyTo
				: [email.replyTo]
			: [email.source],
	};

	if ("html" in email.body) {
		input.Message.Body.Html.Data = email.body.html;
	}
	if ("text" in email.body) {
		input.Message.Body.Text.Data = email.body.text;
	}

	const cmd = new SendEmailCommand(input);
	const res = await client.send(cmd);
}

export { sendEmail, type Email };

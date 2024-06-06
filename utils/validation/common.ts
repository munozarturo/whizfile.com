import { z } from "zod";

const zodUUID = z.string().uuid();
const zodEmail = z.string().email();
const zodPassword = z
	.string()
	.min(6, "Password must be at least 6 characters long")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[0-9]/, "Password must contain at least one number")
	.regex(
		/[^A-Za-z0-9]/,
		"Password must contain at least one special character"
	);
const zodToken = z
	.string()
	.min(6, { message: "Token is 6 characters." })
	.max(6, { message: "Token is 6 characters." });
const zodLongToken = z
	.string()
	.min(128, { message: "Token is 128 characters." })
	.max(128, { message: "Token is 128 characters." });

export { zodUUID, zodEmail, zodPassword, zodToken, zodLongToken };

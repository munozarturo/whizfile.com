import * as crypto from "crypto";

function generateToken(bytes: number): string {
	return crypto.randomBytes(bytes).toString("hex");
}

export { generateToken };

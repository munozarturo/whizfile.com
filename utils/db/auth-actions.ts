import * as schema from "~/utils/db/schema";

import { and, eq, gt } from "drizzle-orm";

import { dbClient } from "./client";

type AuthContext = {
	user: {
		id: string;
		email: string;
		verified: boolean;
	};
	session: {
		token: string;
		active: boolean;
		createdAt: Date;
	};
} | null;

async function getUser(args: {
	email?: string;
	userId?: string;
}): Promise<typeof schema.users.$inferSelect | null> {
	const query = dbClient.select().from(schema.users);

	const { email, userId } = args;

	if (!email && !userId) return null;
	if (email) query.where(eq(schema.users.email, email));
	if (userId) query.where(eq(schema.users.id, userId));
	const res = await query.execute();

	if (res.length == 0) return null;

	const user = res[0];
	return user;
}

async function createUser(
	user: typeof schema.users.$inferInsert
): Promise<string | null> {
	const res = await dbClient
		.insert(schema.users)
		.values(user)
		.returning({ insertedId: schema.users.id })
		.execute();

	if (res.length == 0) return null;

	const insertedId = res[0].insertedId;
	return insertedId;
}

async function getChallenge(
	id: string
): Promise<typeof schema.challenges.$inferSelect | null> {
	const res = await dbClient
		.select()
		.from(schema.challenges)
		.where(eq(schema.challenges.id, id))
		.execute();

	if (res.length == 0) return null;

	const challenges = res[0];
	return challenges;
}

async function createChallenge(
	challenge: typeof schema.challenges.$inferInsert
): Promise<string | null> {
	const res = await dbClient
		.insert(schema.challenges)
		.values(challenge)
		.returning({ insertedId: schema.challenges.id })
		.execute();

	if (res.length == 0) return null;

	const insertedId = res[0].insertedId;
	return insertedId;
}

async function attemptChallenge(challengeId: string): Promise<string | null> {
	const resUpdateChallenge = await dbClient
		.update(schema.challenges)
		.set({ used: true })
		.where(eq(schema.challenges.id, challengeId))
		.returning({ userId: schema.challenges.userId })
		.execute();

	if (resUpdateChallenge.length == 0) return null;

	const userId = resUpdateChallenge[0].userId;
	return userId;
}

async function verifyUser(userId: string): Promise<void> {
	await dbClient
		.update(schema.users)
		.set({ verified: true })
		.where(eq(schema.users.id, userId))
		.execute();
}

async function resetPassword(
	userId: string,
	passwordHash: string
): Promise<void> {
	await dbClient
		.update(schema.users)
		.set({ passwordHash })
		.where(eq(schema.users.id, userId))
		.execute();
}

async function getSession(sessionId: string): Promise<AuthContext> {
	const res = await dbClient
		.select({
			userId: schema.users.id,
			email: schema.users.email,
			verified: schema.users.verified,
			sessionToken: schema.sessions.id,
			active: schema.sessions.active,
			createdAt: schema.sessions.createdAt,
		})
		.from(schema.sessions)
		.innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
		.where(eq(schema.sessions.id, sessionId))
		.execute();

	if (res.length === 0) return null;

	const { userId, email, verified, sessionToken, active, createdAt } = res[0];

	return {
		user: {
			id: userId,
			email,
			verified,
		},
		session: {
			token: sessionToken,
			active,
			createdAt,
		},
	};
}

async function createSession(
	session: typeof schema.sessions.$inferInsert
): Promise<string | null> {
	const res = await dbClient
		.insert(schema.sessions)
		.values(session)
		.returning({ insertedId: schema.sessions.id })
		.execute();

	if (res.length == 0) return null;

	const insertedId = res[0].insertedId;
	return insertedId;
}

async function closeSession(sessionId: string): Promise<string | null> {
	const res = await dbClient
		.update(schema.sessions)
		.set({ active: false })
		.where(eq(schema.sessions.id, sessionId))
		.returning({ userId: schema.sessions.userId })
		.execute();

	if (res.length == 0) return null;

	const userId = res[0].userId;
	return userId;
}

async function refreshSession(sessionId: string): Promise<string | null> {
	const userId = await closeSession(sessionId);
	if (!userId) return null;

	return await createSession({ userId });
}

async function logCommunication(
	communication: typeof schema.communications.$inferInsert
): Promise<string | null> {
	const res = await dbClient
		.insert(schema.communications)
		.values(communication)
		.returning({ insertedId: schema.communications.id })
		.execute();

	if (res.length == 0) return null;

	const insertedId = res[0].insertedId;
	return insertedId;
}

async function getCommunications(args: {
	to: string;
	fromTimestamp: Date;
	// not sure how to get enum types some other way
	type: (typeof schema.communications)["_"]["columns"]["type"]["_"]["enumValues"][number];
}): Promise<(typeof schema.communications.$inferSelect)[]> {
	const { to, fromTimestamp, type } = args;

	const res = await dbClient
		.select()
		.from(schema.communications)
		.where(
			and(
				eq(schema.communications.to, to),
				and(
					eq(schema.communications.type, type),
					gt(schema.communications.sentAt, fromTimestamp)
				)
			)
		)
		.execute();

	return res;
}

const auth = {
	getUser,
	createUser,
	getChallenge,
	createChallenge,
	attemptChallenge,
	verifyUser,
	resetPassword,
	getSession,
	createSession,
	closeSession,
	refreshSession,
	logCommunication,
	getCommunications,
};

export default auth;

export { type AuthContext };

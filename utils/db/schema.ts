import {
	boolean,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	email: text("email").notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	verified: boolean("verified").notNull().default(false),
});

export const sessions = pgTable("sessions", {
	id: uuid("id").primaryKey().defaultRandom(),
	active: boolean("active").notNull().default(true),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const challengeType = pgEnum("challenge_type", [
	"verification",
	"password-reset",
]);

export const challenges = pgTable("challenges", {
	id: uuid("id").primaryKey().defaultRandom(),
	type: challengeType("challenge_type").notNull(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	tokenHash: text("token_hash").notNull(),
	used: boolean("used").notNull().default(false),
});

export const communicationType = pgEnum("communication_type", [
	"verification-email",
	"password-reset-email",
]);

export const communications = pgTable("communications", {
	id: uuid("id").primaryKey().defaultRandom(),
	to: text("to").notNull(),
	type: communicationType("communication_type").notNull(),
	sentAt: timestamp("sent_at").notNull().defaultNow(),
});

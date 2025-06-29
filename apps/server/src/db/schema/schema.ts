//import { integer, text, boolean, pgTable } from "drizzle-orm/pg-core";
import {
	boolean,
	foreignKey,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// Categories table
export const categories = pgTable("categories", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 50 }).notNull().unique(), // e.g., "Tech", "Lifestyle"
});

// Blog posts table
export const posts = pgTable("posts", {
	id: serial("id").primaryKey(),
	title: varchar("title", { length: 200 }).notNull(),
	content: text("content").notNull(),
	image_url: varchar("image_url", { length: 500 }),
	category_id: integer("category_id").references(() => categories.id),
	author_id: text("author_id")
		.notNull()
		.references(() => user.id, {
			onDelete: "cascade",
		}),
	created_at: timestamp("created_at").defaultNow(),
	updated_at: timestamp("updated_at").defaultNow(),
});

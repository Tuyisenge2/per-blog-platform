//import { integer, text, boolean, pgTable } from "drizzle-orm/pg-core";
import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  foreignKey,
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
  author_id: integer("author_id").references(() => user.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// // user tabl
// export const users = pgTable("users", {
//   id: serial("id").primaryKey(),
//   username: varchar("username", { length: 255 }).notNull().unique(),
//   email: varchar("email", { length: 255 }).notNull().unique(),
//   password: varchar("password", { length: 255 }).notNull(),
//   is_admin: boolean("is_admin").default(false).notNull(),
//   created_at: timestamp("created_at").defaultNow().notNull(),
//   updated_at: timestamp("updated_at").defaultNow().notNull(),
// });
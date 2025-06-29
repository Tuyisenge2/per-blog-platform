import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "@/db/index";
import { categories, posts } from "@/db/schema/schema";

// Get all categories
export const getAllCategories = async () => {
	return await db.select().from(categories);
};

// Add new category (now returns the created category)
export const addCategory = async (name: string) => {
	const [newCategory] = await db
		.insert(categories)
		.values({ name })
		.returning(); // This returns the inserted record
	return newCategory; // Make sure to return the category
};

// Update category (new addition)
export const updateCategory = async (id: number, name: string) => {
	await db.update(categories).set({ name }).where(eq(categories.id, id));
};

// Delete category
export const deleteCategory = async (id: number) => {
	await db.delete(categories).where(eq(categories.id, id));
};

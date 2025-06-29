import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "@/db/index";
import { categories, posts } from "@/db/schema/schema";

const app = new Hono();

export const createPostResponse = ({
	success,
	title,
	body,
	postId,
}: {
	success: boolean;
	title: string;
	body: string;
	postId: string;
}) => ({
	success,
	message: "Post created successfully",
	post: {
		id: postId,
		title,
		body,
	},
});

export const addPost = async (
	title: string,
	content: string,
	categoryId: number | null,
	authorId: string,
	image_url?: string,
) => {
	const now = new Date();
	try {
		const [newPost] = await db
			.insert(posts)
			.values({
				title,
				content,
				image_url,
				category_id: categoryId,
				author_id: authorId,
				created_at: now,
				updated_at: now,
			})
			.returning();

		return {
			success: true,
			data: {
				...newPost,
				created_at: newPost.created_at ? new Date(newPost.created_at) : now,
				updated_at: newPost.updated_at ? new Date(newPost.updated_at) : now,
			},
			invalidate: ["/posts"],
		};
	} catch (error) {
		console.error("Failed to create post:", error);
		return {
			success: false,
			error: "Failed to create post",
			invalidate: [],
		};
	}
};

// Get single post by ID
export const getPost = async (id: number): Promise<any | null> => {
	const result = await db
		.select({
			id: posts.id,
			title: posts.title,
			content: posts.content,
			image_url: posts.image_url,
			category_id: posts.category_id,
			category_name: categories.name,
			created_at: posts.created_at,
			updated_at: posts.updated_at,
		})
		.from(posts)
		.leftJoin(categories, eq(posts.category_id, categories.id))
		.where(eq(posts.id, id));
	return result[0] || null;
};

// Get all posts with category names
export const getAllPosts = async (): Promise<any[]> => {
	return await db
		.select({
			id: posts.id,
			title: posts.title,
			content: posts.content,
			image_url: posts.image_url,
			category_id: posts.category_id,
			category_name: categories.name,
			created_at: posts.created_at,
			updated_at: posts.updated_at,
		})
		.from(posts)
		.leftJoin(categories, eq(posts.category_id, categories.id));
};

export const updatePost = async (
	id: number,
	title: string,
	content: string,
	categoryId: number | null,
	image_url?: string,
) => {
	await db
		.update(posts)
		.set({
			title,
			content,
			image_url,
			category_id: categoryId,
			updated_at: new Date(),
		})
		.where(eq(posts.id, id));
	return {
		success: true,
		message: "Post updated successfully",
	};
};

export const deletePost = async (id: number) => {
	await db.delete(posts).where(eq(posts.id, id));
	return {
		success: true,
		message: "Post deleted successfully",
	};
};

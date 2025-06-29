import { ORPCError } from "@orpc/server";
import z from "zod";
import { getAllCategories } from "@/lib/categories";
import {
  addPost,
  createPostResponse,
  deletePost,
  getAllPosts,
  getPost,
  updatePost,
} from "@/lib/post";
import { protectedProcedure, publicProcedure } from "../lib/orpc";
//const Pusher = require("pusher");
import Pusher from "pusher";

const pusher = new Pusher({
  appId: "2017929",
  key: "6e2d29ee27817f62d38a",
  secret: "e215502d4b2397e6eb8f",
  cluster: "ap2",
  useTLS: true,
});

pusher.trigger("my-channel", "my-event", {
  message: "hello world",
});

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    // pusher.trigger("chat-channel", "new-message", {
    //   message: "Hello, world!",
    // });

    return "OK";
  }),
  pusherRouter: publicProcedure
    .input(
      z.object({
        message: z.string().optional(),
      })
    )
    .handler(({ input }) => {
      pusher.trigger("chat-channel", "new-message", {
        message: input.message || "pusher not working",
      });
      return {
ok: true,     };
    }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
  addPost: publicProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
        categoryId: z.number().optional(),
        authorId: z.string(),
        image_url: z.string().optional(),
      })
    )
    .handler(async ({ input }) => {
      const result = await addPost(
        input.title,
        input.content,
        input.categoryId || null,
        input.authorId,
        input.image_url
      );
      if (!result.success) {
        throw new ORPCError("POST_CREATION_FAILED", {
          message: result.error,
        });
      }
      return {
        ...result.data,
        invalidate: result.invalidate,
      };
    }),
  createPost: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3),
        body: z.string().min(10),
      })
    )
    .handler(async ({ input }) => {
      return createPostResponse({
        success: true,
        title: input.title,
        body: input.body,
        postId: Math.random().toString(36).substring(2, 15),
      });
    }),
  getAllpost: protectedProcedure.handler(async () => {
    return getAllPosts();
  }),
  getPost: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .handler(async ({ input }) => {
      return getPost(input.id);
    }),
  getAllCategories: protectedProcedure.handler(async () => {
    return getAllCategories();
  }),
  editPost: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string(),
        content: z.string(),
        categoryId: z.number(),
        image_url: z.string(),
      })
    )
    .handler(async ({ input }) => {
      // You'll need to implement this in your lib/post.ts
      const result = await updatePost(
        input.id,
        input.title,
        input.content,
        input.categoryId,
        input.image_url || ""
      );

      if (!result.success) {
        throw new ORPCError("POST_UPDATE_FAILED", {
          message: result.message || "Failed to update post",
        });
      }
      return {
        ...result,
      };
    }),
  deletePost: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .handler(async ({ input }) => {
      const result = await deletePost(input.id); // to implement in lib/post.ts

      if (!result.success) {
        throw new ORPCError("POST_DELETION_FAILED", {
          message: result.message,
        });
      }
      return {
        message: "Post deleted successfully",
      };
    }),
};
export type AppRouter = typeof appRouter;

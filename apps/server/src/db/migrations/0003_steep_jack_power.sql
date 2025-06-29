ALTER TABLE "posts" DROP CONSTRAINT "posts_author_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "author_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
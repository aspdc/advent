CREATE TABLE "submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"problemId" "problem_id",
	"user_id" text NOT NULL,
	"submitted_value" integer NOT NULL,
	"submitted_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
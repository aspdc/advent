import { relations } from "drizzle-orm"
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  index,
  serial,
  date,
  pgEnum,
} from "drizzle-orm/pg-core"
import { user } from "./auth-schema"

export const problemIdEnum = pgEnum(
  "problem_id",
  Array.from({ length: 15 }, (_, i) => String(i + 1)) as unknown as [
    string,
    ...string[],
  ]
)

export const submission = pgTable("submissions", {
  id: serial("id").primaryKey(),
  problemId: problemIdEnum(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "no action",
      onUpdate: "no action",
    }),
  submittedValue: integer("submitted_value").notNull(),
  submittedAt: timestamp("submitted_at", { mode: "date" }).defaultNow(),
})

export const userSubmissionRelation = relations(user, ({ many }) => ({
  submissions: many(submission),
}))

export const submissionUserRelation = relations(submission, ({ one }) => ({
  user: one(user, {
    fields: [submission.userId],
    references: [user.id],
  }),
}))

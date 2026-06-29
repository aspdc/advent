import { relations } from "drizzle-orm"
import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core"
import { user } from "./auth-schema"

export const problem = pgTable("problems", {
  id: text("id").primaryKey(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const problemRelations = relations(problem, ({ many }) => ({
  submissions: many(user),
}))

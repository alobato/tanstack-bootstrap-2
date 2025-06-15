
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const customer = sqliteTable("customer", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull()
});

export type Customer = typeof customer.$inferSelect | undefined // return type when queried
export type InsertCustomer = typeof customer.$inferInsert // insert type
export type CustomerUpdate = InsertCustomer & { id: number }
export type CustomerDelete = { id: number }

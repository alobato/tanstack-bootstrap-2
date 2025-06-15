import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1'
import * as schema from '../db/schema'

export type Db = DrizzleD1Database<typeof schema>

export function initDb(env: { DB: D1Database }) {
  return drizzle(env.DB, { schema })
}

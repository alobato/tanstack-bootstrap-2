import { Db } from '@/lib/db';

export async function customersGet(db: Db) {
  const data = await db.query.customer.findMany();
  return data;
}

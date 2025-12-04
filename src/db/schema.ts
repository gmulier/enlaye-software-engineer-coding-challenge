import { sqliteTable, text, integer, foreignKey } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
});

export const files = sqliteTable("files", {
  id: integer().primaryKey({ autoIncrement: true }),
  ownerId: integer().notNull(),
  path: text().notNull(),
}, (table) => [
  foreignKey({
    columns: [table.ownerId],
    foreignColumns: [users.id],
  }),
]);

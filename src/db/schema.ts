import {
  foreignKey,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
});

export const files = sqliteTable(
  "files",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    ownerId: integer("owner_id").notNull(),
    path: text().notNull(),
    size: integer().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.ownerId],
      foreignColumns: [users.id],
    }),
  ]
);

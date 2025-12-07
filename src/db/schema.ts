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

export const processed_files = sqliteTable("processed_files", {
  id: integer().primaryKey({ autoIncrement: true }),
  hashCode: text().notNull().unique(),
});

export const files = sqliteTable(
  "files",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    path: text().notNull().unique(),
    ownerId: integer("owner_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.ownerId],
      foreignColumns: [users.id],
    }),
  ]
);

export const file_versions = sqliteTable(
  "file_versions",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    fileId: integer("file_id").notNull(),
    processedFileId: integer("processed_file_id").notNull(),
    size: integer().notNull(),
    uploadedAt: integer("uploaded_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (table) => [
    foreignKey({
      columns: [table.fileId],
      foreignColumns: [files.id],
    }),
    foreignKey({
      columns: [table.processedFileId],
      foreignColumns: [processed_files.id],
    }),
  ]
);


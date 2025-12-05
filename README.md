# Enlaye Files

This is a [Next.js](https://nextjs.org) project, with Drizzle and a local file-based SQL database.

## Getting Started

Use `npm` or `pnpm` (this project's default) or `yarn`.

```bash
pnpm install
pnpm run db:push # to create the database and update it

# Then you can run these two background tasks
pnpm run dev
pnpm run db:studio
```

## Troubleshooting

- `pnpm run db:push` is necessary at the beginning, and whenever `schema.ts` is updated.
- whenever something is wrong with the database, delete [`sqlite.db`](./sqlite.db) to clear the database, and restart the app.

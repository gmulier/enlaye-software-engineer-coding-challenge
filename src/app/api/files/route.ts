import { db, files, processed_files } from "@/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const allFiles = await db.select().from(files);

  const filesWithDuplicates = await Promise.all(
    allFiles.map(async (file) => {
      const duplicates = await db
        .select({ path: files.path })
        .from(files)
        .where(eq(files.processedFile, file.processedFile!));

      const samePathCount = duplicates.filter((d) => d.path === file.path).length;
      const otherPaths = [...new Set(duplicates.map((d) => d.path))].filter(
        (p) => p !== file.path
      );

      return {
        ...file,
        duplicateOf: otherPaths,
        samePathCount,
      };
    })
  );

  return NextResponse.json({ files: filesWithDuplicates });
}

export async function DELETE() {
  await db.delete(files);
  await db.delete(processed_files);
  return NextResponse.json({ success: true });
}

import { db, files, file_versions, processed_files } from "@/db";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const allFiles = await db.select().from(files);

  const allVersions = await db
    .select()
    .from(file_versions)
    .orderBy(desc(file_versions.uploadedAt));

  const versionsByFile = new Map<number, typeof allVersions>();
  const latestHashByFile = new Map<number, number>();

  for (const version of allVersions) {
    if (!versionsByFile.has(version.fileId)) {
      versionsByFile.set(version.fileId, []);
      latestHashByFile.set(version.fileId, version.processedFileId); // Premier = le plus récent (orderBy desc)
    }
    versionsByFile.get(version.fileId)!.push(version);
  }

  const filesWithMetadata = allFiles.map((file) => {
      const versions = versionsByFile.get(file.id)!;
      const currentVersion = versions[0];

      const duplicatePaths: string[] = [];
      for (const otherFile of allFiles) {
        if (otherFile.id === file.id) continue;
        if (latestHashByFile.get(otherFile.id) === currentVersion.processedFileId) {
          duplicatePaths.push(otherFile.path);
        }
      }

      return {
        id: file.id,
        path: file.path,
        size: currentVersion.size,
        uploadedAt: currentVersion.uploadedAt,
        duplicateOf: duplicatePaths,
        versions: versions.map((v, index) => ({
          id: v.id,
          size: v.size,
          uploadedAt: v.uploadedAt,
          isCurrent: index === 0,
        })),
      };
    });

  return NextResponse.json({ files: filesWithMetadata });
}

export async function DELETE() {
  await db.delete(file_versions);
  await db.delete(files);
  await db.delete(processed_files);
  return NextResponse.json({ success: true });
}

import { db, files, file_versions, processed_files, users } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { eq } from "drizzle-orm";

const USER_ID = 1;

async function getOrCreateProcessedFile(hash: string): Promise<number> {
  await db
    .insert(processed_files)
    .values({ hashCode: hash })
    .onConflictDoNothing();

  const [file] = await db
    .select()
    .from(processed_files)
    .where(eq(processed_files.hashCode, hash))
    .limit(1);

  return file.id;
}

async function insertVersion(fileId: number, processedFileId: number, size: number) {
  await db.insert(file_versions).values({ fileId, processedFileId, size });
}

async function createFileWithVersion(path: string, processedFileId: number, size: number) {
  const [newFile] = await db
    .insert(files)
    .values({ path, ownerId: USER_ID })
    .returning();

  await insertVersion(newFile.id, processedFileId, size);
}

async function generateCopyPath(originalPath: string): Promise<string> {
  const parts = originalPath.split('/');
  const fileName = parts[parts.length - 1];
  const basePath = parts.slice(0, -1).join('/');

  const dotIndex = fileName.lastIndexOf('.');
  const name = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
  const ext = dotIndex > 0 ? fileName.slice(dotIndex) : '';

  let counter = 1;
  let newPath: string;

  do {
    const newFileName = `${name} (${counter})${ext}`;
    newPath = basePath ? `${basePath}/${newFileName}` : newFileName;

    const [existing] = await db
      .select()
      .from(files)
      .where(eq(files.path, newPath))
      .limit(1);

    if (!existing) break;
    counter++;
  } while (counter < 100);

  return newPath;
}

export async function POST(request: NextRequest) {
  await assertUserExists();

  const formData = await request.formData();
  const formFile = formData.get("file") as File;
  const path = formData.get("path") as string;
  const mode = formData.get("mode") as "replace" | "copy" | null;

  const buffer = Buffer.from(await formFile.arrayBuffer());
  const checksumHash = createHash("sha256").update(buffer).digest("hex");

  const processedFileId = await getOrCreateProcessedFile(checksumHash);

  const [existingFile] = await db
    .select()
    .from(files)
    .where(eq(files.path, path))
    .limit(1);

  if (!existingFile) {
    await createFileWithVersion(path, processedFileId, formFile.size);
    return NextResponse.json({ success: true });
  }

  if (!mode) {
    return NextResponse.json({ conflict: true }, { status: 409 });
  }

  if (mode === "replace") {
    await insertVersion(existingFile.id, processedFileId, formFile.size);
    return NextResponse.json({ success: true });
  }

  const newPath = await generateCopyPath(path);
  await createFileWithVersion(newPath, processedFileId, formFile.size);
  return NextResponse.json({ success: true, newPath });
}

const assertUserExists = () =>
  db
    .insert(users)
    .values({
      id: USER_ID,
      email: "test@test.com",
      name: "Test User",
    })
    .onConflictDoNothing();

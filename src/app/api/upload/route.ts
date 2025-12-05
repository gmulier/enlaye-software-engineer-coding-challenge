import { db, files, processed_files, users } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { eq } from "drizzle-orm";

const USER_ID = 1;

export async function POST(request: NextRequest) {
  await assertUserExists();

  const formData = await request.formData();
  const formFile = formData.get("file") as File | null;
  const path = formData.get("path") as string;

  if (!formFile) {
    return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
  }

  await db
    .insert(users)
    .values({
      id: 1,
      email: "test@test.com",
      name: "Test User",
    })
    .onConflictDoNothing();

  const checksumHash = await createHash("sha256")

    .update(Buffer.from(await formFile.arrayBuffer()))

    .digest("hex");

  let processedFileId: number;

  const existing = await db
    .select()
    .from(processed_files)
    .where(eq(processed_files.hashCode, checksumHash));

  if (existing.length > 0) {
    processedFileId = existing[0].id;
  } else {
    const [createdHash] = await db
      .insert(processed_files)
      .values({ hashCode: checksumHash })
      .returning();
    processedFileId = createdHash.id;
  }

  const [createdFile] = await db
    .insert(files)
    .values({
      ownerId: 1,
      path,
      size: formFile.size,
      processedFile: processedFileId,
    })
    .returning();

  return NextResponse.json({ createdFile });
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

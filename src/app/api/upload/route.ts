import { db, files, users } from "@/db";
import { NextRequest, NextResponse } from "next/server";

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

  const [createdFile] = await db
    .insert(files)
    .values({
      ownerId: 1,
      path,
      size: formFile.size,
    })
    .returning();

  return NextResponse.json({
    createdFile,
  });
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

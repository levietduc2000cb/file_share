import { db } from "@/lib/db";

export type FileItem = {
  id: number;
  userId: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
};

export type CreateFileInput = {
  user_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
};

export async function getFilesByUserId(
  userId: number
): Promise<FileItem[]> {
  const result = await db.query<FileItem>(
    `
      SELECT
        id,
        user_id AS "userId",
        file_name AS "fileName",
        file_size AS "fileSize",
        file_path AS "filePath",
        created_at AS "createdAt"
      FROM files
      WHERE user_id = $1
      ORDER BY created_at DESC
    `,
    [userId]
  );

  return result.rows;
}

export async function getFirstFileByIdAndUserId(
  id: number,
  userId: number
): Promise<FileItem | null> {
  const result = await db.query<FileItem>(
    `
      SELECT
        id,
        user_id AS "userId",
        file_name AS "fileName",
        file_size AS "fileSize",
        file_path AS "filePath",
        created_at AS "createdAt"
      FROM files
      WHERE id = $1 AND user_id = $2
      ORDER BY created_at DESC
    `,
    [id, userId]
  );

  return result.rows[0] ?? null;
}

export async function createFile(
  data: CreateFileInput
): Promise<FileItem> {
  const { user_id,file_name,file_path, file_size, mime_type } = data;

  const result = await db.query<FileItem>(
    `
      INSERT INTO files (
        user_id,
        file_name,
        file_path,
        file_size,
        mime_type
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        user_id AS "userId",
        file_name AS "fileName",
        file_path AS "filePath",
        file_size AS "fileSize",
        created_at AS "createdAt"
    `,
    [user_id,file_name,file_path, file_size, mime_type]
  );

  return result.rows[0];
}

export async function deleteFile(id: number): Promise<FileItem | null> {
  const result = await db.query<FileItem>(
    `
      DELETE FROM files
      WHERE id = $1
      RETURNING
        id,
        user_id AS "userId",
        file_name AS "fileName",
        file_path AS "filePath",
        file_size AS "fileSize",
        mime_type AS "mimeType",
        created_at AS "createdAt"
    `,
    [id]
  );

  return result.rows[0] ?? null;
}
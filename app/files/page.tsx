import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getFilesByUserId } from "@/lib/repositories/fileRepository";
import FileManager from "./FileManager";


export default async function FilesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const files = await getFilesByUserId(user.id);

  return (
    <FileManager
      initialFiles={files.map((f) => ({
        ...f,
        createdAt: f.createdAt.toISOString(),
      }))}
    />
  );
}
"use client";

import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type Item = {
  id: number;
  fileName: string;
  size: number;
  createdAt: string;
};

export default function FileManager({
  initialFiles,
}: {
  initialFiles: Item[];
}) {
  const router = useRouter();

  const [files, setFiles] = useState<Item[]>(initialFiles);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tổng dung lượng
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  // Tìm kiếm file
  const filteredFiles = files.filter((file) =>
    file.fileName.toLowerCase().includes(search.toLowerCase())
  );

  // Chọn file
  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (file) {
      setSelectedFile(file);
      setMessage("");
    }
  }

  // Kéo file vào
  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files?.[0];

    if (file) {
      setSelectedFile(file);
      setMessage("");
    }
  }

  // Upload file
  async function upload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedFile || loading) return;

    setLoading(true);
    setMessage("");

    try {
      const body = new FormData();
      body.append("file", selectedFile);

      const res = await fetch("/api/files/upload", {
        method: "POST",
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Upload thất bại.");
        return;
      }

      setFiles((old) => [data.file, ...old]);

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setMessage("Upload file thành công!");
    } catch {
      setMessage("Có lỗi xảy ra khi upload file.");
    } finally {
      setLoading(false);
    }
  }

  // Xóa file
  async function remove(id: number) {
    if (!confirm("Bạn chắc chắn muốn xoá file này?")) return;

    try {
      const res = await fetch(`/api/files/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFiles((old) => old.filter((f) => f.id !== id));
      } else {
        setMessage("Không thể xóa file.");
      }
    } catch {
      setMessage("Có lỗi xảy ra khi xóa file.");
    }
  }

  // Đăng xuất
  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
              <FolderIcon />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                File Manager
              </h1>

              <p className="text-xs text-slate-500">
                Quản lý và lưu trữ dữ liệu
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">

        {/* TITLE */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Kho file của tôi
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Upload, quản lý và tải xuống các file của bạn.
          </p>
        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Tổng số file
            </p>

            <div className="mt-3 flex items-center justify-between">
              <h3 className="text-3xl font-bold text-slate-900">
                {files.length}
              </h3>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <FolderIcon />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Tổng dung lượng
            </p>

            <div className="mt-3 flex items-center justify-between">
              <h3 className="text-3xl font-bold text-slate-900">
                {formatSize(totalSize)}
              </h3>

              <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                <StorageIcon />
              </div>
            </div>
          </div>
        </div>

        {/* UPLOAD */}
        <form
          onSubmit={upload}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-slate-900">
              Upload file mới
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Chọn file từ máy tính hoặc kéo thả vào khu vực bên dưới.
            </p>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragging(false);
            }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              flex cursor-pointer flex-col items-center justify-center
              rounded-xl border-2 border-dashed px-6 py-12
              text-center transition-all
              ${
                dragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50"
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              name="file"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="mb-4 rounded-full bg-blue-100 p-4 text-blue-600">
              <UploadIcon />
            </div>

            {selectedFile ? (
              <>
                <p className="max-w-full break-all text-sm font-semibold text-blue-600">
                  {selectedFile.name}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {formatSize(selectedFile.size)}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-slate-700">
                  Nhấn để chọn file hoặc kéo thả vào đây
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Hỗ trợ upload tài liệu, hình ảnh, video và các định dạng khác
                </p>
              </>
            )}
          </div>

          <div className="mt-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">

            <div>
              {message && (
                <p className="text-sm text-slate-600">
                  {message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="
                inline-flex w-full items-center justify-center gap-2
                rounded-xl bg-blue-600 px-6 py-3
                text-sm font-semibold text-white
                transition hover:bg-blue-700
                disabled:cursor-not-allowed disabled:opacity-50
                sm:w-auto
              "
            >
              <UploadIcon />

              {loading ? "Đang upload..." : "Upload file"}
            </button>
          </div>
        </form>

        {/* FILE LIST */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* LIST HEADER */}
          <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Danh sách file
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {filteredFiles.length} file
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon />
              </span>

              <input
                type="text"
                placeholder="Tìm kiếm file..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  w-full rounded-xl border border-slate-200
                  bg-slate-50 py-2.5 pl-10 pr-4
                  text-sm text-slate-700 outline-none
                  transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100
                "
              />
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">

              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">
                    Tên file
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Dung lượng
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Ngày tải lên
                  </th>

                  <th className="px-6 py-4 text-right font-semibold">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredFiles.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-16 text-center text-sm text-slate-400"
                    >
                      Không tìm thấy file nào.
                    </td>
                  </tr>
                )}

                {filteredFiles.map((file) => (
                  <tr
                    key={file.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <FileIcon />
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[300px] truncate text-sm font-medium text-slate-800">
                            {file.fileName}
                          </p>

                          <p className="mt-1 text-xs uppercase text-slate-400">
                            {getExtension(file.fileName)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatSize(file.size)}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(file.createdAt).toLocaleString("vi-VN")}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">

                        <a
                          href={`/api/files/${file.id}/download`}
                          className="
                            rounded-lg bg-blue-50 px-3 py-2
                            text-xs font-semibold text-blue-600
                            transition hover:bg-blue-100
                          "
                        >
                          Tải xuống
                        </a>

                        <button
                          type="button"
                          onClick={() => remove(file.id)}
                          className="
                            rounded-lg bg-red-50 px-3 py-2
                            text-xs font-semibold text-red-600
                            transition hover:bg-red-100
                          "
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER */}
        <div className="pb-6 text-center text-xs text-slate-400">
          File Manager © {new Date().getFullYear()}
        </div>

      </main>
    </div>
  );
}

/* ================= HELPERS ================= */

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function getExtension(filename: string) {
  return filename.split(".").pop() || "FILE";
}

/* ================= ICONS ================= */

function FolderIcon() {
  return (
    <svg
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 16V4m0 0L7 9m5-5l5 5M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3"
      />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
      />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function StorageIcon() {
  return (
    <svg
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <rect x="3" y="4" width="18" height="7" rx="2" />
      <rect x="3" y="13" width="18" height="7" rx="2" />
      <path d="M7 7.5h.01M7 16.5h.01" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </svg>
  );
}
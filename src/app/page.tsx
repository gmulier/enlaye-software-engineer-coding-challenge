"use client";

import { useState, useCallback, useEffect } from "react";
import { UploadFiles } from "./components/UploadFiles";
import { FileBrowser } from "./components/FileBrowser";
import { FileResponse } from "./components/FileSystem";

export default function Home() {
  const [files, setFiles] = useState<FileResponse[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    const res = await fetch("/api/files");
    const data = await res.json();
    setFiles(data.files);
  }, []);

  const resetFiles = async () => {
    await fetch("/api/files", { method: "DELETE" });
    setFiles([]);
    setSelectedPath(null);
  };

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return (
    <div className="container mx-auto px-4 py-10 h-screen overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Enlaye Files</h1>
        <button
          onClick={resetFiles}
          className="px-3 py-1.5 text-sm border rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Reset
        </button>
      </div>

      <UploadFiles onUploadComplete={fetchFiles} />

      <FileBrowser
        files={files}
        selectedPath={selectedPath}
        onSelect={setSelectedPath}
      />
    </div>
  );
}

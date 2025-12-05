"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";

type ExtendedFile = File & {
  /** can sometimes be an empty string */
  webkitRelativePath?: string;
  path?: string;
  relativePath?: string;
};

type CreatedFile = {
  id: number;
  path: string;
  size: number;
  isDuplicate: boolean;
  duplicateOf: string[];
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function UploadFiles() {
  const [createdFiles, setCreatedFiles] = useState<CreatedFile[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchFiles = useCallback(async () => {
    const res = await fetch("/api/files");
    const data = await res.json();
    setCreatedFiles(data.files);
  }, []);

  const resetFiles = async () => {
    await fetch("/api/files", { method: "DELETE" });
    setCreatedFiles([]);
  };

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const onDrop = useCallback(async (acceptedFiles: ExtendedFile[]) => {
    if (acceptedFiles.length === 0) return;

    for (const file of acceptedFiles) {
      const path =
        file.path || file.relativePath || file.webkitRelativePath || file.name;
      const normalizedPath = path.replace(/^\.?\//, ""); // removes leading ./ or /

      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", normalizedPath);

      await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
    }
    // Rafraîchir la liste après upload
    fetchFiles();
  }, [fetchFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Upload Files</h3>
        <button
          onClick={resetFiles}
          className="px-3 py-1.5 text-sm border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
      </div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here...</p>
        ) : (
          <p>Drag & drop files here, or click to select</p>
        )}
      </div>
      <div className="mt-4 space-y-2">
        {createdFiles.map((file) => {
          const parts = file.path.split("/");
          const fileName = parts[parts.length - 1];
          const isExpanded = expandedId === file.id;

          return (
            <div key={file.id} className="border rounded-lg overflow-hidden">
              <div
                onClick={() => setExpandedId(isExpanded ? null : file.id)}
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <span>{fileName}</span>
                  {file.isDuplicate && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                      Doublon
                    </span>
                  )}
                </div>
                <span className="text-gray-500 text-sm">{formatSize(file.size)}</span>
              </div>

              {isExpanded && (
                <div className="border-t bg-gray-50 p-3 text-sm">
                  <div className="font-mono text-gray-600">
                    {parts.map((part, i) => (
                      <div key={i} style={{ paddingLeft: `${i * 16}px` }}>
                        {i < parts.length - 1 ? `📁 ${part}` : `📄 ${part}`}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-gray-500">
                    Taille: {formatSize(file.size)}
                  </div>
                  {file.isDuplicate && file.duplicateOf.length > 0 && (
                    <div className="mt-1 text-orange-600">
                      Identique à: {file.duplicateOf.join(", ")}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

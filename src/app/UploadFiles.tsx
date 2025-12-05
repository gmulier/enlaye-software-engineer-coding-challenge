"use client";

import { useState, useCallback } from "react";
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
};

export function UploadFiles() {
  const [createdFiles, setCreatedFiles] = useState<CreatedFile[]>([]);

  const onDrop = useCallback(async (acceptedFiles: ExtendedFile[]) => {
    if (acceptedFiles.length === 0) return;

    const newCreatedFiles: CreatedFile[] = [];
    for (const file of acceptedFiles) {
      const path =
        file.path || file.relativePath || file.webkitRelativePath || file.name;
      const normalizedPath = path.replace(/^\.?\//, ""); // removes leading ./ or /

      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", normalizedPath);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      newCreatedFiles.push(data.createdFile);
    }
    setCreatedFiles(newCreatedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Upload Files</h3>
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
      <ul className="list-disc list-inside mt-4">
        {createdFiles.map((file) => (
          <li key={file.id}>
            Created file #{file.id}: {file.path} ({file.size} bytes)
          </li>
        ))}
      </ul>
    </div>
  );
}

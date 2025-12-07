"use client";

import { useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { ConflictDialog } from "./ConflictDialog";
import { normalizeFilePath, ExtendedFile } from "../utils";

type PendingFile = { file: File; path: string };

interface UploadFilesProps {
  onUploadComplete: () => void;
}

export function UploadFiles({ onUploadComplete }: UploadFilesProps) {
  const [conflictDialog, setConflictDialog] = useState<PendingFile | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const pendingFilesRef = useRef<PendingFile[]>([]);

  const uploadFile = async (file: File, path: string, mode?: "replace" | "copy"): Promise<boolean> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);
    if (mode) formData.append("mode", mode);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.status === 409) {
      setConflictDialog({ file, path });
      return false;
    }

    return true;
  };

  const processFiles = async (files: PendingFile[], startIndex: number, total: number) => {
    for (let i = 0; i < files.length; i++) {
      const { file, path } = files[i];
      setProgress({ current: startIndex + i + 1, total });

      const success = await uploadFile(file, path);
      if (!success) {
        pendingFilesRef.current = files.slice(i + 1);
        return;
      }
    }

    setConflictDialog(null);
    setProgress(null);
    onUploadComplete();
  };

  const continueWithRemaining = async () => {
    const remaining = pendingFilesRef.current;
    if (remaining.length === 0) {
      setConflictDialog(null);
      setProgress(null);
      onUploadComplete();
      return;
    }

    pendingFilesRef.current = [];
    const currentIndex = progress?.current ?? 0;
    await processFiles(remaining, currentIndex, progress?.total ?? remaining.length);
  };

  const onDrop = async (acceptedFiles: ExtendedFile[]) => {
    if (acceptedFiles.length === 0) return;

    const files = acceptedFiles.map(f => ({ file: f, path: normalizeFilePath(f) }));
    pendingFilesRef.current = [];
    await processFiles(files, 0, files.length);
  };

  const handleResolve = async (mode: "replace" | "copy") => {
    if (!conflictDialog) return;
    await uploadFile(conflictDialog.file, conflictDialog.path, mode);
    await continueWithRemaining();
  };

  const handleSkip = async () => {
    await continueWithRemaining();
  };

  const handleCancel = () => {
    pendingFilesRef.current = [];
    setConflictDialog(null);
    setProgress(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <>
      {conflictDialog && (
        <ConflictDialog
          conflict={conflictDialog}
          progress={progress}
          onResolve={handleResolve}
          onSkip={handleSkip}
          onCancel={handleCancel}
        />
      )}

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all mb-4 ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        {isDragActive ? (
          <p className="text-sm text-blue-600">Drop the files here...</p>
        ) : (
          <p className="text-sm text-gray-600">Drag & drop files here, or click to select</p>
        )}
      </div>
    </>
  );
}

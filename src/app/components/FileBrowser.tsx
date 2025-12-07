"use client";

import { useEffect, useState, ReactNode } from "react";
import { X, Clock, HardDrive, Copy, History, LucideIcon } from "lucide-react";
import { FileSystem, FileResponse, FileIcon } from "./FileSystem";
import { buildTree, formatSize, formatDateTime, formatRelativeDate } from "../utils";

// Modal Quick Look avec animation scale
function QuickLookModal({ isOpen, onClose, children }: {
  isOpen: boolean;
  onClose: () => void;
  children: (handleClose: () => void) => ReactNode;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 150);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleClose}
    >
      <div
        className={`absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-150 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`relative bg-white rounded-xl shadow-2xl w-96 p-5 transition-all duration-150 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {children(handleClose)}
      </div>
    </div>
  );
}

interface FileBrowserProps {
  files: FileResponse[];
  selectedPath: string | null;
  onSelect: (path: string | null) => void;
}

export function FileBrowser({ files, selectedPath, onSelect }: FileBrowserProps) {
  const tree = buildTree(files);
  const selectedFile = files.find(f => f.path === selectedPath);

  return (
    <div className="select-none max-h-[calc(100vh-280px)] overflow-hidden">
      <div className="border rounded-lg p-4 bg-white overflow-y-auto max-h-[calc(100vh-280px)]">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Files</h3>
        <FileSystem
          files={tree}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      </div>

      <QuickLookModal isOpen={!!selectedFile} onClose={() => onSelect(null)}>
        {(handleClose) => selectedFile && <FileDetails file={selectedFile} onClose={handleClose} />}
      </QuickLookModal>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className="h-4 w-4 text-gray-400" />
      <div className="flex-1">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-sm text-gray-900">{value}</div>
      </div>
    </div>
  );
}

function FileDetails({ file, onClose }: { file: FileResponse; onClose: () => void }) {
  const fileName = file.path.split('/').pop() || file.path;
  const extension = fileName.includes('.') ? fileName.split('.').pop()?.toUpperCase() : 'FILE';

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
            <FileIcon name={fileName} type="file" className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm truncate max-w-[250px]">{fileName}</h3>
            <p className="text-xs text-gray-500">{extension} file</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Path */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-1">Location</div>
        <div className="font-mono text-xs bg-gray-50 px-2 py-1.5 rounded break-all text-gray-700">{file.path}</div>
      </div>

      {/* Info Grid */}
      <div className="border-t border-b py-1 mb-4">
        <InfoRow icon={HardDrive} label="Size" value={formatSize(file.size)} />
        <InfoRow icon={Clock} label="Uploaded" value={formatDateTime(file.uploadedAt)} />
      </div>

      {/* Duplicate Warning */}
      {file.duplicateOf.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-orange-600 mb-2">
            <Copy className="h-4 w-4" />
            <span className="text-xs font-medium">Duplicate content</span>
          </div>
          <div className="text-xs text-gray-500 mb-1">Identical to:</div>
          <ul className="space-y-1">
            {file.duplicateOf.map(path => (
              <li key={path} className="font-mono text-xs bg-orange-50 px-2 py-1 rounded text-orange-700">{path}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Version History */}
      {file.versions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-gray-700 mb-2">
            <History className="h-4 w-4" />
            <span className="text-xs font-medium">Version History ({file.versions.length})</span>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {file.versions.map((version, index) => (
              <div
                key={version.id}
                className={`flex items-center justify-between text-xs px-2 py-1.5 rounded ${
                  version.isCurrent ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={version.isCurrent ? 'text-blue-700 font-medium' : 'text-gray-600'}>
                    v{file.versions.length - index}
                  </span>
                  {version.isCurrent && (
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded">Current</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <span>{formatSize(version.size)}</span>
                  <span>{formatRelativeDate(version.uploadedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

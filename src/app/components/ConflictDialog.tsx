import { AlertCircle, Copy, Replace, SkipForward, X, LucideIcon } from 'lucide-react';

interface ConflictDialogProps {
  conflict: { file: File; path: string };
  progress: { current: number; total: number } | null;
  onResolve: (mode: "replace" | "copy") => void;
  onSkip: () => void;
  onCancel: () => void;
}

function ActionButton({ icon: Icon, title, description, onClick }: {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 border rounded-lg p-3 hover:bg-gray-50 text-left"
    >
      <Icon className="h-5 w-5 text-gray-600 mt-0.5" />
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
    </button>
  );
}

export function ConflictDialog({ conflict, progress, onResolve, onSkip, onCancel }: ConflictDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-orange-500" />
            <h3 className="font-semibold text-lg">File already exists</h3>
          </div>
          {progress && progress.total > 1 && (
            <span className="text-sm text-gray-500">
              {progress.current} / {progress.total}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-4">
          A file already exists at <code className="bg-gray-100 px-1 py-0.5 rounded">{conflict.path}</code>
        </p>

        <div className="space-y-2">
          <ActionButton
            icon={Replace}
            title="Replace"
            description="Create a new version and make it the current one"
            onClick={() => onResolve("replace")}
          />
          <ActionButton
            icon={Copy}
            title="Save a copy"
            description="Keep the original and create a new file with (1) suffix"
            onClick={() => onResolve("copy")}
          />
          <ActionButton
            icon={SkipForward}
            title="Skip"
            description="Ignore this file and continue with the next one"
            onClick={onSkip}
          />
        </div>

        <button
          onClick={onCancel}
          className="w-full flex items-center justify-center gap-2 mt-4 py-2 text-red-600 hover:text-red-700"
        >
          <X className="h-4 w-4" />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );
}

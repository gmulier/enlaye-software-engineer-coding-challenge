import { FileResponse, TreeNode, FolderStats } from './components/FileSystem';

function computeStats(node: TreeNode): FolderStats {
  if (node.type === 'file') {
    return {
      duplicateCount: node.fileData && node.fileData.duplicateOf.length > 0 ? 1 : 0,
      versionedCount: node.fileData && node.fileData.versions.length > 1 ? 1 : 0,
    };
  }

  const stats: FolderStats = { duplicateCount: 0, versionedCount: 0 };
  for (const child of node.children || []) {
    const childStats = computeStats(child);
    stats.duplicateCount += childStats.duplicateCount;
    stats.versionedCount += childStats.versionedCount;
  }
  node.stats = stats;
  return stats;
}

export function buildTree(files: FileResponse[]): TreeNode[] {
  const root: { [key: string]: any } = {};

  files.forEach(file => {
    const parts = file.path.split('/');
    let current = root;

    parts.forEach((part, idx) => {
      const isFile = idx === parts.length - 1;

      if (!current[part]) {
        current[part] = {
          name: part,
          type: isFile ? 'file' : 'folder',
          path: isFile ? file.path : undefined,
          fileData: isFile ? file : undefined,
          children: isFile ? undefined : {},
        };
      }

      if (!isFile) {
        current = current[part].children;
      }
    });
  });

  function toArray(obj: any): TreeNode[] {
    return Object.values(obj).map((node: any) => ({
      ...node,
      children: node.children ? toArray(node.children) : undefined,
    }));
  }

  const tree = toArray(root);
  tree.forEach(computeStats);
  return tree;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeDate(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export type ExtendedFile = File & {
  webkitRelativePath?: string;
  path?: string;
  relativePath?: string;
};

export function normalizeFilePath(file: ExtendedFile): string {
  const path = file.path || file.relativePath || file.webkitRelativePath || file.name;
  return path.replace(/^\.?\//, "");
}

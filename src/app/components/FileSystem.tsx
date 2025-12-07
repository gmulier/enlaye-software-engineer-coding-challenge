import { useState } from 'react';
import { formatSize, formatDate } from '../utils';
import {
  Folder,
  FolderOpen,
  File,
  FileText,
  FileJson,
  FileCode,
  FileImage,
  FileVideo,
  FileSpreadsheet,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

export type FileVersion = {
  id: number;
  size: number;
  uploadedAt: string;
  isCurrent: boolean;
};

export type FileResponse = {
  id: number;
  path: string;
  size: number;
  uploadedAt: string;
  duplicateOf: string[];
  versions: FileVersion[];
};

export type FolderStats = {
  duplicateCount: number;
  versionedCount: number;
};

export type TreeNode = {
  name: string;
  type: 'file' | 'folder';
  path?: string;
  fileData?: FileResponse;
  children?: TreeNode[];
  stats?: FolderStats;
};

// Extension mapping pour les icônes
const FILE_EXTENSIONS = {
  json: ['json'],
  spreadsheet: ['csv', 'xlsx', 'xls'],
  image: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'],
  video: ['mp4', 'mov', 'avi', 'mkv'],
  code: ['js', 'ts', 'tsx', 'jsx', 'py', 'java', 'go', 'rs'],
  text: ['txt', 'md', 'mdx']
};

// Icône basée sur l'extension
export function FileIcon({ name, type, expanded, className = "h-4 w-4" }: { name: string; type: 'file' | 'folder'; expanded?: boolean; className?: string }) {
  if (type === 'folder') {
    return expanded ? <FolderOpen className={className} /> : <Folder className={className} />;
  }

  const ext = name.split('.').pop()?.toLowerCase() ?? '';

  if (FILE_EXTENSIONS.json.includes(ext)) return <FileJson className={className} />;
  if (FILE_EXTENSIONS.spreadsheet.includes(ext)) return <FileSpreadsheet className={className} />;
  if (FILE_EXTENSIONS.image.includes(ext)) return <FileImage className={className} />;
  if (FILE_EXTENSIONS.video.includes(ext)) return <FileVideo className={className} />;
  if (FILE_EXTENSIONS.code.includes(ext)) return <FileCode className={className} />;
  if (FILE_EXTENSIONS.text.includes(ext)) return <FileText className={className} />;

  return <File className={className} />;
}

const GRID_COLS = 'grid grid-cols-[1fr_100px_70px_70px_70px] items-center gap-2 px-2 py-1';

function Badge({ value, color }: { value: number; color: 'orange' | 'blue' }) {
  const colors = color === 'orange'
    ? 'bg-orange-100 text-orange-600'
    : 'bg-blue-100 text-blue-600';
  return (
    <span className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-medium ${colors}`}>
      {value}
    </span>
  );
}

function Dot() {
  return <span className="inline-block w-2.5 h-2.5 bg-orange-400 rounded-full" />;
}

const Empty = () => <span className="text-gray-300">--</span>;

// Composant fichier
function FileNode({ node, depth, isSelected, onSelect }: {
  node: TreeNode;
  depth: number;
  isSelected: boolean;
  onSelect: (path: string | null) => void;
}) {
  const data = node.fileData;

  return (
    <div
      className={`${GRID_COLS} cursor-pointer rounded transition-colors ${
        isSelected ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-50 text-gray-700'
      }`}
      onClick={() => onSelect(isSelected ? null : node.path!)}
    >
      <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 16 + 20}px` }}>
        <FileIcon name={node.name} type="file" />
        <span className="text-sm truncate">{node.name}</span>
      </div>
      <span className="text-xs text-gray-500">{data ? formatDate(data.uploadedAt) : '--'}</span>
      <span className="text-xs text-gray-500">{data ? formatSize(data.size) : '--'}</span>
      <span className="text-xs text-center">
        {data && data.duplicateOf.length > 0 ? <Dot /> : <Empty />}
      </span>
      <span className="text-xs text-center">
        {data && data.versions.length > 1 ? <Badge value={data.versions.length} color="blue" /> : <Empty />}
      </span>
    </div>
  );
}

// Composant dossier
function FolderNode({ node, depth, selectedPath, onSelect }: {
  node: TreeNode;
  depth: number;
  selectedPath: string | null;
  onSelect: (path: string | null) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div>
      <div
        className={`${GRID_COLS} cursor-pointer hover:bg-gray-50 rounded text-gray-700`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 16}px` }}>
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          <FileIcon name={node.name} type="folder" expanded={expanded} />
          <span className="text-sm font-medium">{node.name}</span>
        </div>
        <Empty />
        <Empty />
        <span className="text-xs text-center">
          {node.stats && node.stats.duplicateCount > 0 ? <Badge value={node.stats.duplicateCount} color="orange" /> : <Empty />}
        </span>
        <span className="text-xs text-center">
          {node.stats && node.stats.versionedCount > 0 ? <Badge value={node.stats.versionedCount} color="blue" /> : <Empty />}
        </span>
      </div>
      {node.children && (
        <div className={expanded ? '' : 'hidden'}>
          {node.children.map(child => (
            <TreeNodeRow key={child.name} node={child} depth={depth + 1} selectedPath={selectedPath} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

// Routeur fichier/dossier
function TreeNodeRow({ node, depth, selectedPath, onSelect }: {
  node: TreeNode;
  depth: number;
  selectedPath: string | null;
  onSelect: (path: string | null) => void;
}) {
  const isSelected = node.path === selectedPath;

  if (node.type === 'file') {
    return <FileNode node={node} depth={depth} isSelected={isSelected} onSelect={onSelect} />;
  }

  return <FolderNode node={node} depth={depth} selectedPath={selectedPath} onSelect={onSelect} />;
}

// Composant principal
export function FileSystem({ files, selectedPath, onSelect }: {
  files: TreeNode[];
  selectedPath: string | null;
  onSelect: (path: string | null) => void;
}) {
  if (files.length === 0) {
    return <div className="text-gray-400 text-sm py-4 text-center">No files uploaded yet</div>;
  }

  return (
    <div>
      <div className={`${GRID_COLS} border-b text-xs text-gray-500 font-medium`}>
        <span style={{ paddingLeft: '20px' }}>Name</span>
        <span>Uploaded</span>
        <span>Size</span>
        <span className="text-center">Duplicate</span>
        <span className="text-center">Versions</span>
      </div>
      <div className="space-y-0.5 mt-1">
        {files.map(node => (
          <TreeNodeRow key={node.name} node={node} depth={0} selectedPath={selectedPath} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

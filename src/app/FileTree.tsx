export { FileTree };

type TreeNode = { name: string; children?: TreeNode[] };

const USER_ID = 1;

const FileTree = () => {
  const paths: string[] = [];
  const nodes: TreeNode[] = [];

  return (
    <div className="mb-4">
      <h3 className="text-lg font-bold mb-2">File Tree</h3>
      <FileNodes nodes={nodes} />
    </div>
  );
};

const FileNodes = ({ nodes }: { nodes: TreeNode[] }) => {
  return nodes.map((node) => <p key={node.name}>{node.name}</p>);
};

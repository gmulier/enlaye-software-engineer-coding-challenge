import { FileTree } from "./FileTree";
import { UploadFiles } from "./UploadFiles";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Enlaye Files</h1>
      <FileTree />
      <UploadFiles />
    </div>
  );
}

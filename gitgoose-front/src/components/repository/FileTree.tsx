import { TreeView, TreeItem } from "@mui/lab";
import {
  ExpandMore,
  ChevronRight,
  Folder,
  InsertDriveFile,
} from "@mui/icons-material";
import { Box } from "@mui/material";

interface FileNode {
  id: string;
  name: string;
  type: "file" | "directory";
  children?: FileNode[];
}

interface FileTreeProps {
  files: FileNode[];
  onFileSelect: (fileId: string) => void;
}

export default function FileTree({ files, onFileSelect }: FileTreeProps) {
  const renderTree = (node: FileNode) => (
    <TreeItem
      key={node.id}
      nodeId={node.id}
      label={node.name}
      icon={
        node.type === "directory" ? (
          <Folder color="primary" />
        ) : (
          <InsertDriveFile />
        )
      }
      onClick={() => node.type === "file" && onFileSelect(node.id)}
    >
      {node.children?.map((child) => renderTree(child))}
    </TreeItem>
  );

  return (
    <Box sx={{ maxHeight: "70vh", overflow: "auto" }}>
      <TreeView
        defaultCollapseIcon={<ExpandMore />}
        defaultExpandIcon={<ChevronRight />}
      >
        {files.map(renderTree)}
      </TreeView>
    </Box>
  );
}

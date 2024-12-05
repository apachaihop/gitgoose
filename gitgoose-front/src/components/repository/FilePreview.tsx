import { Box, Paper, Tabs, Tab } from "@mui/material";
import { useState } from "react";
import CodeViewer from "./CodeViewer";
import MarkdownViewer from "./MarkdownViewer";

interface FilePreviewProps {
  file: {
    name: string;
    content: string;
    size: number;
    lastModified: string;
    language: string;
  };
}

export default function FilePreview({ file }: FilePreviewProps) {
  const [viewMode, setViewMode] = useState<"preview" | "raw">("preview");
  const isMarkdown = file.name.toLowerCase().endsWith(".md");

  return (
    <Paper variant="outlined">
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={viewMode}
          onChange={(_, newValue) => setViewMode(newValue)}
        >
          <Tab value="preview" label="Preview" />
          <Tab value="raw" label="Raw" />
        </Tabs>
      </Box>

      <Box sx={{ p: 2 }}>
        {viewMode === "preview" && isMarkdown ? (
          <MarkdownViewer content={file.content} />
        ) : (
          <CodeViewer
            code={file.content}
            language={file.language}
            fileName={file.name}
          />
        )}
      </Box>
    </Paper>
  );
}

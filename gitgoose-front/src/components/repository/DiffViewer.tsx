import { Box, Paper, Typography } from "@mui/material";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface DiffViewerProps {
  filename: string;
  diff: string;
  language: string;
}

export default function DiffViewer({
  filename,
  diff,
  language,
}: DiffViewerProps) {
  return (
    <Paper variant="outlined" sx={{ mb: 2 }}>
      <Box sx={{ p: 1, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="subtitle2">{filename}</Typography>
      </Box>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{ margin: 0 }}
        wrapLines
        showLineNumbers
        lineProps={(lineNumber) => {
          const style = { display: "block", width: "100%" };
          if (diff[lineNumber - 1]?.startsWith("+")) {
            return {
              style: { ...style, backgroundColor: "rgba(40, 167, 69, 0.2)" },
            };
          }
          if (diff[lineNumber - 1]?.startsWith("-")) {
            return {
              style: { ...style, backgroundColor: "rgba(219, 55, 55, 0.2)" },
            };
          }
          return { style };
        }}
      >
        {diff}
      </SyntaxHighlighter>
    </Paper>
  );
}

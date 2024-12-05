import { Box, Paper } from "@mui/material";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface CodeViewerProps {
  code: string;
  language: string;
  fileName: string;
}

export default function CodeViewer({
  code,
  language,
  fileName,
}: CodeViewerProps) {
  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      <Box
        sx={{
          p: 1,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        {fileName}
      </Box>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: 0,
        }}
      >
        {code}
      </SyntaxHighlighter>
    </Paper>
  );
}

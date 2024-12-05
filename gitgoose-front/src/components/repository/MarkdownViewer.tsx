import ReactMarkdown from "react-markdown";
import { Box } from "@mui/material";

interface MarkdownViewerProps {
  content: string;
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  return (
    <Box
      sx={{
        "& img": { maxWidth: "100%" },
        "& pre": {
          backgroundColor: "grey.100",
          p: 2,
          borderRadius: 1,
          overflow: "auto",
        },
        "& code": {
          backgroundColor: "grey.100",
          p: 0.5,
          borderRadius: 0.5,
        },
        "& table": {
          borderCollapse: "collapse",
          "& th, & td": {
            border: "1px solid",
            borderColor: "divider",
            p: 1,
          },
        },
      }}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </Box>
  );
}

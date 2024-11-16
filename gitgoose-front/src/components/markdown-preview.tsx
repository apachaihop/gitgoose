import ReactMarkdown from 'react-markdown';
import { Paper } from '@mui/material';
import remarkGfm from 'remark-gfm';
import 'github-markdown-css/github-markdown.css';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export default function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  return (
    <Paper className={`p-4 markdown-body ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </Paper>
  );
}
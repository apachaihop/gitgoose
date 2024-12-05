import { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  TextField,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import { ContentCopy, Check } from "@mui/icons-material";

interface CloneButtonProps {
  cloneUrl: string;
}

export function CloneButton({ cloneUrl }: CloneButtonProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cloneUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button variant="contained" onClick={(e) => setAnchorEl(e.currentTarget)}>
        Clone
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <Box sx={{ p: 2, minWidth: 300 }}>
          <TextField
            fullWidth
            size="small"
            value={cloneUrl}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <Tooltip title={copied ? "Copied!" : "Copy"}>
                  <IconButton onClick={handleCopy}>
                    {copied ? <Check /> : <ContentCopy />}
                  </IconButton>
                </Tooltip>
              ),
            }}
          />
        </Box>
      </Menu>
    </>
  );
}

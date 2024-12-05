import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Button,
  DialogActions,
} from "@mui/material";
import { Label } from "@mui/icons-material";

const AVAILABLE_LABELS = [
  "bug",
  "feature",
  "documentation",
  "enhancement",
  "help wanted",
  "good first issue",
];

interface LabelSelectorDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectLabel: (label: string) => void;
  currentLabels: string[];
}

export default function LabelSelectorDialog({
  open,
  onClose,
  onSelectLabel,
  currentLabels,
}: LabelSelectorDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Select Labels</DialogTitle>
      <DialogContent>
        <List>
          {AVAILABLE_LABELS.map((label) => (
            <ListItem key={label} button onClick={() => onSelectLabel(label)}>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={currentLabels.includes(label)}
                  tabIndex={-1}
                  disableRipple
                />
              </ListItemIcon>
              <ListItemIcon>
                <Label />
              </ListItemIcon>
              <ListItemText primary={label} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

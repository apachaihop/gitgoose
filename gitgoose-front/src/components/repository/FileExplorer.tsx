import { useState } from "react";
import {
  Box,
  Paper,
  List,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Typography,
  Button,
} from "@mui/material";
import { Folder, InsertDriveFile, ArrowUpward } from "@mui/icons-material";
import { useQuery } from "@apollo/client";
import {
  GET_REPOSITORY_FILES,
  GET_FILE_DETAILS,
} from "@/lib/graphql/queries/repository";
import LoadingSpinner from "../shared/LoadingSpinner";
import BreadcrumbNav from "../navigation/BreadcrumbNav";
import ErrorAlert from "../shared/ErrorAlert";
import FileUploadDialog from "./FileUploadDialog";
import FilePreview from "./FilePreview";
import { getLanguageIcon } from "@/components/icons/LanguageIcon";
import { getLanguageInfo } from "@/lib/utils/languageUtils";

interface FileExplorerProps {
  repository: {
    id: string;
    currentBranch: string;
  };
  isOwner: boolean;
}

export default function FileExplorer({
  repository,
  isOwner,
}: FileExplorerProps) {
  const [currentPath, setCurrentPath] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const { data: filesData, loading: filesLoading } = useQuery(
    GET_REPOSITORY_FILES,
    {
      variables: {
        repositoryId: repository.id,
        ref: repository.currentBranch,
        path: currentPath,
      },
    }
  );

  const { data: fileData, loading: fileLoading } = useQuery(GET_FILE_DETAILS, {
    variables: {
      repositoryId: repository.id,
      path: selectedFile || "",
      ref: repository.currentBranch,
    },
    skip: !selectedFile,
  });

  if (filesLoading || fileLoading) return <LoadingSpinner />;

  const handleFileClick = (path: string, type: "file" | "directory") => {
    if (type === "directory") {
      setCurrentPath(path);
      setSelectedFile(null);
    } else {
      setSelectedFile(path);
    }
  };

  return (
    <Paper>
      <Box sx={{ p: 2 }}>
        {isOwner && (
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              onClick={() => setIsUploadDialogOpen(true)}
            >
              Upload Files
            </Button>
          </Box>
        )}
        <BreadcrumbNav
          path={selectedFile || currentPath}
          onNavigate={(path) => {
            if (path === "") {
              setCurrentPath("");
              setSelectedFile(null);
            } else {
              const isFile =
                filesData?.getRepositoryFiles.find((f) => f.path === path)
                  ?.type === "file";
              if (isFile) {
                setSelectedFile(path);
              } else {
                setCurrentPath(path);
                setSelectedFile(null);
              }
            }
          }}
          showRoot
        />
      </Box>

      {selectedFile && fileData?.getFileDetails ? (
        <Box sx={{ p: 2 }}>
          <FilePreview
            file={{
              name: selectedFile.split("/").pop() || "",
              content: fileData.getFileDetails.content,
              size: fileData.getFileDetails.size,
              lastModified: "",
              language: selectedFile.split(".").pop() || "text",
            }}
          />
        </Box>
      ) : (
        <List>
          {currentPath && (
            <ListItemButton
              onClick={() =>
                handleFileClick(
                  currentPath.split("/").slice(0, -1).join("/"),
                  "directory"
                )
              }
            >
              <ListItemIcon>
                <ArrowUpward />
              </ListItemIcon>
              <ListItemText primary=".." />
            </ListItemButton>
          )}
          {filesData?.getRepositoryFiles.map((item) => {
            const extension = item.path.split(".").pop() || "";
            const langInfo = getLanguageInfo(item.path);

            return (
              <ListItemButton
                key={item.path}
                onClick={() => handleFileClick(item.path, item.type)}
                sx={{
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <ListItemIcon sx={{ color: langInfo.color }}>
                  {item.type === "file" ? (
                    getLanguageIcon(extension)
                  ) : (
                    <Folder />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.path.split("/").pop()}
                  secondary={
                    item.type === "file" ? (
                      <Box
                        component="span"
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {langInfo.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          •
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.size < 1024
                            ? `${item.size} B`
                            : item.size < 1024 * 1024
                            ? `${Math.round(item.size / 1024)} KB`
                            : `${Math.round(item.size / (1024 * 1024))} MB`}
                        </Typography>
                      </Box>
                    ) : null
                  }
                />
              </ListItemButton>
            );
          })}
        </List>
      )}

      <FileUploadDialog
        open={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        repositoryId={repository.id}
        branch={repository.currentBranch}
      />
    </Paper>
  );
}

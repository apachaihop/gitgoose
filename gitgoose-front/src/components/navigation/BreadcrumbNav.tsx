import { Breadcrumbs, Link, Typography } from "@mui/material";
import { Home, InsertDriveFile } from "@mui/icons-material";

interface BreadcrumbItem {
  label: string;
  path: string;
  isLast?: boolean;
}

interface BreadcrumbNavProps {
  path?: string;
  onNavigate?: (path: string) => void;
  showRoot?: boolean;
  items?: BreadcrumbItem[];
}

export default function BreadcrumbNav({
  path = "",
  onNavigate,
  showRoot = false,
  items,
}: BreadcrumbNavProps) {
  if (items) {
    return (
      <Breadcrumbs aria-label="navigation">
        {items.map((item, index) => {
          return item.isLast ? (
            <Typography
              key={item.path}
              color="text.primary"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              {item.label}
            </Typography>
          ) : (
            <Link
              key={item.path}
              href={item.path}
              sx={{
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </Breadcrumbs>
    );
  }

  const pathParts = (path || "").split("/").filter(Boolean);
  const isFile = path.includes(".");

  return (
    <Breadcrumbs aria-label="file navigation">
      {showRoot && (
        <Link
          component="button"
          onClick={() => onNavigate?.("")}
          sx={{ display: "flex", alignItems: "center" }}
        >
          <Home sx={{ mr: 0.5 }} fontSize="small" />
          root
        </Link>
      )}
      {pathParts.map((part, index) => {
        const currentPath = pathParts.slice(0, index + 1).join("/");
        const isLast = index === pathParts.length - 1;

        return isLast ? (
          <Typography
            key={currentPath}
            color="text.primary"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            {isFile && <InsertDriveFile fontSize="small" />}
            {part}
          </Typography>
        ) : (
          <Link
            key={currentPath}
            component="button"
            onClick={() => onNavigate?.(currentPath)}
          >
            {part}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}

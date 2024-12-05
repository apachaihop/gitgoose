import {
  Code,
  Javascript,
  Html,
  Css,
  Language,
  DataObject,
  Terminal,
  Description,
} from "@mui/icons-material";
import { SvgIconProps } from "@mui/material";

export function getLanguageIcon(
  extension: string,
  props?: SvgIconProps
): JSX.Element {
  switch (extension.toLowerCase()) {
    case "js":
      return <Javascript {...props} />;
    case "jsx":
      return <Javascript {...props} />;
    case "ts":
      return <Code {...props} />;
    case "tsx":
      return <Code {...props} />;
    case "html":
      return <Html {...props} />;
    case "css":
      return <Css {...props} />;
    case "json":
      return <DataObject {...props} />;
    case "md":
      return <Description {...props} />;
    case "sh":
      return <Terminal {...props} />;
    case "py":
      return <Language {...props} />;
    case "java":
      return <Code {...props} />;
    case "go":
      return <Code {...props} />;
    case "rs":
      return <Code {...props} />;
    default:
      return <Description {...props} />;
  }
}

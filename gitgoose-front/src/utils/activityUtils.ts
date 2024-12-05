import { Activity } from "@/types/activity";

export function getActivityColor(type: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" {
    switch (type) {
      case "REPO_CREATE":
      case "REPO_UPDATE":
        return "success";
      case "PR_CREATE":
      case "PR_MERGE":
        return "primary";
      case "ISSUE_CREATE":
      case "ISSUE_REOPEN":
        return "warning";
      case "ISSUE_CLOSE":
      case "PR_CLOSE":
        return "error";
      default:
        return "default";
    }
  }

export function getActivityDescription(activity: Activity) {
  switch (activity.type) {
    case "REPO_CREATE":
      return "created a repository";
    case "REPO_DELETE":
      return "deleted a repository";
    case "REPO_UPDATE":
      return "updated a repository";
    case "PR_CREATE":
      return "opened a pull request";
    case "PR_MERGE":
      return "merged a pull request";
    case "PR_CLOSE":
      return "closed a pull request";
    case "ISSUE_CREATE":
      return "opened an issue";
    case "ISSUE_CLOSE":
      return "closed an issue";
    case "ISSUE_REOPEN":
      return "reopened an issue";
    case "STAR_REPO":
      return "starred a repository";
    case "UNSTAR_REPO":
      return "unstarred a repository";
    case "FOLLOW_USER":
      return `started following ${activity.targetUser?.username}`;
    case "UNFOLLOW_USER":
      return `unfollowed ${activity.targetUser?.username}`;
    default:
      return "performed an action";
  }
}
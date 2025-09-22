import { UserRole } from "@/types";

export const userRoleText = (role?: UserRole | null) => {
  switch (role) {
    case "owner":
      return "Owner";
    case "business":
      return "Business user";
    case "developer":
      return "Developer";
    case "financial_controller":
      return "Financial controller";
    case "initiator":
      return "Initiator";
    case "approver":
      return "Approver";
    default:
      return "";
  }
};

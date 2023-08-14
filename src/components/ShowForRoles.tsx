import { useIsUserRoleAccepted } from "hooks/useIsUserRoleAccepted";
import { UserRole } from "types";

interface ShowForRolesProps {
  acceptedRoles: UserRole[];
  children: React.ReactNode;
}

export const ShowForRoles: React.FC<ShowForRolesProps> = ({
  acceptedRoles,
  children,
}: ShowForRolesProps) => {
  const { isRoleAccepted } = useIsUserRoleAccepted(acceptedRoles);

  return isRoleAccepted ? <>{children}</> : null;
};

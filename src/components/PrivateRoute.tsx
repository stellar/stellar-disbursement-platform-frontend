import { Navigate, useLocation } from "react-router-dom";
import { useRedux } from "hooks/useRedux";
import { UserRole } from "types";

export const PrivateRoute = ({
  children,
  acceptedRoles,
}: {
  children: React.ReactElement;
  acceptedRoles?: UserRole[];
}) => {
  const { userAccount } = useRedux("userAccount");
  const location = useLocation();

  const isRoleRestricted = acceptedRoles && acceptedRoles?.length > 0;
  const isRoleAllowed =
    userAccount.role && acceptedRoles?.includes(userAccount.role as UserRole);

  const renderContent = () => {
    if (!isRoleRestricted || isRoleAllowed) {
      return children;
    }

    return (
      <Navigate
        to={{
          pathname: "/unauthorized",
        }}
      />
    );
  };

  return !userAccount.isAuthenticated || userAccount.isSessionExpired ? (
    <Navigate
      to={{
        pathname: "/",
        search: location.search,
      }}
    />
  ) : (
    renderContent()
  );
};

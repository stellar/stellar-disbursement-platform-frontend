import { Icon } from "@stellar/design-system";

import "./styles.scss";

interface EmptyStateMessageProps {
  icon?: React.ReactNode;
  message: string;
}

export const EmptyStateMessage = ({ icon = <Icon.Key01 />, message }: EmptyStateMessageProps) => (
  <div className="EmptyStateMessage">
    {icon}
    {message}
  </div>
);

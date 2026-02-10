import { Icon } from "@stellar/design-system";

import "./styles.scss";

interface EmptyStateMessageProps {
  icon?: React.ReactNode;
  message?: string;
  title?: string;
  description?: string;
}

export const EmptyStateMessage = ({
  icon = <Icon.Key01 />,
  message = "",
  title,
  description,
}: EmptyStateMessageProps) => {
  const useStacked = Boolean(title);

  return (
    <div className={`EmptyStateMessage ${useStacked ? "EmptyStateMessage--stacked" : ""}`}>
      {icon}
      {useStacked ? (
        <>
          {title && <span className="EmptyStateMessage__title">{title}</span>}
          {description && <span className="EmptyStateMessage__description">{description}</span>}
        </>
      ) : (
        message
      )}
    </div>
  );
};

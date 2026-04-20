import { Icon } from "@stellar/design-system";

import "./styles.scss";

type MessageVariant = {
  icon?: React.ReactNode;
  message: string;
  title?: never;
  description?: never;
};

type StackedVariant = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  message?: never;
};

type EmptyStateMessageProps = MessageVariant | StackedVariant;

export const EmptyStateMessage = ({
  icon = <Icon.Key01 />,
  message,
  title,
  description,
}: EmptyStateMessageProps) => {
  return (
    <div className={`EmptyStateMessage ${title ? "EmptyStateMessage--stacked" : ""}`}>
      {icon}
      {title ? (
        <>
          <span className="EmptyStateMessage__title">{title}</span>
          {description && <span className="EmptyStateMessage__description">{description}</span>}
        </>
      ) : (
        message
      )}
    </div>
  );
};

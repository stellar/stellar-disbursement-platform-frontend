import { Text } from "@stellar/design-system";

interface ErrorDisplayProps {
  error?: string;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, className = "" }) => {
  if (!error) return null;

  return (
    <div className={`ReceiverCreateModal__error-row ${className}`}>
      <Text size="sm" as="p">
        {error}
      </Text>
    </div>
  );
};

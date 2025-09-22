import { Text } from "@stellar/design-system";

export const Title = ({
  children,
  size,
}: {
  children: React.ReactNode;
  size: "sm" | "md" | "lg";
}) => (
  <Text size={size} as="div" weight="medium">
    {children}
  </Text>
);

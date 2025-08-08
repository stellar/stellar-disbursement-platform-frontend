import { Heading, Text } from "@stellar/design-system";

export const Unauthorized = () => {
  return (
    <>
      <Heading as="h2" size="sm">
        Unauthorized
      </Heading>
      <Text size="sm" as="p">
        You are not authorized to view this feature. Please contact your administrator with
        questions.
      </Text>
    </>
  );
};

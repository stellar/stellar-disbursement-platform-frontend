import { Heading, Paragraph } from "@stellar/design-system";

export const Unauthorized = () => {
  return (
    <>
      <Heading as="h2" size="sm">
        Unauthorized
      </Heading>
      <Paragraph size="sm">
        You are not authorized to view this feature. Please contact your
        administrator with questions.
      </Paragraph>
    </>
  );
};

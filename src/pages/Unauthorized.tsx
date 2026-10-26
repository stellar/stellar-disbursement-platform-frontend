import { useNavigate } from "react-router-dom";

import { Button, Heading, Text } from "@stellar/design-system";

import { Routes } from "@/constants/settings";

export const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <>
      <Heading as="h2" size="sm">
        You don't have access to this page
      </Heading>
      <Text size="sm" as="p">
        Your role doesn't include this feature. If you think you should have access, ask an owner on
        your team to grant it.
      </Text>
      <div className="UnauthorizedPage__action">
        <Button size="md" variant="primary" onClick={() => navigate(Routes.HOME)}>
          Back to Home
        </Button>
      </div>
    </>
  );
};

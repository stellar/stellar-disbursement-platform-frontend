import { useNavigate } from "react-router-dom";
import { Button, Heading, Text } from "@stellar/design-system";
import { Routes } from "constants/settings";

export const NotFound = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(Routes.HOME);
  };

  return (
    <div className="NotFoundPage">
      <Heading as="h1" size="lg">
        Error 404
      </Heading>
      <Text size="sm" as="p">
        Sorry, that page couldn’t be found.
      </Text>
      <Button size="md" variant="tertiary" onClick={handleBack}>
        Back to home
      </Button>
    </div>
  );
};

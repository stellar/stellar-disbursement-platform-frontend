import { useNavigate } from "react-router-dom";
import { Button, Heading, Paragraph } from "@stellar/design-system";
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
      <Paragraph size="sm">Sorry, that page couldn’t be found.</Paragraph>
      <Button size="sm" variant="secondary" onClick={handleBack}>
        Back to home
      </Button>
    </div>
  );
};

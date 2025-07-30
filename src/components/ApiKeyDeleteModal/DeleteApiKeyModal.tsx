import { useEffect, useState } from "react";
import { Button, Input, Modal, Notification } from "@stellar/design-system";

import { usePrevious } from "hooks/usePrevious";
import { ErrorWithExtras } from "components/ErrorWithExtras";

import { ApiKey } from "types";

import "./styles.scss";

interface DeleteApiKeyModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (apiKeyId: string) => void;
  onResetQuery: () => void;
  isLoading: boolean;
  errorMessage?: string;
  apiKey?: ApiKey;
}

export const DeleteApiKeyModal: React.FC<DeleteApiKeyModalProps> = ({
  visible,
  onClose,
  onSubmit,
  onResetQuery,
  isLoading,
  errorMessage,
  apiKey,
}) => {
  const [confirmationName, setConfirmationName] = useState<string>("");
  const previousVisible = usePrevious(visible);

  useEffect(() => {
    if (previousVisible && !visible) {
      setConfirmationName("");
    }
  }, [visible, previousVisible]);

  const handleClose = () => {
    onClose();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (errorMessage) {
      onResetQuery();
    }
    setConfirmationName(event.target.value);
  };

  const canDelete = confirmationName === apiKey?.name;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canDelete || !apiKey) {
      return;
    }
    onSubmit(apiKey.id);
  };

  return (
    <Modal visible={visible} onClose={handleClose}>
      <Modal.Heading>Delete API Key</Modal.Heading>
      <form onSubmit={handleSubmit} onReset={handleClose}>
        <Modal.Body>
          {errorMessage && (
            <Notification variant="error" title="Error">
              <ErrorWithExtras
                appError={{
                  message: errorMessage,
                }}
              />
            </Notification>
          )}

          <div className="DeleteApiKeyModal__content">
            <p>
              Are you sure you want to delete this API key? Type the name of the key to confirm you
              want to delete it.
            </p>
            <Input
              fieldSize="sm"
              id="confirmationName"
              name="confirmationName"
              type="text"
              placeholder={`Type "${apiKey?.name}"`}
              value={confirmationName}
              onChange={handleInputChange}
              required
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button size="md" variant="tertiary" type="reset" disabled={isLoading}>
            Cancel
          </Button>
          <Button
            size="md"
            variant={!canDelete ? "tertiary" : "destructive"}
            type="submit"
            disabled={!canDelete}
            isLoading={isLoading}
          >
            Delete key
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

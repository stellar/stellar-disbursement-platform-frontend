import { useState } from "react";
import { Button, Icon, Modal, Notification, Input } from "@stellar/design-system";

import "./styles.scss";

interface ApiKeySuccessModalProps {
  visible: boolean;
  onClose: () => void;
  apiKey?: {
    name: string;
    key: string;
  };
}

export const ApiKeySuccessModal: React.FC<ApiKeySuccessModalProps> = ({
  visible,
  onClose,
  apiKey,
}) => {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = () => {
    if (apiKey?.key) {
      navigator.clipboard.writeText(apiKey.key);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <Modal.Heading>
        <div className="ApiKeySuccessModal__header">
          <Icon.CheckCircle className="ApiKeySuccessModal__successIcon" />
          API Key Created Successfully
        </div>
      </Modal.Heading>
      <Modal.Body>
        <Notification variant="warning" title="Important">
          API key was successfully created! Make sure to copy and store it securely, THIS KEY WILL
          NOT BE SHOWN AGAIN. It may take a few minutes to be usable
        </Notification>

        <div className="ApiKeySuccessModal__keyContainer">
          <Input
            fieldSize="sm"
            id="apiKey"
            name="apiKey"
            type="text"
            value={apiKey?.key || ""}
            readOnly
            className="ApiKeySuccessModal__keyInput"
          />
          <Button
            variant="tertiary"
            size="md"
            icon={hasCopied ? <Icon.Check /> : <Icon.Copy01 />}
            onClick={handleCopy}
          >
            {hasCopied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button size="sm" variant="primary" onClick={onClose}>
          I have saved the key securely
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

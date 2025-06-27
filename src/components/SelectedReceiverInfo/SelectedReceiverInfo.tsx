import { ApiReceiver } from "types";

interface SelectedReceiverInfoProps {
  receiver: ApiReceiver;
}

export const SelectedReceiverInfo: React.FC<SelectedReceiverInfoProps> = ({ receiver }) => {
  const hasContactInfo = receiver.phone_number || receiver.email;

  return (
    <div className="DirectPaymentCreateModal__selectedReceiver">
      {receiver.phone_number && (
        <div className="DirectPaymentCreateModal__selectedReceiver__item">
          <span className="DirectPaymentCreateModal__selectedReceiver__label">Phone:</span>
          <span>{receiver.phone_number}</span>
        </div>
      )}
      {receiver.email && (
        <div className="DirectPaymentCreateModal__selectedReceiver__item">
          <span className="DirectPaymentCreateModal__selectedReceiver__label">Email:</span>
          <span>{receiver.email}</span>
        </div>
      )}
      <div className="DirectPaymentCreateModal__selectedReceiver__item">
        <span className="DirectPaymentCreateModal__selectedReceiver__label">ID:</span>
        <span>{receiver.id}</span>
      </div>
      {!hasContactInfo && (
        <div className="DirectPaymentCreateModal__selectedReceiver__item">
          <i>No contact information available</i>
        </div>
      )}
    </div>
  );
};

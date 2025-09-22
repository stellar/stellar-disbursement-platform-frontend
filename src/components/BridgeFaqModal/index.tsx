import { Modal, Link } from "@stellar/design-system";

import "./styles.scss";

interface BridgeFaqModalProps {
  visible: boolean;
  onClose: () => void;
}

const FAQ_DATA = [
  {
    question: "Does the developer provide SWIFT codes or account numbers?",
    answer:
      "Virtual accounts do not currently support SWIFT payments, only ACH and US domestic wires.",
  },
  {
    question: "How do I get microdeposit amounts?",
    answer:
      "Notifications for Microdeposits are sent to email, SMS, push notification. It can take up to 1 day for the microdeposits to arrive.",
  },
  {
    question: "Where can I find the 3-letter Plaid code?",
    answer: "The 3 letter code is included as part of the descriptor of the microdeposit.",
  },
  {
    question: "What transactions can I receive in my virtual account as a non-US resident?",
    answer:
      "Permitted transactions include: First-party payments from personal bank/fintech accounts, Third-party payments from registered businesses, Third-party payments from family members sharing a surname, and Person-to-Person payments under $2,000.",
  },
  {
    question: "What transactions can US residents receive?",
    answer:
      "Permitted transactions include: First-party payments from personal bank/fintech accounts and Payroll payments from businesses.",
  },
];

export const BridgeFaqModal: React.FC<BridgeFaqModalProps> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} onClose={onClose}>
      <Modal.Heading>Bridge Virtual Account FAQ</Modal.Heading>

      <Modal.Body>
        <div className="BridgeFaqModal">
          <div className="BridgeFaqModal__intro">
            <p>Find answers to frequently asked questions about Bridge virtual accounts below.</p>
          </div>

          <div className="BridgeFaqModal__content">
            {FAQ_DATA.map((faq, index) => (
              <div key={index} className="BridgeFaqModal__item">
                <h4 className="BridgeFaqModal__question">{faq.question}</h4>
                <p className="BridgeFaqModal__answer">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="BridgeFaqModal__footer">
            <p>
              For additional support or questions not covered here, please refer to{" "}
              <Link
                href="https://apidocs.bridge.xyz/docs/virtual-accounts-faqs"
                target="_blank"
                rel="noopener noreferrer"
                className="BridgeFaqModal__link"
              >
                Bridge's complete FAQ documentation
              </Link>
              .
            </p>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

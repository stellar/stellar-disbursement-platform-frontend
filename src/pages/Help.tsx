import { Heading } from "@stellar/design-system";
import { ExpandContent } from "components/ExpandContent";
import { SectionHeader } from "components/SectionHeader";

const FAQ = [
  {
    question:
      "What information do I need to upload to create a new disbursement?",
    answer:
      "First select the 'Registration Contact Type', then 'Wallet Provider', 'Asset' and 'Verification Type' for your disbursement. Then download the CSV sample and use it as a model to upload a list of receivers in CSV format with the fields. Keep in mind that phone number should be in international format with the plus sign. ID is a unique identifier per receiver. This should be a consistent identifier you use to track individuals in your internal systems. Amount is denominated in the asset you chose in the dropdown and should only contain the number, not the asset name. Verification is a piece of additional information the receiver will verify when signing up for a wallet in order to receive their funds. This could be date of birth, national ID number, or a personal PIN. It should be something the receiver knows and has provided to your organization.",
  },
  {
    question: "How can I track my payments?",
    answer:
      "You can view payments within a disbursement by going to the Disbursements page and then clicking into a specific disbursement. You can also see individual payments on the Payments screen. Clicking into an individual payment provides detailed information such as status over time and wallet address of the receiver. Payments can be in ready, pending, paused, success, or failure status.",
  },
  {
    question: "How do I pause a disbursement after it has been created?",
    answer:
      "You can pause a disbursement to prevent further payments from being sent. Click into a specific disbursement and click the ‘Pause’ button. This will not impact payments that have already been sent. The disbursement will remain paused until it is started again.",
  },
  {
    question: "How do I fund my distribution account?",
    answer:
      "You can find your distribution account public key by going to the Wallets page. Before you can send disbursements, you will need to fund the distribution account as it is the source of funds for payments. First acquire the digital assets you want to send. This could mean buying them on an exchange, minting them through an entity like Circle, or accepting crypto donations. Once you have the Stellar-based assets and are ready to disburse them, send them to the SDP distribution account. You can easily copy and paste the distribution account public key found on the Wallets page. Once the funds are in the distribution account, they are available for disbursements.",
  },
  {
    question: "How do I know my receivers accessed their money?",
    answer:
      "Payments are only sent once a receiver has registered for a digital wallet after being invited to receive money through the SDP. This means they have to actively participate in the process by claiming their money and verifying their identity. After a receiver has linked their wallet, subsequent payments will automatically be sent when a new disbursement is submitted. You can check to see if a receiver is using their money by clicking into a receiver and viewing their public blockchain key on a blockchain explorer like stellar.expert (available as a link in your dashboard as well). The blockchain explorer shows every transaction that has been done in the receiver’s wallet on an anonymized basis, as well as current balance.",
  },
  {
    question: "How do I track payments on the Stellar blockchain?",
    answer:
      "You can view all Stellar transactions on blockchain explorers like stellar.expert. The easiest way to view payments is by searching for either your distribution account public key or the public key of a specific receiver. This will allow you to see all activity on the account. There are links to stellar.expert directly in your SDP dashboard as well.",
  },
  {
    question: "What should I do if the receiver’s information is incorrect?",
    answer:
      "You can edit certain information on receivers in case of mistakes. Please make sure to confirm with the receiver before editing information.",
  },
  {
    question: "Can I take back funds after they have been sent?",
    answer:
      "No. Once funds are sent from your organization to the receiver, it is final. A receiver’s digital wallet is like a bank account in that they have full agency over the funds.",
  },
];

export const Help = () => {
  return (
    <>
      <SectionHeader>
        <SectionHeader.Row>
          <SectionHeader.Content>
            <Heading as="h2" size="sm">
              Help
            </Heading>
          </SectionHeader.Content>
        </SectionHeader.Row>
      </SectionHeader>

      <div className="CardStack">
        {FAQ.map((item, index) => (
          <ExpandContent key={index} title={item.question}>
            {item.answer}
          </ExpandContent>
        ))}
      </div>
    </>
  );
};

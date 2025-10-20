import { Button, Card } from "@stellar/design-system";

import { CsvPreview } from "@/components/CsvPreview";
import { CsvUpload } from "@/components/CsvUpload";
import { CsvUploadButton } from "@/components/CsvUploadButton";
import { InfoTooltip } from "@/components/InfoTooltip";
import { ShowForRoles } from "@/components/ShowForRoles";
import { Title } from "@/components/Title";
import { formatUploadedFileDisplayName } from "@/helpers/formatUploadedFileDisplayName";
import { saveFile } from "@/helpers/saveFile";
import { RegistrationContactType } from "@/types";

import "./styles.scss";

interface DisbursementInstructionsProps {
  variant: "upload" | "preview";
  csvFile?: File;
  onChange: (file: File | undefined) => void;
  isDisabled?: boolean;
  registrationContactType: RegistrationContactType | undefined;
  verificationField: string | undefined;
}

export const DisbursementInstructions: React.FC<DisbursementInstructionsProps> = ({
  variant,
  csvFile,
  onChange,
  isDisabled,
  registrationContactType,
  verificationField,
}: DisbursementInstructionsProps) => {
  const getCsvTemplateName = () => {
    switch (registrationContactType) {
      case "EMAIL":
      case "PHONE_NUMBER":
        return verificationField ? `${registrationContactType}_${verificationField}` : "";
      case "EMAIL_AND_WALLET_ADDRESS":
      case "PHONE_NUMBER_AND_WALLET_ADDRESS":
        return `${registrationContactType}`;
      default:
        return "";
    }
  };

  const csvTemplateName = getCsvTemplateName();

  const handleDownloadTemplate = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    saveFile({
      fileUrl: csvTemplateName
        ? `/resources/disbursementTemplates/${csvTemplateName}.csv`
        : "/resources/disbursement-template.csv",
      suggestedFileName: csvTemplateName
        ? `DISBURSEMENT_TEMPLATE_${csvTemplateName}.csv`
        : "disbursement-template.csv",
    });
  };

  const renderContent = () => {
    if (variant === "upload") {
      return (
        <>
          <div className="Note">Upload the list of receivers you want to pay.</div>
          <div className="Note">
            Please complete the details above before uploading a disbursement file. The CSV template
            will automatically update to match the options you selected above.
          </div>

          <CsvUpload initFile={csvFile} onChange={onChange} isDisabled={isDisabled} />
        </>
      );
    }

    return (
      <>
        {csvFile ? (
          <>
            <div className="Note">{formatUploadedFileDisplayName(csvFile)}</div>
            <CsvPreview file={csvFile} />
          </>
        ) : (
          <div className="Note">Please upload a disbursement file</div>
        )}
      </>
    );
  };

  const getButtonTitleText = () => {
    if (csvTemplateName) {
      return "";
    }

    if (!registrationContactType) {
      return "Please select Registration Contact Type";
    }

    if (["EMAIL", "PHONE_NUMEBR"].includes(registrationContactType)) {
      return "Please select Verification type";
    }

    return "";
  };

  return (
    <Card>
      <div className="DisbursementInstructions__titleWrapper">
        <InfoTooltip
          infoText={
            <div className="Note">
              File format
              <ul>
                <li>
                  <span className="Note__emphasis">
                    phone or email (mandatory) - the phone number or email address of the receiver.
                    Phone number must be in international format and include + at the beginning.
                  </span>
                </li>
                <li>
                  <span className="Note__emphasis">
                    walletAddress (included only if sending via address) - the Stellar blockchain
                    address of the receiver.
                  </span>
                </li>
                <li>
                  <span className="Note__emphasis">
                    id (mandatory) - a unique person identifier tied to the receiver, typically to
                    trace back to source systems.
                  </span>
                </li>
                <li>
                  <span className="Note__emphasis">
                    amount (mandatory) - the amount to be sent to the receiver in the asset selected
                    above.
                  </span>
                </li>
                <li>
                  <span className="Note__emphasis">
                    paymentID (optional) - a unique payment identifier tied to the specific payment,
                    typically to trace back to source systems.
                  </span>
                </li>
                <li>
                  <span className="Note__emphasis">
                    walletAddressMemo (optional) - if required, the Stellar transaction memo to be
                    included alongside the address.
                  </span>
                </li>
              </ul>
            </div>
          }
        >
          <Title size="md">Disbursement instructions</Title>
        </InfoTooltip>

        <div className="DisbursementInstructions__buttons">
          <Button
            size="sm"
            variant="tertiary"
            onClick={handleDownloadTemplate}
            disabled={!csvTemplateName}
            title={getButtonTitleText()}
          >
            Download CSV template
          </Button>

          <ShowForRoles acceptedRoles={["owner", "financial_controller", "initiator"]}>
            {variant === "preview" ? (
              <CsvUploadButton
                size="sm"
                variant="tertiary"
                onChange={(file) => onChange(file)}
                label={csvFile ? "Reupload CSV" : "Upload CSV"}
                isStandalone={true}
              />
            ) : null}
          </ShowForRoles>
        </div>
      </div>

      {renderContent()}
    </Card>
  );
};

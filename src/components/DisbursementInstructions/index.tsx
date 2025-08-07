import { Button, Card } from "@stellar/design-system";

import { formatUploadedFileDisplayName } from "helpers/formatUploadedFileDisplayName";
import { saveFile } from "helpers/saveFile";

import { CsvUpload } from "components/CsvUpload";
import { CsvUploadButton } from "components/CsvUploadButton";
import { CsvPreview } from "components/CsvPreview";
import { InfoTooltip } from "components/InfoTooltip";
import { Title } from "components/Title";

import { RegistrationContactType } from "types";

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
          <div className="Note">
            Please complete all fields above before uploading a disbursement file
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
        <InfoTooltip infoText="Upload a list of recipients you wish to pay">
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

          {variant === "preview" ? (
            <CsvUploadButton
              size="sm"
              variant="tertiary"
              onChange={(file) => onChange(file)}
              label={csvFile ? "Reupload CSV" : "Upload CSV"}
              isStandalone={true}
            />
          ) : null}
        </div>
      </div>

      {renderContent()}
    </Card>
  );
};

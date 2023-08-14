import { Button, Card, Title } from "@stellar/design-system";
import { formatUploadedFileDisplayName } from "helpers/formatUploadedFileDisplayName";
import { saveFile } from "helpers/saveFile";
import { CsvUpload } from "components/CsvUpload";
import { CsvUploadButton } from "components/CsvUploadButton";
import { CsvPreview } from "components/CsvPreview";
import { InfoTooltip } from "components/InfoTooltip";
import "./styles.scss";

interface DisbursementInstructionsProps {
  variant: "upload" | "preview";
  csvFile?: File;
  onChange: (file: File | undefined) => void;
  isDisabled?: boolean;
}

export const DisbursementInstructions: React.FC<
  DisbursementInstructionsProps
> = ({
  variant,
  csvFile,
  onChange,
  isDisabled,
}: DisbursementInstructionsProps) => {
  const handleDownloadTemplate = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault();
    saveFile({
      fileUrl: "/resources/disbursement-template.csv",
      suggestedFileName: "disbursement-template.csv",
    });
  };

  const renderContent = () => {
    if (variant === "upload") {
      return (
        <>
          <div className="Note">
            Please complete all fields above before uploading a disbursement
            file
          </div>

          <CsvUpload
            initFile={csvFile}
            onChange={onChange}
            isDisabled={isDisabled}
          />
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

  return (
    <Card>
      <div className="DisbursementInstructions__titleWrapper">
        <InfoTooltip infoText="Upload a list of recipients you wish to pay">
          <Title size="md">Disbursement instructions</Title>
        </InfoTooltip>

        <div className="DisbursementInstructions__buttons">
          <Button
            size="xs"
            variant="secondary"
            onClick={handleDownloadTemplate}
          >
            Download CSV template
          </Button>

          {variant === "preview" ? (
            <CsvUploadButton
              size="xs"
              variant="secondary"
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

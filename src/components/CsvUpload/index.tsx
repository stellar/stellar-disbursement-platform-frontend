import { useState } from "react";
import { formatUploadedFileDisplayName } from "helpers/formatUploadedFileDisplayName";
import { CsvUploadButton } from "components/CsvUploadButton";
import { FileUpload } from "components/FileUpload";
import "./styles.scss";

interface CsvUploadProps {
  onChange: (file?: File) => void;
  isDisabled?: boolean;
  initFile?: File;
}

export const CsvUpload = ({ onChange, initFile, isDisabled }: CsvUploadProps) => {
  const [file, setFile] = useState<File | undefined>(initFile);

  const handleChange = (inputFile?: File) => {
    setFile(inputFile);
    onChange(inputFile);
  };

  return (
    <div className="CsvUpload">
      <FileUpload
        onChange={handleChange}
        acceptedType={["text/csv"]}
        infoMessage={file ? formatUploadedFileDisplayName(file) : "or drop your file here"}
        disabled={isDisabled}
        uploadButton={
          <CsvUploadButton size="sm" variant="tertiary" isDisabled={Boolean(isDisabled)} showIcon />
        }
      />
    </div>
  );
};

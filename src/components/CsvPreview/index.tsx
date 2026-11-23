import { useEffect, useState } from "react";

import { DisbursementCsv, readDisbursementCsv } from "@/helpers/readDisbursementCsv";

import "./styles.scss";

interface CsvPreviewProps {
  file: File | undefined;
}

export const CsvPreview = ({ file }: CsvPreviewProps) => {
  const [fileData, setFileData] = useState<DisbursementCsv>();
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    if (!file) return;

    let isCurrent = true;
    readDisbursementCsv(file)
      .then((csv) => {
        if (!isCurrent) return;
        setFileData(csv);
        setErrorMessage(csv.rows.length === 0 ? "The CSV file is empty." : undefined);
      })
      .catch((error: Error) => {
        if (!isCurrent) return;
        setFileData(undefined);
        setErrorMessage(error.message);
      });

    return () => {
      isCurrent = false;
    };
  }, [file]);

  if (errorMessage) {
    return <div className="Note">{errorMessage}</div>;
  }

  if (!fileData || fileData.rows.length === 0) {
    return null;
  }

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  return (
    <div className="CsvPreview">
      <table>
        <thead>
          {/* Row with alphabet letters */}
          <tr>
            {/* Adding extra cell for index */}
            <th></th>
            {fileData.header.map((_, index) => (
              <th key={`col-${index}`}>{alphabet.charAt(index)}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* Row with column names */}
          <tr>
            {/* Adding extra cell for index */}
            <th>1</th>
            {fileData.header.map((col, index) => (
              <td key={`row-${index}`}>{col}</td>
            ))}
          </tr>
          {/* Data rows with index */}
          {fileData.rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              <th>{rowIndex + 2}</th>
              {row.map((val, valIndex) => (
                <td key={`val-${rowIndex}-${valIndex}`}>{`${val}`}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

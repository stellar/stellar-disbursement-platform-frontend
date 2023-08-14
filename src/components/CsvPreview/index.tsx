import { useEffect, useState } from "react";
import { parse } from "papaparse";

import "./styles.scss";

interface CsvPreviewProps {
  file: File | undefined;
}

export const CsvPreview = ({ file }: CsvPreviewProps) => {
  const [fileData, setFileData] = useState<any[]>();
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    if (file) {
      parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const { data } = results;

          if (data?.length === 0) {
            setErrorMessage("The CSV file is empty.");
            return;
          }

          // TODO: handle errors

          setErrorMessage(undefined);
          setFileData(data);
        },
        error: (error) => {
          // TODO: handle error
          console.log(">>> error: ", error);
        },
      });
    }
  }, [file]);

  if (errorMessage) {
    return <div className="Note">{errorMessage}</div>;
  }

  if (!fileData || fileData.length === 0) {
    return null;
  }

  const dataCols = Object.keys(fileData?.[0]);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  return (
    <div className="CsvPreview">
      <table>
        <thead>
          {/* Row with alphabet letters */}
          <tr>
            {/* Adding extra cell for index */}
            <th></th>
            {dataCols.map((col, index) => (
              <th key={`col-${col}`}>{alphabet.charAt(index)}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* Row with column names */}
          <tr>
            {/* Adding extra cell for index */}
            <th>1</th>
            {dataCols.map((col) => (
              <td key={`row-${col}`}>{col}</td>
            ))}
          </tr>
          {/* Data rows with index */}
          {fileData.map((item, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              <th>{rowIndex + 2}</th>
              {Object.values(item).map((val, valIndex) => (
                <td key={`val-${rowIndex}-${valIndex}`}>{`${val}`}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

import { useState, useRef, useEffect, cloneElement } from "react";
import "./styles.scss";

interface FileUploadProps {
  uploadButton?: React.ReactElement;
  onChange: (file?: File) => void;
  acceptedType: string[];
  infoMessage: string;
  disabled?: boolean;
  extraInfo?: React.ReactElement;
}

export const FileUpload = ({
  uploadButton,
  onChange,
  acceptedType,
  infoMessage,
  disabled,
  extraInfo,
}: FileUploadProps) => {
  const dropareaElRef = useRef<HTMLDivElement>(null);

  const [isDropInProgress, setIsDropInProgress] = useState(false);
  const [isDropDisabled, setIsDropDisabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const droparea = dropareaElRef?.current;

    const handleEnter = (event: Event) => {
      event.preventDefault();

      if (disabled) {
        setIsDropDisabled(true);
      } else {
        setIsDropInProgress(true);
        setErrorMessage("");
      }
    };

    const handleLeave = (event: Event) => {
      if (disabled) {
        setIsDropDisabled(false);
      } else {
        event.preventDefault();
        setIsDropInProgress(false);
      }
    };

    const handleDrop = (event: DragEvent) => {
      if (disabled) {
        return;
      }

      const files = event?.dataTransfer?.files;
      const droppedFile = files?.[0];

      // setFile(undefined);
      onChange(undefined);

      if (files && files.length > 1) {
        setErrorMessage("Too many files. Please upload only one file.");
        return;
      }

      if (droppedFile) {
        if (!acceptedType.includes(droppedFile.type)) {
          // We need to use only the second part of the type, for example "png"
          // from "image/png"
          const acceptedTypeString = acceptedType
            .map((t) => {
              const type = t.split("/")[1];
              return `.${type}`;
            })
            .join(" or ");

          setErrorMessage(
            `Wrong format. Please upload a ${acceptedTypeString} file.`,
          );
          return;
        }

        onChange(droppedFile);
        setErrorMessage("");
      }
    };

    ["dragenter", "dragover"].forEach((evtName) => {
      droparea?.addEventListener(evtName, handleEnter);
    });

    ["dragleave", "drop"].forEach((evtName) => {
      droparea?.addEventListener(evtName, handleLeave);
    });

    droparea?.addEventListener("drop", handleDrop);

    return () => {
      ["dragenter", "dragover"].forEach((evtName) => {
        droparea?.removeEventListener(evtName, handleEnter);
      });

      ["dragleave", "drop"].forEach((evtName) => {
        droparea?.removeEventListener(evtName, handleLeave);
      });

      droparea?.removeEventListener("drop", handleDrop);
    };
  }, [acceptedType, disabled, onChange]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const inputFile = event.target?.files?.[0];

    setErrorMessage("");
    onChange(inputFile);

    // We need to clear previous file/value to make it work when the same file is
    // selected again. Without clearing, the browser is caching the file so it
    // won't change even if it's updated and selected again.
    event.target.value = "";
  };

  const containerClasses = [
    "FileUpload",
    ...(isDropInProgress ? ["FileUpload--active"] : []),
    ...(isDropDisabled ? ["FileUpload--disabled"] : []),
  ].join(" ");

  return (
    <div ref={dropareaElRef} className={containerClasses}>
      {uploadButton ? (
        <div className="FileUpload__button">
          {cloneElement(uploadButton, {
            onChange: handleChange,
            disabled: Boolean(disabled),
          })}
        </div>
      ) : null}

      <div className="FileUpload__info">
        {extraInfo ? extraInfo : null}
        {errorMessage ? (
          <div className="FileUpload__message FileUpload__message--error">
            {errorMessage}
          </div>
        ) : (
          <div className="FileUpload__message">{infoMessage}</div>
        )}
      </div>
    </div>
  );
};

import { Icon } from "@stellar/design-system";
import "./styles.scss";

interface CsvUploadButtonProps {
  variant: "primary" | "secondary" | "tertiary";
  size: "md" | "sm" | "xs";
  onChange?: (file?: File) => void;
  label?: string;
  isDisabled?: boolean;
  showIcon?: boolean;
  // in standalone mode it uses local handleChange method
  isStandalone?: boolean;
}

export const CsvUploadButton = ({
  variant,
  size,
  onChange,
  label = "Upload CSV",
  isDisabled = false,
  showIcon,
  isStandalone,
}: CsvUploadButtonProps) => {
  const additionalClasses = ["Button", `Button--${variant}`, `Button--${size}`].join(" ");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isStandalone) {
      event.preventDefault();
      const inputFile = event.target?.files?.[0];

      if (onChange && inputFile) {
        onChange(inputFile);
      }

      // We need to clear previous file/value to make it work when the same file is
      // selected again. Without clearing, the browser is caching the file so it
      // won't change even if it's updated and selected again.
      event.target.value = "";
    } else {
      if (onChange) {
        // This event is actually a File but it won't accept it as a type
        onChange(event as any);
      }
    }
  };

  return (
    <div className="CsvUploadButton" aria-disabled={isDisabled}>
      <label className={additionalClasses} htmlFor="upload-csv-btn">
        {label}

        {showIcon ? (
          <span className="Button__icon">
            <Icon.UploadCloud01 />
          </span>
        ) : null}
      </label>
      <input
        type="file"
        id="upload-csv-btn"
        accept="text/csv"
        hidden
        disabled={isDisabled}
        onChange={handleChange}
      />
    </div>
  );
};

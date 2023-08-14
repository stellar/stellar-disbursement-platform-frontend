export const saveFile = ({
  file,
  fileUrl,
  suggestedFileName,
  callback,
  delay,
}: {
  file?: File;
  fileUrl?: string;
  suggestedFileName: string;
  callback?: () => void;
  delay?: number;
}) => {
  const objUrl = file ? URL.createObjectURL(file) : fileUrl;
  const a = document.createElement("a");

  if (!objUrl) {
    throw Error("Either file or fileUrl is required");
  }

  a.href = objUrl;
  a.download = suggestedFileName;
  a.style.display = "none";

  document.body.append(a);
  a.click();

  const t = setTimeout(() => {
    URL.revokeObjectURL(objUrl);
    a.remove();

    if (callback) {
      callback();
    }
    clearTimeout(t);
  }, delay ?? 3000);
};

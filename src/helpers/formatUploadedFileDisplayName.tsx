export const formatUploadedFileDisplayName = (file: File) => {
  return `${file.name} (${formatSize(file.size)})`;
};

const formatSize = (bytesSize: number): string => {
  if (bytesSize < 1024) {
    return `${bytesSize} bytes`;
  } else if (bytesSize >= 1024 && bytesSize < 1048576) {
    return `${(bytesSize / 1024).toFixed(2)} KB`;
  } else if (bytesSize >= 1048576) {
    return `${(bytesSize / 1048576).toFixed(2)} MB`;
  } else {
    return "";
  }
};

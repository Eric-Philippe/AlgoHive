export const convertBytes = (bytes: number) => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  if (bytes === 0) {
    return "Empty";
  }

  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());

  if (i === 0) {
    return bytes + " " + sizes[i];
  }

  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
};

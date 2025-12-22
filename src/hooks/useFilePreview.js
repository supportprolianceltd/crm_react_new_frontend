import { useState, useEffect, useCallback } from "react";

const useFilePreview = () => {
  const [previewFile, setPreviewFile] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Function to determine file type from filename
  const getFileTypeFromName = useCallback((filename) => {
    if (!filename) return "other";

    const lowerCaseFilename = filename.toLowerCase();

    // Check for image files
    if (
      lowerCaseFilename.includes(".png") ||
      lowerCaseFilename.includes(".jpg") ||
      lowerCaseFilename.includes(".jpeg") ||
      lowerCaseFilename.includes(".gif") ||
      lowerCaseFilename.includes(".webp") ||
      lowerCaseFilename.includes(".svg") ||
      lowerCaseFilename.includes(".bmp")
    ) {
      return "image";
    }

    // Check for PDF files
    if (lowerCaseFilename.includes(".pdf")) {
      return "pdf";
    }

    return "other";
  }, []);

  // Function to determine file type and handle preview
  const handlePreviewFile = useCallback(
    (fileData) => {
      const { file, fileUrl, filePreview } = fileData;

      if (file) {
        // Handle newly uploaded file object
        const fileType = file.type;
        if (fileType.startsWith("image/")) {
          setPreviewType("image");
          setPreviewFile(URL.createObjectURL(file));
        } else if (fileType === "application/pdf") {
          setPreviewType("pdf");
          setPreviewFile(URL.createObjectURL(file));
        } else {
          setPreviewType("other");
          setPreviewFile(file.name);
        }
      } else if (fileUrl) {
        // Handle existing file URL - use string inclusion check instead of extension
        const fileName = fileUrl.split("/").pop().split("?")[0]; // Get filename from URL
        const fileType = getFileTypeFromName(fileName);

        if (fileType === "image") {
          setPreviewType("image");
          setPreviewFile(fileUrl);
        } else if (fileType === "pdf") {
          setPreviewType("pdf");
          setPreviewFile(fileUrl);
        } else {
          setPreviewType("other");
          setPreviewFile(fileUrl);
        }
      } else if (filePreview) {
        // Handle preview from FileUploader (usually image preview)
        setPreviewType("image");
        setPreviewFile(filePreview);
      }
      setShowPreview(true);
    },
    [getFileTypeFromName]
  );

  const closePreview = useCallback(() => {
    setShowPreview(false);
    // Don't immediately clear previewFile to avoid flickering during close animation
    setTimeout(() => {
      setPreviewFile(null);
      setPreviewType(null);
    }, 300);
  }, []);

  // Clean up object URLs when component unmounts or previewFile changes
  useEffect(() => {
    return () => {
      if (previewFile && previewFile.startsWith("blob:")) {
        URL.revokeObjectURL(previewFile);
      }
    };
  }, [previewFile]);

  // Function to check if a file can be previewed
  const canPreviewFile = useCallback((fileData) => {
    const { file, fileUrl, filePreview } = fileData;
    return !!(file || fileUrl || filePreview);
  }, []);

  // Function to get file type for a given file data
  const getFileType = useCallback(
    (fileData) => {
      const { file, fileUrl, filePreview } = fileData;

      if (file) {
        const fileType = file.type;
        if (fileType.startsWith("image/")) return "image";
        if (fileType === "application/pdf") return "pdf";
        return "other";
      } else if (filePreview) {
        return "image";
      } else if (fileUrl) {
        const fileName = fileUrl.split("/").pop().split("?")[0]; // Get filename from URL
        return getFileTypeFromName(fileName);
      }

      return null;
    },
    [getFileTypeFromName]
  );

  return {
    previewFile,
    previewType,
    showPreview,
    handlePreviewFile,
    closePreview,
    canPreviewFile,
    getFileType,
  };
};

export default useFilePreview;

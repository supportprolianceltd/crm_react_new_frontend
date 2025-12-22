import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import OnBoardDoc from "../../../assets/Img/OnBoardDoc.png";
import noDocData from "../../../assets/Img/noDocData.png";
import Pagination from "../../../components/Table/Pagination";
import {
  CloudArrowUpIcon,
  DocumentIcon,
  FolderIcon,
  ClockIcon,
  ArrowUpTrayIcon,
  ExclamationTriangleIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import pdfIcon from "../../../assets/icons/pdf.png";
import wordIcon from "../../../assets/icons/word.png";
import excelIcon from "../../../assets/icons/excel.png";
import txtIcon from "../../../assets/icons/txt.png";
import imageIcon from "../../../assets/icons/image.png";
import zipIcon from "../../../assets/icons/zip.png";
import cadIcon from "../../../assets/icons/cad.png";
import bimIcon from "../../../assets/icons/bim.png";
import powerpointIcon from "../../../assets/icons/powerpoint.png";
import defaultIcon from "../../../assets/icons/file.png";
import { apiClient } from "../../../config";
import StatusBadge from "../../../components/StatusBadge";
import UploadOnboardingDocumentModal from "./modals/UploadOnboardingDocumentModal";
import AddUserAccessModal from "./modals/AddUserAccessModal";
import RemoveUserAccessModal from "./modals/RemoveUserAccessModal";
import ViewOnboardingDocumentModal from "./modals/ViewOnboardingDocumentModal";
import DeleteOnboardingDocumentModal from "./modals/DeleteOnboardingDocumentModal";
import ShowAcknowledgementsModal from "./modals/ShowAcknowledgementsModal";
import ViewVersionsModal from "./modals/ViewVersionsModal";
import ConfirmTitleEditModal from "./modals/ConfirmTitleEditModal";
import {
  fetchOnboardingDocuments,
  fetchAcknowledgements,
  fetchVersions,
  updateOnboardingDocument,
} from "./config/apiConfig";
import LoadingState from "../../../components/LoadingState";

const OnboardingDocuments = () => {
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [isFetchingDocuments, setIsFetchingDocuments] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingCell, setEditingCell] = useState({
    id: null,
    field: null,
    originalValue: "",
  });
  const [lastUpload, setLastUpload] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [uploadingForDocId, setUploadingForDocId] = useState(null);
  const [currentEditingDoc, setCurrentEditingDoc] = useState(null);
  const [currentDocSize, setCurrentDocSize] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "document_number",
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmEdit, setShowConfirmEdit] = useState({
    show: false,
    id: null,
    field: null,
    newValue: "",
  });
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [addUsersModalOpen, setAddUsersModalOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [selectedDocumentTitle, setSelectedDocumentTitle] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedViewDocId, setSelectedViewDocId] = useState(null);
  const [acknowledgementsModalOpen, setAcknowledgementsModalOpen] =
    useState(false);
  const [selectedAcknowledgementsDocId, setSelectedAcknowledgementsDocId] =
    useState(null);
  const [versionsModalOpen, setVersionsModalOpen] = useState(false);
  const [selectedVersionsDocId, setSelectedVersionsDocId] = useState(null);
  const [removeUsersModalOpen, setRemoveUsersModalOpen] = useState(false);
  const [selectedRemoveDocId, setSelectedRemoveDocId] = useState(null);
  const [confirmTitleEditOpen, setConfirmTitleEditOpen] = useState(false);
  const [titleEditData, setTitleEditData] = useState({
    id: null,
    originalTitle: "",
    newTitle: "",
  });
  const [isUpdatingTitle, setIsUpdatingTitle] = useState(false);
  const [titleSuccessMessage, setTitleSuccessMessage] = useState(null);
  const [titleErrorMessage, setTitleErrorMessage] = useState(null);
  const itemsPerPage = 10;

  const getFileExtension = (url) => {
    if (!url) return "";
    return url.split(".").pop().split("?")[0].split("#")[0].toLowerCase();
  };

  const getTotalSizeBytes = () => {
    return Array.isArray(documents)
      ? documents.reduce((acc, doc) => acc + (doc.file_size || 0), 0)
      : 0;
  };

  // Fetch documents on mount with cleanup
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchDocuments = async () => {
      try {
        setIsFetchingDocuments(true);
        const response = await fetchOnboardingDocuments();
        if (isMounted) {
          // Ensure response.data is an array
          const data = Array.isArray(response) ? response : [];
          setDocuments(data);
          if (data.length > 0) {
            setLastUpload(new Date(data[0].uploaded_at));
          }
        }
      } catch (error) {
        if (error.name === "AbortError") return;
        if (isMounted) {
          setErrorMessage("Failed to fetch documents");
          setTimeout(() => setErrorMessage(""), 4000);
        }
      } finally {
        setIsFetchingDocuments(false);
      }
    };

    fetchDocuments();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [refetchTrigger]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search input
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  // Handle sort
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  // Filter and sort documents
  const filteredAndSortedDocuments = Array.isArray(documents)
    ? documents
        .filter(
          (doc) =>
            (doc.document_number || "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            (doc.title || "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            (doc.expiring_date || "None")
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
          if (sortConfig.key === "document_number") {
            return sortConfig.direction === "asc"
              ? (a.document_number || "").localeCompare(b.document_number || "")
              : (b.document_number || "").localeCompare(
                  a.document_number || ""
                );
          }
          if (sortConfig.key === "title") {
            return sortConfig.direction === "asc"
              ? (a.title || "").localeCompare(b.title || "")
              : (b.title || "").localeCompare(a.title || "");
          }
          return 0;
        })
    : [];

  // Pagination
  const totalPages = Math.ceil(
    filteredAndSortedDocuments.length / itemsPerPage
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = filteredAndSortedDocuments.slice(
    startIndex,
    endIndex
  );

  const handleUploadClick = () => {
    setUploadingForDocId(null);
    setCurrentEditingDoc(null);
    setCurrentDocSize(0);
    setUploadModalOpen(true);
  };

  const handleUploadNewVersion = (doc) => {
    setCurrentEditingDoc({
      title: doc.title || "",
      description: doc.description || "",
      tags: doc.tags
        ? typeof doc.tags === "string"
          ? doc.tags
          : doc.tags.join(", ")
        : "",
    });
    setCurrentDocSize(doc.file_size || 0);
    setUploadingForDocId(doc.id);
    setUploadModalOpen(true);
    setActiveDropdown(null);
  };

  const handleUploadSuccess = (updatedDocument) => {
    setRefetchTrigger((prev) => prev + 1);
    setCurrentPage(1);
  };

  const handleUploadClose = () => {
    setUploadModalOpen(false);
    setUploadingForDocId(null);
    setCurrentEditingDoc(null);
    setCurrentDocSize(0);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0 || !bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getTotalSize = () => formatFileSize(getTotalSizeBytes());

  // Get file icon
  const getFileIcon = (ext) => {
    if (ext === "pdf") return pdfIcon;
    if (ext === "doc" || ext === "docx") return wordIcon;
    if (ext === "xls" || ext === "xlsx") return excelIcon;
    if (ext === "txt") return txtIcon;
    if (["jpg", "jpeg", "png", "gif"].includes(ext)) return imageIcon;
    if (ext === "zip") return zipIcon;
    if (ext === "dwg") return cadIcon;
    if (ext === "rvt") return bimIcon;
    if (ext === "ppt" || ext === "pptx") return powerpointIcon;
    return defaultIcon;
  };

  // Handle edit
  const startEditing = (id, field, value) => {
    let valueToUse = value;
    if (field === "expiring_date") {
      valueToUse = value || null;
    }
    setEditingCell({ id, field, originalValue: valueToUse });
  };

  const finishEditing = async (id, field, newValue) => {
    if (!id || !field) {
      setEditingCell({ id: null, field: null, originalValue: "" });
      return;
    }
    let finalValue = newValue.trim();
    if (field === "expiring_date") {
      finalValue = finalValue === "" ? null : finalValue;
    }
    if (finalValue !== editingCell.originalValue) {
      if (field === "title") {
        setTitleEditData({
          id,
          originalTitle: editingCell.originalValue,
          newTitle: finalValue,
        });
        setConfirmTitleEditOpen(true);
      } else {
        setShowConfirmEdit({ show: true, id, field, newValue: finalValue });
      }
    } else {
      setEditingCell({ id: null, field: null, originalValue: "" });
    }
  };

  const confirmEdit = async () => {
    const { id, field, newValue } = showConfirmEdit;
    let isMounted = true;
    try {
      const response = await updateOnboardingDocument(id, {
        [field]: newValue,
      });
      if (isMounted) {
        setDocuments((prev) =>
          prev.map((doc) => (doc.id === id ? response : doc))
        );
        setSuccessMessage(
          field === "title"
            ? "Document title updated"
            : field === "document_number"
            ? "Document number updated"
            : "Expiring date updated"
        );
        setTimeout(() => setSuccessMessage(""), 4000);
      }
    } catch (error) {
      if (isMounted) {
        setErrorMessage("Failed to update document");
        setTimeout(() => setErrorMessage(""), 4000);
      }
    }
    if (isMounted) {
      setShowConfirmEdit({ show: false, id: null, field: null, newValue: "" });
      setEditingCell({ id: null, field: null, originalValue: "" });
    }
    return () => {
      isMounted = false;
    };
  };

  const cancelEdit = () => {
    setShowConfirmEdit({ show: false, id: null, field: null, newValue: "" });
    setEditingCell({ id: null, field: null, originalValue: "" });
  };

  const handleEditChange = (id, field, value) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, [field]: value } : doc))
    );
  };

  const handleConfirmTitleEdit = async () => {
    const { id, newTitle } = titleEditData;
    let isMounted = true;
    try {
      setIsUpdatingTitle(true);
      setTitleSuccessMessage(null);
      setTitleErrorMessage(null);
      const response = await updateOnboardingDocument(id, {
        title: newTitle,
      });
      if (isMounted) {
        setDocuments((prev) =>
          prev.map((doc) => (doc.id === id ? response : doc))
        );
        setTitleSuccessMessage("Document title updated");
        setTimeout(() => setTitleSuccessMessage(null), 4000);
      }
    } catch (error) {
      if (isMounted) {
        setTitleErrorMessage("Failed to update document title");
        setTimeout(() => setTitleErrorMessage(null), 4000);
      }
    } finally {
      if (isMounted) {
        setIsUpdatingTitle(false);
        setConfirmTitleEditOpen(false);
        setTitleEditData({ id: null, originalTitle: "", newTitle: "" });
        setEditingCell({ id: null, field: null, originalValue: "" });
      }
    }
    return () => {
      isMounted = false;
    };
  };

  const handleCancelTitleEdit = () => {
    setConfirmTitleEditOpen(false);
    setTitleEditData({ id: null, originalTitle: "", newTitle: "" });
    setEditingCell({ id: null, field: null, originalValue: "" });
    setIsUpdatingTitle(false);
    setTitleSuccessMessage(null);
    setTitleErrorMessage(null);
  };

  // Handle file open
  const handleFileOpen = (doc) => {
    if (!doc.file_url) {
      setErrorMessage("File not available");
      setTimeout(() => setErrorMessage(""), 4000);
      return;
    }
    setSelectedViewDocId(doc.id);
    setViewModalOpen(true);
  };

  // Handle download
  const handleDownload = (doc) => {
    if (!doc.file_url) {
      setErrorMessage("File not available for download");
      setTimeout(() => setErrorMessage(""), 4000);
      return;
    }
    const ext = getFileExtension(doc.file_url);
    const link = document.createElement("a");
    link.href = doc.file_url;
    link.download = `${doc.title}_${doc.version}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle delete
  const handleDelete = (id, title) => {
    setDocumentToDelete({ id, title });
    setDeleteModalOpen(true);
    setActiveDropdown(null);
  };

  const handleDeleteSuccess = (deletedId) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== deletedId));
    if (paginatedDocuments.length === 1 && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleDeleteClose = () => {
    setDeleteModalOpen(false);
    setDocumentToDelete(null);
  };

  // Handle show acknowledgements
  const handleShowAcknowledgements = (id) => {
    setSelectedAcknowledgementsDocId(id);
    setAcknowledgementsModalOpen(true);
    setActiveDropdown(null);
  };

  const handleCloseAcknowledgements = () => {
    setAcknowledgementsModalOpen(false);
    setSelectedAcknowledgementsDocId(null);
  };

  // Handle view versions
  const handleViewVersions = (id) => {
    setSelectedVersionsDocId(id);
    setVersionsModalOpen(true);
    setActiveDropdown(null);
  };

  const handleCloseVersions = () => {
    setVersionsModalOpen(false);
    setSelectedVersionsDocId(null);
  };

  // Handle add users access
  const handleAddUsersAccess = (id, title) => {
    setSelectedDocumentId(id);
    setSelectedDocumentTitle(title);
    setAddUsersModalOpen(true);
    setActiveDropdown(null);
  };

  const handleAddUsersClose = () => {
    setAddUsersModalOpen(false);
    setSelectedDocumentId(null);
    setSelectedDocumentTitle(null);
  };

  const handleAddUsersSuccess = (updatedDoc) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === selectedDocumentId ? updatedDoc : doc))
    );
    if (viewModalOpen && selectedViewDocId === selectedDocumentId) {
      setRefetchTrigger((prev) => prev + 1);
    }
    setSuccessMessage(`Updated access for users`);
    setTimeout(() => setSuccessMessage(""), 4000);
    handleAddUsersClose();
  };

  // Handle remove user access
  const handleRemoveUserAccess = (id) => {
    setSelectedRemoveDocId(id);
    setRemoveUsersModalOpen(true);
    setActiveDropdown(null);
  };

  const handleRemoveUsersClose = () => {
    setRemoveUsersModalOpen(false);
    setSelectedRemoveDocId(null);
  };

  const handleRemoveUsersSuccess = (updatedDoc) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === selectedRemoveDocId ? updatedDoc : doc))
    );
    setSuccessMessage(`Removed access for users`);
    setTimeout(() => setSuccessMessage(""), 4000);
    handleRemoveUsersClose();
  };

  const handleViewClose = () => {
    setViewModalOpen(false);
    setSelectedViewDocId(null);
  };

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Dropdown and modal animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  };

  if (isFetchingDocuments)
    return <LoadingState text="Loading onboarding documents..." />;

  const initialFormDataForModal = currentEditingDoc || null;

  return (
    <div className="OnboardingDocuments-PGBA">
      {/* Error and Success Alerts */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed",
              top: 70,
              right: 20,
              background: "rgba(255, 77, 79, 0.9)",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "6px",
              zIndex: 3000,
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }}
          >
            {errorMessage}
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed",
              top: 70,
              right: 20,
              background: "rgba(40, 167, 69, 0.95)",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "6px",
              zIndex: 3000,
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }}
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <UploadOnboardingDocumentModal
        isOpen={uploadModalOpen}
        onClose={handleUploadClose}
        onUploadSuccess={handleUploadSuccess}
        initialFormData={initialFormDataForModal}
        documentId={uploadingForDocId}
        currentTotalSizeBytes={getTotalSizeBytes()}
        isUpdate={!!uploadingForDocId}
        currentDocSize={currentDocSize}
      />

      {/* View Document Modal */}
      <ViewOnboardingDocumentModal
        isOpen={viewModalOpen}
        onClose={handleViewClose}
        documentId={selectedViewDocId}
        onAddUsers={handleAddUsersAccess}
        refetchTrigger={refetchTrigger}
      />

      {/* Add Users Modal */}
      <AddUserAccessModal
        isOpen={addUsersModalOpen}
        onClose={handleAddUsersClose}
        documentId={selectedDocumentId}
        documentTitle={selectedDocumentTitle}
        onSuccess={handleAddUsersSuccess}
      />

      {/* Remove Users Modal */}
      <RemoveUserAccessModal
        isOpen={removeUsersModalOpen}
        onClose={handleRemoveUsersClose}
        documentId={selectedRemoveDocId}
        onSuccess={handleRemoveUsersSuccess}
      />

      {/* Show Acknowledgements Modal */}
      <ShowAcknowledgementsModal
        isOpen={acknowledgementsModalOpen}
        onClose={handleCloseAcknowledgements}
        documentId={selectedAcknowledgementsDocId}
      />

      {/* View Versions Modal */}
      <ViewVersionsModal
        isOpen={versionsModalOpen}
        onClose={handleCloseVersions}
        documentId={selectedVersionsDocId}
      />

      {/* Confirm Title Edit Modal */}
      <ConfirmTitleEditModal
        isOpen={confirmTitleEditOpen}
        onClose={handleCancelTitleEdit}
        onConfirm={handleConfirmTitleEdit}
        originalTitle={titleEditData.originalTitle}
        newTitle={titleEditData.newTitle}
        isLoading={isUpdatingTitle}
        successMessage={titleSuccessMessage}
        errorMessage={titleErrorMessage}
      />

      {/* Edit Confirmation Modal for other fields */}
      <AnimatePresence>
        {showConfirmEdit.show && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: "fixed",
              top: "70px",
              left: "40%",
              transform: "translate(-50%, -50%)",
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              zIndex: 4000,
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            <h3>Confirm Edit</h3>
            <p>
              You have changed the{" "}
              {showConfirmEdit.field === "title"
                ? "Title"
                : showConfirmEdit.field === "document_number"
                ? "Document Number"
                : "Expiring Date"}{" "}
              to "{showConfirmEdit.newValue}". Do you want to proceed?
            </p>
            <div>
              <button onClick={confirmEdit} className="btn-primary-bg">
                Proceed
              </button>
              <button onClick={cancelEdit} className="closeBtn">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <DeleteOnboardingDocumentModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteClose}
        document={documentToDelete}
        onDeleteSuccess={handleDeleteSuccess}
      />

      {/* Header */}
      <div className="olsolsk-YYu">
        <h4>Onboarding & Induction Document Management</h4>
        <p>
          <ClockIcon />{" "}
          <span>
            Last upload:{" "}
            <b>{lastUpload ? formatDateTime(lastUpload) : "No uploads yet"}</b>
          </span>
        </p>
      </div>

      {/* Top Section */}
      <div className="Glob-OLs-Top">
        <div className="Glob-OLs-Top-Grid">
          <div className="Glob-OLs-Top-1">
            <div className="FGb-TXTtsg">
              <h2>
                Welcome to the Onboarding & Induction Document Management
                Section
              </h2>
              <p>
                This section allows tenant admins to upload and manage
                onboarding documents for all users to read and acknowledge as
                part of the induction process.
              </p>
              <button className="btn-primary-bg" onClick={handleUploadClick}>
                <ArrowUpTrayIcon /> Upload document
              </button>
            </div>
          </div>
          <div className="Glob-OLs-Top-2">
            <img
              src={OnBoardDoc}
              alt="Onboarding Document"
            />
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="gths-Cards">
        <div className="HHj-Card">
          <div className="HHj-Card-1">
            <FolderIcon />
          </div>
          <div className="HHj-Card-2">
            <p>Uploaded Documents</p>
            <h3>{Array.isArray(documents) ? documents.length : 0}</h3>
          </div>
        </div>
        <div className="HHj-Card">
          <div className="HHj-Card-1">
            <CloudArrowUpIcon />
          </div>
          <div className="HHj-Card-2">
            <p>Recently Uploaded</p>
            <h3>{Array.isArray(documents) ? documents.length : 0}</h3>
          </div>
        </div>
        <div className="HHj-Card">
          <div className="HHj-Card-1">
            <ExclamationTriangleIcon />
          </div>
          <div className="HHj-Card-2">
            <p>Expired</p>
            <h3>
              {Array.isArray(documents)
                ? documents.filter((doc) => doc.status === "expired").length
                : 0}
            </h3>
          </div>
        </div>
        <div className="HHj-Card">
          <div className="HHj-Card-1">
            <DocumentIcon />
          </div>
          <div className="HHj-Card-2">
            <p>Total Size</p>
            <h3>{getTotalSize()}</h3>
          </div>
        </div>
      </div>

      {/* Table */}
      <section className="MAinn-TTable-Sec">
        <div className="PPOlaj-SSde-TopSSUB">
          <div className="oIK-Search">
            <span>
              <MagnifyingGlassIcon className="h-6 w-6" />
            </span>
            <input
              type="text"
              placeholder="Search by ID, Title, or Expiring Date..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div className="oIK-Btns">
            <div className="dropdown-container">
              <button onClick={() => handleSort("title")}>
                Sort by: Title
                <ArrowUpIcon
                  className="h-4 w-4"
                  style={{
                    transform:
                      sortConfig.key === "title" &&
                      sortConfig.direction === "desc"
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </button>
            </div>
            <div className="dropdown-container">
              <button onClick={() => handleSort("document_number")}>
                Sort by: Document Number
                <ArrowUpIcon
                  className="h-4 w-4"
                  style={{
                    transform:
                      sortConfig.key === "document_number" &&
                      sortConfig.direction === "desc"
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </button>
            </div>
          </div>
        </div>

        {filteredAndSortedDocuments.length > 0 ? (
          <div className="table-container Absoluted-Tbd">
            <table>
              <thead>
                <tr>
                  <th>File</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Last Updated</th>
                  <th>Version</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th>Expiring Date</th>
                  <th>Acknowledgments</th>
                  <th>Access Users</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDocuments.map((doc, index) => (
                  <tr key={doc.id}>
                    <td>
                      <img
                        src={getFileIcon(getFileExtension(doc.file_url))}
                        alt={getFileExtension(doc.file_url)}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleFileOpen(doc)}
                      />
                    </td>
                    <td
                      onClick={() => startEditing(doc.id, "title", doc.title)}
                      style={{ cursor: "pointer" }}
                    >
                      {editingCell.id === doc.id &&
                      editingCell.field === "title" ? (
                        <input
                          className="Ediit-Inpuuts"
                          type="text"
                          value={doc.title || ""}
                          onChange={(e) =>
                            handleEditChange(doc.id, "title", e.target.value)
                          }
                          onBlur={(e) =>
                            finishEditing(doc.id, "title", e.target.value)
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            finishEditing(doc.id, "title", e.target.value)
                          }
                          autoFocus
                        />
                      ) : (
                        <p>{doc.title}</p>
                      )}
                    </td>
                    <td>
                      <span
                        onClick={() => handleFileOpen(doc)}
                        className="dddd-TTyhs"
                      >
                        {getFileExtension(doc.file_url).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="last-updated-time">
                        {formatDateTime(doc.updated_at)}
                      </span>
                    </td>
                    <td
                      style={{ cursor: "pointer", textDecoration: "underline" }}
                      onClick={() => handleViewVersions(doc.id)}
                    >
                      {doc.version}
                    </td>
                    <td>{formatFileSize(doc.file_size)}</td>
                    <td>
                      {/* Note: Document status (active, expired) is determined by comparing expiring_date with current date on the backend (e.g., expired if before October 10, 2025). */}
                      <StatusBadge status={doc.status} />
                    </td>
                    <td
                      onClick={() =>
                        startEditing(doc.id, "expiring_date", doc.expiring_date)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      {editingCell.id === doc.id &&
                      editingCell.field === "expiring_date" ? (
                        <input
                          className="Ediit-Inpuuts"
                          type="date"
                          value={doc.expiring_date || ""}
                          onChange={(e) =>
                            handleEditChange(
                              doc.id,
                              "expiring_date",
                              e.target.value
                            )
                          }
                          onBlur={(e) =>
                            finishEditing(
                              doc.id,
                              "expiring_date",
                              e.target.value
                            )
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            finishEditing(
                              doc.id,
                              "expiring_date",
                              e.target.value
                            )
                          }
                          autoFocus
                        />
                      ) : (
                        <p>{doc.expiring_date || "None"}</p>
                      )}
                    </td>
                    <td
                      style={{ cursor: "pointer", textDecoration: "underline" }}
                      onClick={() => handleShowAcknowledgements(doc.id)}
                    >
                      {(doc.acknowledgments || []).length} user(s)
                    </td>
                    <td
                      style={{ cursor: "pointer", textDecoration: "underline" }}
                      onClick={() => handleAddUsersAccess(doc.id, doc.title)}
                    >
                      {doc.permissions ? doc.permissions.length : 0} user(s)
                    </td>
                    <td>
                      <div className="actions-cell">
                        <div className="actions-container">
                          <button
                            className="actions-button"
                            onClick={() => toggleDropdown(doc.id)}
                          >
                            <EllipsisVerticalIcon />
                          </button>
                          <AnimatePresence>
                            {activeDropdown === doc.id && (
                              <motion.ul
                                ref={dropdownRef}
                                variants={dropdownVariants}
                                className="actions-dropdown"
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                style={{
                                  position: "absolute",
                                  ...(paginatedDocuments.length - index <= 3
                                    ? { bottom: "100%" }
                                    : { top: "100%" }),
                                  right: 0,
                                  background: "#fff",
                                  border: "1px solid #ddd",
                                  borderRadius: "6px",
                                  listStyle: "none",
                                  margin: 0,
                                  padding: "6px 0",
                                  zIndex: 20,
                                  boxShadow: "0px 2px 6px rgba(0,0,0,0.15)",
                                }}
                              >
                                <li>
                                  <button
                                    onClick={() => {
                                      handleFileOpen(doc);
                                      setActiveDropdown(null);
                                    }}
                                  >
                                    View File
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => {
                                      handleUploadNewVersion(doc);
                                    }}
                                  >
                                    Upload New Version
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => {
                                      handleDownload(doc);
                                      setActiveDropdown(null);
                                    }}
                                  >
                                    Download ({doc.version})
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => {
                                      handleShowAcknowledgements(doc.id);
                                    }}
                                  >
                                    Show Acknowledgements
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => {
                                      handleViewVersions(doc.id);
                                    }}
                                  >
                                    View All Versions
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => {
                                      handleAddUsersAccess(doc.id, doc.title);
                                    }}
                                  >
                                    <UserIcon className="h-4 w-4 inline mr-2" />
                                    Add User Access
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => {
                                      handleRemoveUserAccess(doc.id);
                                    }}
                                  >
                                    Remove User Access
                                  </button>
                                </li>
                                <li>
                                  <button
                                    style={{ color: "#dc3545" }}
                                    onClick={() =>
                                      handleDelete(doc.id, doc.title)
                                    }
                                  >
                                    Delete File
                                  </button>
                                </li>
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="oaiks-NNijs">
            <img
              src={noDocData}
              alt="No Documents"
            />
            <p>No documents uploaded yet.</p>
          </div>
        )}

        {filteredAndSortedDocuments.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </section>
    </div>
  );
};

export default OnboardingDocuments;

// ComplianceCheckTable.jsx
import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import "./ComplianceCheckTable.css";
import pdfIcon from "../../assets/icons/pdf.png";
import imageIcon from "../../assets/icons/image.png";
import {
  CloudArrowUpIcon,
  PencilIcon,
  XMarkIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Modal from "../../components/Modal";
import RightToWorkFormModal from "./ComplianceFormDocuments/RightToWorkFormModal";
import ProofOfAddressFormModal from "./ComplianceFormDocuments/ProofOfAddressFormModal";
import DBSCertificateFormModal from "./ComplianceFormDocuments/DBSCertificateFormModal";
import ProfessionalQualificationsFormModal from "./ComplianceFormDocuments/ProfessionalQualificationsFormModal";
import ReferencesFormModal from "./ComplianceFormDocuments/ReferencesFormModal";
import DrivingStatusFormModal from "./ComplianceFormDocuments/DrivingStatusFormModal";
import SimpleFileUploadModal from "./ComplianceFormDocuments/SimpleFileUploadModal";
import { API_BASE_URL } from "../../config";

const getFileTypeInfo = (filename) => {
  if (!filename) return { type: "Unknown", icon: imageIcon };

  const extension = filename.split(".").pop().toLowerCase();
  if (extension === "pdf") {
    return { type: "PDF", icon: pdfIcon };
  } else if (["jpg", "jpeg"].includes(extension)) {
    return { type: "JPG Image", icon: imageIcon };
  } else if (extension === "png") {
    return { type: "PNG Image", icon: imageIcon };
  }
  return { type: "Unknown", icon: imageIcon };
};

const ComplianceCheckTable = ({
  complianceChecklist = [],
  uploadedDocuments = [],
  jobApplicationId,
  complianceStatus = [],
  email,
  onComplianceUpdate,
}) => {
  const { unique_link } = useParams();
  const [complianceData, setComplianceData] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedNotesItem, setSelectedNotesItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [showRightToWorkModal, setShowRightToWorkModal] = useState(false);
  const [showProofOfAddressModal, setShowProofOfAddressModal] = useState(false);
  const [showDbsModal, setShowDbsModal] = useState(false);
  const [
    showProfessionalQualificationsModal,
    setShowProfessionalQualificationsModal,
  ] = useState(false);
  const [showReferencesModal, setShowReferencesModal] = useState(false);
  const [showDrivingStatusModal, setShowDrivingStatusModal] = useState(false);
  const [showSimpleUploadModal, setShowSimpleUploadModal] = useState(false);

  const [selectedComplianceItem, setSelectedComplianceItem] = useState(null);
  const [simpleUploadConfig, setSimpleUploadConfig] = useState({
    title: "",
    uploadText: "",
    index: -1,
  });

  const fileInputRefs = useRef([]);

  // All form data states
  const [rightToWorkFormData, setRightToWorkFormData] = useState({
    email: "",
    rightToWorkStatus: "",
    passportHolder: "",
    rightToWorkDocumentType: "",
    rightToWorkDocumentNumber: "",
    rightToWorkDocumentExpiryDate: "",
    shareCode: "",
    rightToWorkFile: null,
    rightToWorkFilePreview: null,
    countryOfIssue: "",
    workRestrictions: "",
  });

  const [proofOfAddressFormData, setProofOfAddressFormData] = useState({
    email: "",
    addressProofType: "",
    utilityBill: null,
    utilityBillPreview: null,
    utilityBillDate: "",
    nin: "",
    ninFile: null,
    ninPreview: null,
  });

  const [dbsFormData, setDbsFormData] = useState({
    email: "",
    dbsType: "",
    dbsCertificate: null,
    dbsCertificatePreview: null,
    dbsCertificateNumber: "",
    dbsIssueDate: "",
    dbsUpdateService: null,
    dbsUpdateServicePreview: null,
    dbsUpdateCertificateNumber: "",
    dbsUpdateIssueDate: "",
    realTimeStatusChecks: false,
  });

  const [
    professionalQualificationsFormData,
    setProfessionalQualificationsFormData,
  ] = useState({
    email: "",
    professionalQualification: "",
    professionalQualificationFile: null,
    professionalQualificationPreview: null,
  });

  const [referencesFormData, setReferencesFormData] = useState({
    email: "",
    referee1Name: "",
    referee1PhoneCode: "+44",
    referee1Phone: "",
    referee1Email: "",
    referee1Relationship: "",
    referee2Name: "",
    referee2PhoneCode: "+44",
    referee2Phone: "",
    referee2Email: "",
    referee2Relationship: "",
  });

  const [drivingStatusFormData, setDrivingStatusFormData] = useState({
    email: "",
    drivingStatus: false,
    vehicleType: "",
    drivingLicenseFront: null,
    drivingLicenseFrontPreview: null,
    drivingLicenseBack: null,
    drivingLicenseBackPreview: null,
    countryOfDrivingLicenseIssue: "",
    drivingLicenseIssueDate: "",
    drivingLicenseExpiryDate: "",
    driversLicenseInsuranceProvider: "",
    driversLicenseInsuranceExpiryDate: "",
    driversLicenseIssuingAuthority: "",
    policyNumber: "",
    isSyncWithRoster: false,
    availability: {},
    accessDuration: false,
    accessExpiryDate: "",
    systemAccess: false,
    systemAccessSelections: [],
  });

  // Address proof options
  const addressProofOptions = [
    "Utility Bill",
    "Bank Statement",
    "Council Tax Bill",
    "Mortgage Statement",
    "Tenancy Agreement",
  ];

  // Refs
  const proofOfAddressFileRef = useRef(null);
  const proofOfAddressNinRef = useRef(null);
  const dbsCertificateRef = useRef(null);
  const dbsUpdateServiceRef = useRef(null);
  const professionalQualificationRef = useRef(null);
  const drivingLicenseFrontRef = useRef(null);
  const drivingLicenseBackRef = useRef(null);
  const rightToWorkFileRef = useRef(null);
  const simpleFileUploadRef = useRef(null);

  // Calculate compliance progress percentage based on accepted documents
  const calculateComplianceProgress = () => {
    if (complianceData.length === 0) return 0;

    const acceptedDocuments = complianceData.filter(
      (item) => item.complianceStatus === "Accepted"
    ).length;

    return (acceptedDocuments / complianceData.length) * 100;
  };

  const isFullyCompliant = calculateComplianceProgress() === 100;

  // Initialize compliance data with separate upload and compliance statuses
  useEffect(() => {
    const initializeComplianceData = () => {
      if (complianceChecklist && complianceChecklist.length > 0) {
        const checklistMap = new Map(
          complianceChecklist.map((item) => [item.name, item])
        );

        let initialData = [];

        if (complianceStatus && complianceStatus.length > 0) {
          initialData = complianceStatus.map((complianceItem) => {
            const checklistItem = checklistMap.get(complianceItem.name);
            const complianceDocument = complianceItem.document;
            const matchingDoc =
              complianceDocument ||
              uploadedDocuments.find(
                (doc) => doc.document_type === complianceItem.name
              );

            // Determine upload status
            let uploadStatus;
            if (matchingDoc && matchingDoc.length > 0) {
              uploadStatus = "Uploaded"; // File-based submission
            } else if (complianceItem.status !== "pending") {
              uploadStatus = "Submitted"; // Text-based submission or reviewed
            } else {
              uploadStatus = "Not Uploaded";
            }

            // Determine compliance status
            let complianceStatusText = "Pending";
            if (complianceItem.status === "accepted") {
              complianceStatusText = "Accepted";
            } else if (complianceItem.status === "rejected") {
              complianceStatusText = "Rejected";
            } else if (complianceItem.status === "in_review") {
              complianceStatusText = "In Review";
            }

            return {
              id: complianceItem.id,
              title:
                complianceItem.name ||
                checklistItem?.name ||
                "Unnamed Requirement",
              fileName: matchingDoc?.file_url?.split("/").pop() || "",
              fileType: getFileTypeInfo(matchingDoc?.file_url || "").type,
              fileIcon: getFileTypeInfo(matchingDoc?.file_url || "").icon,
              fileUrl: matchingDoc?.file_url || "",
              uploadStatus: uploadStatus,
              complianceStatus: complianceStatusText,
              apiStatus: complianceItem.status || "pending",
              notes: complianceItem.notes || "",
              rejectionReason: complianceItem.notes || "",
              file: null,
              uploadedAt: matchingDoc?.uploaded_at || null,
              metadata: complianceItem.metadata || null,
            };
          });

          // Add any checklist items that don't have compliance status entries
          complianceChecklist.forEach((checklistItem) => {
            const existing = initialData.find(
              (item) => item.title === checklistItem.name
            );
            if (!existing) {
              const matchingDoc = uploadedDocuments.find(
                (doc) => doc.document_type === checklistItem.name
              );
              const uploadStatus = matchingDoc
                ? "Uploaded"
                : complianceStatus?.some(
                    (item) =>
                      item.name === checklistItem.name &&
                      item.status !== "pending"
                  )
                ? "Submitted"
                : "Not Uploaded";

              initialData.push({
                id: `checklist-${checklistItem.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`,
                title: checklistItem.name,
                fileName: matchingDoc?.file_url?.split("/").pop() || "",
                fileType: getFileTypeInfo(matchingDoc?.file_url || "").type,
                fileIcon: getFileTypeInfo(matchingDoc?.file_url || "").icon,
                fileUrl: matchingDoc?.file_url || "",
                uploadStatus: uploadStatus,
                complianceStatus: "Not Reviewed",
                apiStatus: matchingDoc ? "uploaded" : "pending",
                notes: "",
                rejectionReason: "",
                file: null,
                uploadedAt: matchingDoc?.uploaded_at || null,
                metadata: matchingDoc?.metadata || null,
              });
            }
          });
        } else {
          initialData = complianceChecklist.map((item) => {
            const matchingDoc = uploadedDocuments.find(
              (doc) => doc.document_type === item.name
            );
            const uploadStatus = matchingDoc
              ? "Uploaded"
              : complianceStatus?.some(
                  (status) =>
                    status.name === item.name && status.status !== "pending"
                )
              ? "Submitted"
              : "Not Uploaded";

            return {
              id: item.id,
              title: item.name || "Unnamed Requirement",
              fileName: matchingDoc?.file_url?.split("/").pop() || "",
              fileType: getFileTypeInfo(matchingDoc?.file_url || "").type,
              fileIcon: getFileTypeInfo(matchingDoc?.file_url || "").icon,
              fileUrl: matchingDoc?.file_url || "",
              uploadStatus: uploadStatus,
              complianceStatus: "Not Reviewed",
              apiStatus: matchingDoc ? "uploaded" : "pending",
              notes: "",
              rejectionReason: "",
              file: null,
              uploadedAt: matchingDoc?.uploaded_at || null,
              metadata: matchingDoc?.metadata || null,
            };
          });
        }

        const sortedData = complianceChecklist
          .map((checklistItem) => {
            return (
              initialData.find((item) => item.title === checklistItem.name) ||
              initialData.find((item) =>
                item.title
                  .toLowerCase()
                  .includes(checklistItem.name.toLowerCase())
              )
            );
          })
          .filter(Boolean);

        setComplianceData(sortedData);
      }
    };

    initializeComplianceData();
  }, [complianceChecklist, uploadedDocuments, complianceStatus]);

  // Fetch existing compliance data for pre-filling
  const fetchExistingComplianceData = async (complianceItem) => {
    try {
      // If we have a jobApplicationId and compliance item ID, fetch the existing data
      if (jobApplicationId && complianceItem.id) {
        const response = await axios.get(
          `${API_BASE_URL}/job-applications/${jobApplicationId}/compliance/${complianceItem.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data && response.data.metadata) {
          return response.data.metadata;
        }
      }

      // Fallback: Check if we have data in the compliance item itself
      if (complianceItem.metadata) {
        return complianceItem.metadata;
      }

      // Fallback: Check if we have data in uploadedDocuments
      const uploadedDoc = uploadedDocuments.find(
        (doc) => doc.document_type === complianceItem.title
      );

      if (uploadedDoc && uploadedDoc.metadata) {
        return uploadedDoc.metadata;
      }

      return null;
    } catch (error) {
      console.error("Error fetching compliance data:", error);
      return null;
    }
  };

  // Get status badge class for upload status
  const getUploadStatusClass = (status) => {
    switch (status) {
      case "Uploaded":
      case "Submitted":
        return "success";
      case "Not Uploaded":
        return "pending";
      default:
        return "pending";
    }
  };

  // Get status badge class for compliance status
  const getComplianceStatusClass = (status) => {
    switch (status) {
      case "Accepted":
        return "success";
      case "In Review":
        return "warning";
      case "Rejected":
        return "error";
      case "Pending":
      case "Not Reviewed":
        return "pending";
      default:
        return "pending";
    }
  };

  // Handle compliance update after successful submission
  const handleComplianceUpdate = async (responseData) => {
    try {
      const job_application = responseData.job_application || responseData;
      if (!job_application) {
        throw new Error("Job application data not found in response");
      }

      if (job_application.compliance_status) {
        const checklistMap = new Map(
          complianceChecklist.map((item) => [item.id, item.name])
        );

        const updatedData = job_application.compliance_status.map((item) => {
          const checklistItem = checklistMap.get(item.id);
          const complianceDocument = item.document;
          const matchingDoc =
            complianceDocument ||
            uploadedDocuments.find((doc) => doc.document_type === item.name);

          // Determine upload status
          let uploadStatus;
          if (matchingDoc && matchingDoc.length > 0) {
            uploadStatus = "Uploaded"; // File-based submission
          } else if (item.status !== "pending") {
            uploadStatus = "Submitted"; // Text-based submission or reviewed
          } else {
            uploadStatus = "Not Uploaded";
          }

          // Determine compliance status
          let complianceStatusText = "Pending";
          if (item.status === "accepted") {
            complianceStatusText = "Accepted";
          } else if (item.status === "rejected") {
            complianceStatusText = "Rejected";
          } else if (item.status === "in_review") {
            complianceStatusText = "In Review";
          }

          return {
            id: item.id,
            title: item.name || checklistItem || "Unnamed Requirement",
            fileName: matchingDoc?.file_url?.split("/").pop() || "",
            fileType: getFileTypeInfo(matchingDoc?.file_url || "").type,
            fileIcon: getFileTypeInfo(matchingDoc?.file_url || "").icon,
            fileUrl: matchingDoc?.file_url || "",
            uploadStatus: uploadStatus,
            complianceStatus: complianceStatusText,
            apiStatus: item.status || "pending",
            rejectionReason: item.notes || "",
            notes: item.notes || "",
            file: null,
            uploadedAt: matchingDoc?.uploaded_at || null,
            metadata: item.metadata || null,
          };
        });

        const mergedData = complianceData.map((existingItem) => {
          const updatedItem = updatedData.find(
            (item) => item.id === existingItem.id
          );
          return updatedItem || existingItem;
        });

        setComplianceData(mergedData);
        showAlert("Successfully submitted for compliance review.", "success");
      } else {
        showAlert(
          "Compliance data received but no status updates found.",
          "warning"
        );
      }

      // Notify parent of update
      if (onComplianceUpdate) {
        onComplianceUpdate(responseData);
      }
    } catch (error) {
      console.error("Error updating compliance data:", error);
      showAlert("Failed to update compliance status.", "error");
    }
  };

  // Utility functions
  const handleOutsideClick = (e, closeFunc) => {
    if (e.target === e.currentTarget) {
      closeFunc(false);
    }
  };

  const showAlert = (message, type = "success") => {
    setAlertMessage({ text: message, type });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  // Handle notes viewing
  const handleViewNotes = (item) => {
    setSelectedNotesItem(item);
    setShowNotesModal(true);
  };

  // Modal type determination
  const getModalForDocument = (title) => {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes("right to work")) {
      return "rightToWork";
    } else if (
      lowerTitle.includes("proof of address") ||
      lowerTitle.includes("address")
    ) {
      return "proofOfAddress";
    } else if (
      lowerTitle.includes("dbs") ||
      lowerTitle.includes("criminal record")
    ) {
      return "dbs";
    } else if (
      lowerTitle.includes("professional qualification") ||
      lowerTitle.includes("certification")
    ) {
      return "professionalQualifications";
    } else if (
      lowerTitle.includes("reference") ||
      lowerTitle.includes("references")
    ) {
      return "references";
    } else if (
      lowerTitle.includes("driving") ||
      lowerTitle.includes("driver") ||
      lowerTitle.includes("vehicle")
    ) {
      return "drivingStatus";
    } else {
      return "simpleUpload";
    }
  };

  const getActionButton = (item, index) => {
    const hasExistingData =
      item.uploadStatus === "Uploaded" || item.uploadStatus === "Submitted";

    if (item.uploadStatus === "Not Uploaded") {
      return (
        <button
          className="oooka-BBTns link-btn"
          onClick={() => triggerFileInput(index, item)}
        >
          <CloudArrowUpIcon className="h-4 w-4" />
          Upload
        </button>
      );
    } else if (item.complianceStatus === "Rejected") {
      return (
        <button
          className="oooka-BBTns link-btn rejected-btn"
          onClick={() => triggerFileInput(index, item)}
        >
          <CloudArrowUpIcon className="h-4 w-4" />
          Resubmit
        </button>
      );
    } else {
      return (
        <button
          className="oooka-BBTns link-btn"
          onClick={() => triggerFileInput(index, item)}
        >
          <PencilIcon className="h-4 w-4" />
          {hasExistingData ? "Edit Submission" : "Edit Upload"}
        </button>
      );
    }
  };

  // Enhanced triggerFileInput with pre-filling functionality
  const triggerFileInput = async (index, item) => {
    setIsLoading(true);
    try {
      const modalType = getModalForDocument(item.title);

      // Fetch existing data for pre-filling
      const existingData = await fetchExistingComplianceData(item);

      switch (modalType) {
        case "rightToWork":
          setSelectedComplianceItem(item);
          // Pre-fill right to work form data
          if (existingData) {
            setRightToWorkFormData((prev) => ({
              ...prev,
              ...existingData,
              email: email || prev.email,
              // Handle file preview if file URL exists
              rightToWorkFilePreview:
                item.fileUrl || prev.rightToWorkFilePreview,
            }));
          } else {
            // Reset form if no existing data
            setRightToWorkFormData({
              email: email || "",
              rightToWorkStatus: "",
              passportHolder: "",
              rightToWorkDocumentType: "",
              rightToWorkDocumentNumber: "",
              rightToWorkDocumentExpiryDate: "",
              shareCode: "",
              rightToWorkFile: null,
              rightToWorkFilePreview: item.fileUrl || null,
              countryOfIssue: "",
              workRestrictions: "",
            });
          }
          setShowRightToWorkModal(true);
          break;

        case "proofOfAddress":
          setSelectedComplianceItem(item);
          // Pre-fill proof of address form data
          if (existingData) {
            setProofOfAddressFormData((prev) => ({
              ...prev,
              ...existingData,
              email: email || prev.email,
              utilityBillPreview: item.fileUrl || prev.utilityBillPreview,
            }));
          } else {
            setProofOfAddressFormData({
              email: email || "",
              addressProofType: "",
              utilityBill: null,
              utilityBillPreview: item.fileUrl || null,
              utilityBillDate: "",
              nin: "",
              ninFile: null,
              ninPreview: null,
            });
          }
          setShowProofOfAddressModal(true);
          break;

        case "dbs":
          setSelectedComplianceItem(item);
          // Pre-fill DBS form data
          if (existingData) {
            setDbsFormData((prev) => ({
              ...prev,
              ...existingData,
              email: email || prev.email,
              dbsCertificatePreview: item.fileUrl || prev.dbsCertificatePreview,
            }));
          } else {
            setDbsFormData({
              email: email || "",
              dbsType: "",
              dbsCertificate: null,
              dbsCertificatePreview: item.fileUrl || null,
              dbsCertificateNumber: "",
              dbsIssueDate: "",
              dbsUpdateService: null,
              dbsUpdateServicePreview: null,
              dbsUpdateCertificateNumber: "",
              dbsUpdateIssueDate: "",
              realTimeStatusChecks: false,
            });
          }
          setShowDbsModal(true);
          break;

        case "professionalQualifications":
          setSelectedComplianceItem(item);
          // Pre-fill professional qualifications form data
          if (existingData) {
            setProfessionalQualificationsFormData((prev) => ({
              ...prev,
              ...existingData,
              email: email || prev.email,
              professionalQualificationPreview:
                item.fileUrl || prev.professionalQualificationPreview,
            }));
          } else {
            setProfessionalQualificationsFormData({
              email: email || "",
              professionalQualification: "",
              professionalQualificationFile: null,
              professionalQualificationPreview: item.fileUrl || null,
            });
          }
          setShowProfessionalQualificationsModal(true);
          break;

        case "references":
          setSelectedComplianceItem(item);
          // Pre-fill references form data
          if (existingData) {
            setReferencesFormData((prev) => ({
              ...prev,
              ...existingData,
              email: email || prev.email,
            }));
          } else {
            setReferencesFormData({
              email: email || "",
              referee1Name: "",
              referee1PhoneCode: "+44",
              referee1Phone: "",
              referee1Email: "",
              referee1Relationship: "",
              referee2Name: "",
              referee2PhoneCode: "+44",
              referee2Phone: "",
              referee2Email: "",
              referee2Relationship: "",
            });
          }
          setShowReferencesModal(true);
          break;

        case "drivingStatus":
          setSelectedComplianceItem(item);
          // Pre-fill driving status form data
          if (existingData) {
            setDrivingStatusFormData((prev) => ({
              ...prev,
              ...existingData,
              email: email || prev.email,
              drivingLicenseFrontPreview:
                item.fileUrl || prev.drivingLicenseFrontPreview,
            }));
          } else {
            setDrivingStatusFormData({
              email: email || "",
              drivingStatus: false,
              vehicleType: "",
              drivingLicenseFront: null,
              drivingLicenseFrontPreview: item.fileUrl || null,
              drivingLicenseBack: null,
              drivingLicenseBackPreview: null,
              countryOfDrivingLicenseIssue: "",
              drivingLicenseIssueDate: "",
              drivingLicenseExpiryDate: "",
              driversLicenseInsuranceProvider: "",
              driversLicenseInsuranceExpiryDate: "",
              driversLicenseIssuingAuthority: "",
              policyNumber: "",
              isSyncWithRoster: false,
              availability: {},
              accessDuration: false,
              accessExpiryDate: "",
              systemAccess: false,
              systemAccessSelections: [],
            });
          }
          setShowDrivingStatusModal(true);
          break;

        case "simpleUpload":
          setSimpleUploadConfig({
            title: item.title,
            uploadText: `Click to upload ${item.title.toLowerCase()}`,
            index,
          });
          setSelectedComplianceItem(item);
          setShowSimpleUploadModal(true);
          break;

        default:
          if (fileInputRefs.current[index]) {
            fileInputRefs.current[index].click();
          }
          break;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Generic file change handler for simple uploads
  const handleFileChange = (index, event) => {
    const file = event.target.files[0];
    if (!file) return;

    const isDuplicate = complianceData.some(
      (item, idx) => idx !== index && item.fileName === file.name
    );
    if (isDuplicate) {
      showAlert(
        "This file has already been uploaded for another requirement.",
        "error"
      );
      return;
    }

    const fileInfo = getFileTypeInfo(file.name);
    if (!["PDF", "JPG Image", "PNG Image"].includes(fileInfo.type)) {
      showAlert("Only PDF, JPG, and PNG files are allowed.", "error");
      return;
    }

    const newData = [...complianceData];
    const isEdit = !!newData[index].file;
    newData[index] = {
      ...newData[index],
      file: file,
      fileName: file.name,
      fileType: fileInfo.type,
      fileIcon: fileInfo.icon,
      uploadStatus: "Uploaded",
      complianceStatus: "Not Reviewed",
      rejectionReason: "",
      notes: "",
    };
    setComplianceData(newData);
    showAlert(
      isEdit ? "Successfully edited file." : "Successfully uploaded file.",
      "success"
    );
  };

  // Right to Work handlers
  const handleRightToWorkFormChange = (e) => {
    const { name, value } = e.target;
    setRightToWorkFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRightToWorkFileUpdate = (file) => {
    if (!file) return;

    const fileInfo = getFileTypeInfo(file.name);
    if (!["PDF", "JPG Image", "PNG Image"].includes(fileInfo.type)) {
      showAlert("Only PDF, JPG, and PNG files are allowed.", "error");
      return;
    }

    const index = complianceData.findIndex((item) =>
      item.title.toLowerCase().includes("right to work")
    );
    if (index === -1) return;

    const isDuplicate = complianceData.some(
      (item, idx) => idx !== index && item.fileName === file.name
    );
    if (isDuplicate) {
      showAlert(
        "This file has already been uploaded for another requirement.",
        "error"
      );
      return;
    }

    const newData = [...complianceData];
    const isEdit = !!newData[index].file;
    newData[index] = {
      ...newData[index],
      file: file,
      fileName: file.name,
      fileType: fileInfo.type,
      fileIcon: fileInfo.icon,
      uploadStatus: "Uploaded",
      complianceStatus: "Not Reviewed",
      rejectionReason: "",
      notes: "",
    };
    setComplianceData(newData);
    setRightToWorkFormData((prev) => ({
      ...prev,
      rightToWorkFile: file,
      rightToWorkFilePreview: URL.createObjectURL(file),
    }));
  };

  const handleRemoveRightToWorkFile = () => {
    const index = complianceData.findIndex((item) =>
      item.title.toLowerCase().includes("right to work")
    );
    if (index === -1) return;

    const newData = [...complianceData];
    newData[index] = {
      ...newData[index],
      file: null,
      fileName: "",
      fileType: "",
      fileIcon: "",
      uploadStatus: "Not Uploaded",
      complianceStatus: "Not Reviewed",
      rejectionReason: "",
      notes: "",
    };
    setComplianceData(newData);
    setRightToWorkFormData((prev) => ({
      ...prev,
      rightToWorkFile: null,
      rightToWorkFilePreview: null,
    }));
  };

  // Proof of Address handlers
  const handleProofOfAddressFormChange = (e) => {
    const { name, value } = e.target;
    setProofOfAddressFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProofOfAddressFileUpdate = (file) => {
    if (!file) return;

    const fileInfo = getFileTypeInfo(file.name);
    if (!["PDF", "JPG Image", "PNG Image"].includes(fileInfo.type)) {
      showAlert("Only PDF, JPG, and PNG files are allowed.", "error");
      return;
    }

    const index = complianceData.findIndex(
      (item) =>
        item.title.toLowerCase().includes("proof of address") ||
        item.title.toLowerCase().includes("address")
    );
    if (index === -1) return;

    const isDuplicate = complianceData.some(
      (item, idx) => idx !== index && item.fileName === file.name
    );
    if (isDuplicate) {
      showAlert(
        "This file has already been uploaded for another requirement.",
        "error"
      );
      return;
    }

    const newData = [...complianceData];
    const isEdit = !!newData[index].file;
    newData[index] = {
      ...newData[index],
      file: file,
      fileName: file.name,
      fileType: fileInfo.type,
      fileIcon: fileInfo.icon,
      uploadStatus: "Uploaded",
      complianceStatus: "Not Reviewed",
      rejectionReason: "",
      notes: "",
    };
    setComplianceData(newData);

    setProofOfAddressFormData((prev) => ({
      ...prev,
      utilityBill: file,
      utilityBillPreview: URL.createObjectURL(file),
    }));
  };

  const handleRemoveProofOfAddressFile = () => {
    const index = complianceData.findIndex(
      (item) =>
        item.title.toLowerCase().includes("proof of address") ||
        item.title.toLowerCase().includes("address")
    );
    if (index === -1) return;

    const newData = [...complianceData];
    newData[index] = {
      ...newData[index],
      file: null,
      fileName: "",
      fileType: "",
      fileIcon: "",
      uploadStatus: "Not Uploaded",
      complianceStatus: "Not Reviewed",
      rejectionReason: "",
      notes: "",
    };
    setComplianceData(newData);

    setProofOfAddressFormData((prev) => ({
      ...prev,
      utilityBill: null,
      utilityBillPreview: null,
    }));
  };

  const handleProofOfAddressNinFileUpdate = (file) => {
    if (!file) return;

    const fileInfo = getFileTypeInfo(file.name);
    if (!["PDF", "JPG Image", "PNG Image"].includes(fileInfo.type)) {
      showAlert("Only PDF, JPG, and PNG files are allowed.", "error");
      return;
    }

    setProofOfAddressFormData((prev) => ({
      ...prev,
      ninFile: file,
      ninPreview: URL.createObjectURL(file),
    }));
  };

  const handleRemoveProofOfAddressNinFile = () => {
    setProofOfAddressFormData((prev) => ({
      ...prev,
      ninFile: null,
      ninPreview: null,
    }));
  };

  // DBS handlers
  const handleDbsFormChange = (e) => {
    const { name, value } = e.target;
    setDbsFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDbsCertificateUpdate = (file) => {
    if (!file) return;

    const fileInfo = getFileTypeInfo(file.name);
    if (!["PDF", "JPG Image", "PNG Image"].includes(fileInfo.type)) {
      showAlert("Only PDF, JPG, and PNG files are allowed.", "error");
      return;
    }

    const index = complianceData.findIndex((item) =>
      item.title.toLowerCase().includes("dbs")
    );
    if (index === -1) return;

    const isDuplicate = complianceData.some(
      (item, idx) => idx !== index && item.fileName === file.name
    );
    if (isDuplicate) {
      showAlert(
        "This file has already been uploaded for another requirement.",
        "error"
      );
      return;
    }

    const newData = [...complianceData];
    const isEdit = !!newData[index].file;
    newData[index] = {
      ...newData[index],
      file: file,
      fileName: file.name,
      fileType: fileInfo.type,
      fileIcon: fileInfo.icon,
      uploadStatus: "Uploaded",
      complianceStatus: "Not Reviewed",
      rejectionReason: "",
      notes: "",
    };
    setComplianceData(newData);

    setDbsFormData((prev) => ({
      ...prev,
      dbsCertificate: file,
      dbsCertificatePreview: URL.createObjectURL(file),
    }));
  };

  const handleRemoveDbsCertificate = () => {
    const index = complianceData.findIndex((item) =>
      item.title.toLowerCase().includes("dbs")
    );
    if (index === -1) return;

    const newData = [...complianceData];
    newData[index] = {
      ...newData[index],
      file: null,
      fileName: "",
      fileType: "",
      fileIcon: "",
      uploadStatus: "Not Uploaded",
      complianceStatus: "Not Reviewed",
      rejectionReason: "",
      notes: "",
    };
    setComplianceData(newData);

    setDbsFormData((prev) => ({
      ...prev,
      dbsCertificate: null,
      dbsCertificatePreview: null,
    }));
  };

  const handleDbsUpdateServiceUpdate = (file) => {
    if (!file) return;

    const fileInfo = getFileTypeInfo(file.name);
    if (!["PDF", "JPG Image", "PNG Image"].includes(fileInfo.type)) {
      showAlert("Only PDF, JPG, and PNG files are allowed.", "error");
      return;
    }

    setDbsFormData((prev) => ({
      ...prev,
      dbsUpdateService: file,
      dbsUpdateServicePreview: URL.createObjectURL(file),
    }));
  };

  const handleRemoveDbsUpdateService = () => {
    setDbsFormData((prev) => ({
      ...prev,
      dbsUpdateService: null,
      dbsUpdateServicePreview: null,
    }));
  };

  const handleDbsToggleChange = (fieldName, value) => {
    setDbsFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // Professional Qualifications handlers
  const handleProfessionalQualificationsFormChange = (e) => {
    const { name, value } = e.target;
    setProfessionalQualificationsFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfessionalQualificationUpdate = (file) => {
    if (!file) return;

    const fileInfo = getFileTypeInfo(file.name);
    if (!["PDF", "JPG Image", "PNG Image"].includes(fileInfo.type)) {
      showAlert("Only PDF, JPG, and PNG files are allowed.", "error");
      return;
    }

    const index = complianceData.findIndex((item) =>
      item.title.toLowerCase().includes("professional qualification")
    );
    if (index === -1) return;

    const isDuplicate = complianceData.some(
      (item, idx) => idx !== index && item.fileName === file.name
    );
    if (isDuplicate) {
      showAlert(
        "This file has already been uploaded for another requirement.",
        "error"
      );
      return;
    }

    const newData = [...complianceData];
    const isEdit = !!newData[index].file;
    newData[index] = {
      ...newData[index],
      file: file,
      fileName: file.name,
      fileType: fileInfo.type,
      fileIcon: fileInfo.icon,
      uploadStatus: "Uploaded",
      complianceStatus: "Not Reviewed",
      rejectionReason: "",
      notes: "",
    };
    setComplianceData(newData);

    setProfessionalQualificationsFormData((prev) => ({
      ...prev,
      professionalQualificationFile: file,
      professionalQualificationPreview: URL.createObjectURL(file),
    }));
  };

  const handleRemoveProfessionalQualification = () => {
    const index = complianceData.findIndex((item) =>
      item.title.toLowerCase().includes("professional qualification")
    );
    if (index === -1) return;

    const newData = [...complianceData];
    newData[index] = {
      ...newData[index],
      file: null,
      fileName: "",
      fileType: "",
      fileIcon: "",
      uploadStatus: "Not Uploaded",
      complianceStatus: "Not Reviewed",
      rejectionReason: "",
      notes: "",
    };
    setComplianceData(newData);

    setProfessionalQualificationsFormData((prev) => ({
      ...prev,
      professionalQualificationFile: null,
      professionalQualificationPreview: null,
    }));
  };

  // References handlers
  const handleReferencesFormChange = (e) => {
    const { name, value } = e.target;
    setReferencesFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Driving Status handlers
  const handleDrivingStatusFormChange = (e) => {
    const { name, value } = e.target;
    setDrivingStatusFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDrivingStatusVehicleTypeChange = (selectedValue) => {
    setDrivingStatusFormData((prev) => ({
      ...prev,
      vehicleType: selectedValue,
    }));
  };

  const handleDrivingLicenseFrontUpdate = (file) => {
    if (!file) return;

    const fileInfo = getFileTypeInfo(file.name);
    if (!["PDF", "JPG Image", "PNG Image"].includes(fileInfo.type)) {
      showAlert("Only PDF, JPG, and PNG files are allowed.", "error");
      return;
    }

    const index = complianceData.findIndex((item) =>
      item.title.toLowerCase().includes("driving")
    );
    if (index === -1) return;

    const isDuplicate = complianceData.some(
      (item, idx) => idx !== index && item.fileName === file.name
    );
    if (isDuplicate) {
      showAlert(
        "This file has already been uploaded for another requirement.",
        "error"
      );
      return;
    }

    const newData = [...complianceData];
    const isEdit = !!newData[index].file;
    newData[index] = {
      ...newData[index],
      file: file,
      fileName: file.name,
      fileType: fileInfo.type,
      fileIcon: fileInfo.icon,
      uploadStatus: "Uploaded",
      complianceStatus: "Not Reviewed",
      rejectionReason: "",
      notes: "",
    };
    setComplianceData(newData);

    setDrivingStatusFormData((prev) => ({
      ...prev,
      drivingLicenseFront: file,
      drivingLicenseFrontPreview: URL.createObjectURL(file),
    }));

    showAlert(
      isEdit
        ? "Successfully edited front license."
        : "Successfully uploaded front license.",
      "success"
    );
  };

  const handleRemoveDrivingLicenseFront = () => {
    setDrivingStatusFormData((prev) => ({
      ...prev,
      drivingLicenseFront: null,
      drivingLicenseFrontPreview: null,
    }));
  };

  const handleDrivingLicenseBackUpdate = (file) => {
    if (!file) return;

    const fileInfo = getFileTypeInfo(file.name);
    if (!["PDF", "JPG Image", "PNG Image"].includes(fileInfo.type)) {
      showAlert("Only PDF, JPG, and PNG files are allowed.", "error");
      return;
    }

    setDrivingStatusFormData((prev) => ({
      ...prev,
      drivingLicenseBack: file,
      drivingLicenseBackPreview: URL.createObjectURL(file),
    }));

    showAlert("Back license uploaded successfully.", "success");
  };

  const handleRemoveDrivingLicenseBack = () => {
    setDrivingStatusFormData((prev) => ({
      ...prev,
      drivingLicenseBack: null,
      drivingLicenseBackPreview: null,
    }));
  };

  // Simple upload handlers
  const handleSimpleFileUpdate = (file) => {
    if (!file) return;

    const fileInfo = getFileTypeInfo(file.name);
    if (!["PDF", "JPG Image", "PNG Image"].includes(fileInfo.type)) {
      showAlert("Only PDF, JPG, and PNG files are allowed.", "error");
      return;
    }

    const { index } = simpleUploadConfig;
    if (index === -1) return;

    const isDuplicate = complianceData.some(
      (item, idx) => idx !== index && item.fileName === file.name
    );
    if (isDuplicate) {
      showAlert(
        "This file has already been uploaded for another requirement.",
        "error"
      );
      return;
    }

    const newData = [...complianceData];
    const isEdit = !!newData[index].file;
    newData[index] = {
      ...newData[index],
      file: file,
      fileName: file.name,
      fileType: fileInfo.type,
      fileIcon: fileInfo.icon,
      uploadStatus: "Uploaded",
      complianceStatus: "Not Reviewed",
      rejectionReason: "",
      notes: "",
      preview: URL.createObjectURL(file),
    };
    setComplianceData(newData);
    setSelectedComplianceItem(newData[index]);
    setSimpleUploadConfig((prev) => ({ ...prev }));

    showAlert(
      isEdit ? "Successfully edited file." : "Successfully uploaded file.",
      "success"
    );
  };

  const handleRemoveSimpleFile = () => {
    const { index } = simpleUploadConfig;
    if (index === -1) return;

    const newData = [...complianceData];
    newData[index] = {
      ...newData[index],
      file: null,
      fileName: "",
      fileType: "",
      fileIcon: "",
      uploadStatus: "Not Uploaded",
      complianceStatus: "Not Reviewed",
      rejectionReason: "",
      notes: "",
      preview: null,
    };
    setComplianceData(newData);
    setSelectedComplianceItem(newData[index]);
    setSimpleUploadConfig((prev) => ({ ...prev }));
  };

  return (
    <div className="table-container">
      <AnimatePresence>
        {alertMessage && (
          <motion.div
            className={`alert-box ${alertMessage.type}`}
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {alertMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Loading...</div>
        </div>
      )}

      <Modal
        isOpen={showNotesModal && selectedNotesItem}
        onClose={() => {
          setShowNotesModal(false);
          setSelectedNotesItem(null);
        }}
        title={
          <div className="notes-header">
            <div
              className={`icon-circle ${
                selectedNotesItem?.complianceStatus === "Accepted"
                  ? "accepted"
                  : selectedNotesItem?.complianceStatus === "Rejected"
                  ? "rejected"
                  : "warning"
              }`}
            >
              {selectedNotesItem?.complianceStatus === "Accepted" ? (
                <CheckIcon />
              ) : selectedNotesItem?.complianceStatus === "Rejected" ? (
                <XMarkIcon />
              ) : (
                <ExclamationTriangleIcon />
              )}
            </div>
            <span>
              {selectedNotesItem?.complianceStatus === "Accepted"
                ? "Approval Notes"
                : selectedNotesItem?.complianceStatus === "Rejected"
                ? "Rejection Notes"
                : "Review Notes"}
            </span>
          </div>
        }
      >
        <div className="notes-container">
          {selectedNotesItem?.notes ? (
            <p className="notes-text">{selectedNotesItem.notes}</p>
          ) : (
            <p className="notes-empty">No notes were provided.</p>
          )}
        </div>
      </Modal>

      <RightToWorkFormModal
        formData={rightToWorkFormData}
        handleChange={handleRightToWorkFormChange}
        handleRightToWorkFileChange={handleRightToWorkFileUpdate}
        removeRightToWorkFile={handleRemoveRightToWorkFile}
        rightToWorkFileRef={rightToWorkFileRef}
        showModal={showRightToWorkModal}
        setShowModal={setShowRightToWorkModal}
        uniqueLink={unique_link}
        jobApplicationId={jobApplicationId}
        email={email}
        onComplianceUpdate={handleComplianceUpdate}
        showAlert={showAlert}
        selectedComplianceItem={selectedComplianceItem}
      />

      <ProofOfAddressFormModal
        formData={proofOfAddressFormData}
        handleChange={handleProofOfAddressFormChange}
        handleProofOfAddressFileChange={handleProofOfAddressFileUpdate}
        handleProofOfAddressNinFileChange={handleProofOfAddressNinFileUpdate}
        removeProofOfAddressFile={handleRemoveProofOfAddressFile}
        removeProofOfAddressNinFile={handleRemoveProofOfAddressNinFile}
        proofOfAddressFileRef={proofOfAddressFileRef}
        proofOfAddressNinRef={proofOfAddressNinRef}
        showModal={showProofOfAddressModal}
        setShowModal={setShowProofOfAddressModal}
        addressProofOptions={addressProofOptions}
        uniqueLink={unique_link}
        jobApplicationId={jobApplicationId}
        email={email}
        onComplianceUpdate={handleComplianceUpdate}
        showAlert={showAlert}
        selectedComplianceItem={selectedComplianceItem}
      />

      <DBSCertificateFormModal
        formData={dbsFormData}
        handleChange={handleDbsFormChange}
        handleDbsCertificateChange={handleDbsCertificateUpdate}
        removeDbsCertificate={handleRemoveDbsCertificate}
        dbsCertificateRef={dbsCertificateRef}
        handleDbsUpdateServiceChange={handleDbsUpdateServiceUpdate}
        removeDbsUpdateService={handleRemoveDbsUpdateService}
        dbsUpdateServiceRef={dbsUpdateServiceRef}
        handleToggleChange={handleDbsToggleChange}
        showModal={showDbsModal}
        setShowModal={setShowDbsModal}
        uniqueLink={unique_link}
        jobApplicationId={jobApplicationId}
        email={email}
        onComplianceUpdate={handleComplianceUpdate}
        showAlert={showAlert}
        selectedComplianceItem={selectedComplianceItem}
      />

      <ProfessionalQualificationsFormModal
        formData={professionalQualificationsFormData}
        handleChange={handleProfessionalQualificationsFormChange}
        handleProfessionalQualificationChange={
          handleProfessionalQualificationUpdate
        }
        removeProfessionalQualification={handleRemoveProfessionalQualification}
        professionalQualificationRef={professionalQualificationRef}
        showModal={showProfessionalQualificationsModal}
        setShowModal={setShowProfessionalQualificationsModal}
        uniqueLink={unique_link}
        jobApplicationId={jobApplicationId}
        email={email}
        onComplianceUpdate={handleComplianceUpdate}
        showAlert={showAlert}
        selectedComplianceItem={selectedComplianceItem}
      />

      <ReferencesFormModal
        formData={referencesFormData}
        handleChange={handleReferencesFormChange}
        showModal={showReferencesModal}
        setShowModal={setShowReferencesModal}
        uniqueLink={unique_link}
        jobApplicationId={jobApplicationId}
        email={email}
        onComplianceUpdate={handleComplianceUpdate}
        showAlert={showAlert}
        selectedComplianceItem={selectedComplianceItem}
      />

      <DrivingStatusFormModal
        formData={drivingStatusFormData}
        handleChange={handleDrivingStatusFormChange}
        handleDrivingLicenseFrontChange={handleDrivingLicenseFrontUpdate}
        drivingLicenseFrontRef={drivingLicenseFrontRef}
        removeDrivingLicenseFront={handleRemoveDrivingLicenseFront}
        handleDrivingLicenseBackChange={handleDrivingLicenseBackUpdate}
        drivingLicenseBackRef={drivingLicenseBackRef}
        removeDrivingLicenseBack={handleRemoveDrivingLicenseBack}
        handleVehicleTypeChange={handleDrivingStatusVehicleTypeChange}
        showModal={showDrivingStatusModal}
        setShowModal={setShowDrivingStatusModal}
        uniqueLink={unique_link}
        jobApplicationId={jobApplicationId}
        email={email}
        onComplianceUpdate={handleComplianceUpdate}
        showAlert={showAlert}
        selectedComplianceItem={selectedComplianceItem}
      />

      <SimpleFileUploadModal
        title={simpleUploadConfig.title}
        uploadText={simpleUploadConfig.uploadText}
        onFileChange={handleSimpleFileUpdate}
        onRemove={handleRemoveSimpleFile}
        currentFile={selectedComplianceItem?.file || null}
        preview={
          selectedComplianceItem?.preview ||
          selectedComplianceItem?.fileUrl ||
          ""
        }
        isOpen={showSimpleUploadModal}
        onClose={() => setShowSimpleUploadModal(false)}
        uniqueLink={unique_link}
        jobApplicationId={jobApplicationId}
        email={email}
        onComplianceUpdate={handleComplianceUpdate}
        showAlert={showAlert}
        documentName={selectedComplianceItem?.title}
        fileRef={simpleFileUploadRef}
      />

      <table className="Gen-Sys-table Complt-Sys-table">
        <thead>
          <tr>
            <th>Compliance Requirement</th>
            <th>Upload Status</th>
            <th>Compliance Status</th>
            <th>Notes</th>
            {!isFullyCompliant && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {complianceData.map((item, index) => {
            const uploadStatusClass = getUploadStatusClass(item.uploadStatus);
            const complianceStatusClass = getComplianceStatusClass(
              item.complianceStatus
            );

            return (
              <tr key={item.id || index}>
                <td>
                  <div className="compliance-requirement">
                    <strong>{item.title}</strong>
                    {item.uploadedAt && (
                      <div className="upload-date">
                        {item.uploadStatus === "Submitted"
                          ? "Submitted"
                          : "Uploaded"}
                        : {new Date(item.uploadedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="status-cell">
                    <span className={`status-badge ${uploadStatusClass}`}>
                      {item.uploadStatus === "Uploaded" ||
                      item.uploadStatus === "Submitted" ? (
                        <CheckIcon className="h-3 w-3 inline mr-1" />
                      ) : (
                        <ClockIcon className="h-3 w-3 inline mr-1" />
                      )}
                      {item.uploadStatus}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="status-cell">
                    <span className={`status-badge ${complianceStatusClass}`}>
                      {item.complianceStatus === "Accepted" ? (
                        <CheckIcon className="h-3 w-3 inline mr-1" />
                      ) : item.complianceStatus === "Rejected" ? (
                        <XMarkIcon className="h-3 w-3 inline mr-1" />
                      ) : (
                        <ClockIcon className="h-3 w-3 inline mr-1" />
                      )}
                      {item.complianceStatus}
                    </span>
                  </div>
                </td>
                <td>
                  {(item.notes ||
                    item.complianceStatus === "Accepted" ||
                    item.complianceStatus === "Rejected") && (
                    <div className="compliance-notes">
                      <button
                        className="view-notes-btn"
                        onClick={() => handleViewNotes(item)}
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View Notes
                      </button>
                    </div>
                  )}
                </td>
                {!isFullyCompliant && (
                  <td>
                    <div className="gen-td-btns">
                      {getActionButton(item, index)}
                      {item.fileUrl && (
                        <button
                          className="oooka-BBTns link-btn"
                          onClick={() => window.open(item.fileUrl, "_blank")}
                          title="View Document"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      )}
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        style={{ display: "none" }}
                        ref={(el) => (fileInputRefs.current[index] = el)}
                        onChange={(e) => handleFileChange(index, e)}
                      />
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {complianceData.length > 0 && (
        <div className="compliance-progress">
          <div className="progress-header">
            <p className="progress-text">
              Compliance Progress: {Math.round(calculateComplianceProgress())}%
              complete
            </p>
            <p className="progress-detail">
              (
              {
                complianceData.filter(
                  (item) => item.complianceStatus === "Accepted"
                ).length
              }{" "}
              of {complianceData.length} documents accepted)
            </p>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${calculateComplianceProgress()}%`,
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceCheckTable;

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from "framer-motion";
import NoAdvertBanner from "../../../assets/Img/noAdvertBanner.png";
import { FaHourglassHalf } from "react-icons/fa";
import {
  InformationCircleIcon,
  PencilIcon,
  EyeIcon,
  XMarkIcon,
  CheckIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  fetchRequisition,
  updateRequisition,
  updateRequisitionStatus,
  deleteRequisition,
  fetchAllRequisitions,
} from "./ApiService";
import StatusBadge from "../../../components/StatusBadge";
import LoadingState from "../../../components/LoadingState";

// Date formatting function
const formatDisplayDate = (dateString) => {
  if (!dateString) return "Not specified";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Get initials from user data
const getInitials = (user) => {
  if (!user || typeof user !== "object") return "N/A";
  if (user.first_name && user.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  }
  if (user.email) {
    return user.email.slice(0, 2).toUpperCase();
  }
  return "N/A";
};

// Get full name from user data
const getFullName = (user) => {
  if (!user || typeof user !== "object") return "Unknown";
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user.email || "Unknown";
};

// Get job position from user data
const getPosition = (user) => {
  if (!user || typeof user !== "object") return "Unknown";
  if (user.job_role) {
    return `${user.job_role}`;
  }
  return "staff";
};

// Get current user name from localStorage
const getCurrentUserName = () => {
  try {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      return getFullName(user);
    }
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
  }
  return "Unknown User";
};

// Backdrop component
const Backdrop = ({ onClick }) => (
  <motion.div
    className="fixed inset-0 z-40 bg-black bg-opacity-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.5 }}
    exit={{ opacity: 0 }}
    onClick={onClick}
  />
);

// Modal animation variants
const modalVariants = {
  hidden: { opacity: 0, y: 25, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: 25,
    scale: 0.95,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// Modal component
const Modal = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => (
  <AnimatePresence>
    <Backdrop onClick={onCancel} />
    <motion.div
      className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg"
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      role="dialog"
      aria-modal="true"
      key="delete-modal"
    >
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      <p className="mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded bg-gray-300 px-4 py-2 font-semibold hover:bg-gray-400"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className="rounded bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
          autoFocus
        >
          {confirmText}
        </button>
      </div>
    </motion.div>
  </AnimatePresence>
);

// AlertModal component
const AlertModal = ({ title, message, onClose }) => {
  // console.log(message);
  return (
    <AnimatePresence>
      <Backdrop onClick={onClose} />
      <motion.div
        className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        role="alertdialog"
        aria-modal="true"
        key="alert-modal"
      >
        <h3 className="mb-4 text-lg font-semibold text-center">{title}</h3>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700"
            autoFocus
          >
            OK
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Mapping objects for job_type and location_type
const jobTypeMap = {
  "Full-time": "full_time",
  "Part-time": "part_time",
  Contract: "contract",
  Freelance: "freelance",
  Internship: "internship",
};

const locationTypeMap = {
  "On-site": "on_site",
  Remote: "remote",
  Hybrid: "hybrid",
};

const reverseJobTypeMap = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  freelance: "Freelance",
  internship: "Internship",
};

const reverseLocationTypeMap = {
  on_site: "On-site",
  remote: "Remote",
  hybrid: "Hybrid",
};

const VewRequisition = ({ job, onClose }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState(job?.status || null);
  const [deadlineDate, setDeadlineDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [activeSection, setActiveSection] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showJobAdvert, setShowJobAdvert] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [alertModal, setAlertModal] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [advertBanner, setAdvertBanner] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isFormMutable, setIsFormMutable] = useState(
    job?.status === "accepted" || job?.status === "open"
  );
  const [responsibilities, setResponsibilities] = useState([""]);
  const [checkedItems, setCheckedItems] = useState([]);
  const [documentTitle, setDocumentTitle] = useState("");
  const [documents, setDocuments] = useState([]);
  const [requisitionData, setRequisitionData] = useState(job || {});
  const [showAddComplianceInput, setShowAddComplianceInput] = useState(false);
  const [newComplianceDoc, setNewComplianceDoc] = useState("");
  const [editingComplianceItem, setEditingComplianceItem] = useState(null);
  const [editingComplianceText, setEditingComplianceText] = useState("");
  const [showAcceptRejectInput, setShowAcceptRejectInput] = useState(false);
  const [acceptRejectText, setAcceptRejectText] = useState("");
  const [isSubmittingAcceptRejectReason, setIsSubmittingAcceptRejectReason] =
    useState(false);
  const [currentAction, setCurrentAction] = useState(null); // 'accept' or 'reject'
  const [acceptRejectReason, setAcceptRejectReason] = useState("");
  const [showEditButtons, setShowEditButtons] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Define original and custom compliance items separately
  const originalChecklistItems = [
    "Passport / ID",
    "Proof of Address",
    "Right to Work",
    "DBS Certificate",
    "Driving License",
    "Professional Qualifications",
    "References",
  ];
  const [customComplianceItems, setCustomComplianceItems] = useState([]);

  // Combine lists with custom items first
  const allComplianceItems = [
    ...customComplianceItems,
    ...originalChecklistItems,
  ];

  // Error states for document titles
  const [documentTitleError, setDocumentTitleError] = useState("");
  const [complianceDocError, setComplianceDocError] = useState("");

  const compulsoryDocuments = ["Curriculum Vitae (CV)"];

  // Form data initialized with requisition data
  const [formData, setFormData] = useState({
    jobTitle: job?.title || "",
    companyName: "",
    jobType: "Full-time",
    locationType: "On-site",
    companyAddress: "",
    job_location: "",
    salaryRange: "",
    jobDescription: "",
    numberOfCandidates: "",
    qualificationRequirement: job?.qualification_requirement || "",
    experienceRequirement: job?.experience_requirement || "",
    knowledgeSkillRequirement: job?.knowledge_requirement || "",
    reasonForRequisition: job?.reason || "",
    advertBannerFile: null,
    contract_duration: job?.contract_duration || "",
  });

  // Fetch requisition and advert details
  useEffect(() => {
    if (job?.id) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const data = await fetchRequisition(job.id);
          setRequisitionData(data);
          setStatus(data.status);
          setIsFormMutable(
            data.status === "open" || data.status === "accepted"
          );
          setShowEditButtons(false);

          setFormData({
            jobTitle: data.title || "",
            companyName: data.company_name || "",
            jobType: reverseJobTypeMap[data.job_type] || "Full-time",
            locationType:
              reverseLocationTypeMap[data.location_type] || "On-site",
            companyAddress: data.company_address || "",
            job_location: data.job_location || "",
            salaryRange: data.salary_range || "",
            jobDescription: data.job_description || "",
            numberOfCandidates: data.number_of_candidates
              ? String(data.number_of_candidates)
              : "",
            qualificationRequirement: data.qualification_requirement || "",
            experienceRequirement: data.experience_requirement || "",
            knowledgeSkillRequirement: data.knowledge_requirement || "",
            reasonForRequisition: data.reason || "",
            advertBannerFile: null, // Reset this to null initially
            contract_duration: data.contract_duration || "",
          });

          setDeadlineDate(
            data.deadline_date ? new Date(data.deadline_date) : null
          );
          setStartDate(data.start_date ? new Date(data.start_date) : null);
          setResponsibilities(
            data.responsibilities?.length ? data.responsibilities : [""]
          );

          // COMPULSORY DOCUMENTS INTEGRATION
          const fetchedDocs = data.documents_required || [];
          const allDocs = [
            ...compulsoryDocuments,
            ...fetchedDocs.filter((doc) => !compulsoryDocuments.includes(doc)),
          ];
          setDocuments(allDocs);

          // Get compliance checklist from API response
          const complianceChecklist = data.compliance_checklist || [];

          // Update checkedItems based on the compliance checklist from the requisition
          setCheckedItems(complianceChecklist.map((item) => item.name));

          const initialCustomItems = complianceChecklist
            .filter((item) => !originalChecklistItems.includes(item.name))
            .map((item) => item.name);
          setCustomComplianceItems(initialCustomItems);

          if (
            data.company_name ||
            data.job_description ||
            data.publish_status
          ) {
            setShowPreview(true);
            setShowJobAdvert(true);
          }

          // Handle banner image - check if we have a banner URL from API
          if (data.advert_banner_url) {
            const bannerUrl = data.advert_banner_url.startsWith("http")
              ? data.advert_banner_url
              : `${process.env.REACT_APP_API_BASE_URL}${data.advert_banner_url}`;
            setAdvertBanner(bannerUrl);
          } else {
            setAdvertBanner(null);
          }
        } catch (error) {
          setAlertModal({
            title: "Error",
            message: error,
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [job?.id]);

  const handleInputChange = (e) => {
    const { name, type, value, files } = e.target;
    if (type === "file" && name === "advertBannerFile") {
      if (files[0]) {
        // Clean up any existing blob URL before creating a new one
        if (advertBanner && advertBanner.startsWith("blob:")) {
          URL.revokeObjectURL(advertBanner);
        }

        // Create a preview URL for the uploaded file
        const previewUrl = URL.createObjectURL(files[0]);
        setAdvertBanner(previewUrl);
        setFormData((prev) => ({ ...prev, advertBannerFile: files[0] }));
      } else {
        setAdvertBanner(null);
        setFormData((prev) => ({ ...prev, advertBannerFile: null }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Clean up object URLs when component unmounts or banner changes
  useEffect(() => {
    return () => {
      if (advertBanner && advertBanner.startsWith("blob:")) {
        URL.revokeObjectURL(advertBanner);
      }
    };
  }, [advertBanner]);

  const handleResponsibilityChange = (index, value) => {
    if (!isFormMutable) return;
    const newResponsibilities = [...responsibilities];
    newResponsibilities[index] = value;
    setResponsibilities(newResponsibilities);
    setErrors((prev) => ({ ...prev, responsibilities: "" }));
  };

  const handleAddResponsibility = () => {
    if (!isFormMutable) return;
    setResponsibilities([...responsibilities, ""]);
  };

  const handleRemoveResponsibility = (index) => {
    if (!isFormMutable || index === 0) return;
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  const tabs = ["Job details", "Document uploads", "Compliance settings"];

  const validateJobDetails = () => {
    const newErrors = {};
    if (!formData.jobTitle.trim()) newErrors.jobTitle = "Job Title is required";
    if (!formData.companyName.trim())
      newErrors.companyName = "Company Name is required";
    if (
      formData.locationType === "On-site" &&
      !formData.companyAddress.trim()
    ) {
      newErrors.companyAddress = "Company Address is required for on-site jobs";
    }
    if (!formData.jobDescription.trim())
      newErrors.jobDescription = "Job Description is required";
    if (
      responsibilities.length === 0 ||
      responsibilities.every((resp) => !resp.trim())
    ) {
      newErrors.responsibilities = "At least one responsibility is required";
    }
    if (!deadlineDate)
      newErrors.deadlineDate = "Application Deadline is required";
    if (formData.jobType === "Contract" && !formData.contract_duration.trim()) {
      newErrors.contract_duration =
        "Contract Duration is required for contract jobs";
    }
    return newErrors;
  };

  const showAlert = (title, message) => {
    setAlertModal({ title, message });
  };

  const closeAlert = () => {
    setAlertModal(null);
  };

  const handlePublish = async () => {
    if (!isFormMutable) {
      showAlert(
        "Action Restricted",
        "Please accept the job request to publish."
      );
      return;
    }

    const jobDetailsErrors = validateJobDetails();
    if (Object.keys(jobDetailsErrors).length > 0) {
      setErrors(jobDetailsErrors);
      showAlert(
        "Validation Error",
        "Please fill in all required fields in Job Details"
      );
      return;
    }

    if (documents.length === 0) {
      setErrors({ documents: "At least one document title is required" });
      showAlert("Document Error", "Please add at least one document");
      return;
    }

    if (checkedItems.length === 0) {
      setErrors({ compliance: "At least one compliance item must be checked" });
      showAlert(
        "Compliance Error",
        "Please check at least one compliance item"
      );
      return;
    }

    setIsPublishing(true);

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.jobTitle);
    formDataToSend.append(
      "job_type",
      jobTypeMap[formData.jobType] || "full_time"
    );
    formDataToSend.append(
      "location_type",
      locationTypeMap[formData.locationType] || "on_site"
    );
    formDataToSend.append("company_name", formData.companyName);
    formDataToSend.append("company_address", formData.companyAddress || "");
    formDataToSend.append("job_location", formData.job_location || "");
    formDataToSend.append("salary_range", formData.salaryRange || "");
    formDataToSend.append("job_description", formData.jobDescription);
    formDataToSend.append(
      "number_of_candidates",
      formData.numberOfCandidates
        ? parseInt(formData.numberOfCandidates, 10)
        : ""
    );
    formDataToSend.append(
      "deadline_date",
      deadlineDate ? deadlineDate.toISOString().split("T")[0] : ""
    );
    if (startDate) {
      formDataToSend.append(
        "start_date",
        startDate.toISOString().split("T")[0]
      );
    }
    formDataToSend.append(
      "responsibilities",
      JSON.stringify(responsibilities.filter((r) => r.trim()))
    );
    formDataToSend.append("documents_required", JSON.stringify(documents));

    // Add contract_duration if jobType is Contract
    if (formData.jobType === "Contract") {
      formDataToSend.append(
        "contract_duration",
        formData.contract_duration || ""
      );
    }

    // Combine compliance items for submission
    const allComplianceItems = [
      ...customComplianceItems,
      ...originalChecklistItems,
    ];
    const complianceToSubmit = checkedItems.map((item) => ({ name: item }));
    formDataToSend.append(
      "compliance_checklist",
      JSON.stringify(complianceToSubmit)
    );

    // Upload the banner file (API expects 'advert_banner')
    if (formData.advertBannerFile instanceof File) {
      formDataToSend.append("advert_banner", formData.advertBannerFile);
    }
    formDataToSend.append("publish_status", "true");

    try {
      await updateRequisition(job.id, formDataToSend);

      // Refetch the data to get the updated advert_banner_url
      const updatedData = await fetchRequisition(job.id);
      setRequisitionData(updatedData);
      setStatus(updatedData.status);
      setIsFormMutable(
        updatedData.status === "open" || updatedData.status === "accepted"
      );
      setShowEditButtons(
        updatedData.status === "accepted" || updatedData.status === "rejected"
      );

      setFormData({
        jobTitle: updatedData.title || "",
        companyName: updatedData.company_name || "",
        jobType: reverseJobTypeMap[updatedData.job_type] || "Full-time",
        locationType:
          reverseLocationTypeMap[updatedData.location_type] || "On-site",
        companyAddress: updatedData.company_address || "",
        job_location: updatedData.job_location || "",
        salaryRange: updatedData.salary_range || "",
        jobDescription: updatedData.job_description || "",
        numberOfCandidates: updatedData.number_of_candidates
          ? String(updatedData.number_of_candidates)
          : "",
        qualificationRequirement: updatedData.qualification_requirement || "",
        experienceRequirement: updatedData.experience_requirement || "",
        knowledgeSkillRequirement: updatedData.knowledge_requirement || "",
        reasonForRequisition: updatedData.reason || "",
        advertBannerFile: null, // Clear the file after successful upload
        contract_duration: updatedData.contract_duration || "",
      });

      setDeadlineDate(
        updatedData.deadline_date ? new Date(updatedData.deadline_date) : null
      );
      setStartDate(
        updatedData.start_date ? new Date(updatedData.start_date) : null
      );
      setResponsibilities(
        updatedData.responsibilities?.length
          ? updatedData.responsibilities
          : [""]
      );

      const fetchedDocs = updatedData.documents_required || [];
      const allDocs = [
        ...compulsoryDocuments,
        ...fetchedDocs.filter((doc) => !compulsoryDocuments.includes(doc)),
      ];
      setDocuments(allDocs);

      const complianceChecklist = updatedData.compliance_checklist || [];
      setCheckedItems(complianceChecklist.map((item) => item.name));

      const initialCustomItems = complianceChecklist
        .filter((item) => !originalChecklistItems.includes(item.name))
        .map((item) => item.name);
      setCustomComplianceItems(initialCustomItems);

      if (
        updatedData.company_name ||
        updatedData.job_description ||
        updatedData.publish_status
      ) {
        setShowPreview(true);
        setShowJobAdvert(true);
      }

      // Handle banner image - check for advert_banner_url from API response
      if (updatedData.advert_banner_url) {
        // Clean up any existing blob URL before setting server URL
        if (advertBanner && advertBanner.startsWith("blob:")) {
          URL.revokeObjectURL(advertBanner);
        }

        const bannerUrl = updatedData.advert_banner_url.startsWith("http")
          ? updatedData.advert_banner_url
          : `${process.env.REACT_APP_API_BASE_URL}${updatedData.advert_banner_url}`;
        setAdvertBanner(bannerUrl);
      } else {
        // Clean up blob URL if no server URL is returned
        if (advertBanner && advertBanner.startsWith("blob:")) {
          URL.revokeObjectURL(advertBanner);
        }
        setAdvertBanner(null);
      }

      onClose();
      window.location.reload();
      await fetchAllRequisitions();
      setIsPublishing(false);
      setShowSuccess(true);
    } catch (error) {
      setIsPublishing(false);
      showAlert("Error", error);
    }
  };

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
        // Uncomment this if you want to navigate after success
        // navigate("/company/recruitment/job-adverts");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, navigate]);

  const handleNext = () => {
    // Check if status allows navigation
    if (status !== "accepted" && status !== "open") {
      showAlert(
        "Action Restricted",
        "Please accept the job request to proceed with drafting."
      );
      return;
    }

    if (activeSection === 0) {
      const jobDetailsErrors = validateJobDetails();
      if (Object.keys(jobDetailsErrors).length > 0) {
        setErrors(jobDetailsErrors);
        showAlert(
          "Validation Error",
          "Please fill in all required fields in Job Details"
        );
        return;
      }
    } else if (activeSection === 1) {
      if (documents.length === 0) {
        setErrors({ documents: "At least one document title is required" });
        showAlert("Document Error", "Please add at least one document");
        return;
      }
    } else if (activeSection === 2) {
      if (checkedItems.length === 0) {
        setErrors({
          compliance: "At least one compliance item must be checked",
        });
        showAlert(
          "Compliance Error",
          "Please check at least one compliance item"
        );
        return;
      }
    }

    if (activeSection < tabs.length - 1) {
      setActiveSection(activeSection + 1);
      setErrors({});
    } else {
      setShowPreview(true);
      setShowJobAdvert(true);
    }
  };

  const handlePrev = () => {
    // Check if status allows navigation
    if (status !== "accepted" && status !== "open") {
      showAlert(
        "Action Restricted",
        "Please accept the job request to proceed with drafting."
      );
      return;
    }

    if (activeSection > 0) {
      setActiveSection(activeSection - 1);
      setErrors({});
    }
  };

  const handleTabClick = (index) => {
    // Check if status allows navigation
    if (status !== "accepted" && status !== "open") {
      showAlert(
        "Action Restricted",
        "Please accept the job request to proceed with drafting."
      );
      return;
    }

    if (index > activeSection) {
      if (activeSection === 0) {
        const jobDetailsErrors = validateJobDetails();
        if (Object.keys(jobDetailsErrors).length > 0) {
          setErrors(jobDetailsErrors);
          showAlert(
            "Validation Error",
            "Please fill in all required fields in Job Details"
          );
          return;
        }
      } else if (activeSection === 1 && documents.length === 0) {
        setErrors({ documents: "At least one document title is required" });
        showAlert("Document Error", "Please add at least one document title");
        return;
      } else if (activeSection === 2 && checkedItems.length === 0) {
        setErrors({
          compliance: "At least one compliance item must be checked",
        });
        showAlert(
          "Compliance Error",
          "Please check at least one compliance item"
        );
        return;
      }
    }
    setActiveSection(index);
    setErrors({});
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setShowJobAdvert(false);
  };

  const handleAcceptClick = () => {
    setCurrentAction("accept");
    setShowAcceptRejectInput(true);
    setAcceptRejectText("");
  };

  const handleRejectClick = () => {
    setCurrentAction("reject");
    setShowAcceptRejectInput(true);
    setAcceptRejectText("");
  };

  const handleConfirmWithReason = async () => {
    if (!acceptRejectText.trim()) {
      showAlert("Validation Error", "Please enter a reason");
      return;
    }

    setIsSubmittingAcceptRejectReason(true);
    try {
      const formData = new FormData();
      formData.append(
        "status",
        currentAction === "accept" ? "open" : "rejected"
      );
      formData.append("comment", acceptRejectText);

      await updateRequisition(job.id, formData);

      // Update local state/UI instead of reloading the page
      setStatus(currentAction === "accept" ? "accepted" : "rejected");
      setIsFormMutable(currentAction === "accept"); // Enable form only if accepted
      setShowEditButtons(true); // Show edit button after action
      setRequisitionData((prev) => ({
        ...prev,
        status: currentAction === "accept" ? "accepted" : "rejected",
        comment: acceptRejectText,
      }));
      setAcceptRejectReason(acceptRejectText);
      setShowAcceptRejectInput(false);
      setCurrentAction(null);
      // Optionally, show a success notification/modal here
    } catch (error) {
      showAlert("Error", error);
    } finally {
      setIsSubmittingAcceptRejectReason(false);
    }
  };

  const handleCancelReason = () => {
    setShowAcceptRejectInput(false);
    setCurrentAction(null);
    setAcceptRejectText("");

    // If we were editing status for accepted/rejected, go back to showing the edit button
    if (status === "accepted" || status === "rejected" || status === "open") {
      setShowEditButtons(false);
    }
  };

  const handleEditStatus = () => {
    setShowEditButtons(true); // This should be true to show accept/reject buttons
    setShowAcceptRejectInput(false);
    // Don't reset the status here - keep it as "accepted" or "rejected"
    setIsFormMutable(false); // Disable form editing
  };

  const handleDeleteAdvert = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAdvert = async () => {
    try {
      await deleteRequisition(job.id);
      await fetchAllRequisitions();
      setShowDeleteModal(false);
      onClose();
    } catch (error) {
      setShowDeleteModal(false);
      showAlert("Error", error);
    }
  };

  const cancelDeleteAdvert = () => {
    setShowDeleteModal(false);
  };

  const toggleChecklistItem = (item) => {
    if (!isFormMutable) return;
    setCheckedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
    setErrors((prev) => ({ ...prev, compliance: "" }));
  };

  const handleAddDocument = () => {
    if (!isFormMutable) return;

    // Validate input
    if (!documentTitle.trim()) {
      setDocumentTitleError("Document title is required");
      return;
    }

    const trimmed = documentTitle.trim();
    if (trimmed && !documents.includes(trimmed)) {
      setDocuments((prev) => [...prev, trimmed]);
      setDocumentTitle("");
      setDocumentTitleError("");
      setErrors((prev) => ({ ...prev, documents: "" }));
    } else {
      setDocumentTitleError("Document title must be unique");
    }
  };

  const handleRemoveDocument = (titleToRemove) => {
    if (!isFormMutable) return;
    // Prevent removal of compulsory documents
    if (compulsoryDocuments.includes(titleToRemove)) return;
    setDocuments((prev) => prev.filter((doc) => doc !== titleToRemove));
  };

  const hasAdvertData = () => {
    return (
      formData.jobTitle.trim() &&
      formData.companyName.trim() &&
      (formData.locationType !== "On-site" || formData.companyAddress.trim()) &&
      formData.jobDescription.trim() &&
      responsibilities.length > 0 &&
      deadlineDate &&
      (formData.jobType !== "Contract" || formData.contract_duration.trim())
    );
  };

  const handleAddComplianceDocument = () => {
    if (!isFormMutable) return;

    // Validate input
    if (!newComplianceDoc.trim()) {
      setComplianceDocError("Document title is required");
      return;
    }

    const trimmedDoc = newComplianceDoc.trim();
    if (
      trimmedDoc &&
      !originalChecklistItems.includes(trimmedDoc) &&
      !customComplianceItems.includes(trimmedDoc)
    ) {
      // Add new item to the beginning of custom items
      setCustomComplianceItems((prev) => [trimmedDoc, ...prev]);
      setNewComplianceDoc("");
      setComplianceDocError("");
      setErrors((prev) => ({ ...prev, compliance: "" }));
    } else {
      setComplianceDocError("Document title must be unique");
    }
  };

  const handleRemoveComplianceDocument = (item) => {
    if (!isFormMutable) return;
    setCustomComplianceItems((prev) => prev.filter((i) => i !== item));
    setCheckedItems((prev) => prev.filter((i) => i !== item));
  };

  const handleEditComplianceDocument = (item) => {
    setEditingComplianceItem(item);
    setEditingComplianceText(item);
    setShowAddComplianceInput(true);
  };

  const handleUpdateComplianceDocument = () => {
    if (!editingComplianceText.trim()) {
      setComplianceDocError("Document title is required");
      return;
    }

    const trimmedDoc = editingComplianceText.trim();

    // Check for uniqueness
    if (
      originalChecklistItems.includes(trimmedDoc) ||
      (customComplianceItems.includes(trimmedDoc) &&
        trimmedDoc !== editingComplianceItem)
    ) {
      setComplianceDocError("Document title must be unique");
      return;
    }

    // Update custom items
    const updatedCustomItems = customComplianceItems.map((item) =>
      item === editingComplianceItem ? trimmedDoc : item
    );

    // Update checked items
    const updatedCheckedItems = checkedItems.map((item) =>
      item === editingComplianceItem ? trimmedDoc : item
    );

    setCustomComplianceItems(updatedCustomItems);
    setCheckedItems(updatedCheckedItems);

    // Reset editing state
    setEditingComplianceItem(null);
    setEditingComplianceText("");
    setComplianceDocError("");
    setShowAddComplianceInput(false);
  };

  const cancelEditCompliance = () => {
    setEditingComplianceItem(null);
    setEditingComplianceText("");
    setComplianceDocError("");
    setShowAddComplianceInput(false);
  };

  const tabVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
  };

  const inputSectionVariants = {
    hidden: { height: 0, opacity: 0, marginBottom: 0 },
    visible: {
      height: "auto",
      opacity: 1,
      marginBottom: "1rem",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    exit: {
      height: 0,
      opacity: 0,
      marginBottom: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const currentUserName = getCurrentUserName();

  return (
    <div className="VewRequisition">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="success-alert"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            style={{
              position: "fixed",
              top: 10,
              backgroundColor: "#38a169",
              color: "white",
              padding: "10px 20px",
              fontSize: "12px",
              borderRadius: "6px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              zIndex: 9999,
            }}
            key="success-alert"
          >
            Job advert has been published successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="VewRequisition-Bodddy" onClick={onClose}></div>
      <button className="VewRequisition-btn" onClick={onClose}>
        <XMarkIcon />
      </button>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="VewRequisition-Main"
      >
        <div className="VewRequisition-Part">
          <div className="VewRequisition-Part-Top">
            <h3>Job Request</h3>
          </div>

          <div className="ssen-regs">
            <div className="ssen-regs-1">
              <span>{getInitials(requisitionData.requested_by)}</span>
            </div>
            <div className="ssen-regs-2">
              <div>
                <h4>{getFullName(requisitionData.requested_by)}</h4>
                <p>{getPosition(requisitionData.requested_by)}</p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="oola-Toa">
              <h3>Request ID : {requisitionData.id || "N/A"}</h3>
              <span>{formatDisplayDate(requisitionData.requested_date)}</span>
            </div>

            <div className="oluj-Seccco">
              <h2 className="pool-HHga">{requisitionData.title}</h2>

              <div className="oluj-Seccco-Main custom-scroll-bar">
                <div className="polau-se">
                  <h4>Reason for Job Requisition</h4>
                  <p>{requisitionData.reason || "No reason provided."}</p>
                </div>

                {(status === "accepted" ||
                  status === "open" ||
                  status === "rejected") &&
                  (acceptRejectReason || requisitionData.comment) && (
                    <div className="polau-se">
                      <h4>
                        Reason for&nbsp;
                        {status === "accepted" || status === "open"
                          ? "Acceptance"
                          : "Rejection"}
                      </h4>
                      <p>{acceptRejectReason || requisitionData.comment}</p>
                    </div>
                  )}
              </div>

              <div className="polau-se">
                <div
                  className="status-container"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "5px",
                    padding: "0.5rem",
                  }}
                >
                  <p className={status?.toLowerCase() || "pending"}>Status:</p>

                  {(status === "accepted" ||
                    status === "open" ||
                    status === "rejected") && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={status === "rejected" ? "#991b1b" : "#38a169"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ marginLeft: "6px" }}
                    >
                      {status === "rejected" ? (
                        <>
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </>
                      ) : (
                        <path d="M20 6L9 17l-5-5" />
                      )}
                    </svg>
                  )}

                  {status === "pending" && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "linear",
                      }}
                      style={{ marginLeft: "6px" }}
                    >
                      <FaHourglassHalf color="#d97706" size={16} />
                    </motion.div>
                  )}

                  <StatusBadge
                    status={
                      status === "open" ? "Accepted" : status || "Pending"
                    }
                  />
                </div>

                {/* Edit button for accepted/rejected status */}
                {(status === "accepted" ||
                  status === "rejected" ||
                  status === "open") &&
                  !showEditButtons && (
                    <div
                      className="Desaa-Btns"
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        marginTop: "10px",
                        gap: "10px",
                      }}
                    >
                      <button
                        className="accept-Btn"
                        onClick={handleEditStatus}
                        disabled={isAccepting || isRejecting}
                        style={{
                          minWidth: "100px",
                          padding: "8px 16px",
                        }}
                      >
                        <PencilIcon className="w-5 h-5" /> Edit
                      </button>
                    </div>
                  )}

                {/* Show accept/reject buttons when editing or pending */}
                {(status === "pending" || showEditButtons) &&
                  !showAcceptRejectInput && (
                    <div
                      className="Desaa-Btns"
                      style={{
                        flexDirection: "column",
                        marginTop: "10px",
                        gap: "10px",
                      }}
                    >
                      <button
                        className="accept-Btn"
                        onClick={handleAcceptClick}
                        disabled={isAccepting || isRejecting}
                      >
                        <CheckIcon className="w-5 h-5" /> Accept
                      </button>
                      <button
                        className="reject-Btn"
                        onClick={handleRejectClick}
                        disabled={isAccepting || isRejecting}
                      >
                        <XMarkIcon className="w-5 h-5" /> Reject
                      </button>
                    </div>
                  )}

                {/* "Accepted by" text for accepted status */}
                {status === "open" && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "0.5rem",
                      fontSize: "12px",
                      fontStyle: "italic",
                      color: "#6b7280",
                    }}
                  >
                    <p>
                      Accepted by&nbsp;
                      <span style={{ fontWeight: "500" }}>
                        {currentUserName}
                      </span>
                    </p>
                  </div>
                )}

                {/* "Rejected by" text for rejected status */}
                {status === "rejected" && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "0.5rem",
                      fontSize: "12px",
                      fontStyle: "italic",
                      color: "#6b7280",
                    }}
                  >
                    <p>
                      Rejected by&nbsp;
                      <span style={{ fontWeight: "500" }}>
                        {currentUserName}
                      </span>
                    </p>
                  </div>
                )}

                {showAcceptRejectInput && (
                  <motion.div
                    variants={inputSectionVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="reason-input-container"
                  >
                    <textarea
                      placeholder={`Reason for ${
                        currentAction === "accept" ? "acceptance" : "rejection"
                      }...`}
                      value={acceptRejectText}
                      onChange={(e) => setAcceptRejectText(e.target.value)}
                      className="reason-textarea"
                    />
                    <div className="reason-buttons">
                      <button
                        onClick={handleConfirmWithReason}
                        disabled={
                          !acceptRejectText.trim() ||
                          isSubmittingAcceptRejectReason
                        }
                        className="reason-button confirm-reason-btn"
                      >
                        {isSubmittingAcceptRejectReason ? (
                          <div className="ooo-AGtgs">
                            <motion.div
                              initial={{ rotate: 0 }}
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              style={{
                                width: 13,
                                height: 13,
                                borderRadius: "50%",
                                border: "3px solid #fff",
                                borderTopColor: "transparent",
                                marginRight: "1px",
                                display: "inline-block",
                              }}
                            />
                            {currentAction === "accept"
                              ? "Accepting..."
                              : "Rejecting..."}
                          </div>
                        ) : (
                          "Confirm"
                        )}
                      </button>
                      <button
                        onClick={handleCancelReason}
                        className="reason-button cancel-reason-btn"
                        disabled={isSubmittingAcceptRejectReason}
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {isLoading ? (
          <LoadingState text="Loading job requisition & advert data..." />
        ) : (
          <>
            <div
              className={`VewRequisition-Part ${
                status === "pending" || status === "rejected"
                  ? "disabled-section"
                  : "enabled-section"
              }`}
            >
              <div className="VewRequisition-Part-Top">
                <h3>Job Advert Drafting</h3>
              </div>

              <div className="ssol-Subam">
                {tabs.map((tab, index) => (
                  <span
                    key={index}
                    className={
                      index === activeSection
                        ? "active-ssol-Subam"
                        : status === "accepted" || status === "open"
                        ? ""
                        : "disabled-tab"
                    }
                    onClick={() => handleTabClick(index)}
                    style={{
                      cursor:
                        status === "accepted" || status === "open"
                          ? "pointer"
                          : "not-allowed",
                      opacity:
                        status === "accepted" || status === "open" ? 1 : 0.5,
                    }}
                  >
                    {tab}
                  </span>
                ))}
              </div>
              <div className="GHuh-Form-Sec">
                <div className="GHuh-Form-Sec-Top">
                  <h3>{tabs[activeSection]}</h3>
                  <div className="GHuh-Form-Sec-Top-Btns">
                    <span
                      onClick={handlePrev}
                      style={{
                        cursor:
                          activeSection > 0 &&
                          (status === "accepted" || status === "open")
                            ? "pointer"
                            : "not-allowed",
                        opacity:
                          activeSection > 0 &&
                          (status === "accepted" || status === "open")
                            ? 1
                            : 0.5,
                      }}
                    >
                      <ArrowLeftIcon /> Prev
                    </span>
                    <span
                      onClick={handleNext}
                      style={{
                        cursor:
                          activeSection < tabs.length &&
                          (status === "accepted" || status === "open")
                            ? "pointer"
                            : "not-allowed",
                        opacity:
                          activeSection < tabs.length &&
                          (status === "accepted" || status === "open")
                            ? 1
                            : 0.5,
                      }}
                    >
                      {activeSection === tabs.length - 1 ? (
                        <>
                          View Advert <EyeIcon />
                        </>
                      ) : (
                        <>
                          Next <ArrowRightIcon />
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="GHuh-Form-Sec-Main custom-scroll-bar">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeSection}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={tabVariants}
                      className="w-full"
                    >
                      {activeSection === 0 && (
                        <>
                          <h3>Basic Job Information</h3>

                          <div className="Gland-All-Grid">
                            <div className="GHuh-Form-Input">
                              <label>Job Title</label>
                              <input
                                name="jobTitle"
                                type="text"
                                placeholder="e.g. Frontend Developer"
                                value={formData.jobTitle}
                                onChange={handleInputChange}
                                required
                                disabled={!isFormMutable}
                              />
                              {errors.jobTitle && (
                                <p className="error">{errors.jobTitle}</p>
                              )}
                            </div>

                            <div className="GHuh-Form-Input">
                              <label>Advert Banner (optional)</label>
                              {advertBanner ? (
                                <div className="file-input-with-preview">
                                  <img
                                    src={advertBanner}
                                    alt="Banner preview"
                                    className="banner-preview-image"
                                  />
                                  <label className="change-file-button">
                                    <input
                                      type="file"
                                      name="advertBannerFile"
                                      accept="image/*"
                                      onChange={handleInputChange}
                                      disabled={!isFormMutable}
                                      style={{ display: "none" }}
                                    />
                                    Change Banner
                                  </label>
                                </div>
                              ) : (
                                <input
                                  type="file"
                                  name="advertBannerFile"
                                  accept="image/*"
                                  onChange={handleInputChange}
                                  disabled={!isFormMutable}
                                />
                              )}
                            </div>
                          </div>

                          <div className="GHuh-Form-Input">
                            <label>Company Name</label>
                            <input
                              name="companyName"
                              type="text"
                              placeholder="e.g. Company Ltd"
                              value={formData.companyName}
                              onChange={handleInputChange}
                              required
                              disabled={!isFormMutable}
                            />
                            {errors.companyName && (
                              <p className="error">{errors.companyName}</p>
                            )}
                          </div>

                          <div className="Gland-All-Grid">
                            <div className="GHuh-Form-Input">
                              <label>Job Type</label>
                              <select
                                name="jobType"
                                value={formData.jobType}
                                onChange={handleInputChange}
                                disabled={!isFormMutable}
                                style={{ padding: "0.5rem 1rem" }}
                              >
                                <option>Full-time</option>
                                <option>Part-time</option>
                                <option>Contract</option>
                                <option>Freelance</option>
                                <option>Internship</option>
                              </select>
                            </div>
                            <div className="GHuh-Form-Input">
                              <label>Work Model</label>
                              <select
                                name="locationType"
                                value={formData.locationType}
                                onChange={handleInputChange}
                                disabled={!isFormMutable}
                              >
                                <option>On-site</option>
                                <option>Remote</option>
                                <option>Hybrid</option>
                              </select>
                            </div>
                          </div>

                          {/* New Contract Duration Field */}
                          {formData.jobType === "Contract" && (
                            <div className="GHuh-Form-Input">
                              <label>Contract Duration</label>
                              <input
                                name="contract_duration"
                                type="text"
                                placeholder="e.g. 6 months"
                                value={formData.contract_duration}
                                onChange={handleInputChange}
                                required
                                disabled={!isFormMutable}
                              />
                              {errors.contract_duration && (
                                <p className="error">
                                  {errors.contract_duration}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="GHuh-Form-Input">
                            <label>Company Address</label>
                            <input
                              name="companyAddress"
                              type="text"
                              placeholder="Enter Company Address"
                              value={formData.companyAddress}
                              onChange={handleInputChange}
                              required
                              disabled={!isFormMutable}
                            />
                            {errors.companyAddress && (
                              <p className="error">{errors.companyAddress}</p>
                            )}
                          </div>

                          <div className="GHuh-Form-Input">
                            <label>Location</label>
                            <input
                              name="job_location"
                              type="text"
                              placeholder="Enter Work Location"
                              onChange={handleInputChange}
                              required
                              disabled={!isFormMutable}
                            />
                          </div>

                          <div className="GHuh-Form-Input">
                            <label>Salary Range (optional)</label>
                            <input
                              name="salaryRange"
                              type="text"
                              placeholder="e.g. $0.00 - $0.00"
                              value={formData.salaryRange}
                              onChange={handleInputChange}
                              disabled={!isFormMutable}
                            />
                          </div>

                          <div className="GHuh-Form-Input">
                            <label>
                              Number of Candidates (Needed for Interview)
                              (optional)
                            </label>
                            <input
                              name="numberOfCandidates"
                              type="text"
                              placeholder="e.g. 10"
                              value={formData.numberOfCandidates}
                              onChange={handleInputChange}
                              disabled={!isFormMutable}
                            />
                            {errors.numberOfCandidates && (
                              <p className="error">
                                {errors.numberOfCandidates}
                              </p>
                            )}
                          </div>

                          <div className="GHuh-Form-Input">
                            <label>Qualification Requirement (optional)</label>
                            <input
                              name="qualificationRequirement"
                              type="text"
                              placeholder="e.g. Bachelor's degree in Computer Science"
                              value={formData.qualificationRequirement}
                              onChange={handleInputChange}
                              disabled={!isFormMutable}
                            />
                            {errors.qualificationRequirement && (
                              <p className="error">
                                {errors.qualificationRequirement}
                              </p>
                            )}
                          </div>

                          <div className="GHuh-Form-Input">
                            <label>Experience Requirement (optional)</label>
                            <input
                              name="experienceRequirement"
                              type="text"
                              placeholder="e.g. 3+ years in web development"
                              value={formData.experienceRequirement}
                              onChange={handleInputChange}
                              disabled={!isFormMutable}
                            />
                            {errors.experienceRequirement && (
                              <p className="error">
                                {errors.experienceRequirement}
                              </p>
                            )}
                          </div>

                          <div className="GHuh-Form-Input">
                            <label>
                              Knowledge/Skill Requirement (optional)
                            </label>
                            <input
                              name="knowledgeSkillRequirement"
                              type="text"
                              placeholder="e.g. React, JavaScript, CSS"
                              value={formData.knowledgeSkillRequirement}
                              onChange={handleInputChange}
                              disabled={!isFormMutable}
                            />
                            {errors.knowledgeSkillRequirement && (
                              <p className="error">
                                {errors.knowledgeSkillRequirement}
                              </p>
                            )}
                          </div>

                          <h3>Job Description</h3>
                          <div className="GHuh-Form-Input">
                            <textarea
                              name="jobDescription"
                              placeholder="Enter job responsibilities, requirements, etc."
                              value={formData.jobDescription}
                              onChange={handleInputChange}
                              required
                              disabled={!isFormMutable}
                            ></textarea>
                            {errors.jobDescription && (
                              <p className="error">{errors.jobDescription}</p>
                            )}
                          </div>

                          <h3>
                            Key Responsibilities{" "}
                            <span
                              onClick={handleAddResponsibility}
                              className={
                                isFormMutable
                                  ? "cursor-pointer"
                                  : "cursor-not-allowed"
                              }
                            >
                              <PlusIcon /> Add
                            </span>
                          </h3>
                          <div className="GHuh-Form-Input">
                            <label>Responsibilities</label>
                            <input
                              type="text"
                              placeholder="Add a responsibility"
                              value={responsibilities[0] || ""}
                              onChange={(e) =>
                                handleResponsibilityChange(0, e.target.value)
                              }
                              disabled={!isFormMutable}
                            />
                            {responsibilities.slice(1).map((resp, index) => (
                              <div
                                key={index + 1}
                                className="responsibility-Inn-Box"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  marginTop: "8px",
                                }}
                              >
                                <input
                                  type="text"
                                  placeholder="Add a responsibility"
                                  value={resp}
                                  onChange={(e) =>
                                    handleResponsibilityChange(
                                      index + 1,
                                      e.target.value
                                    )
                                  }
                                  disabled={!isFormMutable}
                                />
                                <span
                                  onClick={() =>
                                    handleRemoveResponsibility(index + 1)
                                  }
                                  style={{
                                    cursor: isFormMutable
                                      ? "pointer"
                                      : "not-allowed",
                                    marginLeft: "8px",
                                  }}
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </span>
                              </div>
                            ))}
                            {errors.responsibilities && (
                              <p className="error">{errors.responsibilities}</p>
                            )}
                          </div>

                          <h3>Application Details</h3>
                          <div className="Gland-All-Grid">
                            <div className="GHuh-Form-Input">
                              <label>Deadline for Applications</label>
                              <DatePicker
                                selected={deadlineDate}
                                onChange={(date) => {
                                  if (!isFormMutable) return;
                                  setDeadlineDate(date);
                                  setErrors((prev) => ({
                                    ...prev,
                                    deadlineDate: "",
                                  }));
                                }}
                                placeholderText="yyyy-MM-dd"
                                dateFormat="yyyy-MM-dd"
                                className="custom-datepicker-input"
                                required
                                disabled={!isFormMutable}
                              />
                              {errors.deadlineDate && (
                                <p className="error">{errors.deadlineDate}</p>
                              )}
                            </div>

                            <div className="GHuh-Form-Input">
                              <label>Start Date (Optional)</label>
                              <DatePicker
                                selected={startDate}
                                onChange={(date) => {
                                  if (!isFormMutable) return;
                                  setStartDate(date);
                                  setErrors((prev) => ({
                                    ...prev,
                                    startDate: "",
                                  }));
                                }}
                                placeholderText="yyyy-MM-dd"
                                dateFormat="yyyy-MM-dd"
                                className="custom-datepicker-input"
                                disabled={!isFormMutable}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {activeSection === 1 && (
                        <>
                          <h3>Document Uploads</h3>
                          <p style={{ fontSize: 12, marginTop: "-15px" }}>
                            Specify documents for upload at the point of job
                            application
                          </p>
                          <div className="GHuh-Form-Input">
                            <label>Title</label>
                            <div className="ooi-flex">
                              <input
                                type="text"
                                placeholder="Enter Document Title"
                                value={documentTitle}
                                onChange={(e) => {
                                  setDocumentTitle(e.target.value);
                                  // Clear error when user starts typing
                                  if (
                                    documentTitleError &&
                                    e.target.value.trim()
                                  ) {
                                    setDocumentTitleError("");
                                  }
                                }}
                                required
                                disabled={!isFormMutable}
                              />
                              <span
                                className="cursor-pointer"
                                onClick={handleAddDocument}
                                style={{
                                  cursor: isFormMutable
                                    ? "pointer"
                                    : "not-allowed",
                                  opacity: isFormMutable ? 1 : 0.5,
                                }}
                              >
                                <PlusIcon className="w-5 h-5" />
                                Add Document
                              </span>
                            </div>
                            {/* Show error message if exists */}
                            {documentTitleError && (
                              <p className="error">{documentTitleError}</p>
                            )}
                            {errors.documents && (
                              <p className="error">{errors.documents}</p>
                            )}
                            <ul className="apooul-Ul">
                              {documents.map((doc, index) => (
                                <li key={index}>
                                  <p>
                                    <MinusIcon className="w-4 h-4" /> {doc}
                                  </p>
                                  {/* Disable removal for compulsory documents */}
                                  {!compulsoryDocuments.includes(doc) && (
                                    <span
                                      onClick={() => handleRemoveDocument(doc)}
                                      style={{
                                        cursor: isFormMutable
                                          ? "pointer"
                                          : "not-allowed",
                                        opacity: isFormMutable ? 1 : 0.5,
                                      }}
                                    >
                                      <XMarkIcon className="w-4 h-4 cursor-pointer" />
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}

                      {activeSection === 2 && (
                        <>
                          <h3>
                            Compliance document
                            <span
                              className="cursor-pointer"
                              title={
                                editingComplianceItem
                                  ? "Update compliance document"
                                  : "Add more compliance document"
                              }
                              onClick={() => {
                                if (editingComplianceItem) return;
                                setShowAddComplianceInput(
                                  !showAddComplianceInput
                                );
                                setEditingComplianceItem(null);
                                setEditingComplianceText("");
                              }}
                            >
                              <PlusIcon className="w-5 h-5" />
                              {showAddComplianceInput && !editingComplianceItem
                                ? " Close"
                                : " Add"}
                            </span>
                          </h3>

                          <p style={{ fontSize: 12, marginTop: "-15px" }}>
                            Specify documents for compliance check after hiring
                            decision is made
                          </p>

                          <AnimatePresence>
                            {showAddComplianceInput && (
                              <motion.div
                                variants={inputSectionVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="overflow-hidden"
                              >
                                <div className="GHuh-Form-Input">
                                  <label>
                                    {editingComplianceItem
                                      ? "Edit compliance document"
                                      : "Add more compliance document"}
                                  </label>
                                  <div className="ooi-flex">
                                    <input
                                      type="text"
                                      placeholder="Enter Document Title"
                                      value={
                                        editingComplianceItem
                                          ? editingComplianceText
                                          : newComplianceDoc
                                      }
                                      onChange={(e) => {
                                        if (editingComplianceItem) {
                                          setEditingComplianceText(
                                            e.target.value
                                          );
                                        } else {
                                          setNewComplianceDoc(e.target.value);
                                        }
                                        if (
                                          complianceDocError &&
                                          e.target.value.trim()
                                        ) {
                                          setComplianceDocError("");
                                        }
                                      }}
                                      required
                                      disabled={!isFormMutable}
                                    />
                                    {editingComplianceItem ? (
                                      <div className="Edilol-OLka">
                                        <span
                                          className="cursor-pointer btn-primary-bg"
                                          onClick={
                                            handleUpdateComplianceDocument
                                          }
                                        >
                                          Update
                                        </span>
                                        <span
                                          className="cursor-pointer bg-gray-300 px-3 py-1 rounded"
                                          onClick={cancelEditCompliance}
                                        >
                                          Cancel
                                        </span>
                                      </div>
                                    ) : (
                                      <span
                                        className="cursor-pointer btn-primary-bg"
                                        onClick={handleAddComplianceDocument}
                                      >
                                        <PlusIcon className="w-5 h-5" />
                                        Add
                                      </span>
                                    )}
                                  </div>
                                  {complianceDocError && (
                                    <p className="error">
                                      {complianceDocError}
                                    </p>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="GHuh-Form-Input">
                            <ul className="checcck-lissT">
                              {allComplianceItems.map((item, index) => {
                                const isCustom =
                                  customComplianceItems.includes(item);
                                const isChecked = checkedItems.includes(item);

                                return (
                                  <li
                                    key={index}
                                    className={
                                      isCustom
                                        ? `added-COmpll-list ${
                                            isChecked ? "custom-active" : ""
                                          }`
                                        : isChecked
                                        ? "active-Li-Check"
                                        : ""
                                    }
                                    onClick={() => toggleChecklistItem(item)}
                                    style={{
                                      cursor: isFormMutable
                                        ? "pointer"
                                        : "not-allowed",
                                      opacity: isFormMutable ? 1 : 0.5,
                                    }}
                                  >
                                    <p>{item}</p>{" "}
                                    {/* Render the item name directly */}
                                    {isCustom ? (
                                      <div className="GHll-POl-Dec">
                                        <button
                                          className="edit-compliance-btn"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditComplianceDocument(item);
                                          }}
                                        >
                                          <PencilIcon /> Edit
                                        </button>
                                        <button
                                          className="remove-compliance-btn"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveComplianceDocument(
                                              item
                                            );
                                          }}
                                        >
                                          <XMarkIcon className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="check-indicator"></span>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                            {errors.compliance && (
                              <p className="error">{errors.compliance}</p>
                            )}
                          </div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div
              className={`VewRequisition-Part ${
                showJobAdvert ? "active-preview" : ""
              } ${
                status === "pending" || status === "rejected"
                  ? "disabled-section"
                  : "enabled-section"
              }`}
            >
              <div className="VewRequisition-Part-Top">
                <h3>Job Advert</h3>
                {showPreview && (
                  <button
                    className="close-preview-btn"
                    onClick={handleClosePreview}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
              {!showPreview ? (
                <div className="no-advert-message">
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <img src={NoAdvertBanner} alt="No Advert" />
                    <h4>No advert yet!</h4>
                    <p>
                      There are currently no advertisement details available for
                      display.
                    </p>
                  </motion.div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="job-preview-container"
                >
                  <div className="preview-buttons">
                    <button
                      className="publish-btn btn-primary-bg"
                      onClick={handlePublish}
                      disabled={isPublishing}
                    >
                      {isPublishing ? (
                        <>
                          <motion.div
                            initial={{ rotate: 0 }}
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            style={{
                              width: 15,
                              height: 15,
                              borderRadius: "50%",
                              border: "3px solid #fff",
                              borderTopColor: "transparent",
                              marginRight: "5px",
                              display: "inline-block",
                            }}
                          />
                          Publishing...
                        </>
                      ) : (
                        "Publish Job Advert"
                      )}
                    </button>
                    <button className="delete-btn" onClick={handleDeleteAdvert}>
                      <TrashIcon className="w-5 h-5" /> Delete
                    </button>
                  </div>

                  <div className="main-Prevs-Sec custom-scroll-bar">
                    {advertBanner && (
                      <div className="advert-banner">
                        <img
                          src={advertBanner}
                          alt="Job Advert Banner"
                          className="w-full h-auto object-cover rounded-md mb-4"
                        />
                        <span>
                          <InformationCircleIcon /> Advert Banner
                        </span>
                      </div>
                    )}

                    <div className="preview-section-All">
                      <div className="preview-section">
                        <h3>Basic Job Information</h3>
                        <p>
                          <span>Job Title:</span> {formData.jobTitle}
                        </p>
                        <p>
                          <span>Company Name:</span> {formData.companyName}
                        </p>
                        <p>
                          <span>Job Type:</span> {formData.jobType}
                        </p>
                        {formData.jobType === "Contract" &&
                          formData.contract_duration && (
                            <p>
                              <span>Contract Duration:</span>{" "}
                              {formData.contract_duration}
                            </p>
                          )}
                        <p>
                          <span>Location:</span> {formData.locationType}
                        </p>
                        {formData.companyAddress && (
                          <p>
                            <span>Company Address:</span>{" "}
                            {formData.companyAddress}
                          </p>
                        )}
                        {formData.salaryRange && (
                          <p>
                            <span>Salary Range:</span> {formData.salaryRange}
                          </p>
                        )}
                        {formData.numberOfCandidates && (
                          <p>
                            <span>
                              Number of Candidates (Needed for Interview):
                            </span>{" "}
                            {formData.numberOfCandidates}
                          </p>
                        )}
                        {formData.qualificationRequirement && (
                          <p>
                            <span>Qualification Requirement:</span>{" "}
                            {formData.qualificationRequirement}
                          </p>
                        )}
                        {formData.experienceRequirement && (
                          <p>
                            <span>Experience Requirement:</span>{" "}
                            {formData.experienceRequirement}
                          </p>
                        )}
                        {formData.knowledgeSkillRequirement && (
                          <p>
                            <span>Knowledge/Skill Requirement:</span>{" "}
                            {formData.knowledgeSkillRequirement}
                          </p>
                        )}
                        {formData.reasonForRequisition && (
                          <p>
                            <span>Reason for Requisition:</span>{" "}
                            <div
                              dangerouslySetInnerHTML={{
                                __html: formData.reasonForRequisition.replace(
                                  /\n/g,
                                  "<br/>"
                                ),
                              }}
                            />
                          </p>
                        )}
                      </div>

                      <div className="preview-section aadda-poa">
                        <h3>Job Description</h3>
                        <p>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: formData.jobDescription.replace(
                                /\n/g,
                                "<br/>"
                              ),
                            }}
                          />
                        </p>
                      </div>

                      <div className="preview-section">
                        <h3>Responsibilities</h3>
                        {responsibilities.length > 0 && (
                          <ul>
                            {responsibilities
                              .filter((resp) => resp.trim())
                              .map((resp, i) => (
                                <li key={i}>{resp}</li>
                              ))}
                          </ul>
                        )}
                      </div>

                      <div className="preview-section">
                        <h3>Application Details</h3>
                        <p>
                          <span>Deadline for Applications:</span>{" "}
                          {deadlineDate
                            ? formatDisplayDate(deadlineDate)
                            : "Not specified"}
                        </p>
                        <p>
                          <span>Start Date:</span>{" "}
                          {startDate
                            ? formatDisplayDate(startDate)
                            : "Not specified"}
                        </p>
                      </div>

                      <div className="preview-section">
                        <h3>Documents Required</h3>
                        <ul>
                          {documents.length > 0 ? (
                            documents.map((doc, i) => <li key={i}>{doc}</li>)
                          ) : (
                            <li>No documents specified</li>
                          )}
                        </ul>
                      </div>

                      <div className="preview-section">
                        <h3>Compliance Checklist</h3>
                        <ul>
                          {checkedItems.length > 0 ? (
                            checkedItems.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))
                          ) : (
                            <li>No compliance items specified</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </>
        )}
      </motion.div>

      {showDeleteModal && (
        <Modal
          title="Delete Job Advert"
          message="Are you sure you want to delete this job advert? This will clear all entered data."
          onConfirm={confirmDeleteAdvert}
          onCancel={cancelDeleteAdvert}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}

      {alertModal && (
        <AlertModal
          title={alertModal.title}
          message={alertModal.message}
          onClose={closeAlert}
        />
      )}

      <style>
        {`
          .file-input-with-preview {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .banner-preview-image {
            max-width: 100%;
            max-height: 150px;
            border-radius: 4px;
            border: 1px solid #e2e8f0;
          }
          
          .change-file-button {
            padding: 8px 12px;
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s;
          }
          
          .change-file-button:hover {
            background-color: #edf2f7;
          }
        `}
      </style>
    </div>
  );
};

export default VewRequisition;

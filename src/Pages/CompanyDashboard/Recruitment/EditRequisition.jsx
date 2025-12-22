import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion, AnimatePresence } from 'framer-motion';
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
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { fetchRequisition, updateRequisition, deleteRequisition, updateRequisitionStatus, togglePublishRequisition } from './ApiService';

// Date formatting function
const formatDisplayDate = (dateString) => {
  if (!dateString) return 'Not specified';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Get initials from user data
const getInitials = (user) => {
  if (!user || typeof user !== 'object') return 'N/A';
  if (user.first_name && user.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  }
  if (user.email) {
    return user.email.slice(0, 2).toUpperCase();
  }
  return 'N/A';
};

// Get full name from user data
const getFullName = (user) => {
  if (!user || typeof user !== 'object') return 'Unknown';
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user.email || 'Unknown';
};

const getPosition = (user) => {
  if (!user || typeof user !== 'object') return 'Unknown';
  if (user.job_role) {
    return `${user.job_role}`;
  }
  return 'staff';
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
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: 25,
    scale: 0.95,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

// Modal component
const Modal = ({ title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) => (
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
const AlertModal = ({ title, message, onClose }) => (
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
    >
      <h3 className="mb-4 text-lg font-semibold text-center">{title}</h3>
      <p className="mb-6 text-center">{message}</p>
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

const EditRequisition = ({ job, onClose, onHideEditRequisition, isFormMutable = true }) => {
  const navigate = useNavigate();

  // Set default dates
  const today = new Date();
  const defaultStartDate = new Date(today);
  defaultStartDate.setMonth(today.getMonth() + 1);

  const [status, setStatus] = useState(job?.status || 'pending');
  const [publishStatus, setPublishStatus] = useState(job?.publish_status || false);
  const [deadlineDate, setDeadlineDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [activeSection, setActiveSection] = useState(0);
  const [errors, setErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [alertModal, setAlertModal] = useState(null);
  const [showSuccess, setShowSuccess] = useState(null);
  const [advertBanner, setAdvertBanner] = useState(null);
  const [advertBannerFile, setAdvertBannerFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingPublish, setIsTogglingPublish] = useState(false);
  const [responsibilities, setResponsibilities] = useState([]);
  const [checkedItems, setCheckedItems] = useState(['Right to Work Check']);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documents, setDocuments] = useState(['Resume']);
  const [requisitionData, setRequisitionData] = useState(job || { requested_by: null });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Custom compliance document states
  const [showAddComplianceInput, setShowAddComplianceInput] = useState(false);
  const [newComplianceDoc, setNewComplianceDoc] = useState('');
  const [complianceDocError, setComplianceDocError] = useState('');
  const [customComplianceItems, setCustomComplianceItems] = useState([]);
  
  // Editing state for compliance documents
  const [editingComplianceItem, setEditingComplianceItem] = useState(null);
  const [editingComplianceText, setEditingComplianceText] = useState('');

  // Animation variants for compliance input
  const inputSectionVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { 
      height: "auto", 
      opacity: 1, 
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      } 
    },
    exit: { 
      height: 0, 
      opacity: 0, 
      transition: { 
        duration: 0.3,
        ease: "easeIn"
      } 
    }
  };

  // Form data with defaults
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    jobType: 'Full-time',
    locationType: 'On-site',
    companyAddress: '',
    job_location: '',
    salaryRange: '',
    jobDescription: '',
    numberOfCandidates: '',
    qualificationRequirement: '',
    experienceRequirement: '',
    knowledgeSkillRequirement: '',
    reason: '',
  });

  // Default compliance items
  const checklistItems = [
    'Passport / Driver’s Licence',
    'Shared Code or Date of Birth',
    'DBS (Background Check)',
    'Training Certificate',
    'Proof of Address',
    'Right to Work Check',
    'References (Links to previous jobs/projects)',
  ];
  
  // Custom items appear FIRST in the list
  const allComplianceItems = [...customComplianceItems, ...checklistItems];

  // Fetch requisition data if job.id exists
  useEffect(() => {
    if (job?.id) {
      const fetchRequisitionData = async () => {
        try {
          const data = await fetchRequisition(job.id);
          setRequisitionData({
            ...data,
            requested_by: data.requested_by || null,
          });
          setStatus(data.status || 'pending');
          setPublishStatus(data.publish_status || false);
          setFormData({
            jobTitle: data.title || '',
            companyName: data.company_name || '',
            jobType: data.job_type
              ? {
                  full_time: 'Full-time',
                  part_time: 'Part-time',
                  contract: 'Contract',
                  freelance: 'Freelance',
                  internship: 'Internship',
                }[data.job_type] || 'Full-time'
              : 'Full-time',
            locationType: data.location_type
              ? {
                  on_site: 'On-site',
                  remote: 'Remote',
                  hybrid: 'Hybrid',
                }[data.location_type] || 'On-site'
              : 'On-site',
            companyAddress: data.company_address || '',
            job_location: data.job_location || '',
            salaryRange: data.salary_range || '',
            jobDescription: data.job_description || '',
            numberOfCandidates: data.number_of_candidates || '',
            qualificationRequirement: data.qualification_requirement || '',
            experienceRequirement: data.experience_requirement || '',
            knowledgeSkillRequirement: data.knowledge_requirement || '',
            reason: data.reason || '',
          });
          setDeadlineDate(data.deadline_date ? new Date(data.deadline_date) : null);
          setStartDate(data.start_date ? new Date(data.start_date) : null);
          setResponsibilities(data.responsibilities || []);
          setDocuments(data.documents_required || ['Resume']);
          setCheckedItems(data.compliance_checklist || ['Right to Work Check']);
          setAdvertBanner(`${data.advert_banner}`);
          setHasUnsavedChanges(false);
          
          // Initialize custom compliance items
          const savedCompliance = data.compliance_checklist || [];
          const savedCustomItems = savedCompliance.filter(
            item => !checklistItems.includes(item)
          );
          setCustomComplianceItems(savedCustomItems);
        } catch (error) {
          setAlertModal({
            title: 'Error',
            message: error,
          });
          console.error('Error fetching requisition:', error);
        }
      };
      fetchRequisitionData();
    }
  }, [job?.id]);

  // Detect unsaved changes
  useEffect(() => {
    const isFormDataChanged = () => {
      return (
        formData.jobTitle !== (requisitionData.title || '') ||
        formData.companyName !== (requisitionData.company_name || '') ||
        formData.jobType !==
          (requisitionData.job_type
            ? {
                full_time: 'Full-time',
                part_time: 'Part-time',
                contract: 'Contract',
                freelance: 'Freelance',
                internship: 'Internship',
              }[requisitionData.job_type] || 'Full-time'
            : 'Full-time') ||
        formData.locationType !==
          (requisitionData.location_type
            ? {
                on_site: 'On-site',
                remote: 'Remote',
                hybrid: 'Hybrid',
              }[requisitionData.location_type] || 'On-site'
            : 'On-site') ||
        formData.companyAddress !== (requisitionData.company_address || '') ||
        formData.job_location !== (requisitionData.job_location || '') ||
        formData.salaryRange !== (requisitionData.salary_range || '') ||
        formData.jobDescription !== (requisitionData.job_description || '') ||
        formData.numberOfCandidates !== (requisitionData.number_of_candidates || '') ||
        formData.qualificationRequirement !== (requisitionData.qualification_requirement || '') ||
        formData.experienceRequirement !== (requisitionData.experience_requirement || '') ||
        formData.knowledgeSkillRequirement !== (requisitionData.knowledge_requirement || '') ||
        formData.reason !== (requisitionData.reason || '')
      );
    };

    const isResponsibilitiesChanged = () => {
      const savedResponsibilities = requisitionData.responsibilities || [];
      return (
        responsibilities.length !== savedResponsibilities.length ||
        responsibilities.some((resp, i) => resp !== savedResponsibilities[i])
      );
    };

    const isDocumentsChanged = () => {
      const savedDocuments = requisitionData.documents_required || ['Resume'];
      return (
        documents.length !== savedDocuments.length ||
        documents.some((doc, i) => doc !== savedDocuments[i])
      );
    };

    const isComplianceChanged = () => {
      const savedCompliance = requisitionData.compliance_checklist || ['Right to Work Check'];
      return (
        checkedItems.length !== savedCompliance.length ||
        checkedItems.some((item, i) => item !== savedCompliance[i])
      );
    };

    const isDateChanged = () => {
      const savedDeadline = requisitionData.deadline_date
        ? new Date(requisitionData.deadline_date).toISOString().split('T')[0]
        : null;
      const currentDeadline = deadlineDate ? deadlineDate.toISOString().split('T')[0] : null;
      const savedStart = requisitionData.start_date
        ? new Date(requisitionData.start_date).toISOString().split('T')[0]
        : null;
      const currentStart = startDate ? startDate.toISOString().split('T')[0] : null;
      return savedDeadline !== currentDeadline || savedStart !== currentStart;
    };

    const isBannerChanged = () => {
      return !!advertBannerFile;
    };
    
    const isCustomComplianceChanged = () => {
      const savedCompliance = requisitionData.compliance_checklist || [];
      const savedCustomItems = savedCompliance.filter(
        item => !checklistItems.includes(item)
      );
      return (
        customComplianceItems.length !== savedCustomItems.length ||
        customComplianceItems.some((item, i) => item !== savedCustomItems[i])
      );
    };

    const hasChanges =
      isFormDataChanged() ||
      isResponsibilitiesChanged() ||
      isDocumentsChanged() ||
      isComplianceChanged() ||
      isDateChanged() ||
      isBannerChanged() ||
      isCustomComplianceChanged();

    setHasUnsavedChanges(hasChanges);
  }, [
    formData,
    responsibilities,
    documents,
    checkedItems,
    deadlineDate,
    startDate,
    advertBannerFile,
    requisitionData,
    customComplianceItems
  ]);

  const handleInputChange = (e) => {
    const { name, type, value, files } = e.target;
    if (type === 'file') {
      if (files[0]) {
        setAdvertBanner(URL.createObjectURL(files[0]));
        setAdvertBannerFile(files[0]);
      } else {
        setAdvertBanner(null);
        setAdvertBannerFile(null);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleResponsibilityChange = (index, value) => {
    if (!isFormMutable) return;
    const newResponsibilities = [...responsibilities];
    newResponsibilities[index] = value;
    setResponsibilities(newResponsibilities);
    setErrors((prev) => ({ ...prev, responsibilities: '' }));
  };

  const handleAddResponsibility = () => {
    if (!isFormMutable) return;
    setResponsibilities([...responsibilities, '']);
  };

  const handleRemoveResponsibility = (index) => {
    if (!isFormMutable || index === 0) return;
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  const tabs = ['Job details', 'Document uploads', 'Compliance settings'];

  const validateJobDetails = () => {
    const newErrors = {};
    if (!formData.jobTitle.trim()) newErrors.jobTitle = 'Job Title is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company Name is required';
    if (formData.locationType === 'On-site' && !formData.companyAddress.trim()) {
      newErrors.companyAddress = 'Company Address is required for on-site jobs';
    }
    if (!formData.jobDescription.trim()) newErrors.jobDescription = 'Job Description is required';
    if (responsibilities.length === 0 || responsibilities.every((resp) => !resp.trim())) {
      newErrors.responsibilities = 'At least one responsibility is required';
    }
    if (!deadlineDate) newErrors.deadlineDate = 'Application Deadline is required';
    return newErrors;
  };

  const showAlert = (title, message) => {
    setAlertModal({ title, message });
  };

  const closeAlert = () => {
    setAlertModal(null);
  };

  const handleSaveChanges = async () => {
    if (!isFormMutable) {
      showAlert('Action Restricted', 'Form is not mutable.');
      return;
    }

    const jobDetailsErrors = validateJobDetails();
    if (Object.keys(jobDetailsErrors).length > 0) {
      setErrors(jobDetailsErrors);
      showAlert('Validation Error', 'Please fill in all required fields in Job Details');
      return;
    }

    if (documents.length === 0) {
      setErrors({ documents: 'At least one document title is required' });
      showAlert('Document Error', 'Please add at least one document');
      return;
    }

    if (checkedItems.length === 0) {
      setErrors({ compliance: 'At least one compliance item must be checked' });
      showAlert('Compliance Error', 'Please check at least one compliance item');
      return;
    }

    setIsSaving(true);

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.jobTitle);
    formDataToSend.append('company_name', formData.companyName);
    formDataToSend.append(
      'job_type',
      {
        'Full-time': 'full_time',
        'Part-time': 'part_time',
        Contract: 'contract',
        Freelance: 'freelance',
        Internship: 'internship',
      }[formData.jobType] || 'full_time'
    );
    formDataToSend.append(
      'location_type',
      {
        'On-site': 'on_site',
        Remote: 'remote',
        Hybrid: 'hybrid',
      }[formData.locationType] || 'on_site'
    );
    formDataToSend.append('company_address', formData.companyAddress);
    formDataToSend.append('job_location', formData.job_location);
    formDataToSend.append('salary_range', formData.salaryRange);
    formDataToSend.append('job_description', formData.jobDescription);
    formDataToSend.append('number_of_candidates', formData.numberOfCandidates || '');
    formDataToSend.append('qualification_requirement', formData.qualificationRequirement);
    formDataToSend.append('experience_requirement', formData.experienceRequirement);
    formDataToSend.append('knowledge_requirement', formData.knowledgeSkillRequirement);
    formDataToSend.append('reason', formData.reason);
    formDataToSend.append('deadline_date', deadlineDate ? deadlineDate.toISOString().split('T')[0] : '');
    if (startDate) formDataToSend.append('start_date', startDate.toISOString().split('T')[0]);
    formDataToSend.append('responsibilities', JSON.stringify(responsibilities.filter((r) => r.trim())));
    formDataToSend.append('documents_required', JSON.stringify(documents));
    formDataToSend.append('compliance_checklist', JSON.stringify(checkedItems));
    if (advertBannerFile) formDataToSend.append('advert_banner', advertBannerFile);

    try {
      let response;
      if (job?.id) {
        response = await updateRequisition(job.id, formDataToSend);
      } else {
        response = await createRequisition(formDataToSend);
      }
      setRequisitionData({
        ...response,
        requested_by: response.requested_by || null,
      });
      setPublishStatus(response.publish_status);
      setIsSaving(false);
      setHasUnsavedChanges(false);
      setShowSuccess({ type: 'save', message: 'Changes saved successfully!' });
      return response;
    } catch (error) {
      setIsSaving(false);
      showAlert('Error', error);
      console.error('Error saving requisition:', error);
      throw error;
    }
  };

  const handleTogglePublish = async () => {
    if (!isFormMutable) {
      showAlert('Action Restricted', 'Form is not mutable.');
      return;
    }

    if (!job?.id) {
      showAlert('Error', 'Please save the job before publishing.');
      return;
    }

    const jobDetailsErrors = validateJobDetails();
    if (Object.keys(jobDetailsErrors).length > 0) {
      setErrors(jobDetailsErrors);
      showAlert('Validation Error', 'Please fill in all required fields in Job Details');
      return;
    }

    if (documents.length === 0) {
      setErrors({ documents: 'At least one document title is required' });
      showAlert('Document Error', 'Please add at least one document');
      return;
    }

    if (checkedItems.length === 0) {
      setErrors({ compliance: 'At least one compliance item must be checked' });
      showAlert('Compliance Error', 'Please check at least one compliance item');
      return;
    }

    setIsTogglingPublish(true);

    try {
      await handleSaveChanges();
      const newPublishStatus = !publishStatus;
      const response = await togglePublishRequisition(job.id, newPublishStatus);
      setPublishStatus(newPublishStatus);
      setRequisitionData({
        ...response,
        requested_by: response.requested_by || null,
      });
      setIsTogglingPublish(false);
      setShowSuccess({
        type: 'publish',
        message: newPublishStatus ? 'Job published successfully!' : 'Job unpublished successfully!',
      });
    } catch (error) {
      setIsTogglingPublish(false);
      showAlert('Error', typeof error === 'object' ? JSON.stringify(error) : error);
      console.error('Error toggling publish status:', error);
    }
  };

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(null);
        if (showSuccess.type === 'save' || showSuccess.type === 'publish') {
          navigate('/company/recruitment/job-adverts');
          onHideEditRequisition();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, navigate, onHideEditRequisition]);

  const handleNext = () => {
    if (!isFormMutable) {
      showAlert('Action Restricted', 'Form is not mutable.');
      return;
    }

    if (activeSection === 0) {
      const jobDetailsErrors = validateJobDetails();
      if (Object.keys(jobDetailsErrors).length > 0) {
        setErrors(jobDetailsErrors);
        showAlert('Validation Error', 'Please fill in all required fields in Job Details');
        return;
      }
    } else if (activeSection === 1) {
      if (documents.length === 0) {
        setErrors({ documents: 'At least one document title is required' });
        showAlert('Document Error', 'Please add at least one document');
        return;
      }
    } else if (activeSection === 2) {
      if (checkedItems.length === 0) {
        setErrors({ compliance: 'At least one compliance item must be checked' });
        showAlert('Compliance Error', 'Please check at least one compliance item');
        return;
      }
    }

    if (activeSection < tabs.length - 1) {
      setActiveSection(activeSection + 1);
      setErrors({});
    }
  };

  const handlePrev = () => {
    if (!isFormMutable) return;
    if (activeSection > 0) {
      setActiveSection(activeSection - 1);
      setErrors({});
    }
  };

  const handleTabClick = (index) => {
    if (!isFormMutable) {
      showAlert('Action Restricted', 'Form is not mutable.');
      return;
    }

    if (index > activeSection) {
      if (activeSection === 0) {
        const jobDetailsErrors = validateJobDetails();
        if (Object.keys(jobDetailsErrors).length > 0) {
          setErrors(jobDetailsErrors);
          showAlert('Validation Error', 'Please fill in all required fields in Job Details');
          return;
        }
      } else if (activeSection === 1 && documents.length === 0) {
        setErrors({ documents: 'At least one document title is required' });
        showAlert('Document Error', 'Please add at least one document title');
        return;
      } else if (activeSection === 2 && checkedItems.length === 0) {
        setErrors({ compliance: 'At least one compliance item must be checked' });
        showAlert('Compliance Error', 'Please check at least one compliance item');
        return;
      }
    }
    setActiveSection(index);
    setErrors({});
  };

  const handleAccept = async () => {
    try {
      const response = await updateRequisitionStatus(job.id, 'open');
      setStatus('open');
      setRequisitionData((prev) => ({
        ...prev,
        status: 'open',
        requested_by: prev.requested_by || null,
      }));
    } catch (error) {
      showAlert('Error', error);
      console.error('Error accepting requisition:', error);
    }
  };

  const handleReject = async () => {
    try {
      const response = await updateRequisitionStatus(job.id, 'rejected');
      setStatus('rejected');
      setRequisitionData((prev) => ({
        ...prev,
        status: 'rejected',
        requested_by: prev.requested_by || null,
      }));
    } catch (error) {
      showAlert('Error', error);
      console.error('Error rejecting requisition:', error);
    }
  };

  const handleEditStatus = () => {
    setStatus(null);
  };

  const handleDeleteAdvert = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAdvert = async () => {
    if (job?.id) {
      try {
        await deleteRequisition(job.id);
        setShowDeleteModal(false);
        setShowSuccess({ type: 'delete', message: 'Job deleted successfully!' });
      } catch (error) {
        setShowDeleteModal(false);
        showAlert('Error', error);
        console.error('Error deleting requisition:', error);
      }
    } else {
      setFormData({
        jobTitle: '',
        companyName: '',
        jobType: 'Full-time',
        locationType: 'On-site',
        job_location: '',
        companyAddress: '',
        salaryRange: '',
        jobDescription: '',
        numberOfCandidates: '',
        qualificationRequirement: '',
        experienceRequirement: '',
        knowledgeSkillRequirement: '',
        reason: '',
      });
      setDeadlineDate(null);
      setStartDate(null);
      setAdvertBanner(null);
      setAdvertBannerFile(null);
      setDocuments(['Resume']);
      setDocumentTitle('');
      setCheckedItems(['Right to Work Check']);
      setResponsibilities([]);
      setActiveSection(0);
      setErrors({});
      setShowDeleteModal(false);
      setHasUnsavedChanges(false);
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
    setErrors((prev) => ({ ...prev, compliance: '' }));
  };

  const handleAddDocument = () => {
    if (!isFormMutable) return;
    const trimmed = documentTitle.trim();
    if (trimmed && !documents.includes(trimmed)) {
      setDocuments((prev) => [...prev, trimmed]);
      setDocumentTitle('');
      setErrors((prev) => ({ ...prev, documents: '' }));
    } else if (!trimmed) {
      setErrors((prev) => ({ ...prev, documents: 'Document title cannot be empty' }));
    } else {
      setErrors((prev) => ({ ...prev, documents: 'Document title already exists' }));
    }
  };

  const handleRemoveDocument = (titleToRemove) => {
    if (!isFormMutable) return;
    setDocuments((prev) => prev.filter((doc) => doc !== titleToRemove));
  };
  
  // Custom compliance document handlers
  const handleAddComplianceDocument = () => {
    const trimmed = newComplianceDoc.trim();
    
    if (!trimmed) {
      setComplianceDocError('Document title cannot be empty');
      return;
    }
    
    if (allComplianceItems.includes(trimmed)) {
      setComplianceDocError('This document already exists');
      return;
    }
    
    setCustomComplianceItems(prev => [...prev, trimmed]);
    setNewComplianceDoc('');
    setComplianceDocError('');
    setShowAddComplianceInput(false);
  };

  const handleRemoveComplianceDocument = (doc) => {
    setCustomComplianceItems(prev => prev.filter(item => item !== doc));
    
    // Also remove from checked items if it was checked
    if (checkedItems.includes(doc)) {
      setCheckedItems(prev => prev.filter(item => item !== doc));
    }
  };
  
  // Handle edit compliance document
  const handleEditComplianceDocument = (item) => {
    setEditingComplianceItem(item);
    setEditingComplianceText(item);
    setShowAddComplianceInput(true);
  };

  // Handle update compliance document
  const handleUpdateComplianceDocument = () => {
    const trimmed = editingComplianceText.trim();
    
    if (!trimmed) {
      setComplianceDocError('Document title cannot be empty');
      return;
    }
    
    if (allComplianceItems.includes(trimmed) && trimmed !== editingComplianceItem) {
      setComplianceDocError('This document already exists');
      return;
    }
    
    // Update the custom compliance item
    const updatedItems = customComplianceItems.map(item => 
      item === editingComplianceItem ? trimmed : item
    );
    
    setCustomComplianceItems(updatedItems);
    
    // Update checked items if needed
    if (checkedItems.includes(editingComplianceItem)) {
      const updatedCheckedItems = checkedItems.map(item => 
        item === editingComplianceItem ? trimmed : item
      );
      setCheckedItems(updatedCheckedItems);
    }
    
    // Reset editing state
    setEditingComplianceItem(null);
    setEditingComplianceText('');
    setShowAddComplianceInput(false);
    setComplianceDocError('');
  };

  // Cancel edit compliance
  const cancelEditCompliance = () => {
    setEditingComplianceItem(null);
    setEditingComplianceText('');
    setShowAddComplianceInput(false);
    setComplianceDocError('');
  };

  const hasAdvertData = () => {
    return (
      formData.jobTitle.trim() &&
      formData.companyName.trim() &&
      (formData.locationType !== 'On-site' || formData.companyAddress.trim()) &&
      formData.jobDescription.trim() &&
      responsibilities.length > 0 &&
      deadlineDate
    );
  };

  const tabVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
  };

  return (
    <div className='VewRequisition'>
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="success-alert"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'fixed',
              top: 10,
              backgroundColor: '#38a169',
              color: 'white',
              padding: '10px 20px',
              fontSize: '12px',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 9999,
            }}
          >
            {showSuccess.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className='VewRequisition-Bodddy' onClick={onHideEditRequisition}></div>
      <button className='VewRequisition-btn' onClick={onHideEditRequisition}>
        <XMarkIcon />
      </button>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className='VewRequisition-Main'
      >
        <div className='VewRequisition-Part'>
          <div className='VewRequisition-Part-Top'>
            <h3>Job Request</h3>
          </div>

          <div className='ssen-regs'>
            <div className='ssen-regs-1'>
              <span>{getInitials(requisitionData.requested_by)}</span>
            </div>
            <div className='ssen-regs-2'>
              <div>
                <h4>{getFullName(requisitionData.requested_by)}</h4>
                <p>{getPosition(requisitionData.requested_by)}</p>
              </div>
            </div>
          </div>
          <motion.div
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className='oola-Toa'>
              <h3>Request ID : {requisitionData.id || 'N/A'}</h3>
              <span>{formatDisplayDate(requisitionData.requested_date)}</span>
            </div>

            <div className='oluj-Seccco'>
              <div className='oluj-Seccco-Main custom-scroll-bar'>
                {status && (
                  <div className='polau-se'>
                    <div className='status-container' style={{ display: 'flex', alignItems: 'center' }}>
                      <p className={status.toLowerCase()}>
                        <span>Status:</span> {status.charAt(0).toUpperCase() + status.slice(1)}
                      </p>
                      {status === 'open' ? (
                        <svg
                          width='16'
                          height='16'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='#7226FF'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          style={{ marginLeft: '6px' }}
                        >
                          <path d='M20 6L9 17l-5-5' />
                        </svg>
                      ) : (
                        <svg
                          width='16'
                          height='16'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='#991b1b'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          style={{ marginLeft: '6px' }}
                        >
                          <line x1='18' y1='6' x2='6' y2='18' />
                          <line x1='6' y1='6' x2='18' y2='18' />
                        </svg>
                      )}
                      <button className='edit-status-btn' onClick={handleEditStatus}>
                        <PencilIcon className='w-4 h-4' />
                        Edit
                      </button>
                    </div>
                  </div>
                )}
                <div className='polau-se'>
                  <h4>Publish Status</h4>
                  <p className={publishStatus ? 'open' : 'closed'}>
                    <span>{publishStatus ? 'Published' : 'Unpublished'}</span>
                  </p>
                </div>
                <div className='polau-se'>
                  <h4>Reason</h4>
                  <p>{requisitionData.reason || 'No reason provided.'}</p>
                </div>
              </div>

              {!status && (
                <div className='Desaa-Btns'>
                  <button className='accept-Btn' onClick={handleAccept}>
                    <CheckIcon /> Accept
                  </button>
                  <button className='reject-Btn' onClick={handleReject}>
                    <XMarkIcon /> Reject
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <div className='VewRequisition-Part'>
          <div className='VewRequisition-Part-Top'>
            <h3>
              Job Advert Drafting {hasUnsavedChanges && <span className="text-red-600 ml-2">* Unsaved Changes</span>}
            </h3>
          </div>
          <div className='ssol-Subam'>
            {tabs.map((tab, index) => (
              <span
                key={index}
                className={index === activeSection ? 'active-ssol-Subam' : ''}
                onClick={() => handleTabClick(index)}
              >
                {tab}
              </span>
            ))}
          </div>

          <div className='GHuh-Form-Sec'>
            <div className='GHuh-Form-Sec-Top'>
              <h3>{tabs[activeSection]}</h3>
              <div className='GHuh-Form-Sec-Top-Btns'>
                <span
                  onClick={handlePrev}
                  style={{
                    cursor: activeSection > 0 && isFormMutable ? 'pointer' : 'not-allowed',
                    opacity: activeSection > 0 && isFormMutable ? 1 : 0.5,
                  }}
                >
                  <ArrowLeftIcon /> Prev
                </span>
                <span
                  onClick={handleNext}
                  style={{
                    cursor: activeSection < tabs.length && isFormMutable ? 'pointer' : 'not-allowed',
                    opacity: activeSection < tabs.length && isFormMutable ? 1 : 0.5,
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

            <div className='GHuh-Form-Sec-Main custom-scroll-bar'>
              <AnimatePresence mode='wait'>
                <motion.div
                  key={activeSection}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={tabVariants}
                  className='w-full'
                >
                  {activeSection === 0 && (
                    <>
                      <h3>Basic Job Information</h3>

                      <div className='Gland-All-Grid'>
                        <div className='GHuh-Form-Input'>
                          <label>Job Title</label>
                          <input
                            name="jobTitle"
                            type='text'
                            placeholder='e.g. Frontend Developer'
                            value={formData.jobTitle}
                            onChange={handleInputChange}
                            required
                            disabled={!isFormMutable}
                          />
                          {errors.jobTitle && <p className='error'>{errors.jobTitle}</p>}
                        </div>

                        <div className='GHuh-Form-Input'>
                          <label>Advert Banner (optional)</label>
                          <input
                            type='file'
                            accept="image/*"
                            onChange={handleInputChange}
                            disabled={!isFormMutable}
                          />
                        </div>
                      </div>

                      <div className='GHuh-Form-Input'>
                        <label>Company Name</label>
                        <input
                          name="companyName"
                          type='text'
                          placeholder='e.g. ValueFlowTech Ltd'
                          value={formData.companyName}
                          onChange={handleInputChange}
                          required
                          disabled={!isFormMutable}
                        />
                        {errors.companyName && <p className='error'>{errors.companyName}</p>}
                      </div>

                      <div className='Gland-All-Grid'>
                        <div className='GHuh-Form-Input'>
                          <label>Job Type</label>
                          <select
                            name="jobType"
                            value={formData.jobType}
                            onChange={handleInputChange}
                            disabled={!isFormMutable}
                          >
                            <option>Full-time</option>
                            <option>Part-time</option>
                            <option>Contract</option>
                            <option>Freelance</option>
                            <option>Internship</option>
                          </select>
                        </div>
                        <div className='GHuh-Form-Input'>
                          <label>Location</label>
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

                      {formData.locationType === 'On-site' && (
                        <div className='GHuh-Form-Input'>
                          <label>Company Address</label>
                          <input
                            name="companyAddress"
                            type='text'
                            placeholder='e.g. 24 Marina Street, Lagos'
                            value={formData.companyAddress}
                            onChange={handleInputChange}
                            required
                            disabled={!isFormMutable}
                          />
                          {errors.companyAddress && <p className='error'>{errors.companyAddress}</p>}
                        </div>
                      )}

                      <div className='GHuh-Form-Input'>
                        <label>Salary Range (optional)</label>
                        <input
                          name="salaryRange"
                          type='text'
                          placeholder='e.g. $0.00 - $0.00'
                          value={formData.salaryRange}
                          onChange={handleInputChange}
                          disabled={!isFormMutable}
                        />
                      </div>

                      <div className='GHuh-Form-Input'>
                        <label>Number of Candidates (optional)</label>
                        <input
                          name="numberOfCandidates"
                          type='text'
                          placeholder='e.g. 10'
                          value={formData.numberOfCandidates}
                          onChange={handleInputChange}
                          disabled={!isFormMutable}
                        />
                        {errors.numberOfCandidates && <p className='error'>{errors.numberOfCandidates}</p>}
                      </div>

                      <div className='GHuh-Form-Input'>
                        <label>Qualification Requirement (optional)</label>
                        <input
                          name="qualificationRequirement"
                          type='text'
                          placeholder='e.g. Bachelor’s degree in Computer Science'
                          value={formData.qualificationRequirement}
                          onChange={handleInputChange}
                          disabled={!isFormMutable}
                        />
                        {errors.qualificationRequirement && <p className='error'>{errors.qualificationRequirement}</p>}
                      </div>

                      <div className='GHuh-Form-Input'>
                        <label>Experience Requirement (optional)</label>
                        <input
                          name="experienceRequirement"
                          type='text'
                          placeholder='e.g. 3+ years in web development'
                          value={formData.experienceRequirement}
                          onChange={handleInputChange}
                          disabled={!isFormMutable}
                        />
                        {errors.experienceRequirement && <p className='error'>{errors.experienceRequirement}</p>}
                      </div>

                      <div className='GHuh-Form-Input'>
                        <label>Knowledge/Skill Requirement (optional)</label>
                        <input
                          name="knowledgeSkillRequirement"
                          type='text'
                          placeholder='e.g. React, JavaScript, CSS'
                          value={formData.knowledgeSkillRequirement}
                          onChange={handleInputChange}
                          disabled={!isFormMutable}
                        />
                        {errors.knowledgeSkillRequirement && <p className='error'>{errors.knowledgeSkillRequirement}</p>}
                      </div>

                      <div className='GHuh-Form-Input'>
                        <label>Reason for Requisition (optional)</label>
                        <textarea
                          name="reason"
                          placeholder='e.g. Expansion of the development team'
                          value={formData.reason}
                          onChange={handleInputChange}
                          disabled={!isFormMutable}
                        ></textarea>
                        {errors.reason && <p className='error'>{errors.reason}</p>}
                      </div>

                      <h3>Job Description</h3>
                      <div className='GHuh-Form-Input'>
                        <textarea
                          name="jobDescription"
                          placeholder='Enter job responsibilities, requirements, etc.'
                          value={formData.jobDescription}
                          onChange={handleInputChange}
                          required
                          disabled={!isFormMutable}
                        ></textarea>
                        {errors.jobDescription && <p className='error'>{errors.jobDescription}</p>}
                      </div>

                      <h3>
                        Key Responsibilities{' '}
                        <span
                          onClick={handleAddResponsibility}
                          className={isFormMutable ? 'cursor-pointer' : 'cursor-not-allowed'}
                        >
                          <PlusIcon /> Add
                        </span>
                      </h3>
                      <div className='GHuh-Form-Input'>
                        <label>Responsibilities</label>
                        {responsibilities.map((resp, index) => (
                          <div
                            key={index}
                            className='responsibility-Inn-Box'
                            style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}
                          >
                            <input
                              type='text'
                              placeholder='Add a responsibility'
                              value={resp}
                              onChange={(e) => handleResponsibilityChange(index, e.target.value)}
                              disabled={!isFormMutable}
                            />
                            {index > 0 && (
                              <span
                                onClick={() => handleRemoveResponsibility(index)}
                                style={{
                                  cursor: isFormMutable ? 'pointer' : 'not-allowed',
                                  marginLeft: '8px',
                                }}
                              >
                                <XMarkIcon className='w-4 h-4' />
                              </span>
                            )}
                          </div>
                        ))}
                        {errors.responsibilities && <p className='error'>{errors.responsibilities}</p>}
                      </div>

                      <h3>Application Details</h3>
                      <div className='Gland-All-Grid'>
                        <div className='GHuh-Form-Input'>
                          <label>Deadline for Applications</label>
                          <DatePicker
                            selected={deadlineDate}
                            onChange={(date) => {
                              if (!isFormMutable) return;
                              setDeadlineDate(date);
                              setErrors((prev) => ({ ...prev, deadlineDate: '' }));
                            }}
                            placeholderText="yyyy-MM-dd"
                            dateFormat="yyyy-MM-dd"
                            className="custom-datepicker-input"
                            required
                            disabled={!isFormMutable}
                          />
                          {errors.deadlineDate && <p className='error'>{errors.deadlineDate}</p>}
                        </div>

                        <div className='GHuh-Form-Input'>
                          <label>Start Date (optional)</label>
                          <DatePicker
                            selected={startDate}
                            onChange={(date) => {
                              if (!isFormMutable) return;
                              setStartDate(date);
                              setErrors((prev) => ({ ...prev, startDate: '' }));
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
                      <div className='GHuh-Form-Input'>
                        <label>Title</label>
                        <div className='ooi-flex'>
                          <input
                            type='text'
                            placeholder='Enter Document Title'
                            value={documentTitle}
                            onChange={(e) => setDocumentTitle(e.target.value)}
                            required
                            disabled={!isFormMutable}
                          />
                          <span
                            onClick={handleAddDocument}
                            style={{
                              cursor: isFormMutable ? 'pointer' : 'not-allowed',
                              opacity: isFormMutable ? 1 : 0.5,
                            }}
                          >
                            <PlusIcon className='w-5 h-5' />
                            Add Document
                          </span>
                        </div>
                        {errors.documents && <p className='error'>{errors.documents}</p>}
                        <ul className='apooul-Ul'>
                          {documents.map((doc, index) => (
                            <li key={index} className='flex justify-between items-center'>
                              <p>
                                <MinusIcon className='w-4 h-4 inline-block mr-2' /> {doc}
                              </p>
                              <button
                                onClick={() => handleRemoveDocument(doc)}
                                className='text-red-600 hover:text-red-800'
                                disabled={!isFormMutable}
                              >
                                <XMarkIcon className='w-4 h-4' />
                              </button>
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
                          className='cursor-pointer'
                          title={editingComplianceItem ? 'Update compliance document' : 'Add more compliance document'}
                          onClick={() => {
                            if (editingComplianceItem) return;
                            setShowAddComplianceInput(!showAddComplianceInput);
                            setEditingComplianceItem(null);
                            setEditingComplianceText('');
                          }}
                        >
                          <PlusIcon className='w-5 h-5' />
                          {showAddComplianceInput && !editingComplianceItem ? ' Close' : ' Add'}
                        </span>
                      </h3>
                      
                      <AnimatePresence>
                        {showAddComplianceInput && (
                          <motion.div
                            variants={inputSectionVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="overflow-hidden"
                          >
                            <div className='GHuh-Form-Input'>
                              <label>
                                {editingComplianceItem 
                                  ? "Edit compliance document" 
                                  : "Add more compliance document"}
                              </label>
                              <div className='ooi-flex'>
                                <input
                                  type='text'
                                  placeholder='Enter Document Title'
                                  value={editingComplianceItem ? editingComplianceText : newComplianceDoc}
                                  onChange={(e) => {
                                    if (editingComplianceItem) {
                                      setEditingComplianceText(e.target.value);
                                    } else {
                                      setNewComplianceDoc(e.target.value);
                                    }
                                    // Clear error when user starts typing
                                    if (complianceDocError && e.target.value.trim()) {
                                      setComplianceDocError('');
                                    }
                                  }}
                                  required
                                  disabled={!isFormMutable}
                                />
                                {editingComplianceItem ? (
                                  <div className='Edilol-OLka'>
                                    <span
                                      className='cursor-pointer btn-primary-bg'
                                      onClick={handleUpdateComplianceDocument}
                                    >
                                      Update
                                    </span>
                                    <span
                                      className='cursor-pointer bg-gray-300 px-3 py-1 rounded'
                                      onClick={cancelEditCompliance}
                                    >
                                      Cancel
                                    </span>
                                  </div>
                                ) : (
                                  <span
                                    className='cursor-pointer btn-primary-bg'
                                    onClick={handleAddComplianceDocument}
                                  >
                                    <PlusIcon className='w-5 h-5' />
                                    Add
                                  </span>
                                )}
                              </div>
                              {complianceDocError && <p className='error'>{complianceDocError}</p>}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className='GHuh-Form-Input'>
                        <ul className='checcck-lissT'>
                          {allComplianceItems.map((item, index) => {
                            const isCustom = customComplianceItems.includes(item);
                            const isChecked = checkedItems.includes(item);
                            
                            return (
                              <li
                                key={index}
                                className={
                                  isCustom 
                                    ? `added-COmpll-list ${isChecked ? 'custom-active' : ''}`
                                    : (isChecked ? 'active-Li-Check' : '')
                                }
                                onClick={() => toggleChecklistItem(item)}
                                style={{
                                  cursor: isFormMutable ? 'pointer' : 'not-allowed',
                                  opacity: isFormMutable ? 1 : 0.5,
                                }}
                              >
                                <p>{item}</p>
                                
                                {isCustom && (
                                  <div className="GHll-POl-Dec">
                                    <button
                                      className="edit-compliance-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditComplianceDocument(item);
                                      }}
                                      disabled={!isFormMutable}
                                    >
                                      <PencilIcon /> Edit
                                    </button>
                                    <button
                                      className="remove-compliance-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveComplianceDocument(item);
                                      }}
                                      disabled={!isFormMutable}
                                    >
                                      <XMarkIcon className='w-4 h-4' />
                                    </button>
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                        {errors.compliance && <p className='error'>{errors.compliance}</p>}
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className='VewRequisition-Part active-preview'>
          <div className='VewRequisition-Part-Top'>
            <h3>Job Advert</h3>
          </div>

          <div className='job-preview-container'>
            <div className='preview-buttons'>
              <button
                className='publish-btn btn-primary-bg'
                onClick={handleSaveChanges}
                disabled={isSaving || !isFormMutable}
              >
                {isSaving ? (
                  <>
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: '50%',
                        border: '3px solid #fff',
                        borderTopColor: 'transparent',
                        marginRight: '5px',
                        display: 'inline-block',
                      }}
                    />
                    Saving Changes...
                  </>
                ) : (
                  `Save Changes${hasUnsavedChanges ? ' *' : ''}`
                )}
              </button>
              <button
                className='publish-toggle-btn'
                onClick={handleTogglePublish}
                disabled={isTogglingPublish || !isFormMutable}
              >
                {isTogglingPublish ? (
                  <>
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: '50%',
                        border: '3px solid #fff',
                        borderTopColor: 'transparent',
                        marginRight: '5px',
                        display: 'inline-block',
                      }}
                    />
                    {publishStatus ? 'Saving and Unpublishing...' : 'Saving and Publishing...'}
                  </>
                ) : (
                  <>
                    <GlobeAltIcon className='w-5 h-5 inline-block mr-2' />
                    {publishStatus ? 'Unpublish' : 'Publish'}
                  </>
                )}
              </button>
              <button
                className='delete-btn'
                onClick={handleDeleteAdvert}
                disabled={!isFormMutable}
              >
                <TrashIcon className='w-5 h-5' /> Delete
              </button>
            </div>

            <div className='main-Prevs-Sec custom-scroll-bar'>
              {advertBanner && (
                <div className='advert-banner'>
                  <img
                    src={advertBanner}
                    alt="Job Advert Banner"
                    className='w-full h-auto object-cover rounded-md mb-4'
                  />
                  <span>
                    <InformationCircleIcon /> Advert Banner
                  </span>
                </div>
              )}

              <div className='preview-section-All'>
                <div className='preview-section'>
                  <h3>Basic Job Information</h3>
                  <p>
                    <span>Job Title:</span> {formData.jobTitle || 'Not specified'}
                  </p>
                  <p>
                    <span>Company Name:</span> {formData.companyName || 'Not specified'}
                  </p>
                  <p>
                    <span>Job Type:</span> {formData.jobType || 'Not specified'}
                  </p>
                  <p>
                    <span>Location:</span> {formData.locationType || 'Not specified'}
                  </p>
                  {formData.companyAddress && (
                    <p>
                      <span>Company Address:</span> {formData.companyAddress}
                    </p>
                  )}
                  {formData.salaryRange && (
                    <p>
                      <span>Salary Range:</span> {formData.salaryRange}
                    </p>
                  )}
                  {formData.numberOfCandidates && (
                    <p>
                      <span>Number of Candidates:</span> {formData.numberOfCandidates}
                    </p>
                  )}
                  {formData.qualificationRequirement && (
                    <p>
                      <span>Qualification Requirement:</span> {formData.qualificationRequirement}
                    </p>
                  )}
                  {formData.experienceRequirement && (
                    <p>
                      <span>Experience Requirement:</span> {formData.experienceRequirement}
                    </p>
                  )}
                  {formData.knowledgeSkillRequirement && (
                    <p>
                      <span>Knowledge/Skill Requirement:</span> {formData.knowledgeSkillRequirement}
                    </p>
                  )}
                  {formData.reason && (
                    <p>
                      <span>Reason for Requisition:</span>{' '}
                      <div
                        dangerouslySetInnerHTML={{
                          __html: formData.reason.replace(/\n/g, '<br/>'),
                        }}
                      />
                    </p>
                  )}
                </div>

                {formData.jobDescription && (
                  <div className='preview-section aadda-poa'>
                    <h3>Job Description</h3>
                    <p>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: formData.jobDescription.replace(/\n/g, '<br/>'),
                        }}
                      />
                    </p>
                  </div>
                )}

                {responsibilities.length > 0 && (
                  <div className='preview-section'>
                    <h3>Responsibilities</h3>
                    <ul>
                      {responsibilities
                        .filter((resp) => resp.trim())
                        .map((resp, i) => (
                          <li key={i}>{resp}</li>
                        ))}
                    </ul>
                  </div>
                )}

                <div className='preview-section'>
                  <h3>Application Details</h3>
                  <p>
                    <span>Deadline for Applications:</span>{' '}
                    {deadlineDate ? formatDisplayDate(deadlineDate) : 'Not specified'}
                  </p>
                  <p>
                    <span>Start Date:</span>{' '}
                    {startDate ? formatDisplayDate(startDate) : 'Not specified'}
                  </p>
                </div>

                <div className='preview-section'>
                  <h3>Documents Required</h3>
                  <ul>
                    {documents.length > 0 ? (
                      documents.map((doc, i) => <li key={i}>{doc}</li>)
                    ) : (
                      <li>No documents specified</li>
                    )}
                  </ul>
                </div>

                <div className='preview-section'>
                  <h3>Compliance Checklist</h3>
                  <ul>
                    {checkedItems.length > 0 ? (
                      checkedItems.map((item, i) => <li key={i}>{item}</li>)
                    ) : (
                      <li>No compliance items specified</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
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
        <AlertModal title={alertModal.title} message={alertModal.message} onClose={closeAlert} />
      )}
    </div>
  );
};

export default EditRequisition;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PencilIcon,
  XMarkIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import AdvertBanner from '../../../assets/Img/Advert-Banner.jpg';
import { fetchRequisition } from './ApiService';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h3>Error Displaying Job Details</h3>
          <p>{this.state.errorMessage || 'Something went wrong. Please try again later.'}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// AlertModal component
const AlertModal = ({ title, message, onClose }) => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 z-40"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      exit={{ opacity: 0 }}
    />
    <motion.div
      className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg"
      initial={{ opacity: 0, scale: 0.75 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.75 }}
      role="alertdialog"
      aria-modal="true"
    >
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      <p className="mb-6">{message}</p>
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          autoFocus
        >
          OK
        </button>
      </div>
    </motion.div>
  </AnimatePresence>
);

const JobDetails = ({ job, onClose, onShowEditRequisition }) => {
  const [jobDetails, setJobDetails] = useState(null);
  const [alertModal, setAlertModal] = useState(null);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not Specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Fetch job details from API
  useEffect(() => {
    if (job?.id) {
      const fetchJobDetails = async () => {
        try {
          const data = await fetchRequisition(job.id);
          setJobDetails(data);
        } catch (error) {
          setAlertModal({
            title: 'Error',
            message: error.message || 'Failed to fetch job details.',
          });
          console.error('Error fetching job details:', error);
        }
      };
      fetchJobDetails();
    }
  }, [job?.id]);

  // Fallback to job prop if jobDetails is not loaded
  const displayJob = jobDetails || job || {};

  // Handle edit button click
  const handleEditClick = () => {
    onShowEditRequisition(displayJob);
  };

  // Close alert modal
  const closeAlert = () => {
    setAlertModal(null);
  };

  // Format job description with line breaks
  const formatDescription = (text) => {
    if (!text) return 'Not Specified';
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));
  };

  return (
    <ErrorBoundary>
      <div className="VewRequisition">
        <div className="VewRequisition-Bodddy" onClick={onClose}></div>
        <button className="VewRequisition-btn" onClick={onClose}>
          <XMarkIcon />
        </button>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="VewRequisition-Main JobDell-gab"
        >
          <div className="VewRequisition-Part">
            <div className="VewRequisition-Part-Top">
              <h3>Job Advert</h3>
              <button className="close-preview-btn" onClick={onClose}>
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="job-preview-container">
              <div className="preview-buttons">
                <div onClick={onClose}>
                  <button className="publish-btn btn-primary-bg" onClick={handleEditClick}>
                    <PencilIcon /> Edit Job Advert
                  </button>
                </div>
              </div>
              <div className="main-Prevs-Sec custom-scroll-bar">
                {displayJob.advert_banner ? (
                  <div className="advert-banner">
                    <img
                      src={`${displayJob.advert_banner}`}
                      alt="Job Advert Banner"
                      className="w-full h-auto object-cover rounded-md mb-4"
                      onError={(e) => (e.target.src = AdvertBanner)}
                    />
                    <span>
                      <InformationCircleIcon /> Advert Banner
                    </span>
                  </div>
                ) : (
                  <div className="advert-banner">
                    <img
                      src={AdvertBanner}
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
                      <span>Job Title:</span> {displayJob.title || 'Not Specified'}
                    </p>
                    <p>
                      <span>Company Name:</span> {displayJob.company || displayJob.company_name || 'Not Specified'}
                    </p>
                    <p>
                      <span>Job Type:</span> {displayJob.jobType || displayJob.job_type || 'Not Specified'}
                    </p>
                    <p>
                      <span>Location:</span> {displayJob.location || displayJob.location_type || 'Not Specified'}
                    </p>
                    <p>
                      <span>Company Address:</span> {displayJob.company_address || 'Not Specified'}
                    </p>
                    <p>
                      <span>Salary Range:</span> {displayJob.salary_range || 'Not Specified'}
                    </p>
                    <p>
                      <span>Qualification Requirement:</span> {displayJob.qualification_requirement || 'Not Specified'}
                    </p>
                    <p>
                      <span>Experience Requirement:</span> {displayJob.experience_requirement || 'Not Specified'}
                    </p>
                    <p>
                      <span>Knowledge/Skill Requirement:</span> {displayJob.knowledge_requirement || 'Not Specified'}
                    </p>
                    <p>
                      <span>Reason for Requisition:</span> {displayJob.reason || 'Not Specified'}
                    </p>
                  </div>

                  <div className="preview-section aadda-poa">
                    <h3>Job Description</h3>
                    <p>{formatDescription(displayJob.job_description)}</p>
                  </div>

                  <div className="preview-section">
                    <h3>Responsibilities</h3>
                    <ul>
                      {displayJob.responsibilities?.length ? (
                        displayJob.responsibilities.map((resp, index) => <li key={index}>{resp}</li>)
                      ) : (
                        <li>No responsibilities specified</li>
                      )}
                    </ul>
                  </div>

                  <div className="preview-section">
                    <h3>Application Details</h3>
                    <p>
                      <span>Deadline for Applications:</span> {formatDate(displayJob.deadline || displayJob.deadline_date)}{' '}
                      <b className={`bB-status status ${displayJob.status?.toLowerCase() || 'open'}`}>
                        {displayJob.status || 'Open'}
                      </b>
                    </p>
                    <p>
                      <span>Start Date:</span> {formatDate(displayJob.start_date)}
                    </p>
                  </div>

                  <div className="preview-section">
                    <h3>Documents Required</h3>
                    <ul>
                      {displayJob.documents_required?.length ? (
                        displayJob.documents_required.map((doc, index) => <li key={index}>{doc}</li>)
                      ) : (
                        <li>No documents specified</li>
                      )}
                    </ul>
                  </div>

                  <div className="preview-section">
                    <h3>Compliance Checklist</h3>
                    <ul>
                      {displayJob.compliance_checklist?.length ? (
                        displayJob.compliance_checklist.map((item, index) => (
                          <li key={index}>{item.name || 'Unnamed compliance item'}</li>
                        ))
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

        <AnimatePresence>
          {alertModal && (
            <AlertModal title={alertModal.title} message={alertModal.message} onClose={closeAlert} />
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
};

export default JobDetails;
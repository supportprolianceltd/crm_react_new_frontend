import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import pdfIcon from '../../../assets/icons/pdf.png';
import imageIcon from '../../../assets/icons/image.png';

import { API_BASE_URL } from '../../../config';

import {
  EyeIcon,
  ExclamationTriangleIcon,
  EllipsisHorizontalIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const ComplianceCheckTable = React.memo(({ complianceData: initialComplianceData, onUpdate }) => {
  const [complianceData, setComplianceData] = useState(initialComplianceData || []);

  const [alertMessage, setAlertMessage] = useState(null);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectIndex, setRejectIndex] = useState(null);

  const [showViewReasonModal, setShowViewReasonModal] = useState(false);
  const [viewReasonText, setViewReasonText] = useState('');
  const [editReasonIndex, setEditReasonIndex] = useState(null);

  const fileInputRefs = useRef([]);
  const menuRef = useRef(null);
  const rejectModalRef = useRef(null);
  const viewReasonModalRef = useRef(null);

  useEffect(() => {
    if (JSON.stringify(initialComplianceData) !== JSON.stringify(complianceData)) {
      setComplianceData(initialComplianceData || []);
    }
  }, [initialComplianceData]);

  const debouncedUpdate = useCallback(
    (newData) => {
      if (onUpdate && JSON.stringify(newData) !== JSON.stringify(complianceData)) {
        onUpdate(newData);
      }
    },
    [onUpdate, complianceData]
  );

  const triggerFileInput = (index) => {
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index].click();
    }
  };

  const getFileTypeInfo = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    if (extension === 'pdf') return { type: 'PDF', icon: pdfIcon };
    if (['jpg', 'jpeg', 'png'].includes(extension)) return { type: 'Image', icon: imageIcon };
    return null;
  };

  const handleFileChange = (index, file) => {
    if (!file) return;
    const isDuplicate = complianceData.some((item, idx) => idx !== index && item.fileName === file.name);
    if (isDuplicate) {
      showAlert('This file has already been uploaded for another requirement.', 'error');
      return;
    }
    const fileInfo = getFileTypeInfo(file.name);
    if (!fileInfo) {
      showAlert('Only PDF, JPG, and PNG files are allowed.', 'error');
      return;
    }
    const fileUrl = URL.createObjectURL(file);
    const newData = [...complianceData];
    newData[index] = {
      ...newData[index],
      file,
      fileName: file.name,
      fileType: fileInfo.type,
      fileIcon: fileInfo.icon,
      fileUrl,
      status: 'Pending',
      rejectionReason: '',
    };
    setComplianceData(newData);
    debouncedUpdate(newData);
    showAlert('Successfully uploaded file.', 'success');
  };

  const showAlert = (message, type = 'success') => {
    setAlertMessage({ text: message, type });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleAccept = (index) => {
    const newData = [...complianceData];
    newData[index].status = 'Accepted';
    newData[index].rejectionReason = '';
    setComplianceData(newData);
    debouncedUpdate(newData);
    showAlert(`"${newData[index].title}" accepted.`, 'success');
    setOpenMenuIndex(null);
  };

  const handleRejectClick = (index) => {
    setRejectIndex(index);
    setRejectReason(complianceData[index]?.rejectionReason || '');
    setShowRejectModal(true);
    setOpenMenuIndex(null);
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) {
      alert('Please enter a reason for rejection.');
      return;
    }
    const newData = [...complianceData];
    newData[rejectIndex].status = 'Rejected';
    newData[rejectIndex].rejectionReason = rejectReason.trim();
    setComplianceData(newData);
    debouncedUpdate(newData);
    showAlert(`"${newData[rejectIndex].title}" rejected.`, 'error');
    setShowRejectModal(false);
    setRejectIndex(null);
    setRejectReason('');
  };

  const cancelReject = () => {
    setShowRejectModal(false);
    setRejectIndex(null);
    setRejectReason('');
  };

  const handleViewReasonClick = (index) => {
    setEditReasonIndex(index);
    setViewReasonText(complianceData[index].rejectionReason || '');
    setShowViewReasonModal(true);
  };

  const saveEditedReason = () => {
    if (!viewReasonText.trim()) {
      alert('Rejection reason cannot be empty.');
      return;
    }
    const newData = [...complianceData];
    newData[editReasonIndex].rejectionReason = viewReasonText.trim();
    setComplianceData(newData);
    debouncedUpdate(newData);
    showAlert(`Rejection reason updated for "${newData[editReasonIndex].title}".`, 'success');
    setShowViewReasonModal(false);
    setEditReasonIndex(null);
    setViewReasonText('');
  };

  const cancelViewEditReason = () => {
    setShowViewReasonModal(false);
    setEditReasonIndex(null);
    setViewReasonText('');
  };

  const toggleMenu = (index) => {
    setOpenMenuIndex((prev) => (prev === index ? null : index));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutsideModal = (event) => {
      if (showRejectModal && rejectModalRef.current && !rejectModalRef.current.contains(event.target)) {
        cancelReject();
      }
      if (showViewReasonModal && viewReasonModalRef.current && !viewReasonModalRef.current.contains(event.target)) {
        cancelViewEditReason();
      }
    };
    document.addEventListener('mousedown', handleClickOutsideModal);
    return () => document.removeEventListener('mousedown', handleClickOutsideModal);
  }, [showRejectModal, showViewReasonModal]);

  return (
    <div className="table-container" style={{ position: 'relative' }}>
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

      <table className="Gen-Sys-table Complt-Sys-table" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Compliance Requirement</th>
            <th>Icon</th>
            <th>File Name</th>
            <th>File Type</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {complianceData.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                No compliance data available. Please wait for data to load or check the applicant details.
              </td>
            </tr>
          ) : (
            complianceData.map((item, index) => {
              const statusClass = item.status.toLowerCase().replace(/\s+/g, '-');

              return (
                <tr key={index} style={{ position: 'relative' }}>
                  <td>{item.title}</td>
                  <td>
                    {item.fileUrl ? (
                      <a
                        href={`${API_BASE_URL}${item.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`View uploaded file: ${item.fileName}`}
                      >
                        <img src={item.fileIcon} alt="file icon" className="file-icon" />
                      </a>
                    ) : (
                      <span className="no-file">—</span>
                    )}
                  </td>
                  <td>{item.fileName || <span className="no-file">No file</span>}</td>
                  <td>{item.fileType || <span className="no-file">—</span>}</td>
                  <td>
                    <div className="oLL-TTDD">
                      <span
                        className={`status-badge ${statusClass}`}
                        style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                      >
                        {item.status === 'Pending' && (
                          <ExclamationTriangleIcon className="status-icon" title="Pending" />
                        )}
                        {item.status === 'Accepted' && (
                          <CheckIcon
                            className="status-icon"
                            title="Accepted"
                            style={{ width: 14, height: 14 }}
                          />
                        )}
                        {item.status === 'Rejected' && (
                          <XMarkIcon
                            className="status-icon"
                            title="Rejected"
                            style={{ width: 14, height: 14 }}
                          />
                        )}
                        {item.status}
                      </span>
                      {item.status === 'Rejected' && item.rejectionReason && (
                        <button
                          onClick={() => handleViewReasonClick(index)}
                          className="Resss-POla"
                          title="View/Edit Rejection Reason"
                        >
                          <EyeIcon /> Reason
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={{ position: 'relative', minWidth: 140 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {item.fileUrl ? (
                        <div className="gen-td-btns oaika">
                          <a
                            href={`${API_BASE_URL}${item.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="oooka-BBTns link-btn"
                            title="View Uploaded File"
                          >
                            View File
                          </a>
                        </div>
                      ) : (
                        <span className="no-file">—</span>
                      )}
                      <div ref={menuRef} style={{ position: 'relative' }}>
                        <button
                          onClick={() => toggleMenu(index)}
                          aria-label="More options"
                          title="More options"
                          className="mmmo-BBTH-Drop"
                        >
                          <EllipsisHorizontalIcon />
                        </button>
                        <AnimatePresence>
                          {openMenuIndex === index && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className={`Gen-Boxshadow oooo-Dropdiakm ${
                                index === complianceData.length - 1 ? 'last-row-dropdown' : 'not-last-row-dropdown'
                              }`}
                            >
                              <button onClick={() => handleAccept(index)}>Accept</button>
                              <button onClick={() => handleRejectClick(index)}>Reject</button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      style={{ display: 'none' }}
                      ref={(el) => (fileInputRefs.current[index] = el)}
                      onChange={(e) => handleFileChange(index, e.target.files[0])}
                    />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 3000,
            }}
          >
            <motion.div
              ref={rejectModalRef}
              className="modal-content custom-scroll-bar okauj-MOadad"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              style={{
                background: '#fff',
                padding: '1.5rem',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh',
                overflowY: 'auto',
              }}
            >
              <h3>Reason for Rejection</h3>
              <div className="GGtg-DDDVa">
                <textarea
                  id="message"
                  className="oujka-Inpuauy OIUja-Tettxa"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    minHeight: '100px',
                  }}
                  placeholder="Enter rejection reason..."
                />
              </div>
              <div className="oioak-POldj-BTn" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={cancelReject} className="CLCLCjm-BNtn">Cancel</button>
                <button onClick={confirmReject} className="btn-primary-bg">Submit</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showViewReasonModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 3000,
            }}
          >
            <motion.div
              ref={viewReasonModalRef}
              className="modal-content custom-scroll-bar okauj-MOadad"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              style={{
                background: '#fff',
                padding: '1.5rem',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh',
                overflowY: 'auto',
              }}
            >
              <h3>Edit Rejection Reason</h3>
              <div className="GGtg-DDDVa">
                <textarea
                  id="message"
                  className="oujka-Inpuauy OIUja-Tettxa"
                  value={viewReasonText}
                  onChange={(e) => setViewReasonText(e.target.value)}
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    minHeight: '100px',
                  }}
                  placeholder="Edit rejection reason..."
                />
              </div>
              <div className="oioak-POldj-BTn" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={cancelViewEditReason} className="CLCLCjm-BNtn">Cancel</button>
                <button onClick={saveEditedReason} className="btn-primary-bg">Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default ComplianceCheckTable;
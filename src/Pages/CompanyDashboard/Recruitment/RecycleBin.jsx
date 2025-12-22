import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { FaRecycle } from 'react-icons/fa';
import {
  UsersIcon as UsersOutline,
  CalendarDaysIcon as CalendarOutline,
  BriefcaseIcon as BriefcaseOutline,
} from '@heroicons/react/24/outline';
import {
  UsersIcon as UsersSolid,
  CalendarDaysIcon as CalendarSolid,
  BriefcaseIcon as BriefcaseSolid,
} from '@heroicons/react/24/solid';
import {
  fetchSoftDeletedSchedules,
  recoverSchedules,
  permanentDeleteSchedules,
  fetchSoftDeletedRequisitions,
  recoverRequisitions,
  permanentDeleteRequisitions,
  fetchSoftDeletedJobApplications,
  recoverJobApplications,
  permanentDeleteJobApplications,
} from './ApiService';

const tabs = [
  { id: 'job-requisition', label: 'Job Requisition', OutlineIcon: BriefcaseOutline, SolidIcon: BriefcaseSolid },
  { id: 'applications', label: 'Applications', OutlineIcon: UsersOutline, SolidIcon: UsersSolid },
  { id: 'scheduled-interviews', label: 'Scheduled Interviews', OutlineIcon: CalendarOutline, SolidIcon: CalendarSolid },
];

const Modal = ({ title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel' }) => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 z-40"
      onClick={onCancel}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      exit={{ opacity: 0 }}
    />
    <motion.div
      className="fixed top-1/2 left-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg"
      initial={{ opacity: 0, scale: 0.75 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.75 }}
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
    >
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      <p className="mb-6">{message}</p>
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="rounded bg-blue-600 px-7 py-2 font-semibold text-white hover:bg-blue-700"
          autoFocus
        >
          OK
        </button>
      </div>
    </motion.div>
  </AnimatePresence>
);

const SuccessModal = ({ title, message, onClose }) => (
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
      <h3 className="mb-4 text-lg font-semibold text-green-600">{title}</h3>
      <p className="mb-6">{message}</p>
      <div className="flex justify-end">
        <button
          onClick={onClose}
           className="rounded bg-blue-600 px-7 py-2 font-semibold text-white hover:bg-blue-700"
          autoFocus
        >
          OK
        </button>
      </div>
    </motion.div>
  </AnimatePresence>
);


const RecycleBin = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showNoSelectionAlert, setShowNoSelectionAlert] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteRequestId, setDeleteRequestId] = useState(null);
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);
  const [restoreRequestId, setRestoreRequestId] = useState(null);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const masterCheckboxRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        let response;
        switch (activeTab) {
          case 'scheduled-interviews':
            response = await fetchSoftDeletedSchedules();
            break;
          case 'job-requisition':
            response = await fetchSoftDeletedRequisitions();
            break;
          case 'applications':
            response = await fetchSoftDeletedJobApplications();
            break;
          default:
            response = [];
        }
        // Ensure data is an array, handling cases where response is an object with a data property
        const dataArray = Array.isArray(response) ? response : response.data || [];
        
        setData(dataArray);
        setIsLoading(false);
      } catch (error) {
        setErrorMessage(error.message);
        setData([]);
        setIsLoading(false);
        setTimeout(() => setErrorMessage(''), 5000);
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.checked = false;
    }
    setSelectedIds([]);
  }, [currentPage, rowsPerPage, activeTab]);

  const filteredData = data.filter((item) => {
    switch (activeTab) {
      case 'job-requisition':
        return (
          String(item.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.requested_by ? `${item.requested_by.first_name} ${item.requested_by.last_name}` : '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.role || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      case 'applications':
        return (
          String(item.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.job_requisition_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.full_name ? (typeof item.full_name === 'string' ? item.full_name : `${item.full_name.first_name} ${item.full_name.last_name}`) : '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      case 'scheduled-interviews':
        return (
          String(item.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.job_requisition_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.candidate_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.interview_date_time || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      default:
        return true;
    }
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((requestId) => requestId !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    if (currentData.every((item) => selectedIds.includes(item.id))) {
      setSelectedIds((prev) => prev.filter((id) => !currentData.some((item) => item.id === id)));
    } else {
      setSelectedIds((prev) => [
        ...prev,
        ...currentData.filter((item) => !prev.includes(item.id)).map((item) => item.id),
      ]);
    }
  };

  const handleDeleteMarked = () => {
    if (selectedIds.length === 0) {
      setShowNoSelectionAlert(true);
      return;
    }
    setShowConfirmDelete(true);
  };

  const handleDeleteSingle = (id) => {
    setDeleteRequestId(id);
    setShowConfirmDelete(true);
  };

  const handleRestoreSingle = (id) => {
    setRestoreRequestId(id);
    setShowConfirmRestore(true);
  };

  const confirmDelete = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const ids = deleteRequestId ? [deleteRequestId] : selectedIds;
      let response;
      switch (activeTab) {
        case 'scheduled-interviews':
          response = await permanentDeleteSchedules(ids);
          break;
        case 'job-requisition':
          response = await permanentDeleteRequisitions(ids);
          break;
        case 'applications':
          response = await permanentDeleteJobApplications(ids);
          break;
        default:
          throw new Error('Invalid tab for deletion');
      }
      setData((prev) => prev.filter((item) => !ids.includes(item.id)));
      setSelectedIds([]);
      setDeleteRequestId(null);
      setShowConfirmDelete(false);
      setSuccessMessage(response.detail || `Successfully deleted ${ids.length} item(s).`);
      setShowSuccessModal(true);
      setIsLoading(false);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to permanently delete.');
      setIsLoading(false);
      setTimeout(() => setErrorMessage(''), 5000);
      console.error('Error deleting:', error);
    }
  };

  const confirmRestore = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const ids = [restoreRequestId];
      let response;
      switch (activeTab) {
        case 'scheduled-interviews':
          response = await recoverSchedules(ids);
          break;
        case 'job-requisition':
          response = await recoverRequisitions(ids);
          break;
        case 'applications':
          response = await recoverJobApplications(ids);
          break;
        default:
          throw new Error('Invalid tab for restoration');
      }
      setData((prev) => prev.filter((item) => !ids.includes(item.id)));
      setSelectedIds([]);
      setRestoreRequestId(null);
      setShowConfirmRestore(false);
      setSuccessMessage(response.detail || `Successfully restored ${ids.length} item(s).`);
      setShowSuccessModal(true);
      setIsLoading(false);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to restore.');
      setIsLoading(false);
      setTimeout(() => setErrorMessage(''), 5000);
     // console.error('Error restoring:', error);
    }
  };

  const renderTableHeaders = () => {
    let headers = [];
    switch (activeTab) {
      case 'job-requisition':
        headers = ['ID', 'Title', 'Status', 'Requested By', 'Created At'];
        break;
      case 'applications':
        headers = ['ID', 'Job Title', 'Candidate', 'Status', 'Applied At'];
        break;
      case 'scheduled-interviews':
        headers = ['ID', 'Position', 'Candidate', 'Interview Date/Time', 'Status'];
        break;
      default:
        break;
    }
    return headers.map((header) => (
      <th key={header}>
        <span className="flex items-center gap-1">{header}</span>
      </th>
    ));
  };

  // const renderTableRow = (item) => {
  //   let rowData = [];
  //   switch (activeTab) {
  //     case 'job-requisition':
  //       rowData = [
  //         item.id || 'N/A',
  //         item.title || 'N/A',
  //         <span className={`status deleted haggsb-status`}>{item.status || 'Deleted'}</span>,
  //         item.requested_by ? `${item.requested_by.first_name} ${item.requested_by.last_name}` : 'N/A',
  //         item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB') : 'N/A',
  //       ];
  //       break;
  //     case 'applications':
  //       rowData = [
  //         item.id || 'N/A',
  //         item.job_requisition_title || 'N/A',
  //         item.full_name ? (typeof item.full_name === 'string' ? item.full_name : `${item.full_name.first_name} ${item.full_name.last_name}`) : 'N/A',
  //         <span className={`status deleted haggsb-status`}>{item.status || 'Deleted'}</span>,
  //         item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB') : 'N/A',
  //       ];
  //       break;
  //     case 'scheduled-interviews':
  //       rowData = [
  //         item.id || 'N/A',
  //         item.job_requisition_title || 'N/A',
  //         item.candidate_name || 'N/A',
  //         item.interview_date_time
  //           ? new Date(item.interview_date_time).toLocaleString('en-GB', {
  //               day: '2-digit',
  //               month: 'short',
  //               year: 'numeric',
  //               hour: 'numeric',
  //               minute: '2-digit',
  //               hour12: true,
  //             })
  //           : 'N/A',
  //         <span className={`status deleted haggsb-status`}>{item.status || 'Deleted'}</span>,
  //       ];
  //       break;
  //     default:
  //       break;
  //   }
  //   return rowData.map((cell, index) => <td key={index}>{cell}</td>);
  // };


  const renderTableRow = (item) => {
  let rowData = [];
  switch (activeTab) {
    case 'job-requisition':
      rowData = [
        item.id || 'N/A',
        item.title || 'N/A',
        <span className={`status deleted haggsb-status`}>{item.status || 'Deleted'}</span>,
        item.requested_by
          ? item.requested_by.first_name && item.requested_by.last_name
            ? `${item.requested_by.first_name} ${item.requested_by.last_name}`
            : item.requested_by.email || 'N/A'
          : 'N/A',
        item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB') : 'N/A',
      ];
      break;
    case 'applications':
      rowData = [
        item.id || 'N/A',
        item.job_requisition_title || 'N/A',
        item.full_name ? (typeof item.full_name === 'string' ? item.full_name : `${item.full_name.first_name} ${item.full_name.last_name}`) : 'N/A',
        <span className={`status deleted haggsb-status`}>{item.status || 'Deleted'}</span>,
        item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB') : 'N/A',
      ];
      break;
    case 'scheduled-interviews':
      rowData = [
        item.id || 'N/A',
        item.job_requisition_title || 'N/A',
        item.candidate_name || 'N/A',
        item.interview_date_time
          ? new Date(item.interview_date_time).toLocaleString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })
          : 'N/A',
        <span className={`status deleted haggsb-status`}>{item.status || 'Deleted'}</span>,
      ];
      break;
    default:
      break;
  }
  return rowData.map((cell, index) => <td key={index}>{cell}</td>);
};
  return (
    <div className="RecycleBin-sec">
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            className="error-notification"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#fee2e2',
              padding: '1rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              zIndex: 4001,
              maxWidth: '500px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              style={{ width: '20px', height: '20px', marginRight: '0.5rem', fill: '#fff' }}
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <span style={{ color: '#fff' }}>{errorMessage}</span>
          </motion.div>
        )}
        {showSuccessModal && (
          <SuccessModal
            title="Success"
            message={successMessage}
            onClose={() => setShowSuccessModal(false)}
          />
        )}
      </AnimatePresence>

      <div className="OLIK-NAVVVB OLik-Srfga">
        {tabs.map(({ id, label, OutlineIcon, SolidIcon }) => {
          const isActive = activeTab === id;
          const Icon = isActive ? SolidIcon : OutlineIcon;
          return (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                setCurrentPage(1);
                setSelectedIds([]);
                setSearchTerm('');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
                isActive
                  ? 'active-OLika bg-blue-100 text-blue-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          );
        })}
      </div>

      <div className="Dash-OO-Boas OOOP-LOa">
        <div className="Dash-OO-Boas-Top">
          <div className="Dash-OO-Boas-Top-1">
            <h3>Recycle Bin - {tabs.find((tab) => tab.id === activeTab).label}</h3>
          </div>
          <div className="Dash-OO-Boas-Top-2">
            <div className="genn-Drop-Search">
              <span>
                <MagnifyingGlassIcon className="h-6 w-6" />
              </span>
              <input
                type="text"
                placeholder={`Search deleted ${activeTab.replace('-', ' ')}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="Dash-OO-Boas Gen-Boxshadow">
        <div className="oujah-Oujka">
          <h3>Deleted {tabs.find((tab) => tab.id === activeTab).label}</h3>
        </div>
        <div className="table-container">
          <table className="Gen-Sys-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    ref={masterCheckboxRef}
                    onChange={handleSelectAllVisible}
                    checked={currentData.length > 0 && currentData.every((item) => selectedIds.includes(item.id))}
                    disabled={isLoading}
                  />
                </th>
                {renderTableHeaders()}
                <th>
                  <span className="flex items-center gap-1">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '20px', fontStyle: 'italic' }}>
                    <ul className="tab-Loadding-AniMMA">
                      <li></li>
                      <li></li>
                      <li></li>
                      <li></li>
                      <li></li>
                      <li></li>
                      <li></li>
                      <li></li>
                    </ul>
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td
                    colSpan={renderTableHeaders().length + 2}
                    style={{ textAlign: 'center', padding: '20px', fontStyle: 'italic' }}
                  >
                    No deleted {activeTab.replace('-', ' ')} found
                  </td>
                </tr>
              ) : (
                currentData.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleCheckboxChange(item.id)}
                        disabled={isLoading}
                      />
                    </td>
                    {renderTableRow(item)}
                    <td>
                      <div className="gen-td-btns">
                        <button
                          onClick={() => handleRestoreSingle(item.id)}
                          className="link-btn btn-primary-bg"
                          disabled={isLoading}
                        >
                          <ArrowPathIcon className="h-4 w-4 mr-1" />
                          Restore
                        </button>
                        <button
                          onClick={() => handleDeleteSingle(item.id)}
                          className="view-btn"
                          disabled={isLoading}
                        >
                          <FaRecycle className="h-4 w-4 mr-1" />
                          Permanently Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && filteredData.length > 0 && (
          <div className="pagination-controls">
            <div className="Dash-OO-Boas-foot">
              <div className="Dash-OO-Boas-foot-1">
                <div className="items-per-page">
                  <p>Number of rows:</p>
                  <select
                    className="form-select"
                    value={rowsPerPage}
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                    disabled={isLoading}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
              <div className="Dash-OO-Boas-foot-2">
                <button onClick={handleSelectAllVisible} className="mark-all-btn" disabled={isLoading}>
                  <CheckCircleIcon className="h-5 w-5 mr-1" />
                  {currentData.every((item) => selectedIds.includes(item.id)) ? 'Unmark All' : 'Mark All'}
                </button>
                <button onClick={handleDeleteMarked} className="delete-marked-btn" disabled={isLoading}>
                  <FaRecycle className="h-5 w-5 mr-1" />
                  Permanently Delete Marked
                </button>
              </div>
            </div>
            <div className="page-navigation">
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <div className="page-navigation-Btns">
                <button
                  className="page-button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  className="page-button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || isLoading}
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showNoSelectionAlert && (
          <AlertModal
            title="No Selection"
            message="You have not selected any items to delete."
            onClose={() => setShowNoSelectionAlert(false)}
          />
        )}
        {showConfirmDelete && (
          <Modal
            title="Confirm Permanent Deletion"
            message={
              deleteRequestId
                ? `Are you sure you want to permanently delete the ${activeTab.replace('-', ' ')} "${
                    activeTab === 'job-requisition'
                      ? data.find((r) => r.id === deleteRequestId)?.title
                      : activeTab === 'applications'
                      ? data.find((r) => r.id === deleteRequestId)?.job_requisition?.title
                      : data.find((r) => r.id === deleteRequestId)?.job_requisition_title
                  }"? This action cannot be undone.`
                : `Are you sure you want to permanently delete ${selectedIds.length} selected ${activeTab.replace(
                    '-',
                    ' '
                  )}(s)? This action cannot be undone.`
            }
            onConfirm={confirmDelete}
            onCancel={() => {
              setShowConfirmDelete(false);
              setDeleteRequestId(null);
            }}
            confirmText="Permanently Delete"
            cancelText="Cancel"
          />
        )}
        {showConfirmRestore && (
          <Modal
            title="Confirm Restore"
            message={`Are you sure you want to restore the ${activeTab.replace('-', ' ')} "${
              activeTab === 'job-requisition'
                ? data.find((r) => r.id === restoreRequestId)?.title
                : activeTab === 'applications'
                ? data.find((r) => r.id === restoreRequestId)?.job_requisition?.title
                : data.find((r) => r.id === restoreRequestId)?.job_requisition_title
            }"?`}
            onConfirm={confirmRestore}
            onCancel={() => {
              setShowConfirmRestore(false);
              setRestoreRequestId(null);
            }}
            confirmText="Restore"
            cancelText="Cancel"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecycleBin;
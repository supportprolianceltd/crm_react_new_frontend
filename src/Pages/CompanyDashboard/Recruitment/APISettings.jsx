import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  LockClosedIcon,
  LockOpenIcon,
  CheckCircleIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  PlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Predefined list of job boards
const JOB_BOARDS = [
  'LinkedIn', 'Indeed', 'Glassdoor', 'Monster', 'CareerBuilder',
  'SimplyHired', 'ZipRecruiter', 'FlexJobs', 'AngelList', 'Dice'
];

// Modal component for confirmation dialogs
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

// AlertModal component for simple alerts
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

// Job Board Modal Component
const JobBoardModal = ({ 
  isOpen, 
  onClose, 
  jobBoard, 
  onSave,
  isSaving = false
}) => {
  const [name, setName] = useState(jobBoard?.name || '');
  const [apiKey, setApiKey] = useState(jobBoard?.apiKey || '');
  const [status, setStatus] = useState(jobBoard?.status || 'Active');
  const [error, setError] = useState('');
  const modalContentRef = useRef(null);
  const errorTimeoutRef = useRef(null);

  useEffect(() => {
    if (jobBoard) {
      setName(jobBoard.name);
      setApiKey(jobBoard.apiKey);
      setStatus(jobBoard.status);
    } else {
      setName('');
      setApiKey('');
      setStatus('Active');
    }
  }, [jobBoard]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalContentRef.current && 
          !modalContentRef.current.contains(event.target) &&
          isOpen) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clear any existing timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    
    if (!name.trim()) {
      setError('Job board name is required');
      // Set timeout to clear error after 3 seconds
      errorTimeoutRef.current = setTimeout(() => {
        setError('');
      }, 3000);
      return;
    }
    
    if (!apiKey.trim()) {
      setError('API key is required');
      // Set timeout to clear error after 3 seconds
      errorTimeoutRef.current = setTimeout(() => {
        setError('');
      }, 3000);
      return;
    }
    
    const boardData = {
      name: name.trim(),
      apiKey: apiKey.trim(),
      status
    };
    
    onSave(boardData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          zIndex: 3000
        }}
      >
        <motion.div 
          className="modal-content custom-scroll-bar okauj-MOadad"
          ref={modalContentRef}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          <h3>
            {jobBoard ? 'Edit Job Board' : 'Add New Job Board'}
          </h3>

          <form onSubmit={handleSubmit} className="p-6">
            <AnimatePresence>
              {error && (
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
                              color: '#fff',
                              padding: '1rem',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              zIndex: 4001,
                              maxWidth: '500px',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                          >
                  <ExclamationTriangleIcon style={{ width: '20px', height: '20px', marginRight: '0.5rem' }} />
                  <span style={{ color: '#fff' }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className='GGtg-DDDVa'>
              <label>
                Job Board Name *
              </label>
              <select
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='oujka-Inpuauy'
              >
                <option value="">Select a job board</option>
                {JOB_BOARDS.map(board => (
                  <option key={board} value={board}>
                    {board}
                  </option>
                ))}
                <option value="Other">Other (specify below)</option>
              </select>
            </div>
            
            {name === "Other" && (
              <div className='GGtg-DDDVa'>
                <label>
                  Custom Job Board Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className='oujka-Inpuauy'
                  placeholder="Enter custom job board name"
                />
              </div>
            )}
            
            <div className='GGtg-DDDVa'>
              <label>
                API Key *
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className='oujka-Inpuauy'
                placeholder="Enter API key"
              />
            </div>
            
            <div className='GGtg-DDDVa'>
              <label>
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className='oujka-Inpuauy'
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            
            <div className='oioak-POldj-BTn'>
              <button
                type="button"
                onClick={onClose}
                className='CLCLCjm-BNtn'
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className='btn-primary-bg'
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        border: '3px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        marginRight: '5px',
                      }}
                    />
                    {jobBoard ? 'Updating...' : 'Creating...'}
                  </>
                ) : jobBoard ? 'Update Board' : 'Add Board'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Function to generate mock job board data
const generateMockJobBoards = () => {
  const boards = [];
  for (let i = 1; i <= 50; i++) {
    const createdDate = `2025-${String((i % 3) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`;
    const lastSync = new Date(`2025-04-01`);
    lastSync.setDate(lastSync.getDate() + Math.floor(Math.random() * 10) + 1);
    lastSync.setHours(Math.floor(Math.random() * 24));
    lastSync.setMinutes(Math.floor(Math.random() * 60));
    const lastSyncFormatted = `${lastSync.toISOString().split('T')[0]} ${String(lastSync.getHours()).padStart(2, '0')}:${String(lastSync.getMinutes()).padStart(2, '0')}`;
    
    boards.push({
      id: `BOARD-${String(i).padStart(3, '0')}`,
      name: JOB_BOARDS[i % JOB_BOARDS.length],
      apiKey: `API-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      activePostings: Math.floor(Math.random() * 20) + 1,
      createdDate,
      lastSync: lastSyncFormatted,
      status: i % 2 === 0 ? 'Active' : 'Inactive'
    });
  }
  return boards;
};

// Main APISettings component
const APISettings = () => {
  // State declarations
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isVisible, setIsVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showNoSelectionAlert, setShowNoSelectionAlert] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteBoardId, setDeleteBoardId] = useState(null);
  const [showJobBoardModal, setShowJobBoardModal] = useState(false);
  const [currentJobBoard, setCurrentJobBoard] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const masterCheckboxRef = useRef(null);

  const toggleSection = () => {
    setIsVisible(prev => !prev);
  };

  const statuses = ['All', 'Active', 'Inactive'];

  // Initialize job boards with mock data
  const [jobBoards, setJobBoards] = useState(generateMockJobBoards());

  // Filter job boards based on search term and status
  const filteredJobBoards = jobBoards.filter((board) => {
    const matchesSearch = 
      board.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      board.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      board.apiKey.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || board.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredJobBoards.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentJobBoards = filteredJobBoards.slice(startIndex, startIndex + rowsPerPage);

  // Handle checkbox selection for individual job boards
  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((boardId) => boardId !== id) : [...prev, id]
    );
  };

  // Handle select all visible job boards
  const handleSelectAllVisible = () => {
    if (currentJobBoards.every((board) => selectedIds.includes(board.id))) {
      setSelectedIds((prev) => prev.filter((id) => !currentJobBoards.some((board) => board.id === id)));
    } else {
      setSelectedIds((prev) => [
        ...prev,
        ...currentJobBoards.filter((board) => !prev.includes(board.id)).map((board) => board.id),
      ]);
    }
  };

  // Handle delete marked job boards
  const handleDeleteMarked = () => {
    if (selectedIds.length === 0) {
      setShowNoSelectionAlert(true);
      return;
    }
    setShowConfirmDelete(true);
  };

  // Handle single job board deletion
  const handleDeleteSingle = (id) => {
    setDeleteBoardId(id);
    setShowConfirmDelete(true);
  };

  // Confirm deletion of selected or single job board
  const confirmDelete = () => {
    if (deleteBoardId) {
      // Single job board deletion
      setJobBoards((prev) => prev.filter((board) => board.id !== deleteBoardId));
      setSelectedIds((prev) => prev.filter((id) => id !== deleteBoardId));
      setDeleteBoardId(null);
    } else {
      // Multiple job board deletion
      setJobBoards((prev) => prev.filter((board) => !selectedIds.includes(board.id)));
      setSelectedIds([]);
    }
    setShowConfirmDelete(false);
  };

  // Handle opening job board modal for adding
  const handleAddJobBoard = () => {
    setCurrentJobBoard(null);
    setShowJobBoardModal(true);
  };

  // Handle opening job board modal for editing
  const handleEditJobBoard = (board) => {
    setCurrentJobBoard(board);
    setShowJobBoardModal(true);
  };

  // Handle saving job board (add or edit)
  const handleSaveJobBoard = (formData) => {
    setIsSaving(true);
    
    // Simulate API call with 3 second delay
    setTimeout(() => {
      if (currentJobBoard) {
        // Update existing job board
        setJobBoards(prev => 
          prev.map(board => 
            board.id === currentJobBoard.id 
              ? { ...board, ...formData } 
              : board
          )
        );
      } else {
        // Add new job board at the beginning and reset current page to 1
        const newBoard = {
          id: `BOARD-${String(jobBoards.length + 1).padStart(3, '0')}`,
          ...formData,
          activePostings: Math.floor(Math.random() * 20) + 1,
          createdDate: new Date().toISOString().split('T')[0],
          lastSync: new Date().toISOString().split('T')[0] + ' 00:00'
        };
        setJobBoards(prev => [newBoard, ...prev]); // Add to beginning of array
        setCurrentPage(1); // Reset to first page
      }
      
      setIsSaving(false);
      setShowJobBoardModal(false);
    }, 3000); // 3 second delay
  };

  // Reset master checkbox when page or rows change
  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.checked = false;
    }
    setSelectedIds([]);
  }, [currentPage, rowsPerPage]);

  return (
    <div className="APISettings-sec">
      <div className="Dash-OO-Boas OOOP-LOa">
        <div className="Dash-OO-Boas-Top">
          <div className="Dash-OO-Boas-Top-1">
            <span onClick={toggleSection} title='Filter'><AdjustmentsHorizontalIcon className="h-6 w-6" /></span>
            <h3>Job Board Integrations</h3>
          </div>
          <div className="Dash-OO-Boas-Top-2">
            <div className="genn-Drop-Search">
              <span><MagnifyingGlassIcon className="h-6 w-6" /></span>
              <input 
                type="text" 
                placeholder="Search job boards..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isVisible && (
            <motion.div
              className="filter-dropdowns"
              initial={{ height: 0, opacity: 0, overflow: "hidden" }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'All' ? 'All Statuses' : status}
                  </option>
                ))}
              </select>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="Dash-OO-Boas Gen-Boxshadow">
        <div className='oujah-Oujka'>
          <h3>API Integrations</h3>
          <button 
            className='poli-BTn btn-primary-bg'
            onClick={handleAddJobBoard}
          >
            <PlusIcon className="h-5 w-5 mr-1" /> Add Job Board
          </button>
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
                    checked={currentJobBoards.length > 0 && currentJobBoards.every((board) => selectedIds.includes(board.id))}
                  />
                </th>
                <th>
                  <span className="flex items-center gap-1">
                    Board ID
                  </span>
                </th>
                <th>
                  <span className="flex items-center gap-1">
                    Job Board
                  </span>
                </th>
                <th>
                  <span className="flex items-center gap-1">
                    API Key
                  </span>
                </th>
                <th>
                  <span className="flex items-center gap-1">
                    Active Postings
                  </span>
                </th>
                <th>
                  <span className="flex items-center gap-1">
                    Created Date
                  </span>
                </th>
                <th>
                  <span className="flex items-center gap-1">
                    Last Sync
                  </span>
                </th>
                <th>
                  <span className="flex items-center gap-1">
                    Status
                  </span>
                </th>
                <th>
                  <span className="flex items-center gap-1">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentJobBoards.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '20px', fontStyle: 'italic' }}>
                    No matching job board integrations found
                  </td>
                </tr>
              ) : (
                currentJobBoards.map((board) => (
                  <tr key={board.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(board.id)}
                        onChange={() => handleCheckboxChange(board.id)}
                      />
                    </td>
                    <td>{board.id}</td>
                    <td>{board.name}</td>
                    <td>{board.apiKey}</td>
                    <td>{board.activePostings}</td>
                    <td>{board.createdDate}</td>
                    <td>{board.lastSync}</td>
                    <td>
                      <span className={`status ${board.status.toLowerCase()} haggsb-status`}>
                        {board.status === 'Active' ? (
                          <LockOpenIcon className="h-5 w-5" />
                        ) : (
                          <LockClosedIcon className="h-5 w-5" />
                        )}
                        {board.status}
                      </span>
                    </td>
                    <td>
                      <div className="gen-td-btns">
                        <button
                          onClick={() => handleEditJobBoard(board)}
                          className="link-btn btn-primary-bg"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSingle(board.id)}
                          className="view-btn"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredJobBoards.length > 0 && (
          <div className="pagination-controls">
            <div className="Dash-OO-Boas-foot">
              <div className="Dash-OO-Boas-foot-1">
                <div className="items-per-page">
                  <p>Number of rows:</p>
                  <select
                    className="form-select"
                    value={rowsPerPage}
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div className="Dash-OO-Boas-foot-2">
                <button onClick={handleSelectAllVisible} className="mark-all-btn">
                  <CheckCircleIcon className="h-5 w-5 mr-1" />
                  {currentJobBoards.every((board) => selectedIds.includes(board.id)) ? 'Unmark All' : 'Mark All'}
                </button>
                <button onClick={handleDeleteMarked} className="delete-marked-btn">
                  <TrashIcon className="h-5 w-5 mr-1" />
                  Delete Marked
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
                  disabled={currentPage === 1}
            >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  className="page-button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Job Board Modal */}
      <JobBoardModal
        isOpen={showJobBoardModal}
        onClose={() => setShowJobBoardModal(false)}
        jobBoard={currentJobBoard}
        onSave={handleSaveJobBoard}
        isSaving={isSaving}
      />

      <AnimatePresence>
        {showNoSelectionAlert && (
          <AlertModal
            title="No Selection"
            message="You have not selected any job board integrations to delete."
            onClose={() => setShowNoSelectionAlert(false)}
          />
        )}
        {showConfirmDelete && (
          <Modal
            title="Confirm Delete"
            message={
              deleteBoardId
                ? `Are you sure you want to delete the job board integration for ${jobBoards.find(b => b.id === deleteBoardId)?.name}? This action cannot be undone.`
                : `Are you sure you want to delete ${selectedIds.length} selected job board integration(s)? This action cannot be undone.`
            }
            onConfirm={confirmDelete}
            onCancel={() => {
              setShowConfirmDelete(false);
              setDeleteBoardId(null);
            }}
            confirmText="Delete"
            cancelText="Cancel"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default APISettings;
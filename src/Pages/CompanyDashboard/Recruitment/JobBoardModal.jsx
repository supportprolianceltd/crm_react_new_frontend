import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  LockClosedIcon,
  LockOpenIcon
} from '@heroicons/react/24/outline';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Job board name is required');
      return;
    }
    
    if (!apiKey.trim()) {
      setError('API key is required');
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
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          ref={modalContentRef}
          className="bg-white rounded-lg w-full max-w-md"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <div className="border-b p-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {jobBoard ? 'Edit Job Board' : 'Add New Job Board'}
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Board Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., LinkedIn, Indeed"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key *
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter API key"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 flex items-center">
                {status === 'Active' ? (
                  <>
                    <LockOpenIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">Active integrations will sync job postings</span>
                  </>
                ) : (
                  <>
                    <LockClosedIcon className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-600">Inactive integrations will not sync</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
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

export default JobBoardModal;
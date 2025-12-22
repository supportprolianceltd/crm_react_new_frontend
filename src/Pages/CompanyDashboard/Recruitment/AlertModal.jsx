// src/recruitment/AlertModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

const AlertModal = ({ title, message, onClose }) => {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg p-6 max-w-md w-full Gen-Boxshadow"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-red-600">{title}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <p className="mb-6 text-gray-600">{message}</p>
          <div className="flex justify-end">
            <button
              className="btn-primary-bg px-4 py-2 rounded"
              onClick={onClose}
            >
              OK
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AlertModal;
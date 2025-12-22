import { useState, useEffect, useRef } from "react";
import Table from "../../../../../components/Table/Table";
import StatusBadge from "../../../../../components/StatusBadge";
import { FiMoreVertical } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import ToggleButton from "../../../../../components/ToggleButton";

const user = JSON.parse(localStorage.getItem("user"));

export default function OnboardingDocumentsStep({
  formData,
  onboardingDocuments,
  setOnboardingAccess,
}) {
  const [activePopup, setActivePopup] = useState(null);
  const [selectedAccess, setSelectedAccess] = useState([]);
  const popupRef = useRef(null);

  useEffect(() => {
    setSelectedAccess(formData.onboardingDocumentsAccess || []);
  }, [formData.onboardingDocumentsAccess]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setActivePopup(null);
      }
    };

    if (activePopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activePopup]);

  const handleToggleAccess = (docId) => {
    const newSelected = selectedAccess.includes(docId)
      ? selectedAccess.filter((id) => id !== docId)
      : [...selectedAccess, docId];
    setSelectedAccess(newSelected);
    setOnboardingAccess(newSelected);
  };

  const tableColumns = [
    { key: "name", header: "Document Name" },
    { key: "type", header: "Type" },
    { key: "lastUpdated", header: "Last Updated" },
    {
      key: "status",
      header: "Status",
      render: (doc) => <StatusBadge status={doc.status || "active"} />,
    },
    {
      key: "access",
      header: "Grant Access",
      render: (doc) => (
        <ToggleButton
          label=""
          isOn={selectedAccess.includes(doc.id)}
          onToggle={() => handleToggleAccess(doc.id)}
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (doc) => (
        <div className="actions-cell">
          <motion.button
            className="actions-button"
            onClick={() =>
              setActivePopup(activePopup === doc.id ? null : doc.id)
            }
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiMoreVertical />
          </motion.button>
          <AnimatePresence>
            {activePopup === doc.id && (
              <motion.div
                ref={popupRef}
                className="actions-popup"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <motion.button whileHover={{ x: 5 }}>View</motion.button>
                {user?.profile?.permissions?.includes("44") && (
                  <motion.button whileHover={{ x: 5 }}>Replace</motion.button>
                )}
                <motion.button whileHover={{ x: 5 }}>Remove</motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ),
    },
  ];

  const documents = onboardingDocuments?.map((doc) => ({
    id: doc.id,
    name: doc.title || "Untitled Document",
    type: doc.file_url
      ? doc.file_url.split("?")[0].split(".").pop().toUpperCase()
      : "Unknown",
    lastUpdated: doc.updated_at
      ? new Date(doc.updated_at).toLocaleString()
      : "N/A",
    status: doc.status || "active",
  }));

  return (
    <div className="form-section">
      <h3>Onboarding Documents</h3>
      <p>
        Select documents to grant access to the employee&nbsp;
        <strong>
          ({formData?.firstName}&nbsp;
          {formData?.lastName})
        </strong>
        &nbsp;for acknowledgement
      </p>

      <div style={{ marginTop: "1.5rem" }}>
        <Table
          columns={tableColumns}
          data={documents}
          emptyStateMessage="No documents found"
          emptyStateDescription="No onboarding documents available"
        />
      </div>
    </div>
  );
}

// CareCircle.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  MagnifyingGlassIcon,
  ClockIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
  XMarkIcon,
  PlusCircleIcon,
  EllipsisHorizontalIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
const CareCircle = () => {
  // States
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAccessLog, setShowAccessLog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'edit'
  const [editingId, setEditingId] = useState(null);
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    emergency_contact: "No",
    lpa: "No",
    phone: "",
    email: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [successAlert, setSuccessAlert] = useState({
    show: false,
    title: "",
    updated: false,
  });
  const detailPanelRef = useRef(null);
  const modalRef = useRef(null);
  // Load dummy data on mount
  const loadData = () => {
    const dummyClients = [
      {
        id: 1,
        name: "Precious Wen",
        relationship: "Spouse",
        emergency_contact: "Yes",
        lpa: "Yes",
        phone: "123-456-7890",
        email: "precious@example.com",
        notes: "Primary emergency contact for medical decisions.",
      },
      {
        id: 2,
        name: "Jane Doe",
        relationship: "Daughter",
        emergency_contact: "Yes",
        lpa: "No",
        phone: "234-567-8901",
        email: "jane@example.com",
        notes: "Secondary contact, available during weekdays.",
      },
      {
        id: 3,
        name: "John Smith",
        relationship: "Brother",
        emergency_contact: "No",
        lpa: "No",
        phone: "345-678-9012",
        email: "john@example.com",
        notes: "General contact for family matters.",
      },
      {
        id: 4,
        name: "Emily Brown",
        relationship: "Friend",
        emergency_contact: "No",
        lpa: "Yes",
        phone: "456-789-0123",
        email: "emily@example.com",
        notes: "Close friend, not for emergencies.",
      },
      {
        id: 5,
        name: "Mike Wilson",
        relationship: "Son",
        emergency_contact: "Yes",
        lpa: "Yes",
        phone: "567-890-1234",
        email: "mike@example.com",
        notes: "Available 24/7 for urgent situations.",
      },
    ];
    setClients(dummyClients);
    setFilteredClients(dummyClients);
  };
  useEffect(() => {
    loadData();
  }, []);
  // Handle create button click
  const handleCreateClick = () => {
    setModalType('create');
    setEditingId(null);
    setFormData({
      name: "",
      relationship: "",
      emergency_contact: "No",
      lpa: "No",
      phone: "",
      email: "",
      notes: "",
    });
    setShowModal(true);
  };
  // Handle edit button click
  const handleEdit = (row) => {
    setOpenMenuIndex(null);
    setModalType('edit');
    setEditingId(row.id);
    setFormData({
      name: row.name,
      relationship: row.relationship,
      emergency_contact: row.emergency_contact,
      lpa: row.lpa,
      phone: row.phone,
      email: row.email,
      notes: row.notes,
    });
    setShowModal(true);
  };
  // Handle access log button click
  const handleAccessLogClick = () => {
    setShowAccessLog(true);
  };
  // Handle form submission
  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.relationship || !formData.phone || !formData.email) {
      alert("Please fill in all required fields");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      if (modalType === 'create') {
        const newClient = {
          id: clients.length + 1,
          ...formData,
        };
        setClients(prev => [...prev, newClient]);
        setSuccessAlert({
          show: true,
          title: "New Care Circle Member",
          updated: false,
        });
      } else if (modalType === 'edit') {
        setClients(prev => prev.map(c => c.id === editingId ? { ...formData, id: editingId } : c ));
        setSuccessAlert({
          show: true,
          title: "Care Circle Member",
          updated: true,
        });
      }
      setShowModal(false);
      // Reset form for create
      if (modalType === 'create') {
        setFormData({
          name: "",
          relationship: "",
          emergency_contact: "No",
          lpa: "No",
          phone: "",
          email: "",
          notes: "",
        });
      }
      setSaving(false);
      setTimeout(
        () => setSuccessAlert({ show: false, title: "", updated: false }),
        2200
      );
    }, 3000);
  };
  const handleCancelModal = () => {
    setShowModal(false);
  };
  // Apply search
  useEffect(() => {
    if (!Array.isArray(clients)) {
      setFilteredClients([]);
      return;
    }
    let data = [...clients];
    // Apply search
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      data = data.filter(
        (row) =>
          (row.name && row.name.toLowerCase().includes(query)) ||
          (row.relationship && row.relationship.toLowerCase().includes(query)) ||
          (row.phone && row.phone.toLowerCase().includes(query)) ||
          (row.email && row.email.toLowerCase().includes(query)) ||
          (row.lpa && row.lpa.toLowerCase().includes(query))
      );
    }
    console.log(`Filtered data: ${data.length} items after search`);
    setFilteredClients(data);
  }, [searchQuery, clients]);
  // Close detail panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        selectedClient &&
        detailPanelRef.current &&
        !detailPanelRef.current.contains(event.target) &&
        (!showModal || !modalRef.current || !modalRef.current.contains(event.target))
      ) {
        setSelectedClient(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedClient, showModal]);
  // Close access log panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showAccessLog &&
        detailPanelRef.current &&
        !detailPanelRef.current.contains(event.target)
      ) {
        setShowAccessLog(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAccessLog]);
  // Get initials
  const getInitials = (name) => {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  };
  // Handle table row actions
  const handleCancelInvite = (row) => {
    setOpenMenuIndex(null);
    console.log("Cancel invite for:", row.name);
    // Implement cancel invite functionality
  };
  const handleRemove = (row) => {
    setOpenMenuIndex(null);
    console.log("Remove contact:", row.name);
    // Implement remove functionality
  };
  // Hide dropdowns when clicking outside for table actions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".actions-dropdown")
      ) {
        setOpenMenuIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const currentRows = filteredClients; // No pagination, show all
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="GenReq-Page">
        <div className="PPOl-COnt">
            <p className="cadd-Note">Care circle members have full access to cleint's care notes.</p>
          <div className="PPOlaj-SSde-TopSSUB NoAbsuls">
            {/* Search */}
            <div className="oIK-Search">
              <span>
                <MagnifyingGlassIcon />
              </span>
              <input
                type="text"
                placeholder="Search by Name, Relationship, Phone, Email, L.P.A..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
         <div className="oIK-Btns Ujka-Btnna">
            <div className="Gtbs-OOls">
                     <button className="LLl-BBtn-ACCt" onClick={handleCreateClick}>
                        <PlusIcon />
                     Create new care circle member
                 </button>
                  <button className="LLl-BBtn-ACCt  btn-primary-bg" onClick={handleAccessLogClick}>
                       Access log
                 </button>
            </div>
            </div>
          </div>
         
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Relationship</th>
                  <th>Emergency Contact</th>
                  <th>L.P.A</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((row, index) => {
                    const isLastRow = index === currentRows.length - 1;
                    const initials = getInitials(row.name);
                    return (
                      <tr 
                        key={index} 
                      >
                        <td>
                          <div className='HGh-Tabl-Gbs'>
                            <div className='HGh-Tabl-Gbs-Tit'>
                              <h3>
                                <span 
                                  className="table-avatar initials-placeholder"
                                ><b>{initials}</b></span>
                                <span className='Cree-Name'>
                                  <span>{row.name || ''}</span>
                                </span>
                              </h3>
                            </div>
                          </div>
                        </td>
                        <td>
                          {row.relationship}
                        </td>
                        <td>
                          {row.emergency_contact}
                        </td>
                        <td>{row.lpa}</td>
                        <td>{row.phone}</td>
                        <td>{row.email}</td>
                        <td>
                          <div className="relative">
                            <button
                              className="actions-button ff-SVVgs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuIndex(
                                  openMenuIndex === index ? null : index
                                );
                              }}
                            >
                              <EllipsisHorizontalIcon />
                            </button>
                            <AnimatePresence>
                              {openMenuIndex === index && (
                                <motion.div
                                  className={`dropdown-menu ${isLastRow ? 'last-row-dropdown' : 'not-last-row-dropdown'} NNo-Spacebbatw`}
                                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                  transition={{ duration: 0.15 }}
                                >
                                  <span 
                                    className='dropdown-item'
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEdit(row);
                                    }}
                                  >
                                    Edit
                                  </span>
                                  <span 
                                    className='dropdown-item'
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCancelInvite(row);
                                    }}
                                  >
                                    Cancel Invite
                                  </span>
                                  <span 
                                    className='dropdown-item last-item'
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemove(row);
                                    }}
                                  >
                                    Remove
                                  </span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                        
                      </tr>
                    );
                  })
                ) : (
                  <tr className="monn-Ntga">
                    <td
                      colSpan={7}
                      style={{ textAlign: "center", padding: "2rem" }}
                    >
                      {clients.length === 0
                        ? "No contacts added yet."
                        : "No matching contacts found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Sliding Detail Panel */}
        <AnimatePresence>
          {selectedClient && (
            <motion.div
              ref={detailPanelRef}
              className="detail-panel custom-scroll-bar"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="detail-header">
                <h2>{selectedClient.name}</h2>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="close-button"
                >
                  <XMarkIcon />
                </button>
              </div>
              <div className="client-info">
                <h3 className="client-name">{selectedClient.name}</h3>
                <div className="client-meta">
                  <p>
                    <span><BriefcaseIcon /></span>
                    {selectedClient.relationship}
                  </p>
                  <p>
                    <span><ClockIcon /></span>
                    {selectedClient.emergency_contact}
                  </p>
                  <p>
                    <span><CalendarDaysIcon /></span>
                    {selectedClient.lpa}
                  </p>
                </div>
              </div>
              <div className="notes-section">
                <h4>Phone</h4>
                <p className="notes-text">{selectedClient.phone}</p>
                <h4>Email</h4>
                <p className="notes-text">{selectedClient.email}</p>
              </div>
              <div className="Addd-Comnt-Sec">
                <h3>Notes</h3>
                <textarea name="" id="" placeholder="Type notes here..">{selectedClient.notes}</textarea>
                  <div className="GGtg-Btns">
                  <button className="btn-primary-bg">
                    <PlusCircleIcon />
                  Add Note
                </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Access Log Panel */}
        <AnimatePresence>
          {showAccessLog && (
            <motion.div
              ref={detailPanelRef}
              className="detail-panel custom-scroll-bar"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="detail-header">
                <h2>Access Log</h2>
                <button
                  onClick={() => setShowAccessLog(false)}
                  className="close-button"
                >
                  <XMarkIcon />
                </button>
              </div>
              <div className="Htgs-notes-section">
                <ul>
                    <li>
                        <p>16 April 2024</p>
                        <span>15:47 Mr. Daniel Henry was invited by Tesny Zinny (Care Coordinator)</span>
                    </li>
                    <li>
                        <p>10 April 2024</p>
                        <span>09:22 Jane Doe accessed care notes for review</span>
                    </li>
                    <li>
                        <p>05 April 2024</p>
                        <span>14:15 John Smith was removed from care circle by admin</span>
                    </li>
                    <li>
                        <p>02 April 2024</p>
                        <span>11:30 Emily Brown accepted invitation to join care circle</span>
                    </li>
                    <li>
                        <p>28 March 2024</p>
                        <span>16:08 Mike Wilson viewed emergency contact details</span>
                    </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Success Alert - Adapted from CareTask */}
        <AnimatePresence>
          {successAlert.show && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
              className="global-task-success-alert"
            >
              <div>
                {successAlert.updated
                  ? "Successfully updated:"
                  : "Successfully created:"}{" "}
                <strong>{successAlert.title}</strong>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Modal - Fully Adapted from CareTask Modal Structure */}
        <AnimatePresence>
          {showModal && (
            <>
              <motion.div
                className="add-task-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCancelModal}
              />
              <motion.div
                ref={modalRef}
                className="add-task-panel custom-scroll-bar"
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <div className="TTas-Boxxs">
                  <div className="TTas-Boxxs-Top">
                    <h4>{modalType === 'edit' ? 'Edit Care Circle Member' : 'Create New Care Circle Member'}</h4>
                    <p>
                      {modalType === 'edit' 
                        ? 'Update the details for this care circle member.' 
                        : 'Add a new member to the care circle with access to client\'s care notes.'
                      }
                    </p>
                  </div>
                  <div className="TTas-Boxxs-Body">
                    <form onSubmit={handleSubmitForm} className="add-task-form">
                      <div className="TTtata-Input">
                        <label>Name *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter name"
                          required
                        />
                      </div>
                      <div className="TTtata-Input">
                        <label>Relationship *</label>
                        <input
                          type="text"
                          value={formData.relationship}
                          onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                          placeholder="Enter relationship"
                          required
                        />
                      </div>
                      <div className="TTtata-Input">
                        <label>Emergency Contact *</label>
                        <select
                          value={formData.emergency_contact}
                          onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact: e.target.value }))}
                          required
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div className="TTtata-Input">
                        <label>L.P.A *</label>
                        <select
                          value={formData.lpa}
                          onChange={(e) => setFormData(prev => ({ ...prev, lpa: e.target.value }))}
                          required
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div className="TTtata-Input">
                        <label>Phone *</label>
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter phone number"
                          required
                        />
                      </div>
                      <div className="TTtata-Input">
                        <label>Email *</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter email"
                          required
                        />
                      </div>
                      <div className="TTtata-Input">
                        <label>Notes</label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Enter notes (optional)"
                        />
                      </div>
                      <div className="add-task-actions">
                        <button
                          type="button"
                          className="close-task"
                          onClick={handleCancelModal}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="proceed-tast-btn btn-primary-bg"
                        >
                          {saving ? (
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
                              {modalType === 'edit' ? 'Updating...' : 'Creating...'}
                            </>
                          ) : (
                            modalType === 'edit' ? 'Update' : 'Create'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
export default CareCircle;
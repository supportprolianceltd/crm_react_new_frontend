// CareLog.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  MagnifyingGlassIcon,
  ArrowDownIcon,
  BarsArrowDownIcon,
  CheckIcon,
  EllipsisHorizontalIcon,
  ClockIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
  XMarkIcon,
  FlagIcon,
  PlusCircleIcon,
  PencilIcon,
  ListBulletIcon,
  Squares2X2Icon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import CareerImg1 from "../../../Img/Careers/1.jpg";
import CareerImg2 from "../../../Img/Careers/2.jpg";
import CareerImg3 from "../../../Img/Careers/3.jpg";
import CareerImg4 from "../../../Img/Careers/4.jpg";
import CareerImg5 from "../../../Img/Careers/5.jpg";
import "./CareLog.css"; // Import custom CSS file
const CareLog = () => {
  // Cards data structure
  const cardData = [
    { title: "Total care logs", filter: "all" },
    { title: "Completed Tasks", filter: "completed" },
    { title: "Missed Tasks", filter: "missed" },
    { title: "Flags", filter: "flagged" },
  ];
  // States
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [counts, setCounts] = useState(cardData.map(() => 0));
  const [activeCardId, setActiveCardId] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([
    "completed",
    "missed",
    "flagged",
  ]);
  const [viewMode, setViewMode] = useState("card");
  const dropdownRef = useRef(null);
  const detailPanelRef = useRef(null);
  const modalRef = useRef(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  // Flag modal states (adapted from CareTask)
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState("Client behaviour change");
  const [flagComments, setFlagComments] = useState("");
  const [savingFlag, setSavingFlag] = useState(false);
  const [successAlert, setSuccessAlert] = useState({
    show: false,
    title: "",
    updated: false,
  });
  // Load dummy data on mount
  const loadData = () => {
    const dummyClients = [
      {
        id: 1,
        client_id: "CL001",
        // client_name: "Precious Wen",
        image: CareerImg1,
        status: "completed",
        title: "Assisted with Nutrition",
        assigned_task: "Food and nutrition",
        task: "Food and nutrition",
        date: "12 January 2025",
        time: "4:03am",
        notes:
          "Precious Wen had a breakfast consisting of oatmeal with fruit, toast and a cup of tea. Drank 300ml of water. Appetite improving compared to yesterday.",
        carer_name: "David Kim",
        comment: "Please ensure that she drinks enough fluids",
      },
      {
        id: 2,
        client_id: "CL002",
        // client_name: "Jane Doe",
        image: CareerImg2,
        status: "completed",
        title: "Medication Management",
        assigned_task: "Medication management",
        task: "Medication management",
        date: "10 January 2025",
        time: "2:15pm",
        notes:
          "Administered daily medications as prescribed. Client reported no side effects.",
        carer_name: "Lisa Chen",
        comment: "Monitor for any allergic reactions.",
      },
      {
        id: 3,
        client_id: "CL003",
        // client_name: "John Smith",
        image: CareerImg3,
        status: "missed",
        title: "Daily Exercise",
        assigned_task: "Daily exercise",
        task: "Daily exercise",
        date: "05 November 2025",
        time: "9:45am",
        notes: "Client was unable to participate due to fatigue.",
        carer_name: "Robert Taylor",
        comment: "Reschedule for tomorrow and assess energy levels.",
      },
      {
        id: 4,
        client_id: "CL004",
        // client_name: "Emily Brown",
        image: CareerImg4,
        status: "missed",
        title: "Hygiene Care",
        assigned_task: "Hygiene care",
        task: "Hygiene care",
        date: "03 November 2025",
        time: "1:20pm",
        notes: "Session missed due to scheduling conflict.",
        carer_name: "Maria Garcia",
        comment: "Follow up to reschedule immediately.",
      },
      {
        id: 5,
        client_id: "CL005",
        // client_name: "Mike Wilson",
        image: CareerImg5,
        status: "completed",
        title: "Emotional Support",
        assigned_task: "Emotional support",
        task: "Emotional support",
        date: "01 November 2025",
        time: "6:30pm",
        notes:
          "Discussed recent stressors; client expressed relief after conversation.",
        carer_name: "James Wilson",
        comment: "Continue weekly check-ins.",
      },
    ];
    setClients(dummyClients);
    setFilteredClients(dummyClients);
  };
  useEffect(() => {
    loadData();
  }, []);
  // Toggle active state and select client for details
  const handleCardClick = (client) => {
    if (selectedClient?.id === client.id) {
      setSelectedClient(null);
      setActiveCardId(null);
    } else {
      setSelectedClient(client);
      setActiveCardId(client.id);
    }
  };
  // Handle flag button click
  const handleFlagClick = () => {
    setShowFlagModal(true);
  };
  // Handle flag submission (adapted from CareTask handleSave)
  const handleSubmitFlag = (e) => {
    e.preventDefault();
    if (!flagReason) {
      alert("Please select a Reason for flag");
      return;
    }
    setSavingFlag(true);
    setTimeout(() => {
      console.log("Flag submitted:", {
        reason: flagReason,
        comments: flagComments,
        client: selectedClient,
      });
      setShowFlagModal(false);
      // Reset form
      setFlagReason("Client behaviour change");
      setFlagComments("");
      // Optionally update client status to "flagged"
      setSelectedClient((prev) =>
        prev ? { ...prev, status: "flagged" } : prev
      );
      setSavingFlag(false);
      setSuccessAlert({
        show: true,
        title: "Care Log Entry",
        updated: false,
      });
      setTimeout(
        () => setSuccessAlert({ show: false, title: "", updated: false }),
        2200
      );
    }, 3000);
  };
  const handleCancelFlag = () => {
    setShowFlagModal(false);
  };
  // Compute counts from clients
  useEffect(() => {
    if (!Array.isArray(clients)) {
      console.warn("Clients is not an array:", clients);
      setCounts([0, 0, 0, 0]);
      return;
    }
    const total = clients.length;
    const completed = clients.filter((c) => c.status === "completed").length;
    const missed = clients.filter((c) => c.status === "missed").length;
    const flagged = clients.filter((c) => c.status === "flagged").length;
    console.log(
      `Counts - Total: ${total}, Completed: ${completed}, Missed: ${missed}, Flagged: ${flagged}`
    );
    // Animate card numbers from 0 to target
    const targetValues = [total, completed, missed, flagged];
    const intervals = cardData.map((card, index) => {
      const targetValue = targetValues[index];
      const increment = Math.ceil(targetValue / 50) || 1;
      let current = 0;
      return setInterval(() => {
        if (current < targetValue) {
          current += increment;
          setCounts((prev) => {
            const newCounts = [...prev];
            newCounts[index] = Math.min(current, targetValue);
            return newCounts;
          });
        } else {
          clearInterval(intervals[index]);
        }
      }, 20);
    });
    return () => intervals.forEach((i) => clearInterval(i));
  }, [clients]);
  // Apply filters + search
  useEffect(() => {
    if (!Array.isArray(clients)) {
      setFilteredClients([]);
      return;
    }
    let data = [...clients];
    // Apply status filters
    if (selectedFilters.length > 0) {
      data = data.filter((row) => selectedFilters.includes(row.status));
    } else {
      data = [...clients]; // Show all if no filters selected
    }
    // Apply search
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      data = data.filter(
        (row) =>
          (row.client_id && row.client_id.toLowerCase().includes(query)) ||
          (row.client_name && row.client_name.toLowerCase().includes(query)) ||
          (row.assigned_task &&
            row.assigned_task.toString().toLowerCase().includes(query)) ||
          (row.status && row.status.toLowerCase().includes(query))
      );
    }
    console.log(`Filtered data: ${data.length} items after filters and search`);
    setFilteredClients(data);
  }, [selectedFilters, searchQuery, clients]);
  const handleTopCardClick = (filter) => {
    if (filter === "all") {
      setSelectedFilters(["completed", "missed", "flagged"]);
    } else {
      setSelectedFilters([filter]);
    }
  };
  const toggleFilter = (filter) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };
  const handleSortByStatus = () => {
    const sorted = [...filteredClients].sort((a, b) => {
      const statusA = a.status || "";
      const statusB = b.status || "";
      return sortOrder === "asc"
        ? statusA.localeCompare(statusB)
        : statusB.localeCompare(statusA);
    });
    setFilteredClients(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
  // Hide dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  // Close detail panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        selectedClient &&
        detailPanelRef.current &&
        !detailPanelRef.current.contains(event.target) &&
        (!showFlagModal ||
          !modalRef.current ||
          !modalRef.current.contains(event.target))
      ) {
        setSelectedClient(null);
        setActiveCardId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedClient, showFlagModal]);
  // Get initials
  const getInitials = (name) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };
  // Get status display
  const getStatusDisplay = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  // Get date time display
  const getDateTimeDisplay = (client) => {
    return `${client.date} at ${client.time}`;
  };
  // Handle table row actions
  const handleViewDetails = (client) => {
    setOpenMenuIndex(null);
    handleCardClick(client);
  };
  const handleFlagFromTable = (client) => {
    setOpenMenuIndex(null);
    setSelectedClient(client);
    handleFlagClick();
  };
  // Hide dropdowns when clicking outside for table actions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !event.target.closest(".actions-dropdown")
      ) {
        setShowFilterDropdown(false);
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
        <div className="oIK-Btns">
          <button className="LLl-BBtn-ACCt">
            <ArrowDownTrayIcon />
            Download Care Log
          </button>
        </div>
        {/* Cards */}
        <div className="ooilaui-Cards">
          {cardData.map((card, i) => (
            <div
              key={i}
              className="ooilaui-Card Simp-Boxshadow"
              onClick={() => handleTopCardClick(card.filter)}
              style={{ cursor: "pointer" }}
            >
              <h4>{card.title}</h4>
              <h3>{counts[i]}</h3>
            </div>
          ))}
        </div>
        <div className="PPOl-COnt">
          <div className="PPOlaj-SSde-TopSSUB NoAbsuls">
            {/* Search */}
            <div className="oIK-Search">
              <span>
                <MagnifyingGlassIcon />
              </span>
              <input
                type="text"
                placeholder="Search by Carer, Task, Status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Sort + Filter */}
            <div className="oIK-Btns">
              <div className="dropdown-container">
                <button onClick={handleSortByStatus}>
                  Sort by:{" "}
                  <span>
                    Status
                    <ArrowDownIcon
                      style={{
                        transform:
                          sortOrder === "desc"
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    />
                  </span>
                </button>
              </div>
              {/* Filter Dropdown */}
              <div className="Gtbs-OOls">
                <div
                  className="dropdown-container"
                  style={{ position: "relative" }}
                  ref={dropdownRef}
                >
                  <button
                    className="LLl-BBtn-ACCt"
                    onClick={() => setShowFilterDropdown((prev) => !prev)}
                  >
                    Filters <BarsArrowDownIcon />
                  </button>
                  {showFilterDropdown && (
                    <motion.ul
                      className="dropdown-menu"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {["completed", "missed", "flagged"].map((filter) => (
                        <li
                          key={filter}
                          className="dropdown-item"
                          onClick={() => toggleFilter(filter)}
                        >
                          <span>{getStatusDisplay(filter)}</span>
                          {selectedFilters.includes(filter) && (
                            <CheckIcon className="check-icon" />
                          )}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </div>
                <button
                  className="LLl-BBtn-ACCt swiTch-Btn btn-primary-bg"
                  title={
                    viewMode === "card" ? "Switch to table" : "Switch to card"
                  }
                  onClick={() =>
                    setViewMode(viewMode === "card" ? "table" : "card")
                  }
                >
                  {viewMode === "card" ? (
                    <ListBulletIcon />
                  ) : (
                    <Squares2X2Icon />
                  )}
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {viewMode === "card" && (
              <motion.div
                key="card-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="Gllad-Sec"
              >
                {filteredClients.length === 0 ? (
                  <p>No results found.</p>
                ) : (
                  filteredClients.map((client, index) => (
                    <motion.div
                      key={client.id}
                      className={`Gllad-Card ${
                        activeCardId === client.id ? "active" : ""
                      }`}
                      onClick={() => handleCardClick(client)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div className="Gths-1">
                        <div className="Gths-11">
                          <img src={client.image} alt={client.client_name} />
                          <h3>{client.carer_name}</h3>
                        </div>
                        <div className="Gths-12">
                          <span className={`GthStatus ${client.status}`}>
                            {client.status.charAt(0).toUpperCase() +
                              client.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="Gths-2">
                        <p>
                          <span>
                            <BriefcaseIcon />
                          </span>
                          {client.task}
                        </p>
                      </div>
                      <div className="Gths-3">
                        <p>
                          <span>
                            <CalendarDaysIcon />
                          </span>
                          {client.date}
                        </p>
                        <p>
                          <span>
                            <ClockIcon />
                          </span>
                          {client.time}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
            {viewMode === "table" && (
              <motion.div
                key="table-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="table-container"
              >
                <table className="KLk-TTabsg" style={{ minWidth: "100%" }}>
                  <thead>
                    <tr>
                      <th>Carer</th>
                      <th>Task</th>
                      <th>Status</th>
                      <th>Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.length > 0 ? (
                      currentRows.map((row, index) => {
                        const isLastRow = index === currentRows.length - 1;
                        const initials = getInitials(row.carer_name);
                        return (
                          <motion.tr
                            key={index}
                            onClick={() => handleCardClick(row)}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="Nhns-TRs"
                          >
                            <td>
                              <div className="HGh-Tabl-Gbs">
                                <div className="HGh-Tabl-Gbs-Tit">
                                  <h3>
                                    <img
                                      src={row.image}
                                      alt={row.carer_name || ""}
                                      className="table-avatar initials-placeholder"
                                    />
                                    <span className="Cree-Name">
                                      <span>{row.carer_name || ""}</span>
                                    </span>
                                  </h3>
                                </div>
                              </div>
                            </td>
                            <td>{row.title}</td>
                            <td>
                              <span className={`GthStatus ${row.status}`}>
                                {getStatusDisplay(row.status)}
                              </span>
                            </td>
                            <td>{getDateTimeDisplay(row)}</td>
                          </motion.tr>
                        );
                      })
                    ) : (
                      <tr className="monn-Ntga">
                        <td
                          colSpan={4}
                          style={{ textAlign: "center", padding: "2rem" }}
                        >
                          {clients.length === 0
                            ? "No care logs added yet."
                            : "No matching care logs found."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Sliding Detail Panel */}
        <AnimatePresence>
          {selectedClient && (
            <motion.div
              ref={detailPanelRef}
              className="detail-panel custom-scroll-bar"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="detail-header">
                <h2>{selectedClient.title}</h2>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="close-button"
                >
                  <XMarkIcon />
                </button>
              </div>
              <div className="client-info">
                <h3 className="client-name">{selectedClient.client_name}</h3>
                <div className="client-meta">
                  <p>
                    <span>
                      <CalendarDaysIcon />
                    </span>
                    {selectedClient.date}
                  </p>
                  <p>
                    <span>
                      <ClockIcon />
                    </span>
                    {selectedClient.time}
                  </p>
                </div>
              </div>
              <div className="notes-section">
                <h4>Notes</h4>
                <p className="notes-text">{selectedClient.notes}</p>
                <div className="GGtg-Btns">
                  <button onClick={handleFlagClick}>
                    <FlagIcon />
                    Flag this
                  </button>
                </div>
              </div>
              <div className="Addd-Comnt-Sec">
                <h3>Comment</h3>
                <textarea
                  name=""
                  id=""
                  placeholder="Type comment here.."
                ></textarea>
                <div className="GGtg-Btns">
                  <button className="btn-primary-bg">
                    <PlusCircleIcon />
                    Add Comment
                  </button>
                </div>
              </div>
              {selectedClient.comment && (
                <div className="comment-section">
                  <div className="comment-header">
                    <img
                      src={CareerImg1}
                      alt={selectedClient.carer_name}
                      className="carer-avatar"
                    />
                    <div className="comment-meta">
                      <span className="comment-author">
                        {selectedClient.carer_name}
                      </span>
                      <span className="comment-time">
                        {selectedClient.time}
                      </span>
                    </div>
                  </div>
                  <p className="comment-text">{selectedClient.comment}</p>
                  <button className="edit-button">
                    <PencilIcon />
                    Edit
                  </button>
                </div>
              )}
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
                  : "Successfully flagged:"}{" "}
                <strong>{successAlert.title}</strong>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Flag Modal - Fully Adapted from CareTask Modal Structure */}
        <AnimatePresence>
          {showFlagModal && (
            <>
              <motion.div
                className="add-task-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCancelFlag}
              />
              <motion.div
                ref={modalRef}
                className="add-task-panel"
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <div className="TTas-Boxxs custom-scroll-bar">
                  <div className="TTas-Boxxs-Top">
                    <h4>Flag for Review</h4>
                    <p>
                      Flag this care log entry to ensure it is reviewed by the
                      care coordinator.
                    </p>
                  </div>
                  <div className="TTas-Boxxs-Body">
                    <form onSubmit={handleSubmitFlag} className="add-task-form">
                      <div className="TTtata-Input">
                        <label>Reason for flag *</label>
                        <select
                          value={flagReason}
                          onChange={(e) => setFlagReason(e.target.value)}
                          required
                        >
                          <option value="Client behaviour change">
                            Client behaviour change
                          </option>
                          <option value="Health deterioration">
                            Health deterioration
                          </option>
                          <option value="Medication issue">
                            Medication issue
                          </option>
                          <option value="Scheduling conflict">
                            Scheduling conflict
                          </option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="TTtata-Input">
                        <label>Comments</label>
                        <textarea
                          value={flagComments}
                          onChange={(e) => setFlagComments(e.target.value)}
                          placeholder="Provide additional details about the flag..."
                        />
                      </div>
                      <div className="add-task-actions">
                        <button
                          type="button"
                          className="close-task"
                          onClick={handleCancelFlag}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="proceed-tast-btn btn-primary-bg"
                        >
                          {savingFlag ? (
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
                              Flagging...
                            </>
                          ) : (
                            "Flag"
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
export default CareLog;

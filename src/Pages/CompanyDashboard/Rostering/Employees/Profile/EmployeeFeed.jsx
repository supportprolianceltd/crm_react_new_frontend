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
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

import CareerImg1 from "../../Img/Careers/1.jpg";
import CareerImg2 from "../../Img/Careers/2.jpg";
import CareerImg3 from "../../Img/Careers/3.jpg";
import CareerImg4 from "../../Img/Careers/4.jpg";
import CareerImg5 from "../../Img/Careers/5.jpg";

import "../styles/EmployeeFeed.css"; // Import custom CSS file
import { FileWarningIcon } from "lucide-react";

const EmployeeFeed = () => {
  // Cards data structure
  const cardData = [
    { title: "All Employee Feeds", filter: "all" },
    { title: "Visits", filter: "visit" },
    // { title: "Missed Visits", filter: "missed" },
    { title: "Alerts", filter: "alert" },
  ];
  // States
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [counts, setCounts] = useState(cardData.map(() => 0));
  const [activeCardId, setActiveCardId] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState(["visit", "alert"]);
  const [viewMode, setViewMode] = useState("card");
  const dropdownRef = useRef(null);
  const detailPanelRef = useRef(null);
  const modalRef = useRef(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  // Flag modal states (adapted from CareVisit)
  const [showFlagModal, setShowFlagModal] = useState(false);

  const [successAlert, setSuccessAlert] = useState({
    show: false,
    title: "",
    updated: false,
  });
  // Load dummy data on mount
  const loadData = () => {
    const dummyActivities = [
      {
        id: 1,
        client_id: "CL001",
        client_name: "Precious Wen",
        image: CareerImg1,
        type: "visit",
        status: "completed",
        title: "Assisted with Nutrition",
        assigned_Visit: "Food and nutrition",
        Visit: "Food and nutrition",
        date: "12 January 2025",
        time: "4:03am",
        notes:
          "Precious Wen had a breakfast consisting of oatmeal with fruit, toast and a cup of tea. Drank 300ml of water. Appetite improving compared to yesterday.",
        tasks: [
          {
            id: 1,
            task: "Assist with breakfast preparation",
            risk: "Choking",
            session: "Morning",
            time: "7:45 AM → 8:15 AM",
            frequency: "Once",
            status: "Pending",
            from: "10 Jan 2025",
            until: "11 Jan 2025",
            details:
              "Assist the client in preparing and eating breakfast safely to minimize the risk of choking.",
            note: "completed this task",
          },
          {
            id: 2,
            task: "Administer medication",
            risk: "Medication Safety",
            session: "Morning",
            time: "8:30 AM → 8:45 AM",
            frequency: "Daily",
            status: "Pending",
            from: "10 Jan 2025",
            until: "30 Jun 2025",
            details:
              "Ensure the client takes prescribed medication at the right time following proper dosage and safety checks.",
            note: "completed this task",
          },
          {
            id: 3,
            task: "Assist with mobility exercises",
            risk: "Falls",
            session: "Morning",
            time: "9:00 AM → 9:30 AM",
            frequency: "Twice a week",
            status: "Pending",
            from: "10 Jan 2025",
            until: "30 Mar 2025",
            details:
              "Support the client with light physiotherapy or exercises to improve mobility and reduce the risk of falls.",
            note: "completed this task",
          },
        ],
      },
      {
        id: 2,
        client_id: "CL002",
        client_name: "Jane Doe",
        image: CareerImg2,
        type: "visit",
        status: "completed",
        title: "Medication Management",
        assigned_Visit: "Medication management",
        Visit: "Medication management",
        date: "10 January 2025",
        time: "2:15pm",
        notes:
          "Administered daily medications as prescribed. Client reported no side effects.",
        tasks: [
          {
            id: 1,
            task: "Assist with mobility exercises",
            risk: "Falls",
            session: "Morning",
            time: "9:00 AM → 9:30 AM",
            frequency: "Twice a week",
            status: "Pending",
            from: "10 Jan 2025",
            until: "30 Mar 2025",
            details:
              "Support the client with light physiotherapy or exercises to improve mobility and reduce the risk of falls.",
            note: "completed this task",
          },
          {
            id: 2,
            task: "Check home environment for hazards",
            risk: "Safety",
            session: "Morning",
            time: "10:00 AM → 10:30 AM",
            frequency: "Daily",
            status: "Ongoing",
            from: "10 Jan 2025",
            until: "30 Jun 2025",
            details:
              "Inspect the client's home for potential hazards such as loose rugs or wet floors to ensure a safe environment.",
            note: "completed this task",
          },
        ],
      },
      {
        id: 3,
        client_id: "CL005",
        client_name: "Jack Daniels",
        image: CareerImg5,
        type: "alert",
        status: "Forced Clock In",
        assigned_Visit: "Emotional support",
        Visit: "Emotional support",
        date: "10 November 2025",
        time: "6:30pm",
        note: "Forced clocked in due to low battery as client house was without electricity",
      },
      {
        id: 4,
        client_id: "CL003",
        client_name: "John Smith",
        image: CareerImg3,
        type: "visit",
        status: "completed",
        title: "Daily Exercise",
        assigned_Visit: "Daily exercise",
        Visit: "Daily exercise",
        date: "05 November 2025",
        time: "9:45am",
        notes: "Client was unable to participate due to fatigue.",
        tasks: [
          {
            id: 1,
            task: "Administer medication",
            risk: "Medication Safety",
            session: "Morning",
            time: "8:30 AM → 8:45 AM",
            frequency: "Daily",
            status: "Pending",
            from: "10 Jan 2025",
            until: "30 Jun 2025",
            details:
              "Ensure the client takes prescribed medication at the right time following proper dosage and safety checks.",
            note: "completed this task",
          },
        ],
      },
      {
        id: 5,
        client_id: "CL004",
        client_name: "Emily Brown",
        image: CareerImg4,
        type: "visit",
        status: "missed",
        title: "Hygiene Care",
        assigned_Visit: "Hygiene care",
        Visit: "Hygiene care",
        date: "03 November 2025",
        time: "1:20pm",
        notes: "Session missed due to scheduling conflict.",
        tasks: [
          {
            id: 1,
            task: "Administer medication",
            risk: "Medication Safety",
            session: "Morning",
            time: "8:30 AM → 8:45 AM",
            frequency: "Daily",
            status: "Pending",
            from: "10 Jan 2025",
            until: "30 Jun 2025",
            details:
              "Ensure the client takes prescribed medication at the right time following proper dosage and safety checks.",
            note: "completed this task",
          },
          {
            id: 2,
            task: "Assist with mobility exercises",
            risk: "Falls",
            session: "Morning",
            time: "9:00 AM → 9:30 AM",
            frequency: "Twice a week",
            status: "Pending",
            from: "10 Jan 2025",
            until: "30 Mar 2025",
            details:
              "Support the client with light physiotherapy or exercises to improve mobility and reduce the risk of falls.",
            note: "completed this task",
          },
          {
            id: 3,
            task: "Check home environment for hazards",
            risk: "Safety",
            session: "Morning",
            time: "10:00 AM → 10:30 AM",
            frequency: "Daily",
            status: "Ongoing",
            from: "10 Jan 2025",
            until: "30 Jun 2025",
            details:
              "Inspect the client's home for potential hazards such as loose rugs or wet floors to ensure a safe environment.",
            note: "completed this task",
          },
        ],
      },
      {
        id: 6,
        client_id: "CL005",
        client_name: "Mike Wilson",
        image: CareerImg5,
        type: "visit",
        status: "completed",
        title: "Emotional Support",
        assigned_Visit: "Emotional support",
        Visit: "Emotional support",
        date: "01 November 2025",
        time: "6:30pm",
        notes:
          "Discussed recent stressors; client expressed relief after conversation.",
        tasks: [
          {
            id: 1,
            task: "Assist to have a strip wash",
            risk: "Falls",
            session: "Morning",
            time: "7:00 AM → 7:30 AM",
            frequency: "Once",
            status: "Pending",
            from: "10 Jan 2025",
            until: "10 Jan 2025",
            details:
              "Help the client with a morning strip wash ensuring privacy, comfort, and safety at all times.",
            note: "completed this task",
          },
          {
            id: 2,
            task: "Assist with breakfast preparation",
            risk: "Choking",
            session: "Morning",
            time: "7:45 AM → 8:15 AM",
            frequency: "Once",
            status: "Pending",
            from: "10 Jan 2025",
            until: "11 Jan 2025",
            details:
              "Assist the client in preparing and eating breakfast safely to minimize the risk of choking.",
            note: "completed this task",
          },
          {
            id: 3,
            task: "Administer medication",
            risk: "Medication Safety",
            session: "Morning",
            time: "8:30 AM → 8:45 AM",
            frequency: "Daily",
            status: "Pending",
            from: "10 Jan 2025",
            until: "30 Jun 2025",
            details:
              "Ensure the client takes prescribed medication at the right time following proper dosage and safety checks.",
            note: "completed this task",
          },
        ],
      },
      {
        id: 7,
        client_id: "CL005",
        client_name: "Mathew Daniels",
        image: CareerImg5,
        type: "alert",
        status: "Early Clock Out",
        assigned_Visit: "Emotional support",
        Visit: "Emotional support",
        date: "10 November 2025",
        time: "6:30pm",
        note: "Early clock out was because I finished the task early",
      },
    ];
    setClients(dummyActivities);
    setFilteredClients(dummyActivities);
    setTasks(dummyActivities.tasks);
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

  const [selectedTask, setSelectedTask] = useState(null);

  // Compute counts from clients
  useEffect(() => {
    if (!Array.isArray(clients)) {
      console.warn("Clients is not an array:", clients);
      setCounts([0, 0, 0, 0]);
      return;
    }

    const total = clients.length;
    const visits = clients.filter((c) => c.type === "visit").length;
    const alert = clients.filter((c) => c.type === "alert").length;

    const completed = clients.filter((c) => c.status === "completed").length;
    const missed = clients.filter((c) => c.status === "missed").length;

    // console.log(
    //   `Counts - Total: ${total}, Completed: ${completed}, Missed: ${missed}, Alert: ${alert}`
    // );
    // Animate card numbers from 0 to target
    const targetValues = [total, visits, alert];
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
      data = data.filter((row) => selectedFilters.includes(row.type));
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
          (row.assigned_Visit &&
            row.assigned_Visit.toString().toLowerCase().includes(query)) ||
          (row.status && row.status.toLowerCase().includes(query))
      );
    }
    console.log(`Filtered data: ${data.length} items after filters and search`);
    setFilteredClients(data);
  }, [selectedFilters, searchQuery, clients]);
  const handleTopCardClick = (filter) => {
    if (filter === "all") {
      setSelectedFilters(["visit", "alert"]);
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
  // Framer Motion animation variants
  const contentVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 10, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="GenReq-Page">
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
                placeholder="Search by Client, Visit, Status..."
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
                className="employee-feed-sec"
              >
                {filteredClients.length === 0 ? (
                  <p>No results found.</p>
                ) : (
                  filteredClients.map((client, index) => (
                    <motion.div
                      key={client.id}
                      className={`employee-feed-Card ${
                        activeCardId === client.id ? "active" : ""
                      }`}
                      onClick={() => handleCardClick(client)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div className="card-top-sec">
                        <div>
                          <span className={`GthStatus ${client.status}`}>
                            {client.type.charAt(0).toUpperCase() +
                              client.type.slice(1)}
                          </span>
                        </div>

                        <div className="card-date">
                          <p>
                            <span>
                              <CalendarDaysIcon />
                            </span>
                            {client.date}
                          </p>
                          <p className="Gths-11">
                            <span>
                              <ClockIcon />
                            </span>
                            {client.time}
                          </p>
                        </div>
                      </div>

                      <div className="Gths-1">
                        <div className="Gths-11">
                          {client.type === "visit" ? (
                            <div className="Gths-11">
                              <img
                                src={client.image}
                                alt={client.client_name}
                              />
                              <h3>{client.client_name}</h3>
                            </div>
                          ) : (
                            <div className="Gths-11">
                              {/* <FileWarningIcon /> */}
                              <ExclamationTriangleIcon width={20} height={20} />
                              <h3>{client.status}</h3>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="Gths-2">
                        {client.type === "visit" ? (
                          <p>
                            <span>
                              <BriefcaseIcon />
                            </span>
                            <p className="feed-note">{client.notes}</p>
                          </p>
                        ) : (
                          <p className="feed-note">
                            {client.status} was recorded for visit with{" "}
                            {client.client_name}{" "}
                          </p>
                        )}
                      </div>

                      <div className="card-status">
                        <p className={`GthStatus ${client.status}`}>
                          <span>
                            {client.status === "completed" ? (
                              <CheckIcon />
                            ) : client.status === "missed" ? (
                              <XMarkIcon />
                            ) : (
                              <FlagIcon />
                            )}
                          </span>
                          {client.status}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
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
              <div className="status-top-main">
                <div className="status-top">
                  <span className={`GthStatus ${selectedClient.status}`}>
                    {selectedClient.type.charAt(0).toUpperCase() +
                      selectedClient.type.slice(1)}
                  </span>{" "}
                  <h2 className="status-stats">
                    {selectedClient.status.charAt(0).toUpperCase() +
                      selectedClient.status.slice(1)}{" "}
                  </h2>
                </div>
                {/* <div className="oIK-Btns">
                  <button className="LLl-BBtn-ACCt">
                    <ArrowDownTrayIcon />
                    Download Care Log
                  </button>
                </div> */}
              </div>
              <br />
              <div className="detail-header">
                <h2>{selectedClient.assigned_Visit}</h2>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="close-button"
                >
                  <XMarkIcon />
                </button>
              </div>
              <div className="client-info">
                <h3 className="client-name">
                  Client Name: {selectedClient.client_name}
                </h3>
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

              {selectedClient.type === "visit" ? (
                <div>
                  <div className="tasks-section">
                    <h4>Tasks List ({selectedClient.tasks.length})</h4>
                    <div>
                      <div className="Ggen-BDa custom-scroll-bar">
                        <AnimatePresence mode="wait">
                          {!selectedTask ? (
                            <motion.div
                              key="task-list"
                              variants={contentVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                            >
                              <div className="task-table-header">
                                <span></span>
                                <span>Task</span>
                                <span>Risk Category</span>
                                <span>Sessions</span>
                                <span>Frequency</span>
                              </div>

                              <ul className="task-table">
                                {Array.isArray(selectedClient.tasks) &&
                                selectedClient.tasks.length > 0 ? (
                                  selectedClient.tasks.map((task) => (
                                    <li
                                      key={task.id}
                                      // onClick={() => handleTaskClick(task)}
                                      style={{ cursor: "pointer" }}
                                    >
                                      <span>
                                        <input
                                          type="checkbox"
                                          checked={
                                            selectedClient?.status ===
                                            "completed"
                                          }
                                          readOnly
                                        />
                                      </span>
                                      <span>{task.task}</span>
                                      <span>
                                        <span>{task.risk}</span>
                                      </span>
                                      <span>
                                        {task.session} <b>{task.time}</b>
                                      </span>
                                      <span>{task.frequency}</span>
                                      {/* <span>{task.status}</span> */}

                                      <div className="task-note-section">
                                        <h4>Task Note</h4>
                                        <p className="note-text">
                                          {task.notes}
                                        </p>
                                      </div>
                                    </li>
                                  ))
                                ) : (
                                  <li style={{ padding: "1rem" }}>
                                    <p>No tasks available for this visit</p>
                                  </li>
                                )}
                              </ul>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="task-details"
                              className="HyaTask-Details"
                              variants={contentVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                            >
                              <button
                                className="OO-BackBtn"
                                onClick={handleBack}
                              >
                                <ArrowLeftIcon /> Back
                              </button>

                              <div className="Gthstg-Top">
                                <h2>{selectedTask.task}</h2>
                                <label>
                                  <input
                                    type="checkbox"
                                    checked={
                                      selectedTask.status === "Completed"
                                    }
                                    onChange={() =>
                                      handleCompleteToggle(selectedTask.id)
                                    }
                                  />
                                  Complete
                                </label>
                              </div>

                              <div className="Gthstg-Bddy">
                                <p>
                                  <b>Risk Category:</b>{" "}
                                  <span>{selectedTask.risk}</span>
                                </p>
                                <p>
                                  <b>Session:</b>{" "}
                                  <span>
                                    {selectedTask.session} ({selectedTask.time})
                                  </span>
                                </p>
                                <p>
                                  <b>Frequency:</b>{" "}
                                  <span>{selectedTask.frequency}</span>
                                </p>
                                <p>
                                  <b>From → Until:</b>{" "}
                                  <span>
                                    {selectedTask.from} → {selectedTask.until}
                                  </span>
                                </p>
                                <p>
                                  <b>Status:</b>{" "}
                                  <span>
                                    <span
                                      className={`GthStatus ${
                                        selectedTask.status === "Completed"
                                          ? "completed"
                                          : selectedTask.status === "Pending"
                                          ? "pending"
                                          : "ongoing"
                                      }`}
                                    >
                                      {selectedTask.status}
                                    </span>
                                  </span>
                                </p>

                                <p>
                                  <b>Description:</b>{" "}
                                  <span>{selectedTask.details}</span>
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                  <div className="visit-note-section">
                    <h4>Visit Note</h4>
                    <p className="visit-note-text">{selectedClient.notes}</p>
                    <div className="GGtg-Btns"></div>
                  </div>
                </div>
              ) : (
                <div className="visit-note-section">
                  <h4>Note</h4>
                  <p className="visit-note-text">{selectedClient.note}</p>
                  <div className="GGtg-Btns"></div>
                </div>
              )}

              <div className="Addd-Comnt-Sec">
                <h3>Add Comment</h3>
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
            </motion.div>
          )}
        </AnimatePresence>
        {/* Success Alert - Adapted from CareVisit */}
        <AnimatePresence>
          {successAlert.show && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
              className="global-Visit-success-alert"
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
      </div>
    </motion.div>
  );
};

export default EmployeeFeed;

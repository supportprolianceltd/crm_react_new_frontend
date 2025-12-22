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

import "./CareLogs.css"; // Import custom CSS file
import { FileWarningIcon } from "lucide-react";

const CareLogs = () => {
  const cardData = [
    { title: "All Visits", filter: "all" },
    { title: "Completed Visits", filter: "completed" },
    { title: "In Progress", filter: "in progress" },
    { title: "Missed Visits", filter: "missed" },
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

  const [activeTab, setActiveTab] = useState("visits");
  const [visitTab, setVisitTab] = useState("visit1");
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    setSelectedTask(null);
  };

  const handleVisitClick = (visitTab) => {
    setVisitTab(visitTab);
    setSelectedTask(null);
  };

  // Load dummy data on mount
  const loadData = () => {
    const dummyActivities = [
      {
        id: 1,
        client_id: "CL001",
        client_name: "Precious Wen",
        carer_name: "Pamela Chiamaka",
        image: CareerImg1,
        type: "visit",
        status: "completed",
        alert: {
          type: "forced clock in",
          note: "Forced clocked in due to low battery as client house was without electricity",
        },
        title: "Assisted with Nutrition",
        assigned_Visit: "Food and nutrition",
        visit: "Food and nutrition",
        dates: {
          date1: "12 Nov 2025",
          date2: "14 Nov 2025",
          date3: "16 Nov 2025",
          date4: "18 Nov 2025",
        },
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
        client_name: "Benjamin Franklin",
        carer_name: "Ibroma Ebuka",
        image: CareerImg1,
        type: "visit",
        status: "in progress",
        alert: {
          type: "forced clock in",
          note: "Forced clocked in due to low battery as client house was without electricity",
        },
        title: "Assisted with Nutrition",
        assigned_Visit: "Food and nutrition",
        visit: "Food and nutrition",
        dates: {
          date1: "12 Nov 2025",
          date2: "14 Nov 2025",
          date3: "16 Nov 2025",
          date4: "18 Nov 2025",
        },
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
        id: 3,
        client_id: "CL003",
        client_name: "Jane Doe",
        carer_name: "Pamela Chiamaka",
        image: CareerImg2,
        type: "visit",
        status: "completed",
        alert: {
          type: "forced clock in",
          note: "Forced clocked in due to low battery as client house was without electricity",
        },
        title: "Medication Management",
        assigned_Visit: "Medication management",
        visit: "Medication management",
        dates: {
          date1: "12 Nov 2025",
          date2: "14 Nov 2025",
          date3: "16 Nov 2025",
          date4: "18 Nov 2025",
        },
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
        id: 4,
        client_id: "CL004",
        client_name: "John Smith",
        carer_name: "Jay Emmanuel",
        image: CareerImg3,
        type: "visit",
        status: "in progress",
        alert: {
          type: "forced clock in",
          note: "Forced clocked in due to low battery as client house was without electricity",
        },
        title: "Daily Exercise",
        assigned_Visit: "Daily exercise",
        visit: "Daily exercise",
        dates: {
          date1: "12 Nov 2025",
          date2: "14 Nov 2025",
          date3: "16 Nov 2025",
          date4: "18 Nov 2025",
        },
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
        client_id: "CL005",
        client_name: "Emily Brown",
        carer_name: "Pamela Chiamaka",
        image: CareerImg4,
        type: "visit",
        status: "missed",
        alert: {
          type: "forced clock in",
          note: "Forced clocked in due to low battery as client house was without electricity",
        },
        title: "Hygiene Care",
        assigned_Visit: "Hygiene care",
        visit: "Hygiene care",
        dates: {
          date1: "12 Nov 2025",
          date2: "14 Nov 2025",
          date3: "16 Nov 2025",
          date4: "18 Nov 2025",
        },
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
    // const visits = clients.filter((c) => c.type === "visit").length;
    // const alert = clients.filter((c) => c.type === "alert").length;

    const inProgress = clients.filter((c) => c.status === "in progress").length;
    const completed = clients.filter((c) => c.status === "completed").length;
    const missed = clients.filter((c) => c.status === "missed").length;

    // console.log(
    //   `Counts - Total: ${total}, Completed: ${completed}, Missed: ${missed}, Alert: ${alert}`
    // );
    // Animate card numbers from 0 to target
    const targetValues = [total, completed, inProgress, missed];
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
      setSelectedFilters(["completed", "in progress", "missed"]);
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
      {/* <div className="logs-page"> */}
      <div className="">
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
                placeholder="Search by Client, Carer, Visit, Status..."
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
                      {["completed", "carer", "missed", "in progress"].map(
                        (filter) => (
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
                        )
                      )}
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
                className="log-feed-sec-table"
              >
                <div className="log-head-table">
                  <p>Client ID</p>
                  <p>Client Name</p>
                  <p>Total Visits</p>
                  <p>Completed Visits</p>
                  <p>Missed Visits</p>
                  <p>Tasks Completed</p>
                  <p>Identified Risks</p>
                  {/* <p>Risk Rating</p> */}
                  <p>No. Assigned Carers</p>
                  <p>Care Plan</p>
                </div>
                {filteredClients.length === 0 ? (
                  <p>No results found.</p>
                ) : (
                  filteredClients.map((client, index) => (
                    <motion.div
                      key={client.id}
                      className={`log-feed-Card-table ${
                        activeCardId === client.id ? "active" : ""
                      }`}
                      onClick={() => handleCardClick(client)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div className="log-head-table">
                        <div className="client-log-id">
                          <p>{client.client_id}</p>
                        </div>
                        <div className="log-carer-header-table">
                          <p>{client.client_name}</p>
                        </div>
                        <div className="log-carer-header-table">15</div>
                        <div className="log-carer-header-table">10</div>

                        <div className="log-desc-table">5</div>
                        <div className="log-desc-table">25</div>
                        <div className="log-desc-table">chocking, fall</div>
                        {/* <div className="log-desc-table">High</div> */}
                        <div className="log-desc-table">6</div>
                        <div className="log-desc-table">Completed 7-11-25</div>
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
              className="care-detail-panel custom-scroll-bar"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="status-top-main">
                <div className="log-client-header">
                  <img
                    src={selectedClient.image}
                    alt={selectedClient.client_name}
                  />
                  <div>
                    <h3>{selectedClient.client_name}</h3>
                    {/* <div className="log-carer-header">
                      Visit by: {selectedClient.carer_name}
                    </div> */}
                  </div>
                </div>

                <div className="oIK-Btns">
                  <button className="LLl-BBtn-ACCt">
                    <ArrowDownTrayIcon />
                    Download Care Log
                  </button>
                </div>
              </div>
              <div className="log-client-meta">
                Date onboarded
                <p>
                  <span>
                    <CalendarDaysIcon />
                  </span>
                  {selectedClient.dates.date1}
                </p>
                <p>
                  <span>
                    <ClockIcon />
                  </span>
                  {selectedClient.time}
                </p>
              </div>

              {/* <p className={`GthStatus ${selectedClient.status}`}>
                {selectedClient.status}
              </p> */}
              {/* <div className="detail-header">
                <h2>{selectedClient.assigned_Visit}</h2>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="close-button"
                >
                  <XMarkIcon />
                </button>
              </div> */}

              <div className="care-log-tabs">
                <p
                  className={activeTab === "visits" ? "active" : ""}
                  onClick={() => handleTabClick("visits")}
                >
                  Visits
                </p>
                <p
                  className={activeTab === "care-info" ? "active" : ""}
                  onClick={() => handleTabClick("care-info")}
                >
                  Care Info
                </p>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "visits" && (
                  <motion.div
                    key="visits"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="details-section"
                  >
                    <div className="visits-content">
                      <span>
                        Showing visits from October 15 - December 10th 2025
                      </span>

                      <div className="visit-details">
                        <div className="visit-log-tabs">
                          <div
                            className={visitTab === "visit1" ? "active" : ""}
                            onClick={() => handleVisitClick("visit1")}
                          >
                            <p>{selectedClient.dates.date1}</p>
                            <p> {selectedClient.time}</p>
                          </div>
                          <div
                            className={visitTab === "visit2" ? "active" : ""}
                            onClick={() => handleVisitClick("visit2")}
                          >
                            <p>{selectedClient.dates.date1}</p>
                            <p> {selectedClient.time}</p>
                          </div>

                          <div
                            className={visitTab === "visit3" ? "active" : ""}
                            onClick={() => handleVisitClick("visit3")}
                          >
                            <p>{selectedClient.dates.date1}</p>
                            <p> {selectedClient.time}</p>
                          </div>
                          <div
                            className={visitTab === "visit4" ? "active" : ""}
                            onClick={() => handleVisitClick("visit4")}
                          >
                            <p>{selectedClient.dates.date1}</p>
                            <p> {selectedClient.time}</p>
                          </div>
                        </div>

                        <div className="visit-info">
                          {visitTab === "visit1" && (
                            <motion.div
                              key="visit1"
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="visit-section visit-status-section">
                                <h4>Visit status:</h4>
                                <p
                                  className={`GthStatus ${selectedClient.status}`}
                                >
                                  {selectedClient.status}
                                </p>
                              </div>
                              <div className="visit-flex">
                                <div className="visit-section">
                                  <h4>Care Type</h4>
                                  <p>Routine</p>
                                </div>

                                <div className="visit-section">
                                  <h4>Carer Name</h4>
                                  <p>{selectedClient.carer_name}</p>
                                </div>
                              </div>

                              <div className="visit-section">
                                <h4>Visit Note By Carer</h4>
                                <p>{selectedClient.notes}</p>
                              </div>

                              <h4>
                                Tasks List ({selectedClient.tasks.length} Tasks
                                on this visit)
                              </h4>

                              <div className="visit-task-section">
                                <div className="tasks-content custom-scroll-bar">
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

                                        <ul className="care-task-table">
                                          {Array.isArray(
                                            selectedClient.tasks
                                          ) &&
                                          selectedClient.tasks.length > 0 ? (
                                            selectedClient.tasks.map((task) => (
                                              <li
                                                key={task.id}
                                                onClick={() =>
                                                  setSelectedTask(task)
                                                }
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
                                                  {task.session}{" "}
                                                  <b>{task.time}</b>
                                                </span>
                                                <span>{task.frequency}</span>

                                                <div className="visit-task-note-section">
                                                  <h4>Task Note</h4>
                                                  <p className="note-text">
                                                    {selectedClient.tasks.notes}{" "}
                                                    note
                                                  </p>
                                                </div>
                                              </li>
                                            ))
                                          ) : (
                                            <li style={{ padding: "1rem" }}>
                                              <p>
                                                No tasks available for this
                                                visit
                                              </p>
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
                                          onClick={() => setSelectedTask(null)}
                                        >
                                          ← Back
                                        </button>

                                        <div className="Gthstg-Top">
                                          <h2>{selectedTask.task}</h2>
                                          <label>
                                            <input
                                              type="checkbox"
                                              checked={
                                                selectedTask.status ===
                                                "Completed"
                                              }
                                              readOnly
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
                                              {selectedTask.session} (
                                              {selectedTask.time})
                                            </span>
                                          </p>
                                          <p>
                                            <b>Frequency:</b>{" "}
                                            <span>
                                              {selectedTask.frequency}
                                            </span>
                                          </p>
                                          <p>
                                            <b>From → Until:</b>{" "}
                                            <span>
                                              {selectedTask.from} →{" "}
                                              {selectedTask.until}
                                            </span>
                                          </p>
                                          <p>
                                            <b>Status:</b>{" "}
                                            <span>
                                              <span
                                                className={`GthStatus ${
                                                  selectedTask.status ===
                                                  "Completed"
                                                    ? "completed"
                                                    : selectedTask.status ===
                                                      "Pending"
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
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "care-info" && (
                  <motion.div
                    key="care-info"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="care-info-section"
                  >
                    <h4>Total Carers Assigned "5"</h4>
                    <p></p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CareLogs;

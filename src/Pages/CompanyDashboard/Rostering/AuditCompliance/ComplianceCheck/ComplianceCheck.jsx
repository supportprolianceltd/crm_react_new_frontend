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

import "./ComplianceCheck.css"; // Import custom CSS file
import { FileWarningIcon, Table } from "lucide-react";

const ComplianceCheck = () => {
  const cardData = [
    { title: "All Visits", filter: "all" },
    { title: "Completed Visits", filter: "completed" },
    { title: "In Progress", filter: "in-progress" },
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

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
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
        client_name: "Benjamin Franklin",
        carer_name: "Ibroma Ebuka",
        image: CareerImg1,
        type: "visit",
        status: "in-progress",
        alert: {
          type: "forced clock in",
          note: "Forced clocked in due to low battery as client house was without electricity",
        },
        title: "Assisted with Nutrition",
        assigned_Visit: "Food and nutrition",
        visit: "Food and nutrition",
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
        id: 4,
        client_id: "CL004",
        client_name: "John Smith",
        carer_name: "Jay Emmanuel",
        image: CareerImg3,
        type: "visit",
        status: "in-progress",
        alert: {
          type: "forced clock in",
          note: "Forced clocked in due to low battery as client house was without electricity",
        },
        title: "Daily Exercise",
        assigned_Visit: "Daily exercise",
        visit: "Daily exercise",
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
        client_id: "CL006",
        client_name: "Mike Wilson",
        carer_name: "Pamela Chiamaka",
        image: CareerImg5,
        type: "visit",
        status: "completed",
        alert: {
          type: "forced clock in",
          note: "Forced clocked in due to low battery as client house was without electricity",
        },
        title: "Emotional Support",
        assigned_Visit: "Emotional support",
        visit: "Emotional support",
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

    const inProgress = clients.filter((c) => c.status === "in-progress").length;
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
      setSelectedFilters(["completed", "in-progress", "missed"]);
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
        <div></div>

        <div className="PPOl-COnt">
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
                <div className="compliance-head-table">
                  <p>Client ID</p>
                  <p>Client Name</p>

                  <p>Contract Start Date</p>
                  <p>Contract End Date</p>
                  <p>Cluster</p>
                  <p>Care Compliance %</p>
                  <p>Total Nonconformities Recorded </p>
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
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05,
                      }}
                    >
                      <div className="compliance-head-table">
                        <div className="client-log-id">
                          <p>{client.client_id}</p>
                        </div>
                        <div className="log-carer-header-table">
                          <p>{client.client_name}</p>
                        </div>

                        <div className="log-desc-table">11-12-2025</div>
                        <div className="log-desc-table">10-05-2026</div>

                        <div className="log-desc-table">
                          Aggrey Road Cluster
                        </div>
                        <div className="log-desc-table">70%</div>
                        <div className="log-desc-table">10</div>
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
              <br />
              <div className="log-client-header">
                <p></p>
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
              <br /> <br />
              <div>
                <p>
                  {selectedClient.client_name} currently has a 70% compliance
                  status
                </p>
              </div>
              <br />
              <table className="">
                <tr>
                  <th>Client ID</th>
                  <th>Quality Parameter</th>
                  <th>Compliance (Yes/No)</th>
                  <th>Reference</th>
                  <th>Notes/ Remarks</th>
                </tr>

                <tr>
                  <td>{selectedClient.id}</td>
                  <td>Client Information complete and up-to date?</td>
                  <td>Yes</td>
                  <td>null</td>
                  <td>null</td>
                </tr>
                <tr>
                  <td>{selectedClient.client_id}</td>
                  <td>
                    Resident and Address details completed and up-to date?
                  </td>
                  <td>Yes</td>
                  <td>null</td>
                  <td>null</td>
                </tr>
                <tr>
                  <td>{selectedClient.client_id}</td>
                  <td>Care assessment completed and approved?</td>
                  <td>Yes</td>
                  <td>null</td>
                  <td>null</td>
                </tr>
                <tr>
                  <td>{selectedClient.client_id}</td>
                  <td>
                    Person centered care plan developed based on assessment
                    needs?
                  </td>
                  <td>Yes</td>
                  <td>null</td>
                  <td>null</td>
                </tr>
                <tr>
                  <td>{selectedClient.client_id}</td>
                  <td>Care Plan Approved by Authorised person? </td>
                  <td>Yes</td>
                  <td>null</td>
                  <td>null</td>
                </tr>
                <tr>
                  <td>{selectedClient.client_id}</td>
                  <td>Contractual Agreed Care time documented? </td>
                  <td>Yes</td>
                  <td>null</td>
                  <td>null</td>
                </tr>
                <tr>
                  <td>{selectedClient.client_id}</td>
                  <td>
                    Clients specific Emergency response process identified?{" "}
                  </td>
                  <td>Yes</td>
                  <td>null</td>
                  <td>null</td>
                </tr>
                <tr>
                  <td>{selectedClient.client_id}</td>
                  <td>Medical Equipment needs identified? </td>
                  <td>Yes</td>
                  <td>null</td>
                  <td>null</td>
                </tr>
                <tr>
                  <td>{selectedClient.client_id}</td>
                  <td>Medications schedule available and up-to date? </td>
                  <td>Yes</td>
                  <td>null</td>
                  <td>null</td>
                </tr>
                <tr>
                  <td>{selectedClient.client_id}</td>
                  <td>
                    Medication Administration Records/chart monitored and up-to
                    date?{" "}
                  </td>
                  <td>Yes</td>
                  <td>null</td>
                  <td>null</td>
                </tr>

                <tr>
                  <td>{selectedClient.client_id}</td>
                  <td>
                    Other medical personal information (Allergies, GP/Primary
                    Doctor and Medicine support declaration documented)?{" "}
                  </td>
                  <td>Yes</td>
                  <td>null</td>
                  <td>null</td>
                </tr>
                <tr>
                  <td>{selectedClient.client_id}</td>
                  <td>Contract Duration identified and followed? </td>
                  <td>Yes</td>
                  <td>null</td>
                  <td>null</td>
                </tr>
                <tr>
                  <td>{selectedClient.client_id}</td>
                  <td>Care type Identified?</td>
                  <td>Yes</td>
                  <td>null</td>
                  <td>null</td>
                </tr>
                <tr>
                  <td>{selectedClient.client_id}</td>
                  <td>
                    Legal requirements (Power of Attorney/Legal Guardian)
                    followed?{" "}
                  </td>
                  <td>Yes</td>
                  <td>null</td>
                  <td>null</td>
                </tr>
                <tr>
                  <td>{selectedClient.client_id}</td>
                  <td>Consents and Permissions, rights and</td>
                  <td>Yes</td>
                  <td>null</td>
                  <td>null</td>
                </tr>
                <tr>
                  <td>{selectedClient.client_id}</td>
                  <td>
                    Care cycle identified and communication protocol followed?{" "}
                  </td>
                  <td>Yes</td>
                  <td>null</td>
                  <td>null</td>
                </tr>
                <tr>
                  <td>{selectedClient.client_id}</td>
                  <td>Visits carried out based on agreed time? </td>
                  <td>Yes</td>
                  <td>null</td>
                  <td>null</td>
                </tr>
                <tr>
                  <td>{selectedClient.client_id}</td>
                  <td>Assigned Carer Skills identified based on needs? </td>
                  <td>Yes</td>
                  <td>null</td>
                  <td>null</td>
                </tr>
                <tr>
                  <td>{selectedClient.client_id}</td>
                  <td>
                    Assigned Carer Qualification identified and up-to Date?{" "}
                  </td>
                  <td>Yes</td>
                  <td>null</td>
                  <td>null</td>
                </tr>
                <tr>
                  <td>{selectedClient.client_id}</td>
                  <td>All assigned carer(s) eligible to work? </td>
                  <td>Yes</td>
                  <td>null</td>
                  <td>null</td>
                </tr>
                <tr>
                  <td>{selectedClient.client_id}</td>
                  <td>Only approved carer(s) assigned? </td>
                  <td>Yes</td>
                  <td>null</td>
                  <td>null</td>
                </tr>
                <tr>
                  <td>{selectedClient.client_id}</td>
                  <td>Declined carers identified and blacklisted</td>
                  <td>Yes</td>
                  <td>null</td>
                  <td>null</td>
                </tr>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ComplianceCheck;

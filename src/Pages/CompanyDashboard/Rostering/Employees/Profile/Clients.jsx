// Clients.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  MagnifyingGlassIcon,
  ArrowDownIcon,
  BarsArrowDownIcon,
  CheckIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Clients = () => {
  const navigate = useNavigate();
  // Cards data structure
  const cardData = [
    { title: "Total Clients Visited", filter: "all" },
    { title: "Pending Visits", filter: "pending" },
    { title: "Missed Visits", filter: "missed" },
    // { title: "Declined Clients", filter: "declined" },
  ];

  // Dummy data
  const dummyClients = [
    {
      client_id: "CL-001",
      client_name: "Alice Johnson",
      last_visit_date: "2025-10-28T10:00:00Z",
      assigned_task: 1,
      status: "active",
    },
    {
      client_id: "CL-002",
      client_name: "Bob Smith",
      last_visit_date: "2025-10-25T14:30:00Z",
      assigned_task: 2,
      status: "active",
    },
    {
      client_id: "CL-003",
      client_name: "Carol Davis",
      last_visit_date: "2025-10-20T09:15:00Z",
      assigned_task: 3,
      status: "inactive",
    },
    {
      client_id: "CL-005",
      client_name: "Eve Brown",
      last_visit_date: "2025-10-15T11:20:00Z",
      assigned_task: 5,
      status: "inactive",
    },
    {
      client_id: "CL-006",
      client_name: "Frank Miller",
      last_visit_date: "2025-10-30T08:00:00Z",
      assigned_task: 6,
      status: "active",
    },
    {
      client_id: "CL-008",
      client_name: "Henry Garcia",
      last_visit_date: "2025-10-27T15:30:00Z",
      assigned_task: 8,
      status: "active",
    },
  ];

  // States
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [counts, setCounts] = useState(cardData.map(() => 0));

  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([
    "active",
    "inactive",
    // "declined",
  ]);
  const dropdownRef = useRef(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuIndex, setOpenMenuIndex] = useState(null);

  const getInitials = (name) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDisplayStatus = (status) => {
    if (!status) return "";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Load dummy data on mount
  const loadData = () => {
    setClients(dummyClients);
    setFilteredClients(dummyClients);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute counts from clients
  useEffect(() => {
    if (!Array.isArray(clients)) {
      console.warn("Clients is not an array:", clients);
      setCounts([0, 0, 0, 0]);
      return;
    }

    const total = clients.length;
    const active = clients.filter((c) => c.status === "active").length;
    const inactive = clients.filter((c) => c.status === "inactive").length;
    const declined = clients.filter((c) => c.status === "declined").length;

    console.log(
      `Counts - Total: ${total}, Active: ${active}, Inactive: ${inactive}, Declined: ${declined}`
    );

    setCounts([total, active, inactive, declined]);

    // Animate card numbers
    const intervals = cardData.map((card, index) => {
      const targetValues = [total, active, inactive, declined];
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
      data = [];
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

  const handleCardClick = (filter) => {
    if (filter === "all") {
      setFilteredClients(clients);
      setSelectedFilters(["active", "inactive", "declined"]);
    } else {
      setFilteredClients(clients.filter((row) => row.status === filter));
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

  const handleSortByDeclined = () => {
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

  console.log(currentRows, filteredClients);

  const handleViewTask = (row) => {
    setOpenMenuIndex(null);
    navigate("rostering/profile/care-visits");
    console.log(
      "View task:",
      row.assigned_task,
      "for client:",
      row.client_name
    );
    // Implement view task functionality
  };

  const handleAllowVisit = (row) => {
    setOpenMenuIndex(null);
    console.log("Allow visit for client:", row.client_name);
    // Implement allow visit functionality
  };

  const handleDeclineVisit = (row) => {
    setOpenMenuIndex(null);
    console.log("Decline visit for client:", row.client_name);
    // Implement decline visit functionality
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
              onClick={() => handleCardClick(card.filter)}
              style={{ cursor: "pointer" }}
            >
              <h4>{card.title}</h4>
              <h3>{counts[i]}</h3>
            </div>
          ))}
        </div>

        <div className="PPOl-COnt">
          <div className="PPOlaj-SSde-TopSSUB">
            {/* Search */}
            <div className="oIK-Search">
              <span>
                <MagnifyingGlassIcon />
              </span>
              <input
                type="text"
                placeholder="Search by Client, Visit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Sort + Filter */}
            <div className="oIK-Btns">
              {/* Filter Dropdown */}
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
                    {["active", "inactive"].map((filter) => (
                      <li
                        key={filter}
                        className="dropdown-item"
                        onClick={() => toggleFilter(filter)}
                      >
                        <span>{getDisplayStatus(filter)}</span>
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

          {/* Table */}
          <div
            className="table-container Absoluted-Tbd"
            style={{ paddingBottom: "5rem" }}
          >
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Last Visit Date</th>
                  <th>Assigned Visit</th>
                  <th>Status</th>
                  {/* <th>Action</th> */}
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((row, index) => {
                    const isLastRow = index === currentRows.length - 1;
                    const initials = getInitials(row.client_name);
                    return (
                      <tr key={index}>
                        <td>
                          <div className="HGh-Tabl-Gbs">
                            <div className="HGh-Tabl-Gbs-Tit">
                              <h3>
                                <b className="initials-placeholder">
                                  {initials}
                                </b>
                                <span className="Cree-Name">
                                  <span>{row.client_name || ""}</span>
                                </span>
                              </h3>
                            </div>
                          </div>
                        </td>
                        <td>{formatDate(row.last_visit_date)}</td>
                        <td>{row.assigned_task || ""}</td>

                        <td>
                          <span className={`TD-Status status ${row.status}`}>
                            {getDisplayStatus(row.status)}
                          </span>
                        </td>

                        {/* <td>
                          <div className="relative">
                            <button
                              className="actions-button ff-SVVgs"
                              onClick={() =>
                                setOpenMenuIndex(
                                  openMenuIndex === index ? null : index
                                )
                              }
                            >
                              <EllipsisHorizontalIcon />
                            </button>
                            <AnimatePresence>
                              {openMenuIndex === index && (
                                <motion.div
                                  className={`dropdown-menu ${
                                    isLastRow
                                      ? "last-row-dropdown"
                                      : "not-last-row-dropdown"
                                  } NNo-Spacebbatw`}
                                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                  transition={{ duration: 0.15 }}
                                >
                                  <span
                                    className="dropdown-item"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewTask(row);
                                    }}
                                  >
                                    View Visit
                                  </span>

                                  <span
                                    className="dropdown-item"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAllowVisit(row);
                                    }}
                                  >
                                    Allow Client Visit
                                  </span>
                                  <span
                                    className="dropdown-item last-item"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeclineVisit(row);
                                    }}
                                  >
                                    Decline Client Visit
                                  </span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </td> */}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      {clients.length === 0
                        ? "No clients found"
                        : "No clients match your filters"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Clients;

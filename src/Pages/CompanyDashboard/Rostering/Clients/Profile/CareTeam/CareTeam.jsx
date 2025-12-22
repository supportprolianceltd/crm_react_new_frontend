import React, { useState, useEffect, useRef } from "react";
import {
  MagnifyingGlassIcon,
  ArrowDownIcon,
  BarsArrowDownIcon,
  CheckIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "../../../../../../config";

import CareerImg1 from '../../../Img/Careers/1.jpg';
import CareerImg2 from '../../../Img/Careers/2.jpg';
import CareerImg3 from '../../../Img/Careers/3.jpg';
import CareerImg4 from '../../../Img/Careers/4.jpg';
import CareerImg5 from '../../../Img/Careers/5.jpg';

const CareTeam = ({clientData}) => {
  const clientId = clientData?.id;

  // Cards data structure
  const cardData = [
    { title: "Total Carers", filter: "all" },
    { title: "Active Carers", filter: "active" },
    { title: "Inactive Carers", filter: "inactive" },
    { title: "Declined Carers", filter: "declined" },
  ];

  // States
  const [carers, setCarers] = useState([]);
  const [filteredCarers, setFilteredCarers] = useState([]);
  const [counts, setCounts] = useState(cardData.map(() => 0));

  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([
    "active",
    "inactive",
    "declined",
  ]);
  const dropdownRef = useRef(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuIndex, setOpenMenuIndex] = useState(null);

  const images = [CareerImg1, CareerImg2, CareerImg3, CareerImg4, CareerImg5];

  const getInitials = (name) => {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
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

  const getNumericId = (carerId) => {
    const match = carerId ? carerId.match(/CT-(\d+)$/) : null;
    return parseInt(match ? match[1] : "0", 10);
  };

  // Load carers data on mount
  useEffect(() => {
    if (!clientId) return;

    const fetchCarers = async () => {
      try {
        const response = await apiClient.get(`/api/rostering/careplans/client/${clientId}/carers`);
        const data = response.data;
        if (data.carers && Array.isArray(data.carers)) {
          const transformedCarers = data.carers.map(carer => ({
            carer_id: carer.id,
            carer_name: `${carer.firstName} ${carer.lastName}`,
            last_visit_date: "N/A",
            assigned_task: carer.phone,
            status: "active",
            phone: carer.phone,
          }));
          setCarers(transformedCarers);
          setFilteredCarers(transformedCarers);
        }
      } catch (error) {
        console.error("Error fetching carers:", error);
        setCarers([]);
        setFilteredCarers([]);
      }
    };

    fetchCarers();
  }, [clientId]);

  // Compute counts from carers
  useEffect(() => {
    if (!Array.isArray(carers)) {
      setCounts([0, 0, 0, 0]);
      return;
    }

    const total = carers.length;
    const active = carers.filter((c) => c.status === "active").length;
    const inactive = carers.filter((c) => c.status === "inactive").length;
    const declined = carers.filter((c) => c.status === "declined").length;

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
  }, [carers]);

  // Apply filters + search
  useEffect(() => {
    if (!Array.isArray(carers)) {
      setFilteredCarers([]);
      return;
    }

    let data = [...carers];

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
          (row.carer_id && row.carer_id.toLowerCase().includes(query)) ||
          (row.carer_name && row.carer_name.toLowerCase().includes(query)) ||
          (row.assigned_task && row.assigned_task.toString().toLowerCase().includes(query)) ||
          (row.status && row.status.toLowerCase().includes(query))
      );
    }

    setFilteredCarers(data);
  }, [selectedFilters, searchQuery, carers]);

  const handleCardClick = (filter) => {
    if (filter === "all") {
      setFilteredCarers(carers);
      setSelectedFilters(["active", "inactive", "declined"]);
    } else {
      setFilteredCarers(carers.filter((row) => row.status === filter));
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
    const sorted = [...filteredCarers].sort((a, b) => {
      const statusA = a.status || '';
      const statusB = b.status || '';
      return sortOrder === "asc" ? statusA.localeCompare(statusB) : statusB.localeCompare(statusA);
    });
    setFilteredCarers(sorted);
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

  const currentRows = filteredCarers; // No pagination, show all

  console.log(currentRows, filteredCarers);

  const handleViewTask = (row) => {
    setOpenMenuIndex(null);
    console.log("View task:", row.assigned_task, "for carer:", row.carer_name);
    // Implement view task functionality
  };

  const handleAllowVisit = (row) => {
    setOpenMenuIndex(null);
    console.log("Allow visit for carer:", row.carer_name);
    // Implement allow visit functionality
  };

  const handleDeclineVisit = (row) => {
    setOpenMenuIndex(null);
    console.log("Decline visit for carer:", row.carer_name);
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
                placeholder="Search by Carer, Phone, Status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Sort + Filter */}
            <div className="oIK-Btns">
              <div className="dropdown-container">
                <button onClick={handleSortByDeclined}>
                  Sort by: <span>
                    Declined
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
                    {["active", "inactive", "declined"].map((filter) => (
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
                  <th>Carer</th>
                  <th>Last Visit Date</th>
                  <th>Phone Number</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((row, index) => {
                    const isLastRow = index === currentRows.length - 1;
                    const hasImage = row.assigned_task <= 5;
                    const imageSrc = hasImage ? images[row.assigned_task - 1] : null;
                    const initials = !hasImage ? getInitials(row.carer_name) : null;
                    return (
                      <tr key={index}>
                        <td>
                          <div className='HGh-Tabl-Gbs'>
                            <div className='HGh-Tabl-Gbs-Tit'>
                              <h3>
                                {hasImage ? (
                                  <img src={imageSrc} alt={row.carer_name} />
                                ) : (
                                  <b className="initials-placeholder">{initials}</b>
                                )}
                                <span className='Cree-Name'>
                                  <span>{row.carer_name || ''}</span>
                                </span>
                              </h3>
                            </div>
                          </div>
                        </td>
                        <td>{formatDate(row.last_visit_date)}</td>
                        <td>{row.assigned_task || ''}</td>
                        <td>
                          <span className={`TD-Status status ${row.status}`}>
                            {getDisplayStatus(row.status)}
                          </span>
                        </td>
                        <td>
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
                                      handleViewTask(row);
                                    }}
                                  >
                                    View Task
                                  </span>
                                  <span 
                                    className='dropdown-item'
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAllowVisit(row);
                                    }}
                                  >
                                    Allow Carer to visit
                                  </span>
                                  <span 
                                    className='dropdown-item last-item'
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeclineVisit(row);
                                    }}
                                  >
                                    Decline Carer from visit
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
                  <tr>
                    <td
                      colSpan="5"
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      {carers.length === 0
                        ? "No carers found"
                        : "No carers match your filters"}
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

export default CareTeam;
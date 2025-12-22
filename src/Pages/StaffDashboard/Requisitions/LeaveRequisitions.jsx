// LeaveRequisitions.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowDownIcon,
  BarsArrowDownIcon,
  CheckIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import Pagination from "../../../components/Table/Pagination";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchAllInternalRequestsByUser } from "../../CompanyDashboard/Requests/config/apiConfig";
import { getField, getLastModified } from "../../../utils/helpers";
import LoadingState from "../../../components/LoadingState";
import StatusBadge from "../../../components/StatusBadge";
import TextTooltip from "../../../components/TextTooltip"; // Adjust path as needed
import EditLeaveRequest from "./EditLeaveRequest";
import CancelRequestModal from "./modals/CancelRequestModal";
import DeleteRequestModal from "./modals/DeleteRequestModal";

const LeaveRequisitions = () => {
  const navigate = useNavigate();
  // Cards data structure
  const cardData = [
    { title: "Total Requests", value: 0, filter: "all" },
    { title: "Pending Requests", value: 0, filter: "pending" },
    { title: "Approved Requests", value: 0, filter: "approved" },
    { title: "Declined Requests", value: 0, filter: "rejected" },
    { title: "Cancelled Requests", value: 0, filter: "cancelled" },
  ];

  // States
  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [counts, setCounts] = useState(cardData.map(() => 0));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showCancel, setShowCancel] = useState(false);
  const [selectedCancelRequest, setSelectedCancelRequest] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedDeleteRequest, setSelectedDeleteRequest] = useState(null);

  const rowsPerPage = 10;
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([
    "pending",
    "approved",
    "rejected",
    "cancelled",
  ]);
  const dropdownRef = useRef(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuIndex, setOpenMenuIndex] = useState(null);

  // Tooltip states for remarks
  const [showRemarksTooltip, setShowRemarksTooltip] = useState(false);
  const [remarksTooltipPosition, setRemarksTooltipPosition] = useState({
    x: 0,
    y: 0,
  });
  const [remarksTooltipContent, setRemarksTooltipContent] = useState("");

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const titleCase = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const getDisplayStatus = (status) => {
    if (!status) return "";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getNotes = (row) => {
    return row.description || row.additional_information || "No notes";
  };

  const getRemarks = (row) => {
    return row.comment && row.comment !== "null" ? row.comment : "No remarks";
  };

  const getNumericId = (reqId) => {
    const match = reqId ? reqId.match(/RWQ-(\d+)$/) : null;
    return parseInt(match ? match[1] : "0", 10);
  };

  // Fetch requests on mount
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchAllInternalRequestsByUser();

      if (Array.isArray(data)) {
        const leaveRequests = data.filter((r) => r.request_type === "leave");
        setRequests(leaveRequests);
        setFilteredData(leaveRequests);
      } else {
        setRequests([]);
      }
    } catch (err) {
      setError("Failed to load leave requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute counts from requests
  useEffect(() => {
    if (!Array.isArray(requests)) {
      setCounts([0, 0, 0, 0, 0]);
      return;
    }

    const total = requests.length;
    const pending = requests.filter((r) => r.status === "pending").length;
    const approved = requests.filter((r) => r.status === "approved").length;
    const declined = requests.filter((r) => r.status === "rejected").length;
    const cancelled = requests.filter((r) => r.status === "cancelled").length;

    setCounts([total, pending, approved, declined, cancelled]);

    // Animate card numbers
    const intervals = cardData.map((card, index) => {
      const targetValue = [total, pending, approved, declined, cancelled][
        index
      ];
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
  }, [requests]);

  // Apply filters + search
  useEffect(() => {
    if (!Array.isArray(requests)) {
      setFilteredData([]);
      return;
    }

    let data = [...requests];

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
          (row.request_id && row.request_id.toLowerCase().includes(query)) ||
          (row.description && row.description.toLowerCase().includes(query)) ||
          (row.additional_information &&
            row.additional_information.toLowerCase().includes(query)) ||
          (row.leave_category &&
            row.leave_category.toLowerCase().includes(query)) ||
          (row.address_during_leave &&
            row.address_during_leave.toLowerCase().includes(query)) ||
          (row.contact_phone_number &&
            row.contact_phone_number.toLowerCase().includes(query))
      );
    }

    setFilteredData(data);
    setCurrentPage(1);
  }, [selectedFilters, searchQuery, requests]);

  const handleCardClick = (filter) => {
    setCurrentPage(1);
    if (filter === "all") {
      setFilteredData(requests);
      setSelectedFilters(["pending", "approved", "rejected", "cancelled"]);
    } else {
      setFilteredData(requests.filter((row) => row.status === filter));
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

  const handleSortById = () => {
    const sorted = [...filteredData].sort((a, b) => {
      const idA = getNumericId(a.request_id);
      const idB = getNumericId(b.request_id);
      return sortOrder === "asc" ? idA - idB : idB - idA;
    });
    setFilteredData(sorted);
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

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const currentRows = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleEditRequest = (row) => {
    setOpenMenuIndex(null); // Close any open dropdown before opening edit
    setSelectedRequest(row);
    setShowEdit(true);
  };

  const handleCloseEdit = () => {
    setShowEdit(false);
    setSelectedRequest(null);
    setOpenMenuIndex(null); // Ensure dropdown is closed when returning to list
  };

  const handleUpdateSuccess = () => {
    loadData();
    handleCloseEdit();
  };

  const handleCancelSuccess = () => {
    loadData(); // Refresh the list
    setShowCancel(false);
    setSelectedCancelRequest(null);
  };

  const handleDeleteSuccess = () => {
    loadData(); // Refresh the list
    setShowDelete(false);
    setSelectedDeleteRequest(null);
  };

  const renderRemarksCell = (row) => {
    const remarks = getRemarks(row);
    const isLong = remarks.length > 100; // Adjust threshold as needed
    const handleMouseEnter = (e) => {
      if (isLong) {
        const rect = e.currentTarget.getBoundingClientRect();
        setRemarksTooltipPosition({
          x: rect.right,
          y: rect.top,
        });
        setRemarksTooltipContent(remarks);
        setShowRemarksTooltip(true);
      }
    };
    const handleMouseLeave = () => {
      setShowRemarksTooltip(false);
    };
    return (
      <div
        className="remarks-cell"
        style={{
          maxWidth: "150px",
          overflow: "hidden",
          textOverflow: isLong ? "ellipsis" : "clip",
          whiteSpace: "nowrap",
          cursor: isLong ? "pointer" : "default",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {remarks}
      </div>
    );
  };

  if (loading) {
    return <LoadingState text="Loading Leave Requests" />;
  }

  if (error) {
    return (
      <div className="GenReq-Page">
        <div className="error-container">
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  if (showEdit) {
    return (
      <motion.div
        key="edit-view"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
      >
        <EditLeaveRequest
          request={selectedRequest}
          onClose={handleCloseEdit}
          onUpdate={handleUpdateSuccess}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      key="list-view"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3 }}
    >
      <div className="GenReq-Page">
        <div className="GHGb-MMIn-DDahs-Top New_MainTt_Header">
          <h3>Leave Requests</h3>
          <Link
            to="/staff/new-leave-request"
            className="GenFlt-BTn btn-primary-bg"
          >
            <PlusIcon /> New Request
          </Link>
        </div>

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
                placeholder="Search by ID, Description, Category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Sort + Filter */}
            <div className="oIK-Btns">
              <div className="dropdown-container">
                <button onClick={handleSortById}>
                  Sort by: ID
                  <ArrowDownIcon
                    style={{
                      transform:
                        sortOrder === "desc"
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  />
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
                    {["pending", "approved", "rejected", "cancelled"].map(
                      (filter) => (
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
                      )
                    )}
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
                  <th>Request ID</th>
                  <th>Date Requested</th>
                  <th>Leave Category</th>
                  <th>Number of Days</th>
                  <th>Start Date</th>
                  <th>Resumption Date</th>
                  <th>Region of Stay</th>
                  <th>Address During Leave</th>
                  <th>Contact Phone Number</th>
                  <th>Status</th>
                  <th>Action</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((row, index) => (
                    <tr key={index}>
                      <td>{getField(row, "request_id")}</td>
                      <td>{formatDate(row.created_at)}</td>
                      <td>{titleCase(getField(row, "leave_category"))}</td>
                      <td>{row.number_of_days}</td>
                      <td>{formatDate(row.start_date)}</td>
                      <td>{formatDate(row.resumption_date)}</td>
                      <td>{titleCase(row.region_of_stay)}</td>
                      <td>{row.address_during_leave}</td>
                      <td>{row.contact_phone_number}</td>
                      <td>
                        <StatusBadge status={getField(row, "status")} />
                      </td>
                      <td>
                        {getField(row, "status") === "approved" ? (
                          <span>No actions</span>
                        ) : (
                          <div className="actions-cell">
                            <div
                              className="actions-container"
                              style={{ position: "relative" }}
                            >
                              <button
                                className="actions-button"
                                onClick={() =>
                                  setOpenMenuIndex(
                                    openMenuIndex === index ? null : index
                                  )
                                }
                              >
                                <EllipsisVerticalIcon />
                              </button>

                              {openMenuIndex === index && (
                                <motion.ul
                                  className="actions-dropdown"
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -5 }}
                                  transition={{ duration: 0.2 }}
                                  style={{
                                    position: "absolute",
                                    top: "100%",
                                    right: 0,
                                    background: "#fff",
                                    border: "1px solid #ddd",
                                    borderRadius: "6px",
                                    listStyle: "none",
                                    margin: 0,
                                    padding: "6px 0",
                                    zIndex: 20,
                                    boxShadow: "0px 2px 6px rgba(0,0,0,0.15)",
                                  }}
                                >
                                  <li>
                                    <button
                                      className="dropdown-link"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditRequest(row);
                                      }}
                                    >
                                      Edit Request
                                    </button>
                                  </li>
                                  {getField(row, "status") === "pending" && (
                                    <li>
                                      <button
                                        className="dropdown-link"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedCancelRequest(row);
                                          setShowCancel(true);
                                        }}
                                      >
                                        Cancel Request
                                      </button>
                                    </li>
                                  )}
                                  {getField(row, "status") === "cancelled" && (
                                    <li>
                                      <button
                                        className="dropdown-link"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedDeleteRequest(row);
                                          setShowDelete(true);
                                        }}
                                      >
                                        Delete Request
                                      </button>
                                    </li>
                                  )}
                                </motion.ul>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                      <td>{renderRemarksCell(row)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="12"
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      {requests.length === 0
                        ? "No leave requests found"
                        : "No requests match your filters"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}

          {/* Cancel Modal */}
          <CancelRequestModal
            isOpen={showCancel}
            onClose={() => setShowCancel(false)}
            request={selectedCancelRequest}
            onCancelSuccess={handleCancelSuccess}
          />

          {/* Delete Modal */}
          <DeleteRequestModal
            isOpen={showDelete}
            onClose={() => setShowDelete(false)}
            request={selectedDeleteRequest}
            onDeleteSuccess={handleDeleteSuccess}
          />

          {/* Remarks Tooltip */}
          <TextTooltip
            isVisible={showRemarksTooltip}
            position={remarksTooltipPosition}
            content={remarksTooltipContent}
            title="Remarks"
            placement="left"
            tooltipWidth={750}
            tooltipHeight={400}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default LeaveRequisitions;

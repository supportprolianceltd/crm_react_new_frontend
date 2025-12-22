import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { FiMoreVertical } from "react-icons/fi";
import { TbMoodEmpty } from "react-icons/tb";
import { FiUsers, FiCheck, FiClock, FiX, FiMapPin } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import SideNavBar from "../../Home/SideNavBar";
import FilterOptions from "../../../../components/FilterOptions/FilterOptions";
import SortOptions from "../../../../components/SortOptions/SortOptions";
import Table from "../../../../components/Table/Table";
import StatusBadge from "../../../../components/StatusBadge";
import AnimatedCounter from "../../../../components/AnimatedCounter";
import RequestDetailsModal from "../../Requests/ExternalRequests/modals/RequestDetailsModal";
import RequestConfirmationModal from "../../Requests/ExternalRequests/modals/RequestConfirmationModal";
import ToastNotification from "../../../../components/ToastNotification";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import {
  fetchAllExternalRequests,
  approveExternalRequest,
  declineExternalRequest,
} from "../config/apiConfig";
import "../css/styles.css";
import "./RosteringRequest.css";
import {
  IconCircleCheck,
  IconCircleDashed,
  IconCircleX,
  IconClockPause,
} from "@tabler/icons-react";

const RosteringRequest = ({ openCoverageModal }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [shrinkNav, setShrinkNav] = useState(false);
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [activePopup, setActivePopup] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const itemsPerPage = 10;
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceOptions, setServiceOptions] = useState([]);

  // Toast states
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Confirmation modal states
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    action: "",
    request: null,
  });
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const popupRef = useRef();

  const isHRApp = window.location.pathname.includes("hr");

  const truncateText = (text, maxLength = 20) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchAllExternalRequests();
      const filteredData =
        response?.data?.filter((req) => req.sendToRostering === true) || [];
      const mappedRequests = filteredData.map((req) => ({
        id: req.id,
        serviceType: req.requirements || req.subject || "Unknown",
        clientName: req.requestorName || "Unknown",
        dateRequested: req.createdAt || new Date().toISOString(),
        status: (req.status || "PENDING").toLowerCase(),
        subject: req.subject || "",
        content: req.content || "",
        requester: {
          name: req.requestorName || "",
          email: req.requestorEmail || "",
          phone: req.requestorPhone || "",
        },
        scheduledStartTime: req.scheduledStartTime || "",
        scheduledEndTime: req.scheduledEndTime || "",
        notes: req.notes || "",
        attachment: req.attachment || null,
        urgency: req.urgency || "MEDIUM",
        address: req.address || "",
        postcode: req.postcode || "",
        estimatedDuration: req.estimatedDuration || 0,
        // Additional fields for the new table structure
        location: req.address ? `${req.address.split(",")[0]}` : "Unknown",
        careType: req.requirements || "Home Care",
        carers: req.requiredSkills ? req.requiredSkills.length : 0,
        sendToRostering: req.sendToRostering || false,
        skillsRequired: req.requiredSkills
          ? req.requiredSkills.join(", ")
          : "None",
        probity: req.urgency || "Medium",
      }));
      setRequests(mappedRequests);
      setFilteredRequests(mappedRequests);

      // Compute unique service types for filter
      const uniqueServices = [
        ...new Set(mappedRequests.map((r) => r.serviceType)),
      ];
      setServiceOptions(uniqueServices.map((s) => ({ value: s, label: s })));
    } catch (error) {
      setErrorMessage(
        error.message || "Failed to fetch requests. Please try again."
      );
      setSuccessMessage("");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Auto-clear toast messages after 3 seconds
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setActivePopup(null);
      }
    };

    if (activePopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activePopup]);

  // Filter requests based on active filter tab
  useEffect(() => {
    let filtered = [...requests];

    switch (activeFilter) {
      case "pending":
        filtered = filtered.filter((req) => req.status === "pending");
        break;
      case "accepted":
        filtered = filtered.filter((req) => req.status === "approved");
        break;
      case "declined":
        filtered = filtered.filter((req) => req.status === "declined");
        break;
      default:
        // "all" - no filter
        break;
    }

    setFilteredRequests(filtered);
    setCurrentPage(1);
  }, [activeFilter, requests]);

  // Status counts for cards
  const statusCounts = {
    total: requests.length,
    accepted: requests.filter((req) => req.status === "approved").length,
    pending: requests.filter((req) => req.status === "pending").length,
    declined: requests.filter((req) => req.status === "declined").length,
  };

  const filterOptions = [
    {
      value: "status",
      label: "Status",
      subOptions: [
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "declined", label: "Declined" },
      ],
      isCheckbox: true,
    },
    {
      value: "serviceType",
      label: "Service",
      subOptions: serviceOptions,
      isCheckbox: true,
    },
    {
      value: "dateRange",
      label: "Date Range",
      subOptions: [
        { value: "7days", label: "Last 7 days" },
        { value: "30days", label: "Last 30 days" },
        { value: "60days", label: "Last 60 days" },
        { value: "90days", label: "Last 90 days" },
        { value: "6months", label: "Last 6 months" },
        { value: "1year", label: "Last year" },
      ],
      isCheckbox: false, // Single select
    },
  ];

  const sortOptions = [
    { value: "date-asc", label: "Date Requested (Oldest first)" },
    { value: "date-desc", label: "Date Requested (Newest first)" },
    { value: "client-asc", label: "Client Name (A-Z)" },
    { value: "client-desc", label: "Client Name (Z-A)" },
  ];

  // Updated table columns to match the image
  const tableColumns = [
    {
      key: "clientName",
      header: "CLIENT / REQUEST",
      render: (request) => (
        <div className="client-request-cell">
          <div className="client-avatar-initial">
            {request.clientName.slice(0, 2).toUpperCase()}
          </div>

          <div className="client-request-info">
            <div className="client-request-name">{request.clientName}</div>
            <div className="client-request-id">{request.id}</div>
          </div>
        </div>
      ),
    },
    {
      key: "location",
      header: "LOCATION",
      render: (request) => (
        <div className="location-cell">
          {/* {request.location} */}
          <div className="location-details">
            <div className="location-icon">
              <FiMapPin />
            </div>
            <div className="location-distance">9 ≥ 3 km</div>
          </div>
        </div>
      ),
    },
    {
      key: "careType",
      header: "CARE TYPE",
      render: (request) => truncateText(request.careType, 20),
    },
    {
      key: "carers",
      header: "CARERS",
      render: (request) => <div className="carers-cell">{request.carers}</div>,
    },
    {
      key: "skillsRequired",
      header: "SKILLS REQUIRED",
      render: (request) => {
        const skills = request.skillsRequired.split(", ");
        const maxVisible = 2;
        const visibleSkills = skills.slice(0, maxVisible);
        const remaining = skills.length - maxVisible;

        return (
          <div className="skills-badges">
            {visibleSkills.map((skill, idx) => (
              <span
                key={idx}
                className="skill-badge"
                style={{ color: idx % 2 === 0 ? "#A272D9" : "#E2DA87" }}
              >
                {skill.trim()}
                {idx === visibleSkills.length - 1 && remaining > 0
                  ? ` +${remaining}`
                  : ""}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: "priority",
      header: "PRIORITY",
      render: (request) => (
        <StatusBadge status={request.probity.toLowerCase()} />
      ),
    },
    {
      key: "dateRequested",
      header: "Date of Request",
      render: (request) => formatDate(request.dateRequested),
    },
    {
      key: "status",
      header: "Status",
      render: (request) => <StatusBadge status={request.status} />,
    },
    {
      key: "actions",
      header: "ACTIONS",
      render: (request) => (
        <div className="actions-cell">
          <div className="actions-container">
            <motion.button
              className="actions-button"
              onClick={(e) => togglePopup(request.id, e)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiMoreVertical />
            </motion.button>
            <AnimatePresence>
              {activePopup === request.id && (
                <motion.div
                  ref={popupRef}
                  className="actions-popup"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <motion.button
                    onClick={(e) => handleActionClick("view", request, e)}
                    whileHover={{ x: 5 }}
                  >
                    View Details
                  </motion.button>
                  {request.status === "pending" && (
                    <>
                      <motion.button
                        onClick={(e) =>
                          handleActionClick("approve", request, e)
                        }
                        whileHover={{ x: 5 }}
                        className="approve-action"
                      >
                        Approve
                      </motion.button>
                      <motion.button
                        onClick={(e) =>
                          handleActionClick("decline", request, e)
                        }
                        whileHover={{ x: 5 }}
                        className="decline-action"
                      >
                        Decline
                      </motion.button>
                    </>
                  )}
                  <motion.button
                    onClick={(e) => handleActionClick("edit", request, e)}
                    whileHover={{ x: 5 }}
                  >
                    Edit
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ),
    },
  ];

  const handleFilterChange = (filterType, selectedValues) => {
    let filtered = [...requests];

    if (filterType === "status" && selectedValues.length > 0) {
      filtered = filtered.filter((req) => selectedValues.includes(req.status));
    }

    if (filterType === "serviceType" && selectedValues.length > 0) {
      filtered = filtered.filter((req) =>
        selectedValues.includes(req.serviceType)
      );
    }

    if (filterType === "dateRange" && selectedValues.length > 0) {
      const range = selectedValues[0];
      const now = new Date();
      let startDate;

      switch (range) {
        case "7days":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30days":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "60days":
          startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
          break;
        case "90days":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "6months":
          startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
          break;
        case "1year":
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter(
        (req) => new Date(req.dateRequested) >= startDate
      );
    }

    setFilteredRequests(filtered);
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    let sorted = [...filteredRequests];

    switch (value) {
      case "date-asc":
        sorted.sort(
          (a, b) => new Date(a.dateRequested) - new Date(b.dateRequested)
        );
        break;
      case "date-desc":
        sorted.sort(
          (a, b) => new Date(b.dateRequested) - new Date(a.dateRequested)
        );
        break;
      case "client-asc":
        sorted.sort((a, b) => a.clientName.localeCompare(b.clientName));
        break;
      case "client-desc":
        sorted.sort((a, b) => b.clientName.localeCompare(a.clientName));
        break;
      default:
        break;
    }

    setFilteredRequests(sorted);
  };

  const handleSearch = (term) => {
    const filtered = requests.filter(
      (req) =>
        req.clientName.toLowerCase().includes(term.toLowerCase()) ||
        req.serviceType.toLowerCase().includes(term.toLowerCase()) ||
        req.id.toLowerCase().includes(term.toLowerCase()) ||
        (req.content || "").toLowerCase().includes(term.toLowerCase()) ||
        (req.postcode || "").toLowerCase().includes(term.toLowerCase())
    );
    setFilteredRequests(filtered);
    setCurrentPage(1);
  };

  const togglePopup = (id, e) => {
    e.stopPropagation();
    setActivePopup(activePopup === id ? null : id);
  };

  const closePopups = () => {
    setActivePopup(null);
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleApprove = (request) => {
    setConfirmModal({ open: true, action: "approve", request });
  };

  const handleDecline = (request) => {
    setConfirmModal({ open: true, action: "decline", request });
  };

  const handleConfirmAction = async () => {
    setIsConfirmLoading(true);
    try {
      if (confirmModal.action === "approve") {
        await approveExternalRequest(confirmModal.request.id);
      } else if (confirmModal.action === "decline") {
        await declineExternalRequest(confirmModal.request.id);
      }
      await fetchRequests();
      setSuccessMessage(`Request ${confirmModal.action}d successfully`);
      setErrorMessage("");
      setIsModalOpen(false);
    } catch (error) {
      setErrorMessage(
        `Failed to ${confirmModal.action} request: ${
          error.message || "An unexpected error occurred"
        }`
      );
      setSuccessMessage("");
    } finally {
      setIsConfirmLoading(false);
      setConfirmModal({ open: false, action: "", request: null });
    }
  };

  const handleActionClick = (action, request, e) => {
    e.stopPropagation();
    closePopups();

    if (action === "view") {
      setSelectedRequest(request);
      setIsModalOpen(true);
    }

    if (action === "approve") {
      handleApprove(request);
    }

    if (action === "decline") {
      handleDecline(request);
    }

    if (action === "edit") {
      console.log("Edit request", request);
    }
  };

  const handleRowClick = (requestId) => {
    const request = requests.find((r) => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setIsModalOpen(true);
    }
  };

  const closeConfirmModal = () => {
    setConfirmModal({ open: false, action: "", request: null });
  };

  const handleFilterTabClick = (filter) => {
    setActiveFilter(filter);
  };

  return (
    <div className="Rostering-Overview-sec">
      <div className="TOT-Rost-Sec">
        <div className="RostDB-Envt-Container">
          <motion.div
            className="requests-list-page"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="requests-list-title">Rostering Requests</h1>
            <p className="requests-list-description">
              Manage all client requests in one place
            </p>

            {/* Status Cards - Matching the image */}
            <div className="requests-list-status-cards-container">
              {[
                {
                  title: "Total Requests",
                  count: statusCounts.total,
                  className: "total",
                  icon: <FiUsers />,
                  filter: "all",
                },
                {
                  title: "Total Accepted",
                  count: statusCounts.accepted,
                  className: "accepted",
                  icon: <FiCheck />,
                  filter: "accepted",
                },
                {
                  title: "Total Pending",
                  count: statusCounts.pending,
                  className: "pending",
                  icon: <FiClock />,
                  filter: "pending",
                },
                {
                  title: "Total Declined",
                  count: statusCounts.declined,
                  className: "declined",
                  icon: <FiX />,
                  filter: "declined",
                },
              ].map((card, idx) => (
                <motion.div
                  key={idx}
                  className={`requests-list-status-card ${card.className} ${
                    activeFilter === card.filter ? "active" : ""
                  }`}
                  onClick={() => handleFilterTabClick(card.filter)}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  style={{ cursor: "pointer" }}
                >
                  <h3 className="request-list-status-title">{card.title}</h3>
                  <p className="request-list-status-count">
                    <AnimatedCounter value={card.count} />
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="requests-list-options">
              <div className="search-input-container">
                <CiSearch />
                <input
                  id="search"
                  name="search"
                  type="search"
                  placeholder="Search requests"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleSearch(e.target.value);
                  }}
                />
              </div>

              <FilterOptions
                options={filterOptions}
                onFilterChange={handleFilterChange}
              />

              <SortOptions
                options={sortOptions}
                onSortChange={handleSortChange}
              />
            </div>

            {/* Status buttons */}
            <div className="UJu-OOK">
              <button
                className={`filter-tab ${
                  activeFilter === "all" ? "active" : ""
                }`}
                onClick={() => handleFilterTabClick("all")}
              >
                <span>
                  <IconCircleDashed size={20} />
                  <b>{statusCounts.total}</b> Total
                </span>
              </button>
              <button
                className={`filter-tab ${
                  activeFilter === "pending" ? "active" : ""
                }`}
                onClick={() => handleFilterTabClick("pending")}
              >
                <span>
                  <IconClockPause size={20} />
                  <b>{statusCounts.pending}</b> Pending
                </span>
              </button>
              <button
                className={`filter-tab ${
                  activeFilter === "accepted" ? "active" : ""
                }`}
                onClick={() => handleFilterTabClick("accepted")}
              >
                <span>
                  <IconCircleCheck size={20} />
                  <b>{statusCounts.accepted}</b> Accepted
                </span>
              </button>
              <button
                className={`filter-tab ${
                  activeFilter === "declined" ? "active" : ""
                }`}
                onClick={() => handleFilterTabClick("declined")}
              >
                <span>
                  <IconCircleX size={20} />
                  <b>{statusCounts.declined}</b> Declined
                </span>
              </button>
            </div>

            <div className="requests-list-table">
              <Table
                columns={tableColumns}
                data={filteredRequests}
                isLoading={isLoading}
                currentPage={currentPage}
                totalPages={Math.ceil(filteredRequests.length / itemsPerPage)}
                onPageChange={setCurrentPage}
                onRowClick={handleRowClick}
                emptyStateIcon={<TbMoodEmpty />}
                emptyStateMessage="No requests found"
                emptyStateDescription="Try adjusting your search or filter criteria"
              />
            </div>
          </motion.div>

          {/* <RequestDetailsModal
            request={selectedRequest}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onApprove={handleApprove}
            onDecline={handleDecline}
          />

          <RequestConfirmationModal
            isOpen={confirmModal.open}
            onClose={closeConfirmModal}
            onConfirm={handleConfirmAction}
            action={confirmModal.action}
            loading={isConfirmLoading}
          /> */}

          <ToastNotification
            successMessage={successMessage}
            errorMessage={errorMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default RosteringRequest;

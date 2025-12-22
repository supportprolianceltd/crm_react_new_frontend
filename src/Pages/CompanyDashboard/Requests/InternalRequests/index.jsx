import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { FiMoreVertical } from "react-icons/fi";
import { TbMoodEmpty } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import SideNavBar from "../../Home/SideNavBar";
import FilterOptions from "../../../../components/FilterOptions/FilterOptions";
import SortOptions from "../../../../components/SortOptions/SortOptions";
import Table from "../../../../components/Table/Table";
import StatusBadge from "../../../../components/StatusBadge";
import AnimatedCounter from "../../../../components/AnimatedCounter";
import TextTooltip from "../../../../components/TextTooltip";
import DeleteRequestModal from "../../../StaffDashboard/Requisitions/modals/DeleteRequestModal";
import "../css/styles.css";
import { fetchAllInternalRequests } from "../config/apiConfig";
import RequestDetails from "../InternalRequests/pages/RequestDetailsPage";

const InternalRequestsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [shrinkNav, setShrinkNav] = useState(false);
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [rawRequests, setRawRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [activePopup, setActivePopup] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const itemsPerPage = 10;

  const isHRApp = window.location.pathname.includes("hr");

  // Tooltip states for comment
  const [showCommentTooltip, setShowCommentTooltip] = useState(false);
  const [commentTooltipPosition, setCommentTooltipPosition] = useState({
    x: 0,
    y: 0,
  });
  const [commentTooltipContent, setCommentTooltipContent] = useState("");

  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const [previousStatusCounts, setPreviousStatusCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const filterOptions = [
    {
      value: "status",
      label: "Status",
      subOptions: [
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
      ],
      isCheckbox: true,
    },
    {
      value: "requestType",
      label: "Request Type",
      subOptions: [
        { value: "Material Request", label: "Material Request" },
        { value: "Leave Request", label: "Leave Request" },
        { value: "Service Request", label: "Service Request" },
      ],
      isCheckbox: true,
    },
  ];

  const sortOptions = [
    { value: "date-asc", label: "Date Submitted (Oldest first)" },
    { value: "date-desc", label: "Date Submitted (Newest first)" },
  ];

  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const formatPercentage = (value) => {
    if (value === 0) return "0% this week";
    const direction = value > 0 ? "up" : "down";
    const absValue = Math.abs(value).toFixed(1);
    return `${absValue}% ${direction} this week`;
  };

  const percentageChanges = useMemo(
    () => ({
      pending: calculatePercentageChange(
        statusCounts.pending,
        previousStatusCounts.pending
      ),
      approved: calculatePercentageChange(
        statusCounts.approved,
        previousStatusCounts.approved
      ),
      rejected: calculatePercentageChange(
        statusCounts.rejected,
        previousStatusCounts.rejected
      ),
    }),
    [statusCounts, previousStatusCounts]
  );

  const statisticsCards = useMemo(
    () =>
      [
        {
          title: "Pending",
          count: statusCounts.pending,
          className: "pending",
          percentage: percentageChanges.pending,
        },
        {
          title: "Approved",
          count: statusCounts.approved,
          className: "approved",
          percentage: percentageChanges.approved,
        },
        {
          title: "Rejected",
          count: statusCounts.rejected,
          className: "rejected",
          percentage: percentageChanges.rejected,
        },
      ].map((card, idx) => (
        <motion.div
          key={idx}
          className={`requests-list-statistics-card ${card.className}`}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h3 className="requests-list-statistics-title">{card.title}</h3>
          <p className="requests-list-statistics-count">
            <AnimatedCounter value={card.count} />
          </p>
          <div
            className={`requests-status-percentage ${
              card.percentage > 0
                ? "positive"
                : card.percentage < 0
                ? "negative"
                : "neutral"
            }`}
          >
            <span
              className={
                card.percentage > 0
                  ? "triangle-up"
                  : card.percentage < 0
                  ? "triangle-down"
                  : ""
              }
            >
              {card.percentage > 0 ? "▲" : card.percentage < 0 ? "▼" : ""}
            </span>
            <span>{formatPercentage(card.percentage)}</span>
          </div>
        </motion.div>
      )),
    [statusCounts, percentageChanges, formatPercentage]
  );

  const tableColumns = [
    {
      key: "id",
      header: "Request ID",
      render: (request) => request.requestId,
    },
    {
      key: "requesterName",
      header: "Requester",
      render: (request) => (
        <div className="employee-name-container">
          <div>
            {/* <div style={{ color: "#000", fontSize: "0.875rem" }}>
              {request.requesterName}
            </div> */}
            <small style={{ color: "gray", fontSize: "0.75rem" }}>
              {request.requesterEmail}
            </small>
          </div>
        </div>
      ),
    },
    {
      key: "requestType",
      header: "Request Type",
    },
    {
      key: "dateSubmitted",
      header: "Date Submitted",
      render: (request) => formatDate(request.dateSubmitted),
    },
    {
      key: "status",
      header: "Status",
      render: (request) => <StatusBadge status={request.status} />,
    },
    {
      key: "handledBy",
      header: "Handled By",
      render: (request) =>
        request.handledByName ? (
          <div className="employee-name-container">
            <div>
              <div style={{ color: "#000", fontSize: "0.875rem" }}>
                {request.handledByName}
              </div>
              <small style={{ color: "gray", fontSize: "0.75rem" }}>
                {request.handledByEmail}
              </small>
            </div>
          </div>
        ) : (
          "In Review"
        ),
    },
    {
      key: "comment",
      header: "Comment",
      render: (request) => {
        const comment = request.comment || "N/A";
        const isLong = comment.length > 100; // Adjust threshold as needed
        const handleMouseEnter = (e) => {
          if (isLong) {
            const rect = e.currentTarget.getBoundingClientRect();
            setCommentTooltipPosition({
              x: rect.right,
              y: rect.top,
            });
            setCommentTooltipContent(comment);
            setShowCommentTooltip(true);
          }
        };
        const handleMouseLeave = () => {
          setShowCommentTooltip(false);
        };
        return (
          <div
            className="comment-cell"
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
            {comment}
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
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
                    onClick={(e) => handleActionClick("delete", request, e)}
                    whileHover={{ x: 5 }}
                    className="delete-action"
                    style={{ color: "#dc2626" }}
                  >
                    Delete
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ),
    },
  ];

  const fetchRequests = useCallback(async () => {

    setIsLoading(true);
    try {
      const fetchedRequests = await fetchAllInternalRequests();
      setRawRequests(fetchedRequests);
      const mappedRequests = fetchedRequests
        .map((req) => {
          const requesterName =
            `${req.requested_by?.first_name || ""} ${
              req.requested_by?.last_name || ""
            }`.trim() || "Unknown";
          let handledByName = null;
          let handledByEmail = "";
          if (req.status === "approved") {
            handledByName = `${req.approved_by?.first_name || ""} ${
              req.approved_by?.last_name || ""
            }`.trim();
            handledByEmail = req.approved_by?.email || "";
          } else if (req.status === "rejected") {
            handledByName = `${req.rejected_by?.first_name || ""} ${
              req.rejected_by?.last_name || ""
            }`.trim();
            handledByEmail = req.rejected_by?.email || "";
          }
          return {
            id: req.id,
            requestId: req.request_id,
            requesterName,
            requesterEmail: req.requested_by?.email || "",
            requestType: req.request_type
              ? req.request_type.charAt(0).toUpperCase() +
                req.request_type.slice(1) +
                " Request"
              : "Unknown Request",
            dateSubmitted: req.created_at,
            status: req.status,
            details: req.title || "No details",
            request_type: req.request_type,
            handledByName,
            handledByEmail,
            comment: req.comment || "N/A",
          };
        })
        .filter((req) => req.status !== "cancelled");
      setRequests(mappedRequests);
      setFilteredRequests(mappedRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("previousRequestStats");
    if (saved) {
      setPreviousStatusCounts(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    return () => {
      localStorage.setItem(
        "previousRequestStats",
        JSON.stringify(statusCounts)
      );
    };
  }, [statusCounts]);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    setStatusCounts({
      pending: requests.filter((req) => req.status === "pending").length,
      approved: requests.filter((req) => req.status === "approved").length,
      rejected: requests.filter((req) => req.status === "rejected").length,
    });
  }, [requests]);

  const handleFilterChange = (filterType, selectedValues) => {
    let filtered = [...requests];

    if (filterType === "status" && selectedValues.length > 0) {
      filtered = filtered.filter((req) => selectedValues.includes(req.status));
    }

    if (filterType === "requestType" && selectedValues.length > 0) {
      filtered = filtered.filter((req) =>
        selectedValues.includes(req.requestType)
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
          (a, b) => new Date(a.dateSubmitted) - new Date(b.dateSubmitted)
        );
        break;
      case "date-desc":
        sorted.sort(
          (a, b) => new Date(b.dateSubmitted) - new Date(a.dateSubmitted)
        );
        break;
      default:
        break;
    }

    setFilteredRequests(sorted);
    setCurrentPage(1);
  };

  const handleSearch = (term) => {
    const filtered = requests.filter(
      (req) =>
        req.requesterName.toLowerCase().includes(term.toLowerCase()) ||
        req.requestType.toLowerCase().includes(term.toLowerCase()) ||
        req.details.toLowerCase().includes(term.toLowerCase())
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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const tableData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage + 1;
    return currentItems.map((req, index) => ({
      ...req,
      serialNumber: start + index,
    }));
  }, [currentItems, currentPage, itemsPerPage]);

  const handleActionClick = (action, request, e) => {
    e.stopPropagation();
    closePopups();
    switch (action) {
      case "view":
        setSelectedRequest(rawRequests.find(req => req.id === request.id));
        break;
      case "delete":
        setRequestToDelete(request);
        setShowDeleteModal(true);
        break;
      // case "approve":
      //   // Handle approve logic
      //   console.log("Approve request", request);
      //   break;
      // case "decline":
      //   // Handle decline logic
      //   console.log("Decline request", request);
      //   break;
      default:
        break;
    }
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

  const handleRowClick = (requestId) => {
    setSelectedRequest(rawRequests.find(req => req.id === requestId));
  };

  const handleDetailsClose = () => {
    setSelectedRequest(null);
  };

  const handleDeleteModalClose = () => {
    setShowDeleteModal(false);
    setRequestToDelete(null);
  };

  return !isHRApp ? (
    <motion.div
      className={`DB-Envt ${shrinkNav ? "ShrinkNav" : ""}`}
      onClick={closePopups}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SideNavBar setShrinkNav={setShrinkNav} />
      <div className="Main-DB-Envt">
        <div className="DB-Envt-Container">
          {selectedRequest ? (
            <RequestDetails
              requestData={selectedRequest}
              onClose={handleDetailsClose}
              onRefresh={fetchRequests}
            />
          ) : (
            <motion.div
              className="requests-list-page"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="requests-list-header">
                <div>
                  <h1 className="requests-list-title">Internal Requests</h1>
                  <p className="requests-list-description">
                    Manage all requests in one place
                  </p>
                </div>
              </div>

              <div className="requests-list-statistics-cards-container">
                {statisticsCards}
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

              <div className="requests-list-table">
                <Table
                  columns={tableColumns}
                  data={tableData}
                  isLoading={isLoading}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  onRowClick={handleRowClick}
                  emptyStateIcon={<TbMoodEmpty />}
                  emptyStateMessage="No requests found"
                  emptyStateDescription="Try adjusting your search or filter criteria"
                />
              </div>
            </motion.div>
          )}

          {/* Comment Tooltip */}
          <TextTooltip
            isVisible={showCommentTooltip}
            position={commentTooltipPosition}
            content={commentTooltipContent}
            title="Comment"
            placement="left"
            tooltipWidth={710}
            tooltipHeight={-200}
          />

          <DeleteRequestModal
            isOpen={showDeleteModal}
            onClose={handleDeleteModalClose}
            request={requestToDelete}
            onDeleteSuccess={fetchRequests}
          />
        </div>
      </div>
    </motion.div>
  ) : (
    <>
      {selectedRequest ? (
        <RequestDetails
          requestData={selectedRequest}
          onClose={handleDetailsClose}
          onRefresh={fetchRequests}
        />
      ) : (
        <motion.div
          className="requests-list-page"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="requests-list-header">
            <div>
              <h1 className="requests-list-title">Internal Requests</h1>
              <p className="requests-list-description">
                Manage all requests in one place
              </p>
            </div>
          </div>

          <div className="requests-list-statistics-cards-container">
            {statisticsCards}
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

          <div className="requests-list-table">
            <Table
              columns={tableColumns}
              data={tableData}
              isLoading={isLoading}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onRowClick={handleRowClick}
              emptyStateIcon={<TbMoodEmpty />}
              emptyStateMessage="No requests found"
              emptyStateDescription="Try adjusting your search or filter criteria"
            />
          </div>
        </motion.div>
      )}

      {/* Comment Tooltip */}
      <TextTooltip
        isVisible={showCommentTooltip}
        position={commentTooltipPosition}
        content={commentTooltipContent}
        title="Comment"
        placement="left"
        tooltipWidth={710}
        tooltipHeight={-200}
      />

      <DeleteRequestModal
        isOpen={showDeleteModal}
        onClose={handleDeleteModalClose}
        request={requestToDelete}
        onDeleteSuccess={fetchRequests}
      />
    </>
  );
};

export default InternalRequestsPage;

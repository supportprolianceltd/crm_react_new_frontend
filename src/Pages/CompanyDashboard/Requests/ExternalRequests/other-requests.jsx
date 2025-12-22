import { useEffect, useState, useCallback } from "react";
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
import RequestDetailsModal from "./modals/RequestDetailsModal";
import RequestConfirmationModal from "./modals/RequestConfirmationModal";
import ToastNotification from "../../../../components/ToastNotification";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import {
  fetchAllExternalRequests,
  approveExternalRequest,
  declineExternalRequest,
  updateExternalRequest,
} from "../config/apiConfig";
import "../css/styles.css";

const ExternalRequestsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [shrinkNav, setShrinkNav] = useState(false);
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [activePopup, setActivePopup] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
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

  const isHRApp = window.location.pathname.includes("hr");

  const truncateText = (text, maxLength = 20) => {
    return text?.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchAllExternalRequests();
      const mappedRequests = response?.data?.map((req) => ({
        id: req.id,
        subject: req.subject || "",
        serviceType: req.requestTypes || "Others",
        clientName: req.requestorName || "Unknown",
        dateRequested: req.createdAt || new Date().toISOString(),
        status: (req.status || "PENDING").toLowerCase(),
        content: req.content || "",
        requestorName: req.requestorName || "",
        requestTypes: req.requestTypes || "",
        requester: {
          name: req.requestorName || "",
          email: req.requestorEmail || "",
          phone: req.requestorPhone || "",
        },
        scheduledStartTime: req.scheduledStartTime || "",
        scheduledEndTime: req.scheduledEndTime || "",
        notes: req.notes || "",
        attachment: req.attachment || null,
        sendToRostering: req.sendToRostering,
        urgency: req.urgency || "MEDIUM",
        address: req.address || "",
        postcode: req.postcode || "",
        estimatedDuration: req.estimatedDuration || 0,
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

  // Status counts for cards
  const statusCounts = {
    pending: requests.filter((req) => req.status === "pending").length,
    approved: requests.filter((req) => req.status === "approved").length,
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
  ];

  const sortOptions = [
    { value: "date-asc", label: "Date Requested (Oldest first)" },
    { value: "date-desc", label: "Date Requested (Newest first)" },
    { value: "client-asc", label: "Client Name (A-Z)" },
    { value: "client-desc", label: "Client Name (Z-A)" },
  ];

  const tableColumns = [
    {
      key: "id",
      header: "Request ID",
    },
    // {
    //   key: "subject",
    //   header: "Subject",
    //   render: (request) => {
    //     const fullText = request.subject;
    //     const truncatedText = truncateText(fullText);
    //     return <span title={fullText}>{truncatedText}</span>;
    //   },
    // },
    {
      key: "serviceType",
      header: "Service Type",
      render: (request) => {
        const fullText = request.serviceType;
        const truncatedText = truncateText(fullText);
        return <span title={fullText}>{truncatedText}</span>;
      },
    },
    {
      key: "clientName",
      header: "Client Name",
    },
    {
      key: "urgency",
      header: "Priority",
      render: (request) => <StatusBadge status={request.urgency} />,
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
        req.subject?.toLowerCase().includes(term.toLowerCase()) ||
        req.id.toLowerCase().includes(term.toLowerCase()) ||
        (req.content || "").toLowerCase().includes(term.toLowerCase())
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
    setConfirmModal({
      open: true,
      action: "approve",
      request,
      sendToRostering: request.sendToRostering,
    });
  };

  const handleDecline = (request) => {
    setConfirmModal({ open: true, action: "decline", request });
  };

  const handleConfirmAction = async () => {
    setIsConfirmLoading(true);
    try {
      if (confirmModal.action === "approve") {
        await approveExternalRequest(confirmModal.request.id);
        // If sendToRostering was checked, update it
        if (confirmModal.sendToRostering) {
          await updateExternalRequest(confirmModal.request.id, {
            sendToRostering: true,
          });
        }
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
      // console.log("Edit request", request);
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

  return (
    <>
      {!isHRApp ? (
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
              <motion.div
                className="requests-list-page"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="requests-list-header">
                  <div>
                    <h1 className="requests-list-title">External Requests</h1>
                    <p className="requests-list-description">
                      Manage all client requests in one place
                    </p>
                  </div>

                  <motion.button
                    className="create-request-button"
                    onClick={() =>
                      navigate("/company/requests/external-requests/create")
                    }
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <PlusCircleIcon />
                    <p>Add Request</p>
                  </motion.button>
                </div>

                {/* Statistics Cards */}
                <div className="requests-list-statistics-cards-container">
                  {[
                    {
                      title: "Total Pending",
                      count: statusCounts.pending,
                      className: "pending",
                    },
                    {
                      title: "Total Approved",
                      count: statusCounts.approved,
                      className: "approved",
                    },
                    {
                      title: "Total Declined",
                      count: statusCounts.declined,
                      className: "declined",
                    },
                  ].map((card, idx) => (
                    <motion.div
                      key={idx}
                      className={`requests-list-statistics-card ${card.className}`}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <h3 className="requests-list-statistics-title">
                        {card.title}
                      </h3>
                      <p className="requests-list-statistics-count">
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

                <div className="requests-table">
                  <Table
                    columns={tableColumns}
                    data={filteredRequests}
                    isLoading={isLoading}
                    currentPage={currentPage}
                    totalPages={Math.ceil(
                      filteredRequests.length / itemsPerPage
                    )}
                    onPageChange={setCurrentPage}
                    onRowClick={handleRowClick}
                    emptyStateIcon={<TbMoodEmpty />}
                    emptyStateMessage="No requests found"
                    emptyStateDescription="Try adjusting your search or filter criteria"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          <motion.div
            className="requests-list-page"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="requests-list-title">External Requests</h1>
            <p className="requests-list-description">
              Manage all client requests in one place
            </p>

            {/* Status Cards */}
            <div className="requests-list-status-cards-container">
              {[
                {
                  title: "Total Pending",
                  count: statusCounts.pending,
                  className: "pending",
                },
                {
                  title: "Total Approved",
                  count: statusCounts.approved,
                  className: "approved",
                },
                {
                  title: "Total Declined",
                  count: statusCounts.declined,
                  className: "declined",
                },
              ].map((card, idx) => (
                <motion.div
                  key={idx}
                  className={`requests-list-status-card ${card.className}`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h3 className="requests-list-status-title">{card.title}</h3>
                  <p className="requests-list-status-count">
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
        </>
      )}

      <RequestDetailsModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApprove={handleApprove}
        onDecline={handleDecline}
        onUpdate={fetchRequests}
      />

      <RequestConfirmationModal
        isOpen={confirmModal.open}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        action={confirmModal.action}
        loading={isConfirmLoading}
      />

      <ToastNotification
        successMessage={successMessage}
        errorMessage={errorMessage}
      />
    </>
  );
};

export default ExternalRequestsPage;

import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { FiMoreVertical } from "react-icons/fi";
import { TbMoodEmpty } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import SideNavBar from "../Home/SideNavBar";
import "../../CompanyDashboard/Clients/styles/styles.css";
import FilterOptions from "../../../components/FilterOptions/FilterOptions";
import SortOptions from "../../../components/SortOptions/SortOptions";
import {
  PlusCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import "../../../components/Table/styles.css";
import StatusBadge from "../../../components/StatusBadge";
import Table from "../../../components/Table/Table";
import { fetchClients, fetchSingleClient } from "./config/apiService";
import DeleteClientModal from "./modals/DeleteClientModal";
import AnimatedCounter from "../../../components/AnimatedCounter";
import ClientInfoPage from "./ClientInfoPage";
import BulkUploadClients from "./components/steps/BulkUploadClients";

// Helper function to calculate percentage change
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const ClientsListPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [shrinkNav, setShrinkNav] = useState(false);
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [activePopup, setActivePopup] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [previousPageUrl, setPreviousPageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [hoveredClient, setHoveredClient] = useState(null);
  // const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [showAddClientDropdown, setShowAddClientDropdown] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [allClients, setAllClients] = useState([]);
  const [clientDetailsCache, setClientDetailsCache] = useState({});
  const [currentUrl, setCurrentUrl] = useState(null);
  const addClientDropdownRef = useRef(null);

  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

  // Track previous counts for calculating percentage changes
  const [previousStats, setPreviousStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  // Transform API data to match table structure
  const transformClientData = useCallback((apiData) => {
    return apiData.map((client) => ({
      id: client?.id,
      innerId: client.profile?.id || `USER-${client.id}`,
      clientId: client.profile?.client_id,
      firstName: client.first_name,
      lastName: client.last_name,
      email: client.email,
      phone: client.profile?.contact_number || "N/A",
      assignedStaff: "Not assigned",
      lastVisit: client.profile?.last_visit || "N/A",
      status: client.profile?.status?.toLowerCase() || "inactive",
      compliance: client.profile?.compliance || "N/A",
      photoUrl: client.profile?.photo_url,
    }));
  }, []);

  // Calculate statistics from clients data
  const statistics = useMemo(() => {
    const totalClients = totalCount;
    const activeClients = clients.filter(
      (client) => client.status === "active"
    ).length;
    const inactiveClients = clients.filter(
      (client) => client.status !== "active"
    ).length;

    return {
      total: totalClients,
      active: activeClients,
      inactive: inactiveClients,
    };
  }, [clients, totalCount]);

  // Calculate percentage changes
  const percentageChanges = useMemo(() => {
    return {
      total: calculatePercentageChange(statistics.total, previousStats.total),
      active: calculatePercentageChange(
        statistics.active,
        previousStats.active
      ),
      inactive: calculatePercentageChange(
        statistics.inactive,
        previousStats.inactive
      ),
    };
  }, [statistics, previousStats]);

  // Fetch clients data
  const loadClients = useCallback(
    async (pageUrl = null, filters = {}, sort = null, page = 1) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetchClients(pageUrl, filters, sort);
        const transformedData = transformClientData(response.results);
        // Sort by client_id ascending
        transformedData.sort((a, b) =>
          (a.clientId || "").localeCompare(b.clientId || "")
        );
        // Add serial numbers
        transformedData.forEach((client, index) => {
          client.serialNumber = (page - 1) * 20 + index + 1;
        });
        setClients(transformedData);
        setFilteredClients(transformedData);
        setTotalCount(response.count);
        setNextPageUrl(response.next);
        setPreviousPageUrl(response.previous);

        setPreviousStats({
          total: statistics.total,
          active: statistics.active,
          inactive: statistics.inactive,
        });
      } catch (err) {
        setError(err.message);
        setClients([]);
        setFilteredClients([]);
        setTotalCount(0);
        setNextPageUrl(null);
        setPreviousPageUrl(null);
      } finally {
        setIsLoading(false);
      }
    },
    [transformClientData, statistics]
  );

  // Initial data load
  useEffect(() => {
    loadClients(null, {}, null, 1);
  }, []);

  // Handle page change
  const handlePageChange = useCallback(
    (page) => {
      if (page < 1 || (page > 1 && !nextPageUrl && !previousPageUrl)) return;
      setCurrentPage(page);
      if (page === 1) {
        loadClients(null, {}, null, page); // Fetch first page
      } else if (page > currentPage && nextPageUrl) {
        loadClients(nextPageUrl, {}, null, page); // Fetch next page
      } else if (page < currentPage && previousPageUrl) {
        loadClients(previousPageUrl, {}, null, page); // Fetch previous page
      }
    },
    [currentPage, nextPageUrl, previousPageUrl, loadClients]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        addClientDropdownRef.current &&
        !addClientDropdownRef.current.contains(event.target)
      ) {
        setShowAddClientDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    loadClients(null, {}, null, currentPage); // Reload clients to reflect the deletion
  }, [loadClients, currentPage]);

  // Clean up hover timeout
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  // Memoized table columns
  const tableColumns = useMemo(
    () => [
      { key: "serialNumber", header: "S/N" },
      {
        key: "clientId",
        header: "Client ID",
      },
      {
        key: "name",
        header: "Name",
        render: (client) => {
          const initials = `${client.firstName?.charAt(0) || ""}${
            client.lastName?.charAt(0) || ""
          }`.toUpperCase();

          return (
            <div
              className="client-name-container"
              // onMouseEnter={(e) => handleNameHover(client, e)}
              // onMouseLeave={handleNameLeave}
            >
              {client?.photoUrl ? (
                <img
                  src={client.photoUrl}
                  alt={`${client.firstName} ${client.lastName}`}
                  className="client-profile-image"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}

              <div
                className="client-initials"
                style={{
                  display: client?.photoUrl ? "none" : "flex",
                }}
              >
                {initials}
              </div>

              <span>{`${client.firstName} ${client.lastName}`}</span>
            </div>
          );
        },
      },
      {
        key: "contact",
        header: "Contact Details",
        render: (client) => (
          <div>
            <div>{client.email}</div>
            <div>{client.phone}</div>
          </div>
        ),
      },
      // {
      //   key: "assignedStaff",
      //   header: "Assigned Staff",
      //   render: (client) => client.assignedStaff,
      // },
      // {
      //   key: "lastVisit",
      //   header: "Last Visit",
      //   render: (client) => {
      //     if (client.lastVisit === "N/A" || client.lastVisit === null) {
      //       return "N/A";
      //     }
      //     try {
      //       return new Date(client.lastVisit).toLocaleDateString();
      //     } catch (e) {
      //       return "Invalid date";
      //     }
      //   },
      // },
      {
        key: "status",
        header: "Status",
        render: (client) => <StatusBadge status={client.status} />,
      },
      {
        key: "actions",
        header: "Actions",
        render: (client) => (
          <div className="actions-cell">
            <div className="actions-container">
              <motion.button
                className="actions-button"
                onClick={(e) => togglePopup(client.clientId, e)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiMoreVertical />
              </motion.button>
              <AnimatePresence>
                {activePopup === client.clientId && (
                  <motion.div
                    className="actions-popup"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <motion.button
                      onClick={(e) => handleActionClick("view", client, e)}
                      whileHover={{ x: 5 }}
                    >
                      View Client
                    </motion.button>
                    {/* <motion.button
                      onClick={(e) => handleActionClick("edit", client, e)}
                      whileHover={{ x: 5 }}
                    >
                      Edit Client
                    </motion.button> */}
                    {/* <motion.button
                      onClick={(e) => handleActionClick("continue", client, e)}
                      whileHover={{ x: 5 }}
                    >
                      Continue Care Plan Creation
                    </motion.button> */}
                    {/* <motion.button
                      onClick={(e) => handleActionClick("delete", client, e)}
                      whileHover={{ x: 5 }}
                      style={{ color: "#e53e3e" }} // Red color for delete action
                    >
                      Delete Client
                    </motion.button> */}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ),
      },
    ],
    [activePopup]
  );

  const filterOptions = useMemo(
    () => [
      {
        value: "status",
        label: "Status",
        subOptions: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ],
        isCheckbox: true,
      },
    ],
    []
  );

  const sortOptions = useMemo(
    () => [
      { value: "name-asc", label: "Name (A-Z)" },
      { value: "name-desc", label: "Name (Z-A)" },
    ],
    []
  );

  // const handleNameHover = useCallback(
  //   (client, e) => {
  //     e.stopPropagation();
  //     if (hoverTimeout) {
  //       clearTimeout(hoverTimeout);
  //       setHoverTimeout(null);
  //     }
  //     const timeoutId = setTimeout(() => {
  //       setHoveredClient(client);
  //       setIsClientModalOpen(true);
  //     }, 500);
  //     setHoverTimeout(timeoutId);
  //   },
  //   [hoverTimeout]
  // );

  const handleNameLeave = useCallback(
    (e) => {
      e.stopPropagation();
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        setHoverTimeout(null);
      }
    },
    [hoverTimeout]
  );

  const handleFilterChange = useCallback(
    (filterType, selectedValues) => {
      let filtered = [...clients];

      if (filterType === "status" && selectedValues.length > 0) {
        filtered = filtered.filter((client) => {
          if (selectedValues.includes("active") && client.status === "active") {
            return true;
          }
          if (
            selectedValues.includes("inactive") &&
            client.status !== "active"
          ) {
            return true;
          }
          return false;
        });
      }

      if (filterType === "compliance" && selectedValues.length > 0) {
        filtered = filtered.filter((client) =>
          selectedValues.includes(client.compliance.toLowerCase())
        );
      }

      setFilteredClients(filtered);
      setCurrentPage(1);
    },
    [clients]
  );

  const handleSortChange = useCallback(
    (value) => {
      let sorted = [...filteredClients];

      switch (value) {
        case "name-asc":
          sorted.sort((a, b) =>
            `${a.firstName} ${a.lastName}`.localeCompare(
              `${b.firstName} ${b.lastName}`
            )
          );
          break;
        case "name-desc":
          sorted.sort((a, b) =>
            `${b.firstName} ${b.lastName}`.localeCompare(
              `${a.firstName} ${a.lastName}`
            )
          );
          break;
        default:
          break;
      }

      setFilteredClients(sorted);
    },
    [filteredClients]
  );

  const handleSearch = useCallback(
    (term) => {
      const filtered = clients.filter(
        (client) =>
          client.firstName?.toLowerCase().includes(term.toLowerCase()) ||
          client.lastName?.toLowerCase().includes(term.toLowerCase()) ||
          client.email?.toLowerCase().includes(term.toLowerCase()) ||
          client.phone?.toLowerCase().includes(term.toLowerCase()) ||
          client.id?.toLowerCase().includes(term.toLowerCase()) ||
          client.assignedStaff?.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredClients(filtered);
      setCurrentPage(1);
    },
    [clients]
  );

  const togglePopup = useCallback(
    (id, e) => {
      e.stopPropagation();
      setActivePopup(activePopup === id ? null : id);
    },
    [activePopup]
  );

  const closePopups = useCallback(() => {
    setActivePopup(null);
  }, []);

  const handleBulkUploadSuccess = (title, message) => {
    setModalType("success");
    setModalTitle(title);
    setModalMessage(message);
    setShowStatusModal(true);
  };

  const handleBulkUploadError = (title, message) => {
    setModalType("error");
    setModalTitle(title);
    setModalMessage(message);
    setShowStatusModal(true);
  };

  // Calculate total pages based on API count
  const totalPages = Math.ceil(totalCount / 10); // Assuming API returns 20 items per page

  const handleRowClick = useCallback(
    async (clientId) => {
      let cli = clients.find((c) => c.id === clientId);
      if (!cli) return;

      const cacheKey = `clientDetails_${clientId}`;
      if (!clientDetailsCache[cacheKey]) {
        try {
          const fullCli = await fetchSingleClient(clientId);
          setClientDetailsCache((prev) => ({ ...prev, [cacheKey]: fullCli }));
          cli = fullCli;
        } catch (err) {
          console.error(err);
          return;
        }
      } else if (clientDetailsCache[cacheKey]) {
        cli = clientDetailsCache[cacheKey];
      }

      setSelectedClient(cli);
      setShowDetails(true);
    },
    [clients, clientDetailsCache]
  );

  const handleActionClick = useCallback(
    (action, client, e) => {
      e.stopPropagation();
      closePopups();
      switch (action) {
        case "view":
          handleRowClick(client.id);
          break;
        // case "edit":
        //   navigate(`/company/clients/edit/${client.clientId}`);
        //   break;
        case "continue":
          navigate(`/company/rostering/${profile / careplan / client.id}`);
          break;
        case "delete":
          setSelectedClient(client);
          setIsDeleteModalOpen(true);
          break;
        default:
          break;
      }
    },
    [closePopups, navigate]
  );

  const handleClientUpdate = useCallback(
    (id, updatedCli) => {
      setAllClients((prev) => prev.map((c) => (c.id === id ? updatedCli : c)));
      setClientDetailsCache((prev) => ({
        ...prev,
        [`clientDetails_${id}`]: updatedCli,
      }));
      // Refresh list if needed
      loadClients(currentUrl);
    },
    [currentUrl, loadClients]
  );

  // Format percentage for display
  const formatPercentage = useCallback((value) => {
    if (value === 0) return "0% this week";
    const direction = value > 0 ? "up" : "down";
    const absValue = Math.abs(value).toFixed(1);
    return `${absValue}% ${direction} this week`;
  }, []);

  // Memoized statistics cards
  const statisticsCards = useMemo(() => {
    return [
      {
        title: "Total Clients",
        count: statistics.total,
        className: "total",
        percentage: percentageChanges.total,
      },
      {
        title: "Active Clients",
        count: statistics.active,
        className: "active",
        percentage: percentageChanges.active,
      },
      {
        title: "Inactive Clients",
        count: statistics.inactive,
        className: "inactive",
        percentage: percentageChanges.inactive,
      },
    ].map((card, idx) => (
      <motion.div
        key={idx}
        className={`clients-list-statistics-card ${card.className}`}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <h3 className="clients-list-statistics-title">{card.title}</h3>
        <p className="clients-list-statistics-count">
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
    ));
  }, [statistics, percentageChanges, formatPercentage]);

  return (
    <>
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
              className="clients-list-page"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="clients-list-header">
                <div>
                  <h1 className="clients-list-title">Clients</h1>
                  <p className="clients-list-description">
                    View and manage all registered Clients and their details
                  </p>
                </div>

                {!showDetails && (
                  <div className="clients-list-header-actions">
                    <span
                      className="add-client-button"
                      onClick={() => setShowBulkUploadModal(true)}
                    >
                      <p>Bulk upload</p>
                    </span>

                    <div
                      className="add-client-container"
                      ref={addClientDropdownRef}
                    >
                      <motion.button
                        className="add-client-button"
                        onClick={() =>
                          setShowAddClientDropdown(!showAddClientDropdown)
                        }
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <PlusCircleIcon className="" />
                        <p>Add Client</p>
                      </motion.button>

                      {showAddClientDropdown && (
                        <div className="add-client-dropdown">
                          <div
                            className="dropdown-option"
                            onClick={() =>
                              navigate("/company/clients/create/healthcare")
                            }
                          >
                            <span>Healthcare</span>
                            <span className="dropdown-arrow">→</span>
                          </div>
                          <div
                            className="dropdown-option"
                            onClick={() =>
                              navigate("/company/clients/create/others")
                            }
                          >
                            <span>Others</span>
                            <span className="dropdown-arrow">→</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {showDetails && selectedClient ? (
                <ClientInfoPage
                  client={selectedClient}
                  onBack={() => {
                    setShowDetails(false);
                    setSelectedClient(null);
                  }}
                  onUpdate={handleClientUpdate}
                />
              ) : (
                <>
                  {error && (
                    <div className="error-message">
                      {error}
                      <button onClick={() => loadClients(null)}>
                        Try Again
                      </button>
                    </div>
                  )}

                  <div className="clients-list-statistics-cards-container">
                    {statisticsCards}
                  </div>

                  <div className="clients-list-options">
                    <div className="search-input-container">
                      <CiSearch />
                      <input
                        id="search"
                        name="search"
                        type="search"
                        placeholder="Search client"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          handleSearch(e.target.value);
                        }}
                      />
                    </div>
                    {/* <FilterOptions
                      options={filterOptions}
                      onFilterChange={handleFilterChange}
                    /> */}

                    <BulkUploadClients
                      isOpen={showBulkUploadModal}
                      onClose={() => setShowBulkUploadModal(false)}
                      onSuccess={handleBulkUploadSuccess}
                      onError={handleBulkUploadError}
                    />

                    <SortOptions
                      options={sortOptions}
                      onSortChange={handleSortChange}
                    />
                  </div>

                  <div className="clients-list-table">
                    <Table
                      columns={tableColumns}
                      data={filteredClients}
                      isLoading={isLoading}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      emptyStateIcon={<TbMoodEmpty />}
                      emptyStateMessage="No clients found"
                      emptyStateDescription="Try adjusting your search or filter criteria"
                      onRowClick={handleRowClick}
                    />
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      <DeleteClientModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        client={selectedClient}
        onDeleteSuccess={handleDeleteSuccess}
        setIsLoading={setIsLoading}
      />
    </>
  );
};

export default ClientsListPage;

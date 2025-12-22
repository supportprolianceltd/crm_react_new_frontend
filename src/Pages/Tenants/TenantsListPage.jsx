import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { FiMoreVertical } from "react-icons/fi";
import { TbMoodEmpty } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import FilterOptions from "../../components/FilterOptions/FilterOptions";
import SortOptions from "../../components/SortOptions/SortOptions";
import {
  PlusCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import Table from "../../components/Table/Table";
import { fetchTenants, deleteTenant } from "./config/apiConfig";
import DeleteTenantModal from "./modals/DeleteTenantModal";
import "./styles/TenantsListPage.css";
import TenantNavBar from "./TenantNavbar";

const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const TenantsListPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [activePopup, setActivePopup] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [previousPageUrl, setPreviousPageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const API_PAGE_SIZE = 20;

  const statistics = useMemo(
    () => ({
      total: totalCount,
    }),
    [totalCount]
  );

  const previousStats = useState({ total: 0 })[0];
  const percentageChanges = useMemo(
    () => ({
      total: calculatePercentageChange(statistics.total, previousStats.total),
    }),
    [statistics]
  );

  const tableColumns = useMemo(
    () => [
      { key: "id", header: "ID" },
      { key: "name", header: "Name" },
      {
        key: "domain",
        header: "Domain",
        render: (tenant) => {
          const primaryDomain =
            tenant.domains?.find((d) => d.is_primary)?.domain || "N/A";
          return primaryDomain;
        },
      },
      {
        key: "actions",
        header: "Actions",
        render: (tenant) => (
          <div className="actions-cell">
            <div className="actions-container">
              <motion.button
                className="actions-button"
                onClick={(e) => togglePopup(tenant.id, e)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiMoreVertical />
              </motion.button>
              <AnimatePresence>
                {activePopup === tenant.id && (
                  <motion.div
                    className="actions-popup"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <motion.button
                      onClick={(e) => handleActionClick("view", tenant, e)}
                      whileHover={{ x: 5 }}
                    >
                      View Tenant
                    </motion.button>
                    <motion.button
                      onClick={(e) => handleActionClick("delete", tenant, e)}
                      whileHover={{ x: 5 }}
                    >
                      Delete Tenant
                    </motion.button>
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
        value: "name",
        label: "Name",
        subOptions: tenants.map((t) => ({ value: t.name, label: t.name })),
        isCheckbox: true,
      },
    ],
    [tenants]
  );

  const sortOptions = useMemo(
    () => [
      { value: "name-asc", label: "Name (A-Z)" },
      { value: "name-desc", label: "Name (Z-A)" },
      { value: "domain-asc", label: "Domain (A-Z)" },
      { value: "domain-desc", label: "Domain (Z-A)" },
    ],
    []
  );

  const handleFetchTenants = useCallback(async () => {
    setIsLoading(true);
    try {
      const url =
        currentPage === 1
          ? null
          : currentPage > 1 &&
            previousPageUrl &&
            currentPage < Math.ceil(totalCount / API_PAGE_SIZE)
          ? nextPageUrl
          : previousPageUrl;
      const response = await fetchTenants(url);
      setTenants(response.results || []);
      setFilteredTenants(response.results || []);
      setTotalCount(response.count || 0);
      setNextPageUrl(response.next);
      setPreviousPageUrl(response.previous);
    } catch (error) {
      console.error("Error fetching tenants:", error);
      setTenants([]);
      setFilteredTenants([]);
      setTotalCount(0);
      setNextPageUrl(null);
      setPreviousPageUrl(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, nextPageUrl, previousPageUrl, totalCount]);

  useEffect(() => {
    handleFetchTenants();
  }, [handleFetchTenants]);

  const handleFilterChange = useCallback(
    (filterType, selectedValues) => {
      let filtered = [...tenants];
      if (filterType === "name" && selectedValues.length > 0) {
        filtered = filtered.filter((tenant) =>
          selectedValues.includes(tenant.name)
        );
      }
      setFilteredTenants(filtered);
      setCurrentPage(1);
    },
    [tenants]
  );

  const handleSortChange = useCallback(
    (value) => {
      let sorted = [...filteredTenants];
      switch (value) {
        case "name-asc":
          sorted.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name-desc":
          sorted.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "domain-asc":
          sorted.sort((a, b) => {
            const domainA = a.domains?.find((d) => d.is_primary)?.domain || "";
            const domainB = b.domains?.find((d) => d.is_primary)?.domain || "";
            return domainA.localeCompare(domainB);
          });
          break;
        case "domain-desc":
          sorted.sort((a, b) => {
            const domainA = a.domains?.find((d) => d.is_primary)?.domain || "";
            const domainB = b.domains?.find((d) => d.is_primary)?.domain || "";
            return domainB.localeCompare(domainA);
          });
          break;
        default:
          break;
      }
      setFilteredTenants(sorted);
    },
    [filteredTenants]
  );

  const handleSearch = useCallback(
    (term) => {
      const filtered = tenants.filter(
        (tenant) =>
          tenant.name?.toLowerCase().includes(term.toLowerCase()) ||
          tenant.domains?.some((d) =>
            d.domain?.toLowerCase().includes(term.toLowerCase())
          )
      );
      setFilteredTenants(filtered);
      setCurrentPage(1);
    },
    [tenants]
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

  const totalPages = Math.ceil(totalCount / API_PAGE_SIZE);
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredTenants.slice(
    indexOfFirstItem,
    indexOfFirstItem + itemsPerPage
  );

  const handleActionClick = useCallback(
    (action, tenant, e) => {
      e.stopPropagation();
      closePopups();
      switch (action) {
        case "view":
          navigate(`/company/tenants/view/${tenant.id}`);
          break;
        case "delete":
          setSelectedTenant(tenant);
          setIsDeleteModalOpen(true);
          break;
        default:
          break;
      }
    },
    [closePopups, navigate]
  );

  const handleRowClick = useCallback(
    (tenantId) => {
      navigate(`/tenants/view/${tenantId}`);
    },
    [navigate]
  );

  return (
    <>
      <TenantNavBar />
      <motion.div
        className="tenants-list-page"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="tenants-list-header">
          <div>
            <h1 className="tenants-list-title">Tenants</h1>
            <p className="tenants-list-description">
              View and manage all registered tenants and their details
            </p>
          </div>
          <motion.button
            className="add-tenant-button"
            onClick={() => navigate("/tenants/create")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlusCircleIcon />
            <p>Add Tenant</p>
          </motion.button>
        </div>

        <div className="tenants-list-options">
          <div className="search-input-container">
            <CiSearch />
            <input
              id="search"
              name="search"
              type="search"
              placeholder="Search tenant"
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
          <SortOptions options={sortOptions} onSortChange={handleSortChange} />
        </div>

        <div className="tenants-list-table">
          <Table
            columns={tableColumns}
            data={currentItems}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onRowClick={handleRowClick}
            emptyStateIcon={<TbMoodEmpty />}
            emptyStateMessage="No tenants found"
            emptyStateDescription="Try adjusting your search or filter criteria"
          />
          {!isLoading && totalCount > 0 && (
            <div className="pagination-controls">
              <div className="items-per-page">
                <p>Number of rows:</p>
                <select
                  className="form-select"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
              <div className="page-navigation">
                <span className="page-info">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="page-navigation-Btns">
                  <button
                    className="page-button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={!previousPageUrl}
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <button
                    className="page-button"
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={!nextPageUrl}
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
      <DeleteTenantModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        tenant={selectedTenant}
        onDeleteSuccess={handleFetchTenants}
        setIsLoading={setIsLoading}
      />
    </>
  );
};

export default TenantsListPage;

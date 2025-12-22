import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import noDocData from "../../../assets/Img/noDocData.png";
import Pagination from "../../../components/Table/Pagination";

import {
  ChartBarIcon,
  DocumentIcon,
  FolderIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";

import {
  fetchStaffOnboardingDocuments,
  acknowledgeStaffDocument,
} from "./apiConfig";
import StatusBadge from "../../../components/StatusBadge";
import LoadingState from "../../../components/LoadingState";

const OnboardingDocuments = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id?.toString();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "documentNumber",
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successAlert, setSuccessAlert] = useState(false);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const getFileExtension = (url) => {
    if (!url) return "";
    return url.split(".").pop().split("?")[0].split("#")[0].toLowerCase();
  };

  // Fetch documents on component mount
  useEffect(() => {
    const loadDocuments = async () => {
      if (userId) {
        try {
          setLoading(true);
          const data = await fetchStaffOnboardingDocuments(userId);
          // Transform API response to component format
          const transformedDocuments = data.map((item) => {
            const doc = item.document;
            const uploadDate = new Date(doc.uploaded_at)
              .toISOString()
              .split("T")[0];
            const lastModified = new Date(doc.updated_at)
              .toISOString()
              .split("T")[0];
            // Check if current user has acknowledged
            const hasAcknowledged = doc.acknowledgments.some(
              (ack) => ack.user_id === userId
            );
            const status = hasAcknowledged ? "Acknowledged" : "Pending";
            const documentNumber =
              doc.document_number || `DOC-${String(doc.id).padStart(6, "0")}`;
            const userPermission =
              doc.permissions?.find(
                (p) => parseInt(p.user_id) === parseInt(userId)
              )?.permission_level || "view";
            return {
              id: doc.id,
              key: doc.id,
              documentNumber,
              title: doc.title,
              status,
              uploadDate,
              lastModified,
              file_url: doc.file_url,
              acknowledgments: doc.acknowledgments || [],
              permission_level: userPermission,
            };
          });
          setDocuments(transformedDocuments);
        } catch (error) {
          console.error("Failed to fetch documents:", error);
          setDocuments([]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadDocuments();
  }, [userId]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Progress calc
  const totalDocuments = documents.length;
  const acknowledgedDocuments = documents.filter(
    (doc) => doc.status === "Acknowledged"
  ).length;
  const onboardingProgress =
    totalDocuments > 0
      ? Math.round((acknowledgedDocuments / totalDocuments) * 100)
      : 0;

  // Search + Sort
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const filteredAndSortedDocuments = documents
    .filter((doc) => {
      const searchMatch =
        doc.documentNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const statusMatch = statusFilter === "All" || doc.status === statusFilter;
      return searchMatch && statusMatch;
    })
    .sort((a, b) => {
      if (sortConfig.key === "documentNumber") {
        return sortConfig.direction === "asc"
          ? a.documentNumber?.localeCompare(b.documentNumber)
          : b.documentNumber?.localeCompare(a.documentNumber);
      }
      if (sortConfig.key === "title") {
        return sortConfig.direction === "asc"
          ? a.title?.localeCompare(b.title)
          : b.title?.localeCompare(a.title);
      }
      return 0;
    });

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(
    filteredAndSortedDocuments.length / itemsPerPage
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = filteredAndSortedDocuments.slice(
    startIndex,
    endIndex
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Acknowledge doc
  const handleAcknowledge = async (docId) => {
    setIsAcknowledging(true);
    try {
      const acknowledgment = await acknowledgeStaffDocument(docId);
      setDocuments((prevDocs) =>
        prevDocs.map((doc) =>
          doc.id === docId
            ? {
                ...doc,
                acknowledgments: [
                  ...(doc.acknowledgments || []),
                  acknowledgment,
                ],
                status: "Acknowledged",
              }
            : doc
        )
      );
      setSelectedDoc(null);
      setSuccessAlert(true);
      setTimeout(() => setSuccessAlert(false), 3000);
    } catch (error) {
      console.error("Failed to acknowledge document:", error);
      // Optionally add error alert handling here
    } finally {
      setIsAcknowledging(false);
    }
  };

  // Handle download
  const handleDownload = (doc) => {
    if (!doc.file_url) {
      // Optionally handle error
      return;
    }
    const ext = getFileExtension(doc.file_url);
    const link = document.createElement("a");
    link.href = doc.file_url;
    link.download = `${doc.title}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  // Dropdown animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95 },
  };

  const getBadgeClass = (status) => {
    return status === "Acknowledged" ? "badge acknowledged" : "badge pending";
  };

  if (loading) {
    return (
      <div className="OnboardingDocuments-PGBA ooiksl-PPola ooilssa">
        <div className="GHGb-MMIn-DDahs-Top New_MainTt_Header">
          <h3>Onboarding Documents</h3>
        </div>
        <LoadingState text="Loading documents..." />
      </div>
    );
  }

  return (
    <div className="OnboardingDocuments-PGBA ooiksl-PPola ooilssa">
      <div className="GHGb-MMIn-DDahs-Top New_MainTt_Header">
        <h3>Onboarding Documents</h3>
      </div>

      {/* Success Alert */}
      <AnimatePresence>
        {successAlert && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="oo-UI-success-alert"
          >
            <CheckCircleIcon className="h-5 w-5" />
            <span>Document acknowledged successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards */}
      <div className="gths-Cards">
        <div
          className={`HHj-Card ${
            statusFilter === "All" ? "card-active" : "card-inactive"
          }`}
          onClick={() => handleStatusFilter("All")}
        >
          <div className="HHj-Card-1">
            <FolderIcon />
          </div>
          <div className="HHj-Card-2">
            <p>Uploaded Documents</p>
            <h3>{documents.length}</h3>
          </div>
        </div>
        <div
          className={`HHj-Card ${
            statusFilter === "Pending" ? "card-active" : "card-inactive"
          }`}
          onClick={() => handleStatusFilter("Pending")}
        >
          <div className="HHj-Card-1">
            <ClockIcon />
          </div>
          <div className="HHj-Card-2">
            <p>Pending</p>
            <h3>
              {documents.filter((doc) => doc.status === "Pending").length}
            </h3>
          </div>
        </div>
        <div
          className={`HHj-Card ${
            statusFilter === "Acknowledged" ? "card-active" : "card-inactive"
          }`}
          onClick={() => handleStatusFilter("Acknowledged")}
        >
          <div className="HHj-Card-1">
            <DocumentIcon />
          </div>
          <div className="HHj-Card-2">
            <p>Acknowledged</p>
            <h3>
              {documents.filter((doc) => doc.status === "Acknowledged").length}
            </h3>
          </div>
        </div>
        <div className="HHj-Card">
          <div className="HHj-Card-1">
            <ChartBarIcon />
          </div>
          <div className="HHj-Card-2">
            <p>Onboarding Progress</p>
            <h3>{onboardingProgress}%</h3>
          </div>
        </div>
      </div>

      {/* Table */}
      <section className="MAinn-TTable-Sec">
        <div className="PPOlaj-SSde-TopSSUB">
          <div className="oIK-Search">
            <span>
              <MagnifyingGlassIcon className="h-6 w-6" />
            </span>
            <input
              type="text"
              placeholder="Search by ID or Title..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div className="oIK-Btns">
            <button onClick={() => handleSort("title")}>
              Sort by: Title
              <ArrowUpIcon
                className="h-4 w-4"
                style={{
                  transform:
                    sortConfig.key === "title" &&
                    sortConfig.direction === "desc"
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                }}
              />
            </button>
            <button
              onClick={() => handleSort("documentNumber")}
              className="LLl-BBtn-ACCt"
            >
              Sort by: Document Number
              <ArrowUpIcon
                className="h-4 w-4"
                style={{
                  transform:
                    sortConfig.key === "documentNumber" &&
                    sortConfig.direction === "desc"
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                }}
              />
            </button>
          </div>
        </div>

        {filteredAndSortedDocuments.length > 0 ? (
          <div className="table-container Absoluted-Tbd">
            <table>
              <thead>
                <tr>
                  <th>Document Number</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Upload Date</th>
                  <th>Last Modified</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDocuments.map((doc, index) => (
                  <tr
                    key={index}
                    onClick={(e) => {
                      if (e.target.closest(".actions-container")) return;
                      setSelectedDoc(doc);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{doc.documentNumber}</td>
                    <td>{doc.title}</td>
                    <td>
                      <StatusBadge status={doc.status} />
                    </td>
                    <td>{doc.uploadDate}</td>
                    <td>{doc.lastModified}</td>
                    <td>
                      <div className="actions-cell">
                        <div className="actions-container">
                          <button
                            className="actions-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDropdown(doc.id);
                            }}
                          >
                            <EllipsisVerticalIcon />
                          </button>
                          <AnimatePresence>
                            {activeDropdown === doc.id && (
                              <motion.ul
                                ref={dropdownRef}
                                variants={dropdownVariants}
                                className="actions-dropdown"
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                style={{
                                  position: "absolute",
                                  ...(paginatedDocuments.length - index <= 3
                                    ? { bottom: "100%" }
                                    : { top: "100%" }),
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
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedDoc(doc);
                                      setActiveDropdown(null);
                                    }}
                                  >
                                    View File
                                  </button>
                                </li>
                                {doc.permission_level === "view_download" && (
                                  <li>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownload(doc);
                                        setActiveDropdown(null);
                                      }}
                                    >
                                      Download
                                    </button>
                                  </li>
                                )}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="oaiks-NNijs">
            <img src={noDocData} alt="No Data" />
            <p>No documents found.</p>
          </div>
        )}

        {filteredAndSortedDocuments.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </section>

      {/* PDF Modal */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div
            className="pdf-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDoc(null)}
          >
            <motion.div
              className="pdf-modal-content"
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pdf-modal-header">
                <div className="PPf-D-1">
                  <h3>{selectedDoc.title}</h3>
                </div>
                <div className="PPf-D-2">
                  <button
                    onClick={() => handleAcknowledge(selectedDoc.id)}
                    disabled={
                      isAcknowledging || selectedDoc.status === "Acknowledged"
                    }
                    className={`ack-btn ${
                      selectedDoc.status === "Acknowledged" ? "active" : ""
                    }`}
                  >
                    {isAcknowledging
                      ? "Acknowledging..."
                      : selectedDoc.status === "Acknowledged"
                      ? "Acknowledged"
                      : "Acknowledge"}
                  </button>
                  <span
                    onClick={() => setSelectedDoc(null)}
                    className="close-icon"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </span>
                </div>
              </div>

              <div className="pdf-modal-content-MAin">
                <iframe
                  src={selectedDoc.file_url}
                  title="PDF Preview"
                  style={{ width: "100%" }}
                  className="PDF-ViewImH"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingDocuments;

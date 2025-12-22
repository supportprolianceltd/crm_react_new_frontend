import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import "./CompanyPublicJobListingsPage.css";
import { LogoIcon } from "../../assets/icons/LogoIcon";
import { normalizeText } from "../../utils/helpers";
import LoadingState from "../../components/LoadingState";

const CompanyPublicJobListingsPage = () => {
  const { tenantId } = useParams();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({
    key: "title",
    direction: "asc",
  });
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    logo: "",
    title: "",
  });
  const navigate = useNavigate();

  // console.log("wertyuiuytrewertyu")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://server1.prolianceltd.com/api/talent-engine/requisitions/public/published/${tenantId}/`
        );
        setJobs(response.data?.results);
        console.log(response.data?.results);
        setFilteredJobs(response.data?.results);
        setCompanyInfo({
          name: response.data?.tenant?.name || "",
          logo: response.data?.tenant?.logo || "",
          title: response.data?.tenant?.title || "",
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tenantId]);

  useEffect(() => {
    let result = jobs;

    // Apply search filter
    if (searchTerm.trim() !== "") {
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.job_description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          job.job_location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    setFilteredJobs(result);
  }, [searchTerm, jobs, sortConfig]);

  const handleClickApply = (e, requisition) => {
    e.stopPropagation();
    navigate(`/jobs/${requisition.unique_link}`);
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getTimeStatus = (dateString) => {
    if (!dateString) return null;
    const daysLeft = Math.floor(
      (new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft > 0) {
      return `${daysLeft}d left`;
    } else if (daysLeft === 0) {
      return "Today";
    } else {
      return `${Math.abs(daysLeft)}d ago`;
    }
  };

  const getJobTypeStyle = (type) => {
    switch (type) {
      case "full_time":
        return { background: "rgba(114, 38, 255, 0.1)", color: "#7226FF" };
      case "part_time":
        return { background: "rgba(234, 179, 8, 0.1)", color: "#d97706" };
      case "contract":
        return { background: "rgba(16, 185, 129, 0.1)", color: "#047857" };
      default:
        return { background: "rgba(113, 128, 150, 0.1)", color: "#4a5568" };
    }
  };

  // Animation variants
  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    hover: { backgroundColor: "rgba(114, 38, 255, 0.03)" },
  };

  return (
    <div className="job-table-container">
      {/* Header */}
      <motion.div
        className="table-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="company-logo-title">
          <motion.img
            src={companyInfo.logo}
            alt={`${companyInfo.name} logo`}
            className="company-logo"
            whileHover={{ rotate: 5, scale: 1.05 }}
          />
          <div>
            <h1 className="table-title">Job Openings in {companyInfo.title}</h1>
            <div className="table-subtitle">Current available positions</div>
          </div>
        </div>

        {companyInfo.about && (
          <div className="about-us-compact">
            <h3 className="about-title">About Us</h3>
            <p className="about-text">{companyInfo.title}</p>
          </div>
        )}
      </motion.div>

      {/* Search Bar */}
      <motion.div
        className="search-container"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="search-wrapper">
          <div className="search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search jobs by title or location..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Job Table */}
      {loading ? (
        <LoadingState />
      ) : (
        <div className="table-responsive-wrapper">
          <div className="table-scroll-container">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th
                    onClick={() => requestSort("title")}
                    className={
                      sortConfig.key === "title" ? "active-column" : ""
                    }
                  >
                    <div className="header-content">
                      Job Title
                      <span className="sort-indicator">
                        {getSortIndicator("title")}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => requestSort("job_type")}
                    className={
                      sortConfig.key === "job_type" ? "active-column" : ""
                    }
                  >
                    <div className="header-content">
                      Type
                      <span className="sort-indicator">
                        {getSortIndicator("job_type")}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => requestSort("job_location")}
                    className={
                      sortConfig.key === "job_location" ? "active-column" : ""
                    }
                  >
                    <div className="header-content">
                      Location
                      <span className="sort-indicator">
                        {getSortIndicator("job_location")}
                      </span>
                    </div>
                  </th>
                  <th
                    onClick={() => requestSort("deadline_date")}
                    className={
                      sortConfig.key === "deadline_date" ? "active-column" : ""
                    }
                  >
                    <div className="header-content">
                      Deadline
                      <span className="sort-indicator">
                        {getSortIndicator("deadline_date")}
                      </span>
                    </div>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => {
                      return (
                        <React.Fragment key={job?.id}>
                          <motion.tr
                            className="job-row"
                            variants={rowVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                          >
                            <td className="job-title-cell">
                              <div className="job-title">{job?.title}</div>
                              <div className="job-code">{job?.id}</div>
                            </td>
                            <td className="job-type-cell">
                              <span
                                className="job-type"
                                style={getJobTypeStyle(job?.job_type)}
                              >
                                {job?.job_type.replace("_", " ")}
                              </span>
                            </td>
                            <td className="job-location">
                              <div className="location-wrapper">
                                <svg
                                  className="location-icon"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                {normalizeText(job?.location_type)}
                              </div>
                            </td>
                            <td className="job-deadline">
                              {formatDate(job?.deadline_date)}
                              <div
                                className={`deadline-badge ${
                                  getTimeStatus(job?.deadline_date)?.includes(
                                    "ago"
                                  )
                                    ? "past-deadline"
                                    : ""
                                }`}
                              >
                                {getTimeStatus(job?.deadline_date)}
                              </div>
                            </td>
                            <td>
                              <motion.button
                                className="apply-button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => handleClickApply(e, job)}
                              >
                                Apply
                              </motion.button>
                            </td>
                          </motion.tr>
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <motion.tr
                      className="no-results-row"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <td colSpan="6">
                        <div className="no-results-content">
                          <svg
                            className="no-results-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {searchTerm
                            ? "No jobs match your search."
                            : "No job openings at this time."}
                          {searchTerm && (
                            <button
                              className="clear-search-button"
                              onClick={() => setSearchTerm("")}
                            >
                              Clear search
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Powered by footer */}
      <motion.div
        className="powered-by-footer Nav-Brand"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() =>
          window.open("https://crm-frontend-react.vercel.app", "_blank")
        }
      >
        <LogoIcon />
        <span>CRM</span>
      </motion.div>
    </div>
  );
};

export default CompanyPublicJobListingsPage;

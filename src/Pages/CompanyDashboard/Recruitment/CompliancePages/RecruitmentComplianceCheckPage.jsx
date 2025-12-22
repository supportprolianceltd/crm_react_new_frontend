import React, { useState, useEffect } from "react";
import "../styles/ComplianceCheckPage.css";
import {
  UserGroupIcon,
  InformationCircleIcon,
  HandThumbUpIcon,
} from "@heroicons/react/24/outline";
import ApplicantTable from "../../Recruitment/ApplicantTable";
import {
  fetchAllRequisitions,
  fetchJobApplicationsByRequisition,
} from "../../Recruitment/ApiService";

const RecruitmentComplianceCheckPage = () => {
  const [jobRequisitions, setJobRequisitions] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [hiredApplications, setHiredApplications] = useState([]);
  const [totalApplications, setTotalApplications] = useState(0);
  const [hiredCount, setHiredCount] = useState(0);
  const [complianceChecklist, setComplianceChecklist] = useState([]);
  const [lastComplianceCheck, setLastComplianceCheck] = useState(null);
  const [checkedBy, setCheckedBy] = useState("");
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  // Fetch all job requisitions
  const fetchRequisitions = async () => {
    try {
      const response = await fetchAllRequisitions();
      setJobRequisitions(response?.results);
      // console.log(response);

      if (response?.results?.length > 0) {
        const firstJob = response?.results[0];
        setSelectedJobId(firstJob.id);
        setSelectedJob(firstJob);
        await fetchHiredApplications(firstJob.id);
        setComplianceChecklist(firstJob.compliance_checklist || []);
        setLastComplianceCheck(firstJob.last_compliance_check || null);
        setCheckedBy(firstJob.checked_by || "");
      }
    } catch (err) {
      setError(
        err.message ||
          "Failed to load job requisitions. Please try again later."
      );
    }
  };

  // Fetch hired applications for a specific job
  const fetchHiredApplications = async (jobId) => {
    try {
      const response = await fetchJobApplicationsByRequisition(jobId);

      // Filter to only include hired applicants
      const hiredApps = response?.results?.filter(
        (app) => app.status === "hired"
      );
      // console.log(hiredApps);

      setHiredApplications(hiredApps);
      setHiredCount(hiredApps.length);
      setTotalApplications(response?.results?.length);
    } catch (err) {
      console.error("Failed to fetch hired applications:", err);
      setHiredApplications([]);
      setHiredCount(0);
      setTotalApplications(0);
    }
  };

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const handleJobChange = async (e) => {
    const jobId = e.target.value;
    setSelectedJobId(jobId);

    const selected = jobRequisitions.find((job) => job.id === jobId);

    if (selected) {
      setSelectedJob(selected);
      const response = await fetchHiredApplications(jobId);
      // console.log(response);
      setComplianceChecklist(selected.compliance_checklist || []);
      setLastComplianceCheck(selected.last_compliance_check || null);
      setCheckedBy(selected.checked_by || "");
    } else {
      setHiredApplications([]);
      setHiredCount(0);
      setTotalApplications(0);
      setComplianceChecklist([]);
      setLastComplianceCheck(null);
      setCheckedBy("");
    }
  };

  return (
    <div className="Recruitment">
      {error && <div className="error">Error: {error}</div>}

      <div className="ComplianceCheckPage-TOop Gen-Boxshadow">
        <div className="ComplianceCheckPage-TOop-Grid jjjh-filak">
          <div className="ComplianceCheckPage-TOop-1">
            <h2>Compliance Check</h2>
          </div>
          <div className="ComplianceCheckPage-TOop-2">
            <h4>Select Job Position:</h4>
            <select
              className="filter-select"
              value={selectedJobId}
              onChange={handleJobChange}
              disabled={jobRequisitions.length === 0}
            >
              {jobRequisitions.length === 0 ? (
                <option value="">No jobs available</option>
              ) : (
                jobRequisitions.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} - {job.job_application_code}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="Uijauj-UUplao">
          <ul>
            <li>
              <span>
                <UserGroupIcon /> {hiredCount} hired / {totalApplications} total
                applicants
              </span>
            </li>
            <li>
              <span>
                Posted on:{" "}
                {selectedJob?.requested_date
                  ? new Date(selectedJob.requested_date).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        weekday: "long",
                      }
                    )
                  : "N/A"}
              </span>
            </li>
            <li>
              <span>Status: {selectedJob?.status || "N/A"}</span>
            </li>
          </ul>
        </div>

        <div className="OUkas-POka">
          <h2>{selectedJob?.title || "Select a job"}</h2>
          <p>
            <InformationCircleIcon /> Last compliance check is{" "}
            <b>
              {lastComplianceCheck
                ? new Date(lastComplianceCheck).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    weekday: "long",
                  })
                : "N/A"}
            </b>{" "}
            by <b>{checkedBy || "N/A"}</b>
          </p>
        </div>
      </div>

      <ApplicantTable
        jobId={selectedJobId}
        complianceChecklist={complianceChecklist}
        applications={hiredApplications}
        showOnlyHired={true}
      />
    </div>
  );
};

export default RecruitmentComplianceCheckPage;

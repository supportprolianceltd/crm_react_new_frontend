import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import SideNavBar from "../../../Home/SideNavBar";
import StatusBadge from "../../../../../components/StatusBadge";
import ToastNotification from "../../../../../components/ToastNotification";
import "./EligibilityReport.css";
import { checkForEligibleCarers } from "../../config/apiConfig";

const EligibilityReport = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [shrinkNav, setShrinkNav] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const MockSummary = {
    totalCarers: 7,
    eligibleCarers: 2,
    ineligibleCarers: 5,
    alternativeOptions: 0,
    checkedSchedule: true,
  };

  const MockEligibleCarers = [
    {
      carerId: 54,
      carerName: "Noah Caregiver",
      email: "noah@x.com",
      employed: "Employed",
      skills: "Palliative Care",
      proficiency_level: "Expert",
      description:
        "Specialized in end-of-life care, pain management, and providing comfort to terminally ill patients and their families.",
      acquired_date: "2017-04-12",
      years_of_experience: 8,
      certificate: "Certified Carer",
      certificate_url: "mycertificate.com",
      last_updated_by_id: "2",
      last_updated_by: {
        id: 2,
        email: "support@appbrew.com",
        first_name: "Abib",
        last_name: "Achmed",
      },
      skillsMatch: {
        matchingSkills: "Palliative Care",
        missingSkills: "Overnight Monitoring",
      },
      availability: {
        isAvailable: "Yes",
        availableHours: "monday: 8am-4pm",

        availabilitySuggestion: "tuesday: 7am-3pm",
      },
    },

    {
      carerId: 55,
      carerName: "Ava Smith",
      email: "ava@x.com",
      employed: "Employed",
      skills: "Overnight Monitoring",
      proficiency_level: "Expert",
      description:
        "Experienced in overnight patient monitoring, sleep pattern observation, and responding to nighttime emergencies.",
      acquired_date: "2017-04-12",
      years_of_experience: 8,
      certificate: "Certified Carer",
      certificate_url: "mycertificate.com",
      last_updated_by_id: "2",
      last_updated_by: {
        id: 2,
        email: "support@appbrew.com",
        first_name: "Abib",
        last_name: "Achmed",
      },
      skillsMatch: {
        matchingSkills: "Overnight Monitoring",
        missingSkills: "Palliative Care",
      },
      availability: {
        isAvailable: "Yes",
        availableHours: "monday: 8am-4pm",

        availabilitySuggestion: "tuesday: 7am-3pm",
      },
    },
  ];

  useEffect(() => {
    if (successMsg || errorMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg("");
        setErrorMsg("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, errorMsg]);

  useEffect(() => {
    let mounted = true;

    const loadReport = async () => {
      if (location.state?.reportData) {
        setReportData(location.state.reportData);
        return;
      }

      if (location.state?.eligibleCarers && location.state?.requestDetails) {
        setReportData({
          requestId: location.state.requestDetails.id || id,
          requestDetails: location.state.requestDetails,
          eligibleCarers: location.state.eligibleCarers,
          summary: {
            totalCarers: location.state.eligibleCarers.length,
            eligibleCarers: location.state.eligibleCarers.length,
            ineligibleCarers: 0,
          },
        });
      }

      if (eligibleCarers == 0) {
        setReportData(mockResponse.data);
        return;
      }

      setLoading(true);
      try {
        const resp = await checkForEligibleCarers(id);
        const data = resp?.data ? resp.data : resp;
        if (mounted) setReportData(data);
      } catch (err) {
        console.error("Eligibility report API error:", err);
        setErrorMsg("Failed to load eligibility report");
        if (mounted) setReportData(mockResponse.data);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadReport();
    return () => {
      mounted = false;
    };
  }, [id, location.state]);

  const eligibleCarers =
    reportData?.eligibleCarers?.map((carer) => ({
      id: carer.id,
      name: carer.carerName || carer.name || "Unknown",
      email: carer.email || carer.carerEmail || "",
      employed: carer.employment || "",
      skills: carer.skills.skill_name,
      proficiency: carer.skills.proficiency_level,
      description: carer.skills.description,
      acquired: carer.skills.acquired_date,
      experience: carer.skills.years_of_experience,
      certificate: carer.skills.certificate,
      certificateUrl: carer.skills.certificate_url,
      lastUpdatedByEmail: carer.skills.last_updated_by.email,
      lastUpdatedByFName: carer.skills.last_updated_by.first_name,
      lastUpdatedByLName: carer.skills.last_updated_by.last_name,
      skillsMatch: carer.skillsMatch.matchingSkills,
      missingSkills: carer.skillsMatch.missingSkills,
      requirementsMatch: carer.skillsMatch.requirementsMatch,
      availability: carer.availability.isAvailable,
      availableHours: carer.availability.availableHours,
      availabilitySuggestion: carer.availability.suggestion,
    })) || [];

  const requestDetails =
    reportData?.requestDetails || location.state?.requestDetails || {};

  const handleGoBack = () => navigate(-1);

  const handleDownloadReport = () => {
    const payload = {
      requestId: requestDetails.id,
      subject: requestDetails.subject,
      serviceType: requestDetails.serviceType,
      clientName: requestDetails.clientName,
      eligibleCarersCount: eligibleCarers.length,
      eligibleCarers: eligibleCarers.map((carer) => ({
        id: carer.id,
        name: carer.carerName || carer.name || "Unknown",
        email: carer.email || carer.carerEmail || "",
        employed: carer.employment || "",
        skills: carer.skills.skill_name,
        proficiency: carer.skills.proficiency_level,
        description: carer.skills.description,
        acquired: carer.skills.acquired_date,
        experience: carer.skills.years_of_experience,
        certificate: carer.skills.certificate,
        certificateUrl: carer.skills.certificate_url,
        lastUpdatedByEmail: carer.skills.last_updated_by.email,
        lastUpdatedByFName: carer.skills.last_updated_by.first_name,
        lastUpdatedByLName: carer.skills.last_updated_by.last_name,
        skillsMatch: carer.skillsMatch.matchingSkills,
        missingSkills: carer.skillsMatch.missingSkills,
        requirementsMatch: carer.skillsMatch.requirementsMatch,
        availability: carer.availability.isAvailable,
        availableHours: carer.availability.availableHours,
        availabilitySuggestion: carer.availability.suggestion,
      })),
      generatedDate: new Date().toLocaleString(),
    };

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," +
        encodeURIComponent(JSON.stringify(payload, null, 2))
    );
    element.setAttribute(
      "download",
      `eligibility-report-${requestDetails.id || "report"}.json`
    );
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setSuccessMsg("Report downloaded successfully!");
  };

  return (
    <div className={`DB-Envt ${shrinkNav ? "ShrinkNav" : ""}`}>
      <SideNavBar setShrinkNav={setShrinkNav} />
      <div className="Main-DB-Envt">
        <div className="DB-Envt-Container">
          <div className="eligibility-report-page">
            <div className="eligibility-report-header">
              <button className="back-btn" onClick={handleGoBack}>
                <IoArrowBack /> Back
              </button>
              <h1>Eligibility Report</h1>
              <div />
            </div>

            <div className="eligibility-report-container">
              <div className="report-request-info">
                <h2>Request Details</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Request ID</label>
                    <p className="info-value">{requestDetails.id}</p>
                  </div>
                  <div className="info-item">
                    <label>Subject</label>
                    <p className="info-value">
                      {requestDetails.subject || "N/A"}
                    </p>
                  </div>
                  <div className="info-item">
                    <label>Service Type</label>
                    <p className="info-value">
                      {requestDetails.serviceType || "N/A"}
                    </p>
                  </div>
                  <div className="info-item">
                    <label>Client Name</label>
                    <p className="info-value">
                      {requestDetails.clientName || "N/A"}
                    </p>
                  </div>
                  <div className="info-item">
                    <label>Status</label>
                    <div className="info-value">
                      <StatusBadge
                        status={requestDetails.status || "pending"}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="report-eligible-carers">
                <div className="carers-header">
                  {/* <h2>Eligible Carers ({eligibleCarers.length})</h2> */}

                  {/* mock data */}
                  <div className="carer-num">
                    <h4>Total Carers ({MockSummary.totalCarers})</h4>
                    <h4>Eligible Carers ({MockSummary.eligibleCarers})</h4>
                  </div>
                  <button
                    className="download-btn"
                    onClick={handleDownloadReport}
                  >
                    Download Report
                  </button>
                </div>
                {loading ? (
                  <p>Loading eligibility results…</p>
                ) : eligibleCarers.length > 0 ? (
                  <div className="carers-list">
                    {eligibleCarers.map((carer, index) => (
                      <div key={carer.id || index} className="carer-card">
                        <div className="carer-index">{index + 1}</div>

                        <div className="carer-info">
                          <h3 className="carer-name">{carer.name}</h3>
                          {carer.email && (
                            <p className="carer-detail">
                              <span className="label">Email:</span>
                              <span className="value">{carer.email}</span>
                            </p>
                          )}
                          {carer.employed && (
                            <p className="carer-detail">
                              <span className="label">Employment Status:</span>
                              <span className="value">{carer.employed}</span>
                            </p>
                          )}
                          {carer.skills && (
                            <p className="carer-detail">
                              <span className="label">Skills:</span>
                              <span className="value">{carer.skills}</span>
                            </p>
                          )}
                          {carer.proficiency && (
                            <p className="carer-detail">
                              <span className="label">proficiency:</span>
                              <span className="value">{carer.proficiency}</span>
                            </p>
                          )}
                          {carer.description && (
                            <p className="carer-detail">
                              <span className="label">description:</span>
                              <span className="value">{carer.description}</span>
                            </p>
                          )}

                          {carer.experience && (
                            <p className="carer-detail">
                              <span className="label">Experience:</span>
                              <span className="value">
                                {carer.experience} years
                              </span>
                            </p>
                          )}
                          {carer.certificate && (
                            <p className="carer-detail">
                              <span className="label">Certificate:</span>
                              <span className="value">{carer.certificate}</span>
                            </p>
                          )}
                          {carer.acquired && (
                            <p className="carer-detail">
                              <span className="label">Date acquired:</span>
                              <span className="value">{carer.acquired}</span>
                            </p>
                          )}

                          {carer.certificateUrl && (
                            <p className="carer-detail">
                              <span className="label">Certificate Link:</span>
                              <span className="value">
                                {carer.certificateUrl}
                              </span>
                            </p>
                          )}

                          {carer.lastUpdatedByEmail && (
                            <p className="carer-detail">
                              <span className="label">Last Updated Email:</span>
                              <span className="value">
                                {carer.lastUpdatedByEmail} <br />
                                {carer.lastUpdatedByFName}
                                {carer.lastUpdatedByLName}
                              </span>
                            </p>
                          )}

                          {carer.skillsMatch.matchingSkills && (
                            <p className="carer-detail">
                              <span className="label">Matching Skills:</span>
                              <span className="value">
                                {carer.skillsMatch.matchingSkills}
                              </span>
                            </p>
                          )}

                          {carer.skillsMatch.missingSkills && (
                            <p className="carer-detail">
                              <span className="label">Missing Skills:</span>
                              <span className="value">
                                {carer.skillsMatch.missingSkills}
                              </span>
                            </p>
                          )}

                          {carer.availability.isAvailable && (
                            <p className="carer-detail">
                              <span className="label">Available:</span>
                              <span className="value">
                                {carer.availability.isAvailable}
                              </span>
                            </p>
                          )}

                          {carer.availability.availableHours && (
                            <p className="carer-detail">
                              <span className="label">Available:</span>
                              <span className="value">
                                {carer.availability.availableHours}
                              </span>
                            </p>
                          )}

                          {carer.availability.availabilitySuggestion && (
                            <p className="carer-detail">
                              <span className="label">Available:</span>
                              <span className="value">
                                {carer.availability.availabilitySuggestion}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-carers-found">
                    {/* <p>No eligible carers found for this request.</p> */}
                    {MockEligibleCarers.map((carer, index) => (
                      <div key={carer.id || index} className="carer-card">
                        <div className="carer-index">{index + 1}</div>

                        <p className="carer-detail">
                          <span className="label">Carer ID:</span>
                          <span className="value">{carer.id}</span>
                        </p>
                        <p className="carer-detail">
                          <span className="label">Carer Name:</span>
                          <span className="value">{carer.carerName}</span>
                        </p>
                        <p className="carer-detail">
                          <span className="label">Email:</span>
                          <span className="value">{carer.email}</span>
                        </p>

                        <p className="carer-detail">
                          <span className="label">Employment Status:</span>
                          <span className="value">{carer.employed}</span>
                        </p>

                        <p className="carer-detail">
                          <span className="label">Skills:</span>
                          <span className="value">{carer.skills}</span>
                        </p>

                        <p className="carer-detail">
                          <span className="label">Proficiency:</span>
                          <span className="value">
                            {carer.proficiency_level}
                          </span>
                        </p>

                        <p className="carer-detail">
                          <span className="label">Description:</span>
                          <span className="value">{carer.description}</span>
                        </p>

                        <p className="carer-detail">
                          <span className="label">Experience:</span>
                          <span className="value">
                            {carer.years_of_experience} years
                          </span>
                        </p>

                        <p className="carer-detail">
                          <span className="label">Certificate:</span>
                          <span className="value">{carer.certificate}</span>
                        </p>

                        <p className="carer-detail">
                          <span className="label">Date acquired:</span>
                          <span className="value">{carer.acquired_date}</span>
                        </p>

                        <p className="carer-detail">
                          <span className="label">Certificate Link:</span>
                          <span className="value">{carer.certificate_url}</span>
                        </p>

                        <p className="carer-detail">
                          <span className="label">Last Updated By:</span>
                          <span className="value">
                            {carer.last_updated_by.first_name}
                            {carer.last_updated_by.last_name} -
                            {carer.last_updated_by.email}
                          </span>
                        </p>

                        <p className="carer-detail">
                          <span className="label">Matching Skills</span>
                          <span className="value">
                            {carer.skillsMatch.matchingSkills}
                          </span>
                        </p>

                        <p className="carer-detail">
                          <span className="label">Missing Skills</span>
                          <span className="value">
                            {carer.skillsMatch.missingSkills}
                          </span>
                        </p>

                        <p className="carer-detail">
                          <span className="label">Availabile</span>
                          <span className="value">
                            {carer.availability.isAvailable}
                          </span>
                        </p>

                        <p className="carer-detail">
                          <span className="label">Availability Hours</span>
                          <span className="value">
                            {carer.availability.availableHours}
                          </span>
                        </p>

                        <p className="carer-detail">
                          <span className="label">
                            Suggested Availability Hours
                          </span>
                          <span className="value">
                            {carer.availability.availabilitySuggestion}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="report-actions">
                <button
                  className="action-btn back-to-requests"
                  onClick={handleGoBack}
                >
                  Back to Request Details
                </button>
                <button
                  className="action-btn download-btn-alt"
                  onClick={handleDownloadReport}
                >
                  Download Full Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastNotification successMessage={successMsg} errorMessage={errorMsg} />
    </div>
  );
};

export default EligibilityReport;

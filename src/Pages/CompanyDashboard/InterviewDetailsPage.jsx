import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DiscussionEmbed } from "disqus-react";
import {
  calculateInterviewStatus,
  formatRemainingTime,
  extractRoomId,
  statusMessages,
  calculateDuration,
  getValidDate,
} from "../../utils/interviewUtils";
import "./InterviewDetailsPage.css";
import JitsiVideoCall from "../../components/VideoCall/VideoCall";
import ToastNotification from "../../components/ToastNotification";
import { fetchTenantConfig } from "./Recruitment/ApiService";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    color: "#333",
  },
  header: {
    marginBottom: 25,
    borderBottom: "1px solid #e0e0e0",
    paddingBottom: 20,
  },
  companyHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  companyInfo: {
    flex: 1,
  },
  companyLogo: {
    width: 100,
    height: "auto",
    objectFit: "contain",
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  companyAbout: {
    fontSize: 10,
    color: "#7f8c8d",
    marginTop: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 25,
  },
  heading: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
    borderBottom: "1px solid #eee",
    paddingBottom: 5,
  },
  text: {
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 5,
  },
  highlightText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  candidateInfo: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  scoreContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  scoreLabel: {
    width: 150,
    fontSize: 12,
  },
  scoreBar: {
    height: 10,
    backgroundColor: "#ecf0f1",
    borderRadius: 5,
    marginRight: 10,
    flexGrow: 1,
  },
  scoreFill: (value) => ({
    height: "100%",
    width: `${(value / 5) * 100}%`,
    backgroundColor:
      value >= 4 ? "#2ecc71" : value >= 3 ? "#f39c12" : "#e74c3c",
    borderRadius: 5,
  }),
  scoreValue: {
    fontSize: 12,
    fontWeight: "bold",
    width: 30,
    textAlign: "right",
  },
  tag: {
    display: "inline-block",
    backgroundColor: "#e0f7fa",
    color: "#00838f",
    padding: "3px 8px",
    borderRadius: 4,
    marginRight: 5,
    marginBottom: 5,
    fontSize: 11,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 10,
    color: "#95a5a6",
    borderTop: "1px solid #eee",
    paddingTop: 10,
  },
});

const InterviewPDFReport = ({ interview, scores, tags, companyInfo }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.companyHeader}>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{companyInfo.title}</Text>
          {companyInfo.about_us && (
            <Text style={styles.companyAbout}>{companyInfo.about_us}</Text>
          )}
        </View>
        {companyInfo.logo && (
          <Image
            style={styles.companyLogo}
            src={companyInfo.logo}
            alt="Company Logo"
          />
        )}
      </View>
      <View style={styles.header}>
        <Text style={styles.title}>Interview Evaluation Report</Text>
        <Text style={styles.subtitle}>
          {interview?.job_requisition_title} Position
        </Text>
        <View style={styles.candidateInfo}>
          <View>
            <Text style={styles.highlightText}>
              Candidate: {interview?.candidate_name}
            </Text>
            <Text style={styles.text}>Interview ID: {interview?.id}</Text>
          </View>
          <View>
            <Text style={styles.text}>
              Date: {new Date(interview?.created_at).toLocaleDateString()}
            </Text>
            <Text style={styles.text}>
              Interviewer: {interview?.interviewer_name}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.heading}>Evaluation Scores</Text>
        {scores.map((score, i) => (
          <View key={i} style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>{score.name}:</Text>
            <View style={styles.scoreBar}>
              <View style={styles.scoreFill(score.value)} />
            </View>
            <Text style={styles.scoreValue}>{score.value}/5</Text>
          </View>
        ))}
      </View>
      <View style={styles.section}>
        <Text style={styles.heading}>Key Assessment Tags</Text>
        <View
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          {tags.map((tag, i) => (
            <Text key={i} style={styles.tag}>
              {tag}
            </Text>
          ))}
        </View>
      </View>
      <View style={styles.footer} fixed>
        <Text>
          Confidential - {new Date().toLocaleDateString()} - ©{" "}
          {new Date().getFullYear()} {companyInfo.title}
        </Text>
      </View>
    </Page>
  </Document>
);

// New component for applicant-specific RHS content
const ApplicantView = ({
  interview,
  room,
  meetingTime,
  durationMinutes,
  status,
  getStatusMessage,
  handleJoinMeeting,
  companyInfo,
}) => (
  <motion.div
    className="interview-right applicant-view"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.2 }}
  >
    <motion.h3
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      Welcome, {interview?.candidate_name}!
    </motion.h3>
    <motion.div
      className="tool-box"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h4>Your Interview Details</h4>
      <p>
        <strong>Role:</strong> {interview?.job_requisition_title}
      </p>
      <p>
        <strong>Date:</strong> {meetingTime.format("dddd, MMM D, YYYY")}
      </p>
      <p>
        <strong>Time:</strong> {meetingTime.format("hh:mm A")}
      </p>
      <p>
        <strong>Duration:</strong> {durationMinutes} minutes
      </p>
      <p>
        <strong>Interviewer:</strong> {interview?.interviewer_name}
      </p>
      <p>
        <strong>Meeting Room:</strong> {room}
      </p>
    </motion.div>
    <motion.div
      className="tool-box"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <h4>Join Your Interview</h4>
      {status === "join" ? (
        <motion.button
          onClick={handleJoinMeeting}
          className="join-link"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {getStatusMessage()}
        </motion.button>
      ) : (
        <p>{getStatusMessage()}</p>
      )}
      <p className="meeting-instructions">
        Please join the meeting using the room name above at the scheduled time.
      </p>
    </motion.div>
    <motion.div
      className="tool-box"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <h4>Preparation Tips</h4>
      <ul>
        <li>
          Test your internet connection, microphone, and camera in advance.
        </li>
        <li>Find a quiet, well-lit space for the interview.</li>
        <li>
          Review the job description and prepare questions for the interviewer.
        </li>
        <li>
          Be ready to discuss your experience and skills relevant to the role.
        </li>
        <li>Join the meeting a few minutes early to ensure a smooth start.</li>
      </ul>
      {companyInfo.about_us && (
        <p>
          <strong>About {companyInfo.title}:</strong> {companyInfo.about_us}
        </p>
      )}
    </motion.div>
  </motion.div>
);

const InterviewDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const interview = location.state?.interview;
  // Check localStorage for user role
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;
  const isAdmin = userRole === "admin"; // Determine if user is admin
  const [companyInfo, setCompanyInfo] = useState({});
  const [isFetchingCompanyInfo, setIsFetchingCompanyInfo] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [scores, setScores] = useState([]);
  const [customScore, setCustomScore] = useState("");
  const [tags, setTags] = useState([]);
  const [customTag, setCustomTag] = useState("");
  const [inCall, setInCall] = useState(false);

  const room = `interview-${interview?.id}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  const scoreSuggestions = [
    "Technical Skills",
    "Communication",
    "Problem Solving",
    "Cultural Fit",
    "Leadership",
    "Creativity",
  ];

  const tagSuggestions = [
    "Frontend",
    "Backend",
    "Leadership",
    "Remote-ready",
    "Junior",
    "Senior",
  ];

  useEffect(() => {
    setScores([
      { name: "Technical Skills", value: 0 },
      { name: "Communication", value: 0 },
    ]);
  }, []);

  const handleJoinMeeting = () => {
    setInCall(true);
  };

  const handleEndCall = () => {
    setInCall(false);
  };

  const meetingTime = getValidDate(interview?.interview_start_date_time);
  const meetingEndTime = getValidDate(interview?.interview_end_date_time);
  const durationMinutes = calculateDuration(
    interview?.interview_start_date_time,
    interview?.interview_end_date_time
  );
  const status = calculateInterviewStatus(interview);

  const handleRate = (index, rating) => {
    const newScores = [...scores];
    newScores[index].value = rating;
    setScores(newScores);
  };

  const addScoreCriteria = (criteria) => {
    if (!scores.some((score) => score.name === criteria)) {
      setScores([...scores, { name: criteria, value: 0 }]);
    }
  };

  const addCustomScore = () => {
    if (
      customScore.trim() &&
      !scores.some((score) => score.name === customScore.trim())
    ) {
      setScores([...scores, { name: customScore.trim(), value: 0 }]);
      setCustomScore("");
    }
  };

  const removeScore = (index) => {
    const newScores = [...scores];
    newScores.splice(index, 1);
    setScores(newScores);
  };

  const addTag = (tag) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const addCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      setTags([...tags, customTag.trim()]);
      setCustomTag("");
    }
  };

  const removeTag = (index) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };

  const renderStars = (index) => {
    const rating = scores[index].value;
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((val) => (
          <span
            key={val}
            className={`star ${val <= rating ? "filled" : ""}`}
            onClick={() => handleRate(index, val)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const getStatusMessage = () => {
    if (status === "not_started") {
      return statusMessages.not_started(
        formatRemainingTime(interview?.interview_start_date_time)
      );
    }
    return statusMessages[status];
  };

  const fetchCompanyProfile = async () => {
    setIsFetchingCompanyInfo(true);
    try {
      const response = await fetchTenantConfig();
      setCompanyInfo({
        title: response.title || "",
        about_us: response.about_us || "",
        logo: response.logo || null,
      });
    } catch (error) {
      setErrorMessage("Failed to fetch company profile." || error?.message);
    } finally {
      setIsFetchingCompanyInfo(false);
      setSuccessMessage("");
      setErrorMessage("");
    }
  };

  const getDisqusConfig = () => ({
    url: `${window.location.origin}/interview/${interview?.id}`,
    identifier: `interview-${interview?.id}`,
    title: `Interview with ${interview?.candidate_name} for ${interview?.job_requisition_title}`,
  });

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (window.DISQUS) {
        window.DISQUS.reset({
          reload: true,
          config: getDisqusConfig(),
        });
      }
    };
  }, [interview?.id]);

  // Handle case where interview or userRole is not available
  // if (!interview) {
  //   return <div>No interview selected.</div>;
  // }

  console.log(userRole);

  if (!userRole) {
    return <div>Please log in to view this page.</div>;
  }

  return (
    <>
      <ToastNotification successMessage={successMessage} />
      <ToastNotification errorMessage={errorMessage} />
      <motion.div
        className="interview-page-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ height: "100vh" }}
      >
        {/* LEFT SIDE */}
        <div className="interview-left">
          <AnimatePresence mode="wait">
            {!inCall ? (
              <JitsiVideoCall
                room={room}
                displayName={interview?.interviewer_name}
                onEndCall={handleEndCall}
                interview={interview}
              />
            ) : (
              <motion.div
                key={status}
                className={`status-card ${status}`}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {status === "join" ? (
                  <motion.button
                    onClick={handleJoinMeeting}
                    className="join-link"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {getStatusMessage()}
                  </motion.button>
                ) : (
                  <p>{getStatusMessage()}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            className="interview-details"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2>Interview Details</h2>
            <p>
              <strong>Candidate:</strong> {interview?.candidate_name}
            </p>
            <p>
              <strong>Role:</strong> {interview?.job_requisition_title}
            </p>
            <p>
              <strong>Date:</strong> {meetingTime.format("dddd, MMM D, YYYY")}
            </p>
            <p>
              <strong>Time:</strong> {meetingTime.format("hh:mm A")}
            </p>
            <p>
              <strong>Duration:</strong> {durationMinutes} minutes
            </p>
            {inCall && (
              <div className="jitsi-meeting-info">
                <p>
                  <strong>Meeting Room:</strong> {room}
                </p>
                <p className="meeting-instructions">
                  Share this room name with the candidate:&nbsp;
                  <strong>{room}</strong>
                </p>
              </div>
            )}
          </motion.div>
        </div>
        {/* RIGHT SIDE */}
        {!isAdmin ? (
          <motion.div
            className="interview-right"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.2 } },
            }}
          >
            <motion.h3
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Live Interview Tools
            </motion.h3>
            <motion.div
              className="tool-box"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h4>Interview Scoring</h4>
              <div className="suggestions-container">
                <p>Add scoring criteria:</p>
                <div className="suggestions">
                  {scoreSuggestions.map((suggestion) => (
                    <motion.span
                      key={suggestion}
                      className="suggestion"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addScoreCriteria(suggestion)}
                    >
                      {suggestion}
                    </motion.span>
                  ))}
                </div>
                <div className="custom-input-container">
                  <input
                    type="text"
                    value={customScore}
                    onChange={(e) => setCustomScore(e.target.value)}
                    placeholder="Add custom criteria"
                  />
                  <button onClick={addCustomScore}>Add</button>
                </div>
              </div>
              <div className="scores-grid">
                {scores.map((score, index) => (
                  <div key={index} className="score-item">
                    <div className="score-header">
                      <strong>{score.name}</strong>
                      <button
                        className="remove-btn"
                        onClick={() => removeScore(index)}
                      >
                        ×
                      </button>
                    </div>
                    {renderStars(index)}
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              className="tool-box"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h4>Tagging</h4>
              <div className="suggestions-container">
                <p>Add tags:</p>
                <div className="suggestions">
                  {tagSuggestions.map((tag) => (
                    <motion.span
                      key={tag}
                      className="suggestion"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addTag(tag)}
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
                <div className="custom-input-container">
                  <input
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="Add custom tag"
                  />
                  <button onClick={addCustomTag}>Add</button>
                </div>
              </div>
              <div className="tags">
                {tags.map((tag, index) => (
                  <motion.span
                    key={index}
                    className="tag"
                    whileHover={{ scale: 1.1, backgroundColor: "#d6d8ff" }}
                  >
                    {tag}
                    <span
                      className="remove-tag"
                      onClick={() => removeTag(index)}
                    >
                      ×
                    </span>
                  </motion.span>
                ))}
              </div>
            </motion.div>
            <motion.div
              className="tool-box comments-box"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h4>Collaborative Notes</h4>
              <DiscussionEmbed
                shortname="kaefy"
                config={getDisqusConfig()}
                key={`disqus-${interview?.id}`}
              />
            </motion.div>
            <PDFDownloadLink
              document={
                <InterviewPDFReport
                  interview={interview}
                  scores={scores}
                  tags={tags}
                  companyInfo={companyInfo}
                />
              }
              fileName={`${interview?.candidate_name}'s_interview_report.pdf`}
            >
              {({ loading }) => (
                <motion.div
                  className="submit-container"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <button
                    disabled={loading}
                    className="submit-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {loading
                      ? "Generating PDF..."
                      : "📄 Generate Interview Report"}
                  </button>
                </motion.div>
              )}
            </PDFDownloadLink>
          </motion.div>
        ) : (
          <ApplicantView
            interview={interview}
            room={room}
            meetingTime={meetingTime}
            durationMinutes={durationMinutes}
            status={status}
            getStatusMessage={getStatusMessage}
            handleJoinMeeting={handleJoinMeeting}
            companyInfo={companyInfo}
          />
        )}
      </motion.div>
    </>
  );
};

export default InterviewDetailsPage;

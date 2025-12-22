import React, { useState, useEffect } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { motion } from "framer-motion";
import { getJitsiToken } from "../../Pages/CompanyDashboard/Recruitment/ApiService";
import "./VideoCall.css";

const JitsiVideoCall = ({ room, displayName, onEndCall, interview }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [jitsiApi, setJitsiApi] = useState(null);
  const [token, setToken] = useState(null);
  const [joinLink, setJoinLink] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;
  const isAdmin = userRole === "admin";

  // Fetch Jitsi token and generate join link
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const jwt = await getJitsiToken(room);
        console.log("JWT Token:", jwt);
        setToken(jwt);
        // Generate the join link with the JWT token
        const link = `https://meet.server1.prolianceltd.com/${room}?jwt=${jwt}`;
        setJoinLink(
          `https://crm-frontend-react.vercel.app/interview/${room}/jwt=${jwt}`
        );
      } catch (error) {
        console.error("Error getting Jitsi token", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchToken();
  }, [room]);

  const jitsiConfig = {
    roomName: room,
    jwt: token, // Secure token for authentication
    userInfo: {
      displayName: displayName || "Interviewer",
      email: "",
    },
    onApiReady: (externalApi) => {
      console.log("Jitsi API Ready");
      setJitsiApi(externalApi);
      setIsLoading(false);

      // Add event listeners
      externalApi.addListener("videoConferenceJoined", (data) => {
        console.log("Joined conference:", data);
      });

      externalApi.addListener("videoConferenceLeft", (data) => {
        console.log("Left conference:", data);
        onEndCall();
      });

      externalApi.addListener("participantJoined", (data) => {
        console.log("Participant joined:", data);
      });

      externalApi.addListener("participantLeft", (data) => {
        console.log("Participant left:", data);
      });

      externalApi.addListener("audioMuteStatusChanged", (data) => {
        console.log("Audio mute status changed:", data);
      });

      externalApi.addListener("videoMuteStatusChanged", (data) => {
        console.log("Video mute status changed:", data);
      });
    },
    onReadyToClose: () => {
      console.log("Ready to close");
      onEndCall();
    },
    getIFrameRef: (iframeRef) => {
      iframeRef.style.height = "100%";
      iframeRef.style.width = "100%";
      iframeRef.style.borderRadius = "12px";
    },
  };

  const handleEndCallClick = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand("hangup");
    }
    onEndCall();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinLink);
    alert("Join link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="jitsi-loading">
        <div className="loading-spinner"></div>
        <p>Loading video conference...</p>
      </div>
    );
  }

  if (!token) {
    return <p>❌ Could not get token. Please try again.</p>;
  }

  return (
    <motion.div
      className="jitsi-video-call-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="jitsi-header">
        <h3>Interview with {interview?.candidate_name}</h3>
        <button className="end-call-btn" onClick={handleEndCallClick}>
          End Call
        </button>
      </div>

      <div className="jitsi-meeting-container">
        <JitsiMeeting {...jitsiConfig} />
      </div>

      <div className="jitsi-instructions">
        <p>
          <strong>Room:</strong> {room}
        </p>
        {isAdmin && (
          <>
            <p>
              <strong>Join Link:</strong>{" "}
              <a href={joinLink} target="_blank" rel="noopener noreferrer">
                {joinLink}
              </a>
            </p>
            <button className="copy-link-btn" onClick={handleCopyLink}>
              Copy Join Link
            </button>
            <p>
              Share this link with the candidate to join the interview securely.
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default JitsiVideoCall;

import { useState, useEffect, useCallback } from "react";

export const useWebRTC = (meetingId, localStream, onRemoteStream) => {
  const [peerConnection, setPeerConnection] = useState(null);

  const createPeerConnection = useCallback(async () => {
    const config = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        // Add your TURN servers if needed
      ],
    };

    const pc = new RTCPeerConnection(config);

    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      onRemoteStream(event.streams[0]);
    };

    setPeerConnection(pc);
    return pc;
  }, [localStream, onRemoteStream]);

  const closeConnection = useCallback(() => {
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
  }, [peerConnection]);

  return {
    peerConnection,
    createPeerConnection,
    closeConnection,
  };
};

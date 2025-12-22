import React, {chatRef} from 'react'
import MessageIcon from "../../assets/icons/MessageIcon";


const SupportChat = () => {
    const [openIndex, setOpenIndex] = React.useState(0);
    const [chatOpen, setChatOpen] = React.useState(false);
    const chatRef = React.useRef(null);

    React.useEffect(() => {
    function handleOutside(e) {
      if (chatRef.current && !chatRef.current.contains(e.target)) {
        setChatOpen(false);
      }
    }

    function handleEsc(e) {
      if (e.key === "Escape") setChatOpen(false);
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
      <div
              ref={chatRef}
              className={`chat-section ${chatOpen ? "open" : ""}`}
              onClick={() => setChatOpen((o) => !o)}
              role="button"
              aria-expanded={chatOpen}
            >
              <div className="chat-tip">
                <p className="chat-tip-title">Support</p>
                <p className='chat-tip-desc'>
                  Welcome to E3OS Live support Center? <br /> How can we be of help?
                </p>
              </div>
    
              <MessageIcon width={60} height={60} />
            </div>
  )
}

export default SupportChat;
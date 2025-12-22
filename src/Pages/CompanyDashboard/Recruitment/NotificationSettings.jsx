import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { apiClient } from "../../../config";

/* ---------- Default Templates for Fallback ---------- */
const defaultTemplates = {
  interviewScheduling: {
    content: `Hello [Candidate Name],\n\nWe're pleased to invite you to an interview for the [Position] role at [Company].\nPlease let us know your availability so we can confirm a convenient time.\n\nBest regards,\n[Your Name]`,
    is_auto_sent: false,
  },
  interviewRescheduling: {
    content: `Hello [Candidate Name],\n\nDue to unforeseen circumstances, we need to reschedule your interview originally set for [Old Date/Time]. Kindly share a few alternative slots that work for you.\n\nThanks for your understanding,\n[Your Name]`,
    is_auto_sent: false,
  },
  interviewRejection: {
    content: `Hello [Candidate Name],\n\nThank you for taking the time to interview. After careful consideration, we have decided not to move forward.\n\nBest wishes,\n[Your Name]`,
    is_auto_sent: false,
  },
  interviewAcceptance: {
    content: `Hello [Candidate Name],\n\nCongratulations! We are moving you to the next stage. We'll follow up with next steps.\n\nLooking forward,\n[Your Name]`,
    is_auto_sent: false,
  },
  jobRejection: {
    content: `Hello [Candidate Name],\n\nThank you for applying. Unfortunately, we've chosen another candidate at this time.\n\nKind regards,\n[Your Name]`,
    is_auto_sent: false,
  },
  jobAcceptance: {
    content: `Hello [Candidate Name],\n\nWe're excited to offer you the [Position] role at [Company]! Please find the offer letter attached.\n\nWelcome aboard!\n[Your Name]`,
    is_auto_sent: false,
  },
  passwordReset: {
    content: `Hello [User Name],\n\nYou have requested to reset your password for [Company]. Please use the following link to reset your password:\n\n[Reset Link]\n\nThis link will expire in 1 hour.\n\nBest regards,\n[Your Name]`,
    is_auto_sent: true,
  },
  shortlistedNotification: {
    content: `Hello [Candidate Name],\n\nCongratulations! You have been shortlisted for the [Position] role at [Company]. We will contact you soon with further details.\n\nBest regards,\n[Your Name]`,
    is_auto_sent: false,
  },
};

/* ---------- Floating Success Alert ---------- */
const SuccessAlert = ({ message, show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        className="success-alert"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        style={{
          position: "fixed",
          top: 10,
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#38a169",
          color: "#fff",
          padding: "10px 20px",
          fontSize: 11,
          borderRadius: 6,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          zIndex: 9999,
        }}
      >
        {message}
      </motion.div>
    )}
  </AnimatePresence>
);

/* ---------- Reusable Template Editor ---------- */
const EmailTemplateEditor = ({
  id,
  template,
  triggerGlobalSuccess,
  updateTemplate,
}) => {
  const [content, setContent] = useState(template.content);
  const [isAutoSent, setIsAutoSent] = useState(template.is_auto_sent);
  const [isDirty, setIsDirty] = useState(false);
  const [focused, setFocused] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const textareaRef = useRef(null);

  /* Sync state with template prop changes */
  useEffect(() => {
    setContent(template.content);
    setIsAutoSent(template.is_auto_sent);
    setIsDirty(false);
  }, [template]);

  /* Autoresize on mount and content change */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  /* Extract all placeholder patterns from the content */
  const extractPlaceholders = (text) => {
    const regex = /\[([^\]]+)\]/g;
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }
    return matches;
  };

  /* Handle text input with placeholder protection */
  const handleInput = (e) => {
    const newValue = e.target.value;
    const currentPos = e.target.selectionStart;

    const placeholders = extractPlaceholders(newValue);
    const isEditingPlaceholder = placeholders.some(
      (ph) => currentPos > ph.start && currentPos <= ph.end
    );

    if (isEditingPlaceholder) {
      e.target.value = content;
      e.target.selectionStart = selectionStart;
      e.target.selectionEnd = selectionEnd;
      return;
    }

    setSelectionStart(e.target.selectionStart);
    setSelectionEnd(e.target.selectionEnd);

    setContent(newValue);
    setIsDirty(
      newValue !== template.content || isAutoSent !== template.is_auto_sent
    );
  };

  /* Handle key events to protect placeholders */
  const handleKeyDown = (e) => {
    setSelectionStart(e.target.selectionStart);
    setSelectionEnd(e.target.selectionEnd);

    if (e.key === "Delete" || e.key === "Backspace") {
      const placeholders = extractPlaceholders(content);
      const isAtPlaceholderBoundary = placeholders.some((ph) => {
        return (
          (e.key === "Delete" && e.target.selectionStart === ph.start) ||
          (e.key === "Backspace" && e.target.selectionStart === ph.end)
        );
      });

      if (isAtPlaceholderBoundary) {
        e.preventDefault();
        return;
      }
    }
  };

  /* Handle automation toggle */
  const handleAutoSendToggle = () => {
    setIsAutoSent((prev) => !prev);
    setIsDirty(
      (prev) =>
        content !== template.content || !isAutoSent !== template.is_auto_sent
    );
  };

  /* Save template via API */
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedTemplate = { [id]: { content, is_auto_sent: isAutoSent } };
      await apiClient.patch("/api/tenant/config/", {
        email_templates: updatedTemplate,
      });
      setIsDirty(false);
      updateTemplate(id, { content, is_auto_sent: isAutoSent });
      triggerGlobalSuccess(
        `"${id.replace(
          /([a-z])([A-Z])/g,
          "$1 $2"
        )}" notification updated successfully!`
      );
    } catch (error) {
      console.error("Error saving template:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to save notification. Please try again.";
      triggerGlobalSuccess(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  /* Slide-down bar animation variants */
  const barVariants = {
    hidden: { opacity: 0, y: -10, height: 0, overflow: "hidden" },
    shown: {
      opacity: 1,
      y: 0,
      height: "auto",
      transition: { type: "spring", stiffness: 260, damping: 24 },
    },
  };

  const showBar = focused || isDirty || isSaving;

  return (
    <div className="GGtg-DDDVa">
      <textarea
        ref={textareaRef}
        id={id}
        className="oujka-Inpuauy OIUja-Tettxa"
        value={content}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onSelect={(e) => {
          setSelectionStart(e.target.selectionStart);
          setSelectionEnd(e.target.selectionEnd);
        }}
        style={{ overflow: "hidden", whiteSpace: "pre-wrap" }}
      />
      <div className="mt-2">
        <label className="ssend-Auuto-SPann">
          <input
            type="checkbox"
            checked={isAutoSent}
            onChange={handleAutoSendToggle}
            className="form-checkbox h-5 w-5 text-gray-600"
          />
          <span>Send Automatically</span>
        </label>
      </div>
      <AnimatePresence>
        {showBar && (
          <motion.div
            className="oioak-POldj-BTn ookk-Saoksl"
            initial="hidden"
            animate="shown"
            exit="hidden"
            variants={barVariants}
          >
            <button
              className="btn-primary-bg"
              onClick={handleSave}
              disabled={isSaving}
              style={{ display: "flex", alignItems: "center" }}
            >
              {isSaving && (
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{
                    width: 15,
                    height: 15,
                    borderRadius: "50%",
                    border: "3px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    marginRight: 6,
                  }}
                />
              )}
              {isSaving ? "Saving..." : "Save Update"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ---------- Main Notification Settings ---------- */
const NotificationSettings = () => {
  const [globalSuccess, setGlobalSuccess] = useState({
    show: false,
    message: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [templates, setTemplates] = useState(defaultTemplates);

  /* Fetch or create templates on mount */
  useEffect(() => {
    const fetchOrCreateTemplates = async () => {
      try {
        const response = await apiClient.get("/api/tenant/config/");
        const fetchedTemplates = response.data.email_templates || {};

        // console.log("fetchedTemplates");
        // console.log(fetchedTemplates);
        // console.log("fetchedTemplates");
        // Merge fetched templates with defaults
        const mergedTemplates = { ...defaultTemplates };
        Object.keys(defaultTemplates).forEach((key) => {
          mergedTemplates[key] = {
            content:
              fetchedTemplates[key]?.content || defaultTemplates[key].content,
            is_auto_sent:
              fetchedTemplates[key]?.is_auto_sent ??
              defaultTemplates[key].is_auto_sent,
          };
        });
        setTemplates(mergedTemplates);
      } catch (error) {
        if (
          error.response?.status === 404 &&
          error.response?.data?.message === "Tenant config not found"
        ) {
          try {
            await apiClient.post("/api/tenant/config/", {
              email_templates: defaultTemplates,
            });
            setTemplates(defaultTemplates);
            setGlobalSuccess({
              show: true,
              message:
                "Tenant configuration created with default notifications.",
            });
            setTimeout(
              () => setGlobalSuccess({ show: false, message: "" }),
              2000
            );
          } catch (createError) {
            console.error("Error creating tenant config:", createError);
            setGlobalSuccess({
              show: true,
              message:
                "Failed to create tenant configuration. Using default notifications.",
            });
            setTimeout(
              () => setGlobalSuccess({ show: false, message: "" }),
              2000
            );
            setTemplates(defaultTemplates);
          }
        } else {
          console.error("Error fetching tenant config:", error);
          setGlobalSuccess({
            show: true,
            message: "Failed to load notifications. Using defaults.",
          });
          setTimeout(
            () => setGlobalSuccess({ show: false, message: "" }),
            2000
          );
          setTemplates(defaultTemplates);
        }
      }
    };
    fetchOrCreateTemplates();
  }, []);

  /* Update template state after save */
  const updateTemplate = (id, updatedTemplate) => {
    setTemplates((prevTemplates) => ({
      ...prevTemplates,
      [id]: updatedTemplate,
    }));
  };

  /* Trigger success/error messages */
  const triggerGlobalSuccess = (msg) => {
    setGlobalSuccess({ show: true, message: msg });
    setTimeout(() => setGlobalSuccess({ show: false, message: "" }), 2000);
  };

  /* Search filter */
  const filteredTemplates = Object.entries(templates).filter(([key, value]) => {
    if (!searchTerm.trim()) return true;
    const readableKey = key.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
    return (
      readableKey.includes(searchTerm.toLowerCase()) ||
      value.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <>
      <SuccessAlert message={globalSuccess.message} show={globalSuccess.show} />
      <div className="EmailNotifications">
        {/* Top Bar */}
        <div className="Dash-OO-Boas OOOP-LOa">
          <div className="Dash-OO-Boas-Top">
            <div className="Dash-OO-Boas-Top-1">
              <h3>Notification Settings</h3>
              <p>
                Manage your email notification templates and automation
                settings.
              </p>
            </div>
            <div className="Dash-OO-Boas-Top-2">
              <div className="genn-Drop-Search">
                <span>
                  <MagnifyingGlassIcon className="h-6 w-6" />
                </span>
                <input
                  type="text"
                  placeholder="Search for notification(s)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="oujka-Inpuauy"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Templates List */}
        <div className="Dash-OO-Boas Gen-Boxshadow">
          {filteredTemplates.length ? (
            filteredTemplates.map(([key, value]) => (
              <div key={key} className="EmailNotifications-Partss">
                <div className="EmailNotifications-Partss-1">
                  <h4>{key.replace(/([a-z])([A-Z])/g, "$1 $2")}</h4>
                </div>
                <div className="EmailNotifications-Partss-2">
                  <EmailTemplateEditor
                    id={key}
                    template={value}
                    triggerGlobalSuccess={triggerGlobalSuccess}
                    updateTemplate={updateTemplate}
                  />
                </div>
              </div>
            ))
          ) : (
            <p style={{ padding: "1rem" }}>
              No notifications match "{searchTerm}".
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationSettings;

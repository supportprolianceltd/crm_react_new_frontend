import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  PlusIcon,
  XMarkIcon,
  UserGroupIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import {
  createEvent,
  getEvents,
  getMyEvents,
  getMyInvitations,
  getPublicEvents,
  updateEvent,
  deleteEvent,
  getEventDetails,
  searchUsers,
} from "../CompanyDashboard/Calendar/EventApiService";
import "./Calendar.css";
import SmallCalendar from "../CompanyDashboard/Calendar/component/SmallCalendar";

const Calendar = () => {
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCoAdmin, setIsCoAdmin] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [myEvents, setMyEvents] = useState([]);
  const [invitedEvents, setInvitedEvents] = useState([]);
  const [publicEvents, setPublicEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(); // 
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);





const confirmDeleteEvent = async () => {
  setShowDeleteConfirmModal(false);
  setShowEventDetailsModal(false);
  if (!deleteTargetId) return;
  try {
    await handleDeleteEvent(deleteTargetId);
  } finally {
    setDeleteTargetId(null);
  }
};

    const cancelDelete = () => {
      setShowDeleteConfirmModal(false);
      setDeleteTargetId(null);
    };


    const handleDeleteEvent = async (eventId) => {
        try {
        await deleteEvent(eventId);
        showAlertMessage("Event deleted successfully", "success");
        loadEvents(); // Reload events
      } catch (error) {
        showAlertMessage("Failed to delete event", "error");
      }
    };




  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    priority: "normal",
    category: "personal",
    location: "",
    meeting_link: "",
    locationOrLink: "", // Combined field for smart detection
    shareWithAll: false, // Checkbox for tenant-wide sharing
    participants: [],
  });

  const getPriorityColor = (cat) => {
  const colors = {
    low: "#4CAF50",
    normal: "#2196F3",
    high: "#FF5722",
  };
  return colors[cat] || "#7c3aed";
};

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData) {
        setUser(userData);
        const adminStatus =
          userData.role === "admin" ||
          userData.isAdmin ||
          userData.role === "root-admin" ||
          userData.is_superuser;
        setIsAdmin(adminStatus);
        setIsCoAdmin(userData.role === "Co-Admin" || userData.isCoAdmin);
      }
    } catch (error) {
    }
  }, []);

  // Load events from API
  const loadEvents = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get date range for current week
      const weekStart = getMonday(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const startDate = weekStart.toISOString().split("T")[0];
      const endDate = weekEnd.toISOString().split("T")[0];

      // Load all events accessible to the user (public + admin-created specific events)
      const eventsRes = await getEvents({
        start_date: startDate,
        end_date: endDate,
      });

      // Handle different response formats
      const allEvents = Array.isArray(eventsRes)
        ? eventsRes
        : eventsRes?.results || [];
      // Filter out private events for this component
      const filteredEvents = allEvents.filter(
        (event) => event.visibility !== "private"
      );
      setMyEvents([]); // No personal events in tenant-wide calendar
      setInvitedEvents([]); // No separate invitation events
      setPublicEvents(filteredEvents); // All accessible events except private
    } catch (error) {
      showAlertMessage("Failed to load events", "error");
    } finally {
      setLoading(false);
    }
  }, [user, currentDate]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Function to detect if input is a URL or physical address
  const isUrl = (text) => {
    if (!text) return false;
    const urlPattern =
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
    return (
      urlPattern.test(text.trim()) ||
      text.toLowerCase().includes("zoom.us") ||
      text.toLowerCase().includes("meet.google.com") ||
      text.toLowerCase().includes("teams.microsoft.com") ||
      text.toLowerCase().includes("webex.com") ||
      text.toLowerCase().includes("gotomeeting.com")
    );
  };

  const showAlertMessage = useCallback((message, type = "success") => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  }, []);

  // Week helpers
  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    return date;
  };

  const weekStart = getMonday(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const timeSlots = Array.from({ length: 24 }, (_, i) => 0 + i); // 6am → 10pm

  // Deduplicate events by ID to prevent duplicates
  const eventMap = new Map();
  [...myEvents, ...invitedEvents, ...publicEvents].forEach((event) => {
    eventMap.set(event.id, event);
  });
  
  const allEvents = Array.from(eventMap.values());

  const totalTasks = allEvents.length;

    const upcomingTasks = [...allEvents]
    .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime))
    


  const goPrev = () =>
    setCurrentDate(
      (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7)
    );
  const goNext = () =>
    setCurrentDate(
      (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7)
    );
  const goToday = () => setCurrentDate(new Date());

  const getDateKey = (date) => date.toISOString().split("T")[0];

  // Determine whether the current user can delete a given event.
  // Rules:
  // - Admins / Co-Admins can always delete
  // - Event creators can delete their own events
  // - If the event creator is an admin, non-admin users cannot delete it
  const canDeleteEvent = (ev) => {
    if (!ev || !user) return false;
    if (isAdmin || isCoAdmin) return true;

    // If the current user is the creator, allow unless the creator is an admin
    if (ev.creator === user.id) {
      const creator = ev.creator_details || {};
      const creatorIsAdmin =
        creator.role === "admin" ||
        creator.role === "root-admin" ||
        creator.isAdmin ||
        creator.is_superuser;
      if (creatorIsAdmin && !(isAdmin || isCoAdmin)) return false;
      return true;
    }

    return false;
  };

  // Fetch all users for participant selection
  const fetchAllUsers = async () => {
    if (allUsers.length > 0) return; // Already loaded

    setLoadingUsers(true);
    try {
      const response = await searchUsers(""); // Empty query to get all users
      if (response?.results) {
        setAllUsers(response.results);
      }
    } catch (error) {
    } finally {
      setLoadingUsers(false);
    }
  };

  // Click on any cell → open modal with correct date & time
  const handleCellClick = (date, hour) => {
    setSelectedSlot({ date: new Date(date), hour });
    
    const startTimeStr = `${hour.toString().padStart(2, "0")}:00`;

    // Calculate end time 30 minutes ahead
    const endHour = hour;
    const endMinute = 30;
    const endTimeStr = `${endHour.toString().padStart(2, "0")}:${endMinute
      .toString()
      .padStart(2, "0")}`;

    // Reset form data but keep participants for new event creation
    setFormData({
      title: "",
      description: "",
      startTime: startTimeStr,
      endTime: endTimeStr,
      priority: "normal",
      category: "personal",
      location: "",
      meeting_link: "",
      locationOrLink: "",
      shareWithAll: false,
      participants: [], // Reset participants for new event
    });

    // Reset participant display state
    setParticipants([]);

    // Pre-load all users when modal opens (non-blocking)
    if (isAdmin || isCoAdmin) {
      fetchAllUsers(); // Don't await - let it load in background
    }

    setShowEventModal(true);
  };

  const handleEventClick = (e, event, date) => {
    e.stopPropagation();
    setSelectedEvent({ ...event, date });
    setShowEventDetailsModal(true);
  };

  const handleAddEvent = async () => {
    if (!formData.title.trim()) {
      showAlertMessage("Please enter an event title", "error");
      return;
    }
    if (!selectedSlot) return;

    const [startH, startM] = formData.startTime.split(":").map(Number);
    const [endH, endM] = formData.endTime.split(":").map(Number);

    if (endH < startH || (endH === startH && endM <= startM)) {
      showAlertMessage("End time must be after start time", "error");
      return;
    }

    setCreatingEvent(true);

    // Create datetime strings
    const startDateTime = new Date(selectedSlot.date);
    startDateTime.setHours(startH, startM, 0, 0);

    const endDateTime = new Date(selectedSlot.date);
    endDateTime.setHours(endH, endM, 0, 0);

    // Determine visibility based on shareWithAll checkbox
    let visibility = "private";
    if (isAdmin || isCoAdmin) {
      if (formData.shareWithAll) {
        visibility = "public"; // Tenant-wide
      } else if (formData.participants.length > 0) {
        visibility = "specific_users"; // Specific participants
      } else {
        // For tenant-wide calendar, default to public if no specific participants
        visibility = "public";
      }
    }

    const eventData = {
      title: formData.title,
      description: formData.description,
      start_datetime: startDateTime.toISOString(),
      end_datetime: endDateTime.toISOString(),
      location: formData.location,
      meeting_link: formData.meeting_link,
      visibility: visibility,
      include_all_tenant_users: formData.shareWithAll,
      participants: formData.shareWithAll
        ? []
        : isAdmin || isCoAdmin
        ? formData.participants.map((p) => p.id)
        : [],
    };

    try {
      const result = await createEvent(eventData);
      if (result) {
        showAlertMessage("Event created successfully", "success");
        loadEvents(); // Reload events
        // Reset & close
        setShowEventModal(false);
        setFormData({
          title: "",
          description: "",
          startTime: "",
          endTime: "",
          priority: "normal",
          category: "personal",
          location: "",
          meeting_link: "",
          locationOrLink: "",
          shareWithAll: false,
          participants: [],
        });
        setParticipants([]);
        setSearchQuery("");
        setSearchedUsers([]);
        // Don't clear allUsers to keep them cached for future use
      }
    } catch (error) {
      showAlertMessage("Failed to create event", "error");
    } finally {
      setCreatingEvent(false);
    }
  };

  // Helper function to format dates
const formatDate = (date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

  const formatDateRange = () => {
    return `${weekStart.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} – ${weekDays[6].toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  const isToday = (d) =>
    d.toDateString() === new Date().toDateString();

  // Render events for a whole day as absolutely positioned bars that span
  // horizontally across the hourly columns in the time-row. This produces a
  // single block per event rather than multiple small blocks per hour.
  const renderEventsForDay = (date) => {
    const dateKey = getDateKey(date);
    const dayEvents = allEvents
      .filter((ev) => {
        const eventDate = new Date(ev.start_datetime).toISOString().split("T")[0];
        return eventDate === dateKey;
      })
      // sort so longer events rendered first (optional)
      .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));

    const hourWidth = 120; // px per hour column (keep in sync with CSS)

    return dayEvents.map((ev) => {
      const startDate = new Date(ev.start_datetime);
      const endDate = new Date(ev.end_datetime);
      const startHour = startDate.getHours();
      const startMinutes = startDate.getMinutes();
      const endHour = endDate.getHours();
      const endMinutes = endDate.getMinutes();

      const startDecimal = startHour + startMinutes / 60;
      const endDecimal = endHour + endMinutes / 60;
      const duration = Math.max(endDecimal - startDecimal, 0.25);

      // left offset in pixels from the start of the row
      const firstHour = timeSlots[0];
      const left = (startDecimal - firstHour) * hourWidth;
      const width = Math.max(duration * hourWidth - 8, 48);

      return (
        <div
          key={ev.id}
          className={`event-bar priority-normal`}
          style={{
            position: "absolute",
            left: `${left}px`,
            top: `8px`,
            width: `${width}px`,
            height: `56px`,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 10px",
            boxSizing: "border-box",
            cursor: "pointer",
            zIndex: 5,
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
          onClick={(e) => handleEventClick(e, ev, date)}
          title={ev.title}
        >
          <div
            className="event-dot"
            style={{
              backgroundColor: ev.visibility === "public" ? "#FF9800" : "#2196F3",
            }}
          />
          <span className="event-title-short">
            {ev.title.substring(0, 9)}{ev.title.length > 9 ? "..." : ""}
          </span>
          <UserGroupIcon className="shared-icon" />
        </div>
      );
    });
  };

    const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateSelect = (date) => {
     setSelectedDate(date);
    setCurrentDate(date);

    // setSelectedDate(date);
    // setPeriodText(formatDate(date));
    // setActivePeriod("Today");
  };
  
   

  return (
  <div className="calender-container">

    <div className="small-calender">
       <div className="calendar-header">
        <div className="header-left">
          <span className="today-date"> &gt; {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
        </div>
      </div>

      <div>
        <SmallCalendar selectedDate={selectedDate} onSelect={handleDateSelect} />
      </div>

      

     <div className="task-lists-section">
      <div className="task-lists-header">
       <h3>Event Lists  </h3>
       <span className="task-count"> ( {totalTasks} )</span>
      </div>
       <div className="task-list custom-scroll-bar">
          {upcomingTasks.length === 0 ? (
            <div className="no-tasks">No scheduled tasks</div>
          ) : (
            upcomingTasks.map((ev) => (
              <div
                key={ev.id}
                className="task-item"
                onClick={() => {
                  setSelectedEvent(ev);
                  setShowEventDetailsModal(true);
               }}
                role="button"
                tabIndex={0}
              >
                <div className="task-left">
                  <div className="tasklist-task-title">  {ev.title || "Untitled"}</div>
                  <div className="task-date">
                    {new Date(ev.start_datetime).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                     minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="task-actions">
                  {canDeleteEvent(ev) ? (
                    <button
                      className="task-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTargetId(ev.id);
                        setShowDeleteConfirmModal(true);
                      }}
                      title="Delete task"
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    
    </div>

     <div className="calendar_Sec">
      {/* Header */}
      <div className="calendar-header">
        <div className="header-left">
          <button className="today-btn" onClick={goToday}>
            <CalendarDaysIcon className="w-4 h-4" />
            Today
          </button>

        <button className="small-calendar-nav-btn" onClick={goPrev}>
          <ChevronLeftIcon className="small-calendar-icon" />
        </button>

        <button className="small-calendar-nav-btn" onClick={goNext}>
          <ChevronRightIcon className="small-calendar-icon" />
        </button>

        
          <span className="date-range">{formatDateRange()}</span>
        </div>
        <div className="header-right">
          <div className="view-toggle">
            {/* <button className="view-btn active">Weekly</button> */}
            <button className="view-btn active">Monthly</button>
          </div>
          <span className="total-tasks">Total Tasks: {totalTasks}</span>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="weekly-grid">
        {/* Left: Dates */}
        <div className="date-column">
          <div className="corner-cell" />
          {weekDays.map((day, i) => (
            <div key={i} className={`date-cell ${isToday(day) ? "today" : ""}`}>
              <div className="weekday">
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div className="date-num">{day.getDate()}</div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="time-grid-wrapper">
          <div className="time-header">
            {timeSlots.map((hour) => (
              <div key={hour} className="time-label-cell">
                {hour > 12
                  ? `${hour - 12} PM`
                  : hour === 0
                  ? "12 AM"
                  : hour === 12
                  ? "12pm"
                  : `${hour} AM`}
              </div>
            ))}
          </div>

          {weekDays.map((day, dayIdx) => (
            <div key={dayIdx} className="time-row">
              {/* overlay events spanning the row */}
              <div className="events-overlay">{renderEventsForDay(day)}</div>

              {timeSlots.map((hour) => (
                <div
                  key={hour}
                  className="time-cell"
                  onClick={() => handleCellClick(day, hour)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Create Event Modal */}
      <AnimatePresence>
        {showEventModal && selectedSlot && (
          <motion.div
            className="modal-overlay"
            onClick={() => setShowEventModal(false)}
          >
            <motion.div
              className="event-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Create Event</h3>
                <button onClick={() => setShowEventModal(false)}>
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="modal-body">
                <form action="" className="form-group">
                  <div className="modal-disp">
                    <label>Date</label>
                    <p className="form-display">
                      {selectedSlot.date.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <label>Title</label>
                    <input
                      type="text"
                      placeholder="Event title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label>Location/Link</label>
                    <input
                      type="text"
                      placeholder="Add location or meeting link (Zoom, Google Meet, etc.)"
                      value={formData.locationOrLink}
                      onChange={(e) => {
                        const value = e.target.value;
                        const detectedAsUrl = isUrl(value);

                        setFormData({
                          ...formData,
                          locationOrLink: value,
                          location: detectedAsUrl ? "" : value,
                          meeting_link: detectedAsUrl ? value : "",
                        });
                      }}
                    />
                    {formData.locationOrLink && (
                      <small className="field-hint">
                        {isUrl(formData.locationOrLink)
                          ? "Detected as meeting link"
                          : "Detected as physical location"}
                      </small>
                    )}
                  </div>
                  <label>Description</label>
                  <textarea
                    type="text"
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />

                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Time</label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startTime: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>End Time</label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) =>
                          setFormData({ ...formData, endTime: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  {(isAdmin || isCoAdmin) && (
                    <div className="form-group checkbox">
                      <label>
                        <input
                          type="checkbox"
                          checked={formData.shareWithAll || false}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              shareWithAll: e.target.checked,
                            })
                          }
                        />
                        <span className="flex-it">
                          <UserGroupIcon />
                          <p>Share with all staff (tenant-wide)</p>
                        </span>
                      </label>
                      {formData.shareWithAll && (
                        <p className="info-text">
                          This event will be visible to all staff in your
                          organization and all users will be automatically
                          included as participants
                        </p>
                      )}
                    </div>
                  )}

                  {(isAdmin || isCoAdmin) && !formData.shareWithAll && (
                    <div>
                      <div className="form-group">
                        <label>Invite Participants (Optional)</label>
                        <input
                          type="text"
                          placeholder={
                            loadingUsers
                              ? "Loading users..."
                              : allUsers.length > 0
                              ? `Search ${allUsers.length} users...`
                              : "Search users..."
                          }
                          value={searchQuery}
                          disabled={loadingUsers}
                          onChange={(e) => {
                            const query = e.target.value;
                            setSearchQuery(query);

                            if (query.length > 0) {
                              // Filter from pre-loaded users
                              const filtered = allUsers.filter(
                                (user) =>
                                  user.first_name
                                    .toLowerCase()
                                    .includes(query.toLowerCase()) ||
                                  user.last_name
                                    .toLowerCase()
                                    .includes(query.toLowerCase()) ||
                                  user.email
                                    .toLowerCase()
                                    .includes(query.toLowerCase())
                              );
                              setSearchedUsers(filtered.slice(0, 10)); // Limit to 10 results
                            } else {
                              setSearchedUsers([]);
                            }
                          }}
                        />
                        {searchedUsers.length > 0 && (
                          <div className="user-search-results">
                            {searchedUsers
                              .filter(
                                (u) => !participants.some((p) => p.id === u.id)
                              )
                              .map((user) => (
                                <div
                                  key={user.id}
                                  className="user-search-item"
                                  onClick={() => {
                                    setParticipants([...participants, user]);
                                    setFormData({
                                      ...formData,
                                      participants: [
                                        ...formData.participants,
                                        user,
                                      ],
                                    });
                                    setSearchQuery("");
                                    setSearchedUsers([]);
                                  }}
                                >
                                  {user.first_name} {user.last_name} (
                                  {user.email})
                                </div>
                              ))}
                          </div>
                        )}
                      </div>

                      {participants.length > 0 && (
                        <div className="selected-participants">
                          <label>Selected Participants:</label>
                          {participants.map((participant) => (
                            <div
                              key={participant.id}
                              className="participant-tag"
                            >
                              {participant.first_name} {participant.last_name}
                              <button
                                type="button"
                                onClick={() => {
                                  setParticipants(
                                    participants.filter(
                                      (p) => p.id !== participant.id
                                    )
                                  );
                                  setFormData({
                                    ...formData,
                                    participants: formData.participants.filter(
                                      (p) => p.id !== participant.id
                                    ),
                                  });
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </form>
              </div>
              <div className="modal-footer">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="btn-delete"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvent}
                  className="btn-save"
                  disabled={creatingEvent}
                >
                  {creatingEvent ? (
                    <>
                      <div className="spinner" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-5 h-5" /> Create Event
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* selected event */}

        {selectedEvent && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowEventDetailsModal(false);
              setSelectedEvent(null);
            }}
          >
            <motion.div
              className="event-details-modal"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="event-title-with-icon">
                  <div
                    className="event-category-icon"
                    style={{
                      backgroundColor: getPriorityColor(selectedEvent.priority),
                    }}
                  />
                  <h3>{selectedEvent.title}</h3>
                </div>
                <button
                  className="close-button"
                  onClick={() => {
                    setShowEventDetailsModal(false);
                    setSelectedEvent(null);
                  }}
                >
                  <XMarkIcon />
                </button>
              </div>

              <div className="modal-body event-details">
                <div className="details-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">
                    {new Date(selectedEvent.start_datetime).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>

                  <div className="detail-top">
                    <span className="detail-label">Time:</span>
                    <span className="detail-value">
                      {selectedEvent.start_datetime.slice(11, 16)} -{" "}
                      {selectedEvent.end_datetime.slice(11, 16)} UTC
                    </span>
                  </div>
                </div>

                {selectedEvent.description && (
                  <div className="details-row full-width">
                    <span className="detail-label">Description:</span>
                    <p className="detail-description">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}

                {(selectedEvent.location || selectedEvent.meeting_link) && (
                  <div className="details-row">
                    <span className="detail-label">Location/Link:</span>
                    {selectedEvent.meeting_link ? (
                      <a
                        href={selectedEvent.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="detail-value"
                      >
                        {selectedEvent.meeting_link}
                      </a>
                    ) : (
                      <span className="detail-value">
                        {selectedEvent.location}
                      </span>
                    )}
                  </div>
                )}

                {selectedEvent.visibility === "public" ? (
                  <div className="details-row flex-it">
                    <UserGroupIcon className="shared-badge" />
                    <span className="detail-value">Shared with all staff</span>
                  </div>
                ) : selectedEvent.visibility === "specific_users" ? (
                  <div className="details-row flex-it">
                    <UserGroupIcon className="shared-badge" />
                    <span className="detail-value">
                      Shared with{" "}
                      {selectedEvent.participants_details?.length || 0} staff
                      member
                      {(selectedEvent.participants_details?.length || 0) !== 1
                        ? "s"
                        : ""}
                    </span>
                  </div>
                ) : null}

                {selectedEvent.include_all_tenant_users ? (
                  <div className="details-row full-width">
                    <span className="detail-label">Participants:</span>
                    <span className="detail-value">All staff members </span>
                  </div>
                ) : selectedEvent.participants_details &&
                  selectedEvent.participants_details.length > 0 ? (
                  <div className="details-row full-width">
                    <span className="detail-label">Participants:</span>
                    <div className="participants-list">
                      {selectedEvent.participants_details.map((participant) => (
                        <span key={participant.id} className="participant-name">
                          {participant.first_name} {participant.last_name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="details-row">
                  <span className="detail-label">Created by:</span>
                  <span className="detail-value">
                    {selectedEvent.creator_details?.first_name}{" "}
                    {selectedEvent.creator_details?.last_name}
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                {canDeleteEvent(selectedEvent) && (
                  <button
                    className="btn-delete"
                    onClick={() => {
                      setDeleteTargetId(selectedEvent.id);
                      setShowDeleteConfirmModal(true);
                    }}
                  >
                    <TrashIcon /> Delete
                  </button>
                )}
                <button
                  className="btn-cancel"
                  onClick={() => {
                    setShowEventDetailsModal(false);
                    setSelectedEvent(null);
                  }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showAlert && (
          <motion.div
            className={`alert-message alert-${alertType}`}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            {alertMessage}
          </motion.div>
        )}
      </AnimatePresence>

    {showDeleteConfirmModal && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={cancelDelete}
        >
          <motion.div
            className="confirm-delete-modal"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="modal-header">
              <h3>Confirm Delete</h3>
            </div>
            <div className="delete-modal-body">
              <p>Are you sure you want to delete this scheduled event?</p>
            </div>
            <div className="modal-footer">          
              <button className="btn-delete" onClick=
              {confirmDeleteEvent}
              >Delete</button>
              <button className="btn-cancel" onClick={cancelDelete}>Cancel</button>
            </div>
          </motion.div>
        </motion.div>
     )}

    </div>
   </div>
  );
};



export default Calendar;

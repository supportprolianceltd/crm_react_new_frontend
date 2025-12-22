// MyTasks.jsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  ChevronRightIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  CalendarDaysIcon,
  CubeTransparentIcon,
  BriefcaseIcon,
  UserIcon,
  UsersIcon,
  MapPinIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import PercentageIcon from "./Img/percentage-icon.png";
import "./MyTasks.css";
import NoTaskImg from "./Img/no-task-img.png";
import { tasks } from "./data/tasks";
import { fetchCarerVisits } from "./config/tasksApiService";
import MyTasksContent from "./MyTasksContent/MyTasksContent";
const MyTasks = () => {
  const completionPercentage = 10;
  const scrollRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const partsRef = useRef([]);
  const rafRef = useRef(null);
  const [dragDirection, setDragDirection] = useState(null);
  const [activeIndex, setActiveIndex] = useState(
    new Date().getDay() - 1 >= 0 ? new Date().getDay() - 1 : 6
  );
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [isDragging, setIsDragging] = useState(false);
  const shouldAutoScroll = useRef(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [clockedInTasks, setClockedInTasks] = useState({});
  const [clockedInTimes, setClockedInTimes] = useState({});
  const [completedTasks, setCompletedTasks] = useState({});
  const [totalExtraTimes, setTotalExtraTimes] = useState({}); // Renamed from extraTimes to clarify it's the total accumulated extra
  const [totalOffTimes, setTotalOffTimes] = useState({}); // New state for accumulated off time
  const [offTimeTasks, setOffTimeTasks] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [forcedTasks, setForcedTasks] = useState({});
  const [forcedTaskTimes, setForcedTaskTimes] = useState({});
  const [normalTaskTimes, setNormalTaskTimes] = useState({});
  const [forcedClockOutTasks, setForcedClockOutTasks] = useState({});
  const [forcedClockOutTimes, setForcedClockOutTimes] = useState({});
  const [viewMode, setViewMode] = useState("weekly");
  const [actualClockInTimes, setActualClockInTimes] = useState({});
  const [actualClockOutTimes, setActualClockOutTimes] = useState({});
  const [taskHistory, setTaskHistory] = useState({});
  const [runningTaskName, setRunningTaskName] = useState(null);
  // visits state (from API)
  const [visits, setVisits] = useState([]);

  const handleVisitClick = (visit) => {
    // accept either a raw API visit or a mapped visit-like object
    const startIso = visit.startDate || visit.date || visit.rawVisit?.startDate;
    const endIso = visit.endDate || visit.endDate || visit.rawVisit?.endDate;
    const start = new Date(startIso);
    const end = new Date(endIso);
    const mapped = {
      task: visit.task || `Visit ${visit.id?.slice(-6) || Date.now()}`,
      clientName: visit.clientName || visit.rawVisit?.clientName || `Client`,
      clientImage: visit.clientImage || visit.rawVisit?.clientImage || null,
      startHour: visit.startHour ?? start.getHours(),
      startMin: visit.startMin ?? start.getMinutes(),
      endHour: visit.endHour ?? end.getHours(),
      endMin: visit.endMin ?? end.getMinutes(),
      date: visit.date || startIso,
      callType: visit.callType || visit.rawVisit?.callType || "single",
      distance: visit.distance ?? visit.rawVisit?.distance ?? 0,
      rawVisit: visit.rawVisit || visit,
      clockInAt: visit.clockInAt || visit.rawVisit?.clockInAt || null,
      clockOutAt: visit.clockOutAt || visit.rawVisit?.clockOutAt || null,
      tasks: visit.tasks || visit.rawVisit?.tasks || [],
    };
    setSelectedTask(mapped);
    setShowModal(true);
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const running = Object.keys(clockedInTasks).find(
      (key) => clockedInTasks[key]
    );
    setRunningTaskName(running || null);
  }, [clockedInTasks]);

  // Convert ISO time to formatted time
  const formatTimeFromISO = (isoString) => {
    const date = new Date(isoString);
    return formatTime(date.getHours(), date.getMinutes());
  };

  // Get secondary text for visit
  const getVisitSecondaryText = (visit) => {
    const clockOut = visit.clockOutAt || visit.rawVisit?.clockOutAt || null;
    const clockIn = visit.clockInAt || visit.rawVisit?.clockInAt || null;
    const startIso = visit.startDate || visit.date || visit.rawVisit?.startDate;
    if (clockOut) return `Completed at ${formatTimeFromISO(clockOut)}`;
    if (clockIn) return `Started at ${formatTimeFromISO(clockIn)}`;
    return `Scheduled for ${formatTimeFromISO(startIso)}`;
  };



  // Helper function to format care type
  const formatCareType = (careType) => {
    switch (careType) {
      case 'DOUBLE_HANDED_CALL':
        return 'double';
      case 'SINGLE_HANDED_CALL':
      default:
        return 'single';
    }
  };

  // Get visit status
  const getVisitStatus = (visit) => {
    const clockInAt = visit.clockInAt || visit.rawVisit?.clockInAt;
    const clockOutAt = visit.clockOutAt || visit.rawVisit?.clockOutAt;
    
    if (clockOutAt) return "Visit Completed";
    if (clockInAt) return "In Progress";
    return "Not Clocked In";
  };

  // Function to refresh visits data
  const refreshVisits = async () => {
    try {
      // Use logged-in user id instead of hardcoded carer id
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const carerId = user?.id;
      if (!carerId) return;
      const resp = await fetchCarerVisits(carerId);
      
      // The API returns an array directly
      const payload = Array.isArray(resp) ? resp : [];
      const mapped = (payload || []).map((v, i) => {
        const startIso = v.startDate;
        const endIso = v.endDate;
        const start = new Date(startIso);
        const end = new Date(endIso);
        
        // Extract distance from assignees array
        const assignee = (v.assignees || [])[0];
        const distance = assignee?.distance || "N/A";
        
        return {
          // keep original for modal
          rawVisit: v,
          id: v.id,
          // UI task-shaped fields for rendering
          task: `Visit ${v.id.slice(-6)}`,
          clientName: v.client_name || "Unknown Client",
          clientImage: null,
          startHour: start.getHours(),
          startMin: start.getMinutes(),
          endHour: end.getHours(),
          endMin: end.getMinutes(),
          date: startIso,
          callType: formatCareType(v.careType),
          distance: distance,
          clockInAt: v.clockInAt,
          clockOutAt: v.clockOutAt,
          tasks: v.tasks || [],
          // Additional fields from API
          careType: v.careType,
          status: v.status,
          taskCount: (v.tasks || []).length,
        };
      });
      setVisits(mapped);
      
      // Update selectedTask if it exists to reflect new data
      if (selectedTask) {
        const updatedVisit = mapped.find(v => v.id === selectedTask.id || v.id === selectedTask.rawVisit?.id);
        if (updatedVisit) {
          setSelectedTask(updatedVisit);
        }
      }
    } catch (error) {
    }
  };

  // Fetch and log carer visits for user with id 14
  useEffect(() => {
    refreshVisits();
  }, []);

  const formatTime = (hour, minute) => {
    const period = hour < 12 ? "am" : "pm";
    const adjustedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${adjustedHour}:${minute.toString().padStart(2, "0")}${period}`;
  };
  const formatDuration = (ms) => {
    if (ms <= 0) return "0h 0m 0s";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };
  const parseDurationToMs = (durationStr) => {
    if (!durationStr || durationStr === "0h 0m 0s") return 0;
    let totalSeconds = 0;
    const parts = durationStr.split(" ");
    for (const part of parts) {
      const num = parseInt(part);
      if (part.includes("h")) totalSeconds += num * 3600;
      else if (part.includes("m")) totalSeconds += num * 60;
      else if (part.includes("s")) totalSeconds += num;
    }
    return totalSeconds * 1000;
  };
  const getTaskRemainingTime = (task) => {
    if (!clockedInTasks[task.task]) return "";
    const clockedInAt = clockedInTimes[task.task];
    const now = currentTime.getTime();
    const total = getTaskDurationSeconds(task) * 1000;
    let diff = total - (now - clockedInAt);
    if (diff < 0) diff = 0;
    const hours = Math.floor(diff / 3600000);
    diff %= 3600000;
    const minutes = Math.floor(diff / 60000);
    diff %= 60000;
    const seconds = Math.floor(diff / 1000);
    let str = "";
    if (hours > 0) str += `${hours}h `;
    if (minutes > 0 || hours > 0) str += `${minutes}m `;
    str += `${seconds}s`;
    return str;
  };
  const getTaskDurationSeconds = (task) => {
    const start = task.startHour * 3600 + task.startMin * 60;
    const end = task.endHour * 3600 + task.endMin * 60;
    return end - start;
  };
  const getTaskDuration = (task) => {
    const start = task.startHour * 60 + task.startMin;
    const end = task.endHour * 60 + task.endMin;
    const totalMinutes = end - start;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
  const getLatenessStr = (task) => {
    const taskStart = new Date(task.date);
    taskStart.setHours(task.startHour, task.startMin, 0, 0);
    const diffMs = currentTime - taskStart;
    if (diffMs <= 0) return "";
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    let str = "Late by ";
    if (hours > 0) str += `${hours}h `;
    if (minutes > 0) str += `${minutes}m `;
    if (seconds > 0) str += `${seconds}s `;
    return str.trim();
  };
  // Updated to calculate session extra time correctly (only time worked past scheduled end, and only if not off-time session)
  const calculateSessionExtraTimeMs = (task, clockedInAt, now) => {
    const taskEnd = new Date(task.date);
    taskEnd.setHours(task.endHour, task.endMin, 0, 0);
    const scheduledEndMs = taskEnd.getTime();
    const sessionStartMs = clockedInAt;
    const sessionEndMs = now;
    const extraStartMs = Math.max(sessionStartMs, scheduledEndMs);
    const sessionExtraMs = Math.max(0, sessionEndMs - extraStartMs);
    return sessionExtraMs;
  };
  const getExtraTimeLabel = (task) => {
    if (!clockedInTasks[task.task]) {
      // When not clocked in, show total accumulated extra time
      return totalExtraTimes[task.task] || "";
    }
    // When clocked in, show current session's extra time (only if not off-time session)
    if (offTimeTasks[task.task]) return "";
    const clockedInAt = clockedInTimes[task.task];
    const now = currentTime.getTime();
    const sessionExtraMs = calculateSessionExtraTimeMs(task, clockedInAt, now);
    if (sessionExtraMs <= 0) return "";
    return formatDuration(sessionExtraMs);
  };
  const getOffTimeLabel = (task) => {
    if (!clockedInTasks[task.task]) {
      // When not clocked in, show total accumulated off time
      return totalOffTimes[task.task] || "";
    }
    // When clocked in, show current session's off time (only if off-time session)
    if (!offTimeTasks[task.task]) return "";
    const clockedInAt = clockedInTimes[task.task];
    const now = currentTime.getTime();
    const sessionOffMs = now - clockedInAt;
    return formatDuration(sessionOffMs);
  };
  const getClosestTaskToday = () => {
    const todayStr = selectedDay.toDateString();
    const todayTasks = tasks.filter(
      (task) => new Date(task.date).toDateString() === todayStr
    );
    if (todayTasks.length === 0) return null;
    let closestTask = todayTasks[0];
    let minDiff = Math.abs(
      new Date(todayTasks[0].date).setHours(
        todayTasks[0].startHour,
        todayTasks[0].startMin
      ) - currentTime
    );
    todayTasks.forEach((task) => {
      const taskStart = new Date(task.date);
      taskStart.setHours(task.startHour, task.startMin, 0, 0);
      const diff = Math.abs(taskStart - currentTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestTask = task;
      }
    });
    return closestTask;
  };
  const closestTaskToday = getClosestTaskToday();
  useEffect(() => {
    if (!scrollRef.current || !shouldAutoScroll.current || isDragging) return;
    const dayStr = selectedDay.toDateString();
    const dayTasks = tasks.filter(
      (task) => new Date(task.date).toDateString() === dayStr
    );
    if (dayTasks.length === 0) return;
    const earliestTask = dayTasks.reduce((prev, curr) => {
      const prevMinutes = prev.startHour * 60 + prev.startMin;
      const currMinutes = curr.startHour * 60 + curr.startMin;
      return currMinutes < prevMinutes ? curr : prev;
    });
    const topRow = scrollRef.current.querySelector(".GBJ-Parts.top-Uj");
    if (!topRow) return;
    const hourBlocks = topRow.querySelectorAll(".Div-DR");
    const hourWidth = hourBlocks[0]?.offsetWidth || 100;
    scrollRef.current.scrollLeft = earliestTask.startHour * hourWidth;
  }, [selectedDay, isDragging]);
  const getProgressBarColor = (percentage) => {
    if (percentage <= 33) return "#ff4d4d";
    if (percentage <= 66) return "#ffcc00";
    return "#28a745";
  };
  const startDrag = (pageX) => {
    isDown.current = true;
    setIsDragging(true);
    shouldAutoScroll.current = false;
    scrollRef.current.classList.add("active");
    startX.current = pageX;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };
  const stopDrag = () => {
    isDown.current = false;
    setIsDragging(false);
    scrollRef.current.classList.remove("active");
    setDragDirection(null);
  };
  const onMove = (currentX) => {
    if (!isDown.current) return;
    const walk = (startX.current - currentX) * 2;
    const newScrollLeft = scrollLeft.current + walk;
    if (walk > 0) setDragDirection("right");
    else if (walk < 0) setDragDirection("left");
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = newScrollLeft;
        partsRef.current.forEach((part) => (part.scrollLeft = newScrollLeft));
      }
    });
  };
  const onMouseDown = (e) => startDrag(e.pageX);
  const onMouseUp = stopDrag;
  const onMouseLeave = stopDrag;
  const onMouseMove = (e) => {
    e.preventDefault();
    onMove(e.pageX);
  };
  const onTouchStart = (e) => startDrag(e.touches[0].pageX);
  const onTouchMove = (e) => {
    e.preventDefault();
    onMove(e.touches[0].pageX);
  };
  const onTouchEnd = stopDrag;
  const getWeekDays = (baseDate) => {
    const day = baseDate.getDay();
    const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(baseDate);
    monday.setDate(diff);
    return [...Array(7)].map((_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date;
    });
  };
  const [weekDays, setWeekDays] = useState(getWeekDays(new Date()));
  const handlePrevious = () => {
    const newDate = new Date(selectedDay);
    if (viewMode === "weekly" || viewMode === "today") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1, 1);
    }
    setSelectedDay(newDate);
    setWeekDays(getWeekDays(newDate));
    setActiveIndex(0);
    shouldAutoScroll.current = true;
  };
  const handleNext = () => {
    const newDate = new Date(selectedDay);
    if (viewMode === "weekly" || viewMode === "today") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1, 1);
    }
    setSelectedDay(newDate);
    setWeekDays(getWeekDays(newDate));
    setActiveIndex(0);
    shouldAutoScroll.current = true;
  };
  const handleToday = () => {
    const today = new Date();
    const todayIndex = today.getDay() - 1 >= 0 ? today.getDay() - 1 : 6;
    setSelectedDay(today);
    setWeekDays(getWeekDays(today));
    setActiveIndex(todayIndex);
    setViewMode("today");
    shouldAutoScroll.current = true;
  };
  const handleViewChange = (mode) => {
    setViewMode(mode);
    const newDate = new Date(selectedDay);
    if (mode === "monthly") {
      newDate.setDate(1);
    }
    setSelectedDay(newDate);
    setWeekDays(getWeekDays(newDate));
    setActiveIndex(0);
    shouldAutoScroll.current = true;
  };
  const getDateDisplay = () => {
    if (viewMode === "today") {
      return selectedDay.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } else if (viewMode === "weekly") {
      const start = weekDays[0];
      const end = weekDays[6];
      return `${start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    } else {
      return selectedDay.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
  };
  const getTaskStatus = (task) => {
    if (completedTasks[task.task]) {
      let str = "Completed";
      if (forcedTasks[task.task]) str += " (Forced clock in)";
      if (offTimeTasks[task.task]) str += " (Off time)";
      if (forcedClockOutTasks[task.task]) str += " (Forced clock out)";
      const off = totalOffTimes[task.task];
      const extra = totalExtraTimes[task.task];
      if (off) str += ` (Off ${off})`;
      if (extra) str += ` (Extra ${extra})`;
      return str;
    }
    if (clockedInTasks[task.task]) {
      let str = `Progress: ${Math.round(getTaskProgress(task))}%`;
      if (offTimeTasks[task.task]) str += " (Off time)";
      const offLabel = getOffTimeLabel(task);
      const extraLabel = getExtraTimeLabel(task);
      if (offLabel) str += ` (Off ${offLabel})`;
      if (extraLabel) str += ` (Extra ${extraLabel})`;
      return str;
    }
    if (actualClockInTimes[task.task] && actualClockOutTimes[task.task]) {
      let str = "Clocked out";
      if (forcedTasks[task.task]) str += " (Forced clock in)";
      if (offTimeTasks[task.task]) str += " (Off time)";
      if (forcedClockOutTasks[task.task]) str += " (Forced clock out)";
      const off = totalOffTimes[task.task];
      const extra = totalExtraTimes[task.task];
      if (off) str += ` (Off ${off})`;
      if (extra) str += ` (Extra ${extra})`;
      return str;
    }
    return "Pending";
  };
  const getSecondaryText = (task) => {
    const taskStart = new Date(task.date);
    taskStart.setHours(task.startHour, task.startMin, 0, 0);
    if (completedTasks[task.task]) {
      return getTimeAgo(task);
    }
    if (clockedInTasks[task.task]) {
      let str = "Clocked in";
      if (forcedTasks[task.task]) str += " (Forced clock in)";
      if (offTimeTasks[task.task]) str += " (Off time)";
      const offLabel = getOffTimeLabel(task);
      const extraLabel = getExtraTimeLabel(task);
      if (offLabel) str += ` (Off ${offLabel})`;
      if (extraLabel) str += ` (Extra ${extraLabel})`;
      return str;
    }
    if (actualClockInTimes[task.task] && actualClockOutTimes[task.task]) {
      let str = forcedClockOutTasks[task.task]
        ? "Forced clocked out"
        : "Clocked out";
      if (forcedTasks[task.task]) str += " (Forced clock in)";
      if (offTimeTasks[task.task]) str += " (Off time)";
      const off = totalOffTimes[task.task];
      const extra = totalExtraTimes[task.task];
      if (off) str += ` (Off ${off})`;
      if (extra) str += ` (Extra ${extra})`;
      return str;
    }
    if (isTaskTimeElapsed(task)) {
      return "Not clocked in (Time elapsed)";
    }
    const lateness = getLatenessStr(task);
    if (lateness) return lateness;
    return getTimeAgo(task);
  };
  const getTaskWidth = (task) => {
    const startInMinutes = task.startHour * 60 + task.startMin;
    const endInMinutes = task.endHour * 60 + task.endMin;
    const duration = endInMinutes - startInMinutes;
    return (duration / 60) * 100;
  };
  const getTaskOffset = (task) => {
    const startInMinutes = task.startHour * 60 + task.startMin;
    return ((startInMinutes % 60) / 60) * 100;
  };
  const getTaskProgress = (task) => {
    if (completedTasks[task.task]) return 100;
    if (!clockedInTasks[task.task]) return 0;
    const clockedInAt = clockedInTimes[task.task];
    const now = currentTime.getTime();
    const taskStart = new Date(task.date);
    taskStart.setHours(task.startHour, task.startMin, 0, 0);
    const taskEnd = new Date(task.date);
    taskEnd.setHours(task.endHour, task.endMin, 0, 0);
    const totalMs = getTaskDurationSeconds(task) * 1000;
    const elapsedMs = now - clockedInAt;
    // Calculate initial progress based on lateness at clock-in
    const timeSinceStartAtClockIn = clockedInAt - taskStart.getTime();
    const initialProgress =
      timeSinceStartAtClockIn > 0
        ? (timeSinceStartAtClockIn / totalMs) * 100
        : 0;
    // Current progress is initial progress plus progress since clock-in
    const progressSinceClockIn =
      elapsedMs > 0 ? (elapsedMs / totalMs) * 100 : 0;
    const totalProgress = Math.min(initialProgress + progressSinceClockIn, 100);
    return totalProgress >= 0 ? totalProgress : 0;
  };
  const getClientInitials = (clientName) => {
    if (!clientName) return "";
    const names = clientName.split(" ");
    return names.map((name) => name.charAt(0).toUpperCase()).join("");
  };
  const handleDayClick = (index, date) => {
    setActiveIndex(index);
    setSelectedDay(date);
    shouldAutoScroll.current = true;
  };
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };
  const showAlertMessage = useCallback((message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  }, []);
  const handleClockInTask = (task, clockData = null, closeModal = true) => {
    const runningTask = Object.keys(clockedInTasks).find(
      (key) => clockedInTasks[key]
    );
    if (runningTask && runningTask !== task.task) {
      // No longer set alert here; it's handled in MyTasksContent via onShowAlert
      if (closeModal) setShowModal(false);
      return;
    }
    const now = currentTime.getTime();
    const taskStart = new Date(task.date);
    taskStart.setHours(task.startHour, task.startMin, 0, 0);
    const taskEnd = new Date(task.date);
    taskEnd.setHours(task.endHour, task.endMin, 0, 0);
    const clockInTime = now;
    setClockedInTasks((prev) => ({ ...prev, [task.task]: true }));
    setClockedInTimes((prev) => ({ ...prev, [task.task]: clockInTime }));
    setActualClockInTimes((prev) => ({
      ...prev,
      [task.task]: new Date(clockInTime),
    }));
    const isEarly = clockData?.type === "early";
    const isLate = clockData?.type === "late";
    // Record clock-in in history
    setTaskHistory((prev) => ({
      ...prev,
      [task.task]: [
        ...(prev[task.task] || []),
        {
          type: "clock-in",
          time: new Date(clockInTime),
          isForced: isEarly,
          isLate: isLate,
          isRestart: isLate,
          isOffTime: isLate,
          reason: clockData?.reason,
          comments: clockData?.comments,
        },
      ],
    }));
    // Remove from completed tasks if re-clocking in
    setCompletedTasks((prev) => {
      const newCompleted = { ...prev };
      delete newCompleted[task.task];
      return newCompleted;
    });
    // Handle flags for this session (no extra time set here - it starts from 0s)
    if (isLate) {
      setOffTimeTasks((prev) => ({ ...prev, [task.task]: true }));
      setForcedTasks((prev) => ({ ...prev, [task.task]: false }));
    } else if (isEarly) {
      setForcedTasks((prev) => ({ ...prev, [task.task]: true }));
      setOffTimeTasks((prev) => ({ ...prev, [task.task]: false }));
    } else {
      setForcedTasks((prev) => ({ ...prev, [task.task]: false }));
      setOffTimeTasks((prev) => ({ ...prev, [task.task]: false }));
    }
    if (closeModal) setShowModal(false);
  };
  const getElapsedTime = (task) => {
    if (!clockedInTasks[task.task]) return "0h 0m 0s";
    const clockedInAt = clockedInTimes[task.task];
    const now = currentTime.getTime();
    const elapsedMs = now - clockedInAt;
    const totalSeconds = Math.floor(elapsedMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const estimatedSeconds = getTaskDurationSeconds(task);
    const overtimeSeconds = totalSeconds - estimatedSeconds;
    let overtimeLabel = "";
    if (overtimeSeconds > 0) {
      const oHours = Math.floor(overtimeSeconds / 3600);
      const oMinutes = Math.floor((overtimeSeconds % 3600) / 60);
      const oSeconds = overtimeSeconds % 60;
      if (oHours > 0) overtimeLabel = `+${oHours}h `;
      else if (oMinutes > 0) overtimeLabel = `+${oMinutes}m `;
      else overtimeLabel = `+${oSeconds}s`;
    }
    return `${hours}h ${minutes}m ${seconds}s ${overtimeLabel}`;
  };
  const performTaskClockOut = (task, clockData = null, closeModal = true) => {
    const clockedInAt = clockedInTimes[task.task];
    const now = currentTime.getTime();
    const elapsedMs = now - clockedInAt;
    const taskEnd = new Date(task.date);
    taskEnd.setHours(task.endHour, task.endMin, 0, 0);
    const totalMs = getTaskDurationSeconds(task) * 1000;
    // Calculate session extra or off time based on session type
    let sessionExtraMs = 0;
    let sessionOffMs = 0;
    if (offTimeTasks[task.task]) {
      sessionOffMs = now - clockedInAt;
    } else {
      sessionExtraMs = calculateSessionExtraTimeMs(task, clockedInAt, now);
    }
    const sessionExtraStr =
      sessionExtraMs > 0 ? formatDuration(sessionExtraMs) : "";
    const sessionOffStr = sessionOffMs > 0 ? formatDuration(sessionOffMs) : "";
    setClockedInTasks((prev) => ({ ...prev, [task.task]: false }));
    setClockedInTimes((prev) => {
      const newTimes = { ...prev };
      delete newTimes[task.task];
      return newTimes;
    });
    setActualClockOutTimes((prev) => ({ ...prev, [task.task]: new Date(now) }));
    const isEarlyClockOut = clockData?.type === "earlyClockOut";
    // Record clock-out in history with session extra/off time
    setTaskHistory((prev) => ({
      ...prev,
      [task.task]: [
        ...(prev[task.task] || []),
        {
          type: "clock-out",
          time: new Date(now),
          duration: elapsedMs,
          isEarlyClockOut: isEarlyClockOut,
          extraTime: sessionExtraStr || null,
          offTime: sessionOffStr || null,
          reason: clockData?.reason,
          comments: clockData?.comments,
        },
      ],
    }));
    // Accumulate session extra or off time into totals
    if (sessionOffMs > 0) {
      setTotalOffTimes((prev) => {
        const prevTotalMs = parseDurationToMs(prev[task.task] || "0h 0m 0s");
        const newTotalMs = prevTotalMs + sessionOffMs;
        const newTotalStr = newTotalMs > 0 ? formatDuration(newTotalMs) : "";
        return { ...prev, [task.task]: newTotalStr };
      });
    }
    if (sessionExtraMs > 0 && !offTimeTasks[task.task]) {
      setTotalExtraTimes((prev) => {
        const prevTotalMs = parseDurationToMs(prev[task.task] || "0h 0m 0s");
        const newTotalMs = prevTotalMs + sessionExtraMs;
        const newTotalStr = newTotalMs > 0 ? formatDuration(newTotalMs) : "";
        return { ...prev, [task.task]: newTotalStr };
      });
    }
    const totalSeconds = Math.floor(elapsedMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const elapsedStr = `${hours}h ${minutes}m ${seconds}s`;
    if (forcedTasks[task.task]) {
      setForcedTaskTimes((prev) => ({ ...prev, [task.task]: elapsedStr }));
    } else {
      setNormalTaskTimes((prev) => ({ ...prev, [task.task]: elapsedStr }));
    }
    if (isEarlyClockOut) {
      setForcedClockOutTasks((prev) => ({ ...prev, [task.task]: true }));
      const clockOutTime = new Date();
      const clockOutTimeStr = formatTime(
        clockOutTime.getHours(),
        clockOutTime.getMinutes()
      );
      setForcedClockOutTimes((prev) => ({
        ...prev,
        [task.task]: clockOutTimeStr,
      }));
    } else {
      setCompletedTasks((prev) => ({ ...prev, [task.task]: true }));
    }
    if (closeModal) setShowModal(false);
  };
  const handleClockOutTask = (task, clockData = null, closeModal = true) => {
    if (!clockedInTasks[task.task]) {
      setAlertMessage(`Task "${task.task}" is not clocked in.`);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      if (closeModal) setShowModal(false);
      return;
    }
    performTaskClockOut(task, clockData, closeModal);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTask(null);
  };
  const isTaskTimeStarted = (task) => {
    const taskStart = new Date(task.date);
    taskStart.setHours(task.startHour, task.startMin, 0, 0);
    return currentTime >= taskStart;
  };
  const isTaskTimeElapsed = (task) => {
    const taskEnd = new Date(task.date);
    taskEnd.setHours(task.endHour, task.endMin, 0, 0);
    return currentTime > taskEnd;
  };
  const getModalOverlayClass = (task) => {
    if (!task) return "modal-overlay";
    const taskStart = new Date(task.date);
    taskStart.setHours(task.startHour, task.startMin, 0, 0);
    const taskEnd = new Date(task.date);
    taskEnd.setHours(task.endHour, task.endMin, 0, 0);
    if (currentTime > taskEnd) {
      return "modal-overlay task-late-entry";
    } else if (currentTime >= taskStart && currentTime <= taskEnd) {
      return "modal-overlay task-ontime-entry";
    } else {
      return "modal-overlay task-early-entry";
    }
  };
  const getTimeAgo = (task) => {
    const taskStart = new Date(task.date);
    taskStart.setHours(task.startHour, task.startMin, 0, 0);
    const diffMs = currentTime - taskStart;
    if (diffMs < 0) return "Not clocked in";
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    if (hours > 0) return `${hours}hr${hours !== 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
    return "Just now";
  };
  return (
    <div className="MyTasks_Sec Mains-TThabs-Page">
      <div className="Gthst-du">
        <h2>My Visits</h2>
      </div>
      <div className="TAx-AMijs">
        <div className="TAx-AMijs-1">
          <div className="TAx-AMijs-1-Top">
            <h3>
              <span>
                <ChevronRightIcon />
              </span>
              {selectedDay.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </h3>
            <div className="prog-tracKK"></div>
          </div>
          {/* Initial Design commented out */}
          <div className="Glkk-PLS custom-scroll-bar">
            {visits
              .filter(
                (visit) =>
                  new Date(visit.date).toDateString() ===
                  selectedDay.toDateString()
              )
              .sort((a, b) => {
                const timeA = a.startHour * 60 + a.startMin;
                const timeB = b.startHour * 60 + b.startMin;
                return timeA - timeB;
              })
              .map((visit, index) => {
                const taskStatus = getVisitStatus(visit);
                const secondaryText = `${visit.taskCount} task${visit.taskCount !== 1 ? 's' : ''}`;
                return (
                  <div
                    className="Glkk-Card"
                    key={index}
                    onClick={() => handleTaskClick(visit)}
                  >
                    <div className="Glkk-Card-Top">
                      <div className="OO-client-info-container">
                        <span>{visit.clientName?.charAt(0).toUpperCase() || 'C'}</span>
                        <div className="GGh-PPls">
                          <p>{visit.clientName || 'Unknown Client'}</p>
                        </div>
                      </div>
                      <h3></h3>
                      <h5> </h5>
                      <ul className="oik-pola-ULL">
                        <li>
                          <BriefcaseIcon />
                          <span>{visit.taskCount} task{visit.taskCount !== 1 ? 's' : ''}</span>
                        </li>
                        <li>
                          <ClockIcon />
                          <span>
                            {formatTime(visit.startHour, visit.startMin)} -{" "}
                            {formatTime(visit.endHour, visit.endMin)}
                          </span>
                        </li>
                        <li>
                          {visit.callType === "double" ? (
                            <UsersIcon />
                          ) : (
                            <UserIcon />
                          )}
                          <span>
                            {visit.callType === "double"
                              ? "Double handed call"
                              : "Single handed call"}
                          </span>
                        </li>
                        <li>
                          <MapPinIcon />
                          <span>Distance: {visit.distance}</span>
                        </li>
                      </ul>
                      <div className="PPolsuka">
                        <h6>{getVisitStatus(visit) && <span>{getVisitStatus(visit)}</span>}</h6>
                        <p>{getVisitSecondaryText(visit)}</p>
                      </div>
                      {(visit.clockInAt || visit.rawVisit?.clockInAt) &&
                        !(visit.clockOutAt || visit.rawVisit?.clockOutAt) && (
                          <div className="oo-Ptask-progress-container">
                            <motion.div
                              className="task-progress-bar"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${(() => {
                                  const clockInTime = visit.clockInAt || visit.rawVisit?.clockInAt;
                                  if (!clockInTime) return 0;
                                  const clockInDate = new Date(clockInTime);
                                  const now = new Date();
                                  const elapsed = now - clockInDate;
                                  const taskDurationMs = (visit.endHour * 60 + visit.endMin - visit.startHour * 60 - visit.startMin) * 60 * 1000;
                                  const progress = Math.min((elapsed / taskDurationMs) * 100, 100);
                                  return Math.max(progress, 0);
                                })()}%`,
                              }}
                              transition={{ ease: "linear", duration: 0.5 }}
                              style={{
                                backgroundColor: (() => {
                                  const clockInTime = visit.clockInAt || visit.rawVisit?.clockInAt;
                                  if (!clockInTime) return "#ff4d4d";
                                  const clockInDate = new Date(clockInTime);
                                  const now = new Date();
                                  const elapsed = now - clockInDate;
                                  const taskDurationMs = (visit.endHour * 60 + visit.endMin - visit.startHour * 60 - visit.startMin) * 60 * 1000;
                                  const progress = Math.min((elapsed / taskDurationMs) * 100, 100);
                                  if (progress <= 33) return "#ff4d4d";
                                  if (progress <= 66) return "#ffcc00";
                                  return "#28a745";
                                })(),
                                height: "4px",
                                borderRadius: "2px",
                              }}
                            />
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}
            {visits.filter(
              (visit) =>
                new Date(visit.date).toDateString() ===
                selectedDay.toDateString()
            ).length === 0 && (
              <div className="no-tasks-message">
                <img src={NoTaskImg} />
                <p>No visits assigned yet</p>
              </div>
            )}
          </div>
        </div>
        <div className="TAx-AMijs-2">
          <div className="PPl-Tops">
            <ul className="Ul-OKik">
              <li
                className={`WIthBRd-UIK-VBOx ${
                  viewMode === "today" ? "active-view" : ""
                }`}
                onClick={handleToday}
              >
                <CubeTransparentIcon /> Today
              </li>
              <li onClick={handlePrevious}>
                <ChevronLeftIcon />
              </li>
              <li onClick={handleNext}>
                <ChevronRightIcon />
              </li>
              <li>
                {getDateDisplay()} <ChevronDownIcon />
              </li>
              <li
                className={`WIthBRd-UIK-VBOx ${
                  viewMode === "weekly" ? "active-view" : ""
                }`}
                onClick={() => handleViewChange("weekly")}
              >
                <CalendarDaysIcon /> Weekly
              </li>
              <li
                className={`WIthBRd-UIK-VBOx ${
                  viewMode === "monthly" ? "active-view" : ""
                }`}
                onClick={() => handleViewChange("monthly")}
              >
                <CalendarDaysIcon /> Monthly
              </li>
            </ul>
            {/* Static total kept for easy revert: <h3 className="tot-Tasskai">Total Tasks: <span>{tasks.length}</span></h3> */}
            <h3 className="tot-Tasskai">
              Total Visits: <span>{visits.length}</span>
            </h3>
          </div>
          <div className="Task-Calindees" style={{ position: "relative" }}>
            <div className="Taxy-Days">
              <div className="DD-Day top-Uj"></div>
              {weekDays.map((date, i) => {
                const isToday =
                  date.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={i}
                    className={`DD-Day ${isToday ? "active-today" : ""} ${
                      activeIndex === i ? "active" : ""
                    }`}
                    onClick={() => handleDayClick(i, date)}
                  >
                    <h3>{String(date.getDate()).padStart(2, "0")}</h3>
                    <p>
                      {
                        ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                          date.getDay()
                        ]
                      }
                    </p>
                  </div>
                );
              })}
            </div>
            <AnimatePresence>
              {dragDirection === "left" && (
                <motion.div
                  key="left-arrow"
                  className="drag-arrow left"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <ChevronLeftIcon className="arrow-icon" />
                </motion.div>
              )}
              {dragDirection === "right" && (
                <motion.div
                  key="right-arrow"
                  className="drag-arrow right"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <ChevronRightIcon className="arrow-icon" />
                </motion.div>
              )}
            </AnimatePresence>
            <div
              className="GBj-Mainso"
              ref={scrollRef}
              onMouseDown={onMouseDown}
              onMouseLeave={onMouseLeave}
              onMouseUp={onMouseUp}
              onMouseMove={onMouseMove}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="GBJ-Parts top-Uj">
                {[...Array(24)].map((_, i) => {
                  const hour = i % 12 === 0 ? 12 : i % 12;
                  const ampm = i < 12 ? "am" : "pm";
                  return (
                    <div className="Div-DR" key={i}>
                      <p className="Tol-OPLSA">{`${hour}${ampm}`}</p>
                    </div>
                  );
                })}
              </div>
              {[...Array(7)].map((_, dayIndex) => (
                <div className="GBJ-Parts" key={dayIndex}>
                  {[...Array(24)].map((_, hourIndex) => (
                    <div className="Div-DR" key={`${dayIndex}-${hourIndex}`}>
                      {visits
                        .filter((visit) => {
                          const visitDate = new Date(visit.date).toDateString();
                          const currentDate = weekDays[dayIndex].toDateString();
                          const matches = (
                            visitDate === currentDate &&
                            visit.startHour === hourIndex
                          );
                          return matches;
                        })
                        .map((visit, idx) => {
                          const width = getTaskWidth(visit);
                          const offset = getTaskOffset(visit);
                          const isClosestToday = visit === closestTaskToday;
                          const visitStatus = getVisitStatus(visit);
                          const taskCount = visit.taskCount;
                          return (
                            <div
                              key={idx}
                              className="TaskBar"
                              style={{
                                width: `${width}%`,
                                left: `${offset}%`,
                                position: "absolute",
                                boxSizing: "border-box",
                                cursor: "pointer",
                              }}
                              onClick={() => handleTaskClick(visit)}
                            >
                              <div className="TaskBar-Main">
                                <h3>{visit.clientName || 'Unknown Client'}</h3>
                                <p className="ttask-NUma">
                                  <BriefcaseIcon /> {taskCount}
                                </p>

                                <div className="TTo-Lab-SeC">
                                  {(() => {
                                    const clockInTime = visit.clockInAt || visit.rawVisit?.clockInAt;
                                    const clockOutTime = visit.clockOutAt || visit.rawVisit?.clockOutAt;
                                    const scheduledStart = new Date(visit.date);
                                    scheduledStart.setHours(visit.startHour, visit.startMin, 0, 0);
                                    const scheduledEnd = new Date(visit.date);
                                    scheduledEnd.setHours(visit.endHour, visit.endMin, 0, 0);
                                    const now = new Date();
                                    
                                    if (clockOutTime) {
                                      const clockInDate = new Date(clockInTime);
                                      const clockOutDate = new Date(clockOutTime);
                                      const totalWorkedMs = clockOutDate - clockInDate;
                                      const hours = Math.floor(totalWorkedMs / (1000 * 60 * 60));
                                      const minutes = Math.floor((totalWorkedMs % (1000 * 60 * 60)) / (1000 * 60));
                                      return (
                                        <span className="top-labels tottal-work-time">
                                          Total Work Time: {hours}h {minutes}m
                                        </span>
                                      );
                                    }
                                    
                                    if (clockInTime) {
                                      const clockInDate = new Date(clockInTime);
                                      const isEarlyClockIn = clockInDate < scheduledStart;
                                      const isLateClockIn = clockInDate > scheduledEnd;
                                      
                                      if (isEarlyClockIn) {
                                        return (
                                          <span className="top-labels forced-label">
                                            Early Clock In
                                          </span>
                                        );
                                      }
                                      if (isLateClockIn) {
                                        return (
                                          <span className="top-labels off-time-label">
                                            Late Clock In
                                          </span>
                                        );
                                      }
                                      
                                      // Show elapsed time for normal clock ins
                                      const elapsedMs = now - clockInDate;
                                      const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
                                      const minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
                                      return (
                                        <span className="top-labels extra-time-label">
                                          Working: {hours}h {minutes}m
                                        </span>
                                      );
                                    }
                                    
                                    return null;
                                  })()}
                                </div>
                                {(visit.clockInAt || visit.rawVisit?.clockInAt) &&
                                  !(visit.clockOutAt || visit.rawVisit?.clockOutAt) && (
                                    <div className="Prodssl-uajs">
                                      <div className="task-progress-container">
                                        <motion.div
                                          className="task-progress-bar"
                                          initial={{ width: 0 }}
                                          animate={{
                                            width: `${(() => {
                                              const clockInTime = visit.clockInAt || visit.rawVisit?.clockInAt;
                                              if (!clockInTime) return 0;
                                              const clockInDate = new Date(clockInTime);
                                              const now = new Date();
                                              const elapsed = now - clockInDate;
                                              const taskDurationMs = (visit.endHour * 60 + visit.endMin - visit.startHour * 60 - visit.startMin) * 60 * 1000;
                                              const progress = Math.min((elapsed / taskDurationMs) * 100, 100);
                                              return Math.max(progress, 0);
                                            })()}%`,
                                          }}
                                          transition={{
                                            ease: "linear",
                                            duration: 0.5,
                                          }}
                                          style={{
                                            backgroundColor: "#eadcfcff",
                                          }}
                                        />
                                      </div>
                                      <div className="OOKtask-timer-container">
                                        <div className="task-timer Main-Card-Timer">
                                          ⏱ {(() => {
                                            const clockInTime = visit.clockInAt || visit.rawVisit?.clockInAt;
                                            if (!clockInTime) return "0h 0m";
                                            const clockInDate = new Date(clockInTime);
                                            const now = new Date();
                                            const elapsed = now - clockInDate;
                                            const hours = Math.floor(elapsed / (1000 * 60 * 60));
                                            const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
                                            return `${hours}h ${minutes}m`;
                                          })()} / {getTaskDuration(visit)}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                <div className="task-time">
                                  <p>{`${formatTime(
                                    visit.startHour,
                                    visit.startMin
                                  )} - ${formatTime(
                                    visit.endHour,
                                    visit.endMin
                                  )}`}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <AnimatePresence>
            {showModal && selectedTask && (
              <motion.div
                className={getModalOverlayClass(selectedTask)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 99999,
                }}
                onClick={handleCloseModal}
              >
                <motion.div
                  className="TaSt-Modal-COntsn"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 120, damping: 15 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="OL_TTOP_YS">
                    <div className="TaSt-Modal-COntsn-Main">
                      <div className="oaiks-PPolsla">
                        <h2>{selectedTask.task}</h2>
                        <p className="Toot-POl-FAt">
                          {`${formatTime(
                            selectedTask.startHour,
                            selectedTask.startMin
                          )} - ${formatTime(
                            selectedTask.endHour,
                            selectedTask.endMin
                          )}`}
                        </p>
                        <p>Duration: {getTaskDuration(selectedTask)}</p>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginTop: "10px",
                          }}
                        >
                          {selectedTask.callType === "double" ? (
                            <UsersIcon
                              style={{
                                width: "24px",
                                height: "24px",
                                marginRight: "8px",
                              }}
                            />
                          ) : (
                            <UserIcon
                              style={{
                                width: "24px",
                                height: "24px",
                                marginRight: "8px",
                              }}
                            />
                          )}
                          <span>
                            {selectedTask.callType === "double"
                              ? "Double handed call"
                              : "Single handed call"}
                          </span>
                        </div>
                        {selectedTask.clientName && (
                          <div
                            className="client-info-container"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginTop: "10px",
                            }}
                          >
                            {selectedTask.clientImage ? (
                              <img
                                src={selectedTask.clientImage}
                                alt={selectedTask.clientName}
                                style={{
                                  width: "24px",
                                  height: "24px",
                                  borderRadius: "50%",
                                  marginRight: "8px",
                                }}
                              />
                            ) : (
                              <span
                                style={{
                                  width: "24px",
                                  height: "24px",
                                  borderRadius: "50%",
                                  backgroundColor: "#ccc",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "12px",
                                  marginRight: "8px",
                                }}
                              >
                                {getClientInitials(selectedTask.clientName)}
                              </span>
                            )}
                            <span>{selectedTask.clientName}</span>
                          </div>
                        )}
                        {(selectedTask.clockInAt || selectedTask.rawVisit?.clockInAt) &&
                          !(selectedTask.clockOutAt || selectedTask.rawVisit?.clockOutAt) && (
                            <p>
                              Progress:{" "}
                              {Math.round((() => {
                                const clockInTime = selectedTask.clockInAt || selectedTask.rawVisit?.clockInAt;
                                if (!clockInTime) return 0;
                                const clockInDate = new Date(clockInTime);
                                const now = new Date();
                                const elapsed = now - clockInDate;
                                const taskDurationMs = (selectedTask.endHour * 60 + selectedTask.endMin - selectedTask.startHour * 60 - selectedTask.startMin) * 60 * 1000;
                                const progress = Math.min((elapsed / taskDurationMs) * 100, 100);
                                return Math.max(progress, 0);
                              })())}%
                            </p>
                          )}
                        {getVisitStatus(selectedTask) && (
                          <p>Status: {getVisitStatus(selectedTask)}</p>
                        )}
                        {(selectedTask.clockInAt || selectedTask.rawVisit?.clockInAt) && (
                          <p className="task-timer">
                            ⏱ {(() => {
                              const clockInTime = selectedTask.clockInAt || selectedTask.rawVisit?.clockInAt;
                              if (!clockInTime) return "0h 0m";
                              const clockInDate = new Date(clockInTime);
                              const now = new Date();
                              const elapsed = now - clockInDate;
                              const hours = Math.floor(elapsed / (1000 * 60 * 60));
                              const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
                              return `${hours}h ${minutes}m`;
                            })()} / {getTaskDuration(selectedTask)}
                          </p>
                        )}
                        {getOffTimeLabel(selectedTask) && (
                          <p style={{ color: "#ff4d4d", fontWeight: "bold" }}>
                            Off Time: {getOffTimeLabel(selectedTask)}
                          </p>
                        )}
                        {getExtraTimeLabel(selectedTask) && (
                          <p style={{ color: "#ff4d4d", fontWeight: "bold" }}>
                            Extra Time: {getExtraTimeLabel(selectedTask)}
                          </p>
                        )}
                        {forcedTasks[selectedTask.task] && (
                          <p style={{ color: "red", fontWeight: "bold" }}>
                            ⚠ Forced Clock In
                            {forcedTaskTimes[selectedTask.task]
                              ? ` - ${forcedTaskTimes[selectedTask.task]}`
                              : ""}
                          </p>
                        )}
                        {forcedClockOutTasks[selectedTask.task] && (
                          <p style={{ color: "red", fontWeight: "bold" }}>
                            ⚠ Forced Clock Out at{" "}
                            {forcedClockOutTimes[selectedTask.task]}
                          </p>
                        )}
                      </div>
                      <div className="FG-POLAK">
                        {isTaskTimeElapsed(selectedTask) &&
                          !clockedInTasks[selectedTask.task] &&
                          !completedTasks[selectedTask.task] && (
                            <p>The time for this Visit has elapsed.</p>
                          )}
                        {!isTaskTimeStarted(selectedTask) &&
                          !clockedInTasks[selectedTask.task] &&
                          !completedTasks[selectedTask.task] && (
                            <p>The time for this Visit has not started yet.</p>
                          )}
                        {isTaskTimeStarted(selectedTask) &&
                          !isTaskTimeElapsed(selectedTask) &&
                          !clockedInTasks[selectedTask.task] &&
                          !completedTasks[selectedTask.task] && (
                            <p>{getLatenessStr(selectedTask)}</p>
                          )}
                      </div>
                    </div>
                    <div className="oalsk-OIks">
                      <h2 className="Drop-UJ-HEader">{selectedTask.task}</h2>
                      <div className="HHY-GLd-BanT">
                        {(() => {
                          const taskDate = new Date(selectedTask.date);
                          const currentDate = new Date(currentTime);
                          // Set time to 00:00:00 for date comparison
                          taskDate.setHours(0, 0, 0, 0);
                          currentDate.setHours(0, 0, 0, 0);
                          const isCurrentDay =
                            taskDate.getTime() === currentDate.getTime();
                          if (
                            !isCurrentDay &&
                            !clockedInTasks[selectedTask.task] &&
                            !completedTasks[selectedTask.task]
                          ) {
                            return (
                              <p style={{ color: "#666", marginTop: "10px" }}>
                                {taskDate < currentDate
                                  ? "This Visit is on a past day and cannot be clocked in or out."
                                  : "This Visit is on a future day and cannot be clocked in or out."}
                              </p>
                            );
                          }
                          return (
                            <>
                              {!clockedInTasks[selectedTask.task] && (
                                <button
                                  className="action-task-button"
                                  onClick={() =>
                                    handleClockInTask(selectedTask)
                                  }
                                  style={{
                                    backgroundColor: "#5C54FF",
                                    color: "#fff",
                                    padding: "10px 20px",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    marginTop: "10px",
                                    marginRight: "10px",
                                  }}
                                >
                                  Clock In Task
                                </button>
                              )}
                              {clockedInTasks[selectedTask.task] && (
                                <button
                                  className="action-task-button"
                                  onClick={() =>
                                    handleClockOutTask(selectedTask)
                                  }
                                  style={{
                                    backgroundColor: "#ff4d4d",
                                    color: "#fff",
                                    padding: "10px 20px",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    marginTop: "10px",
                                  }}
                                >
                                  Clock Out Task
                                </button>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="MMMU-POLSU-SECT"></div>
                  </div>
                  <button
                    className="TAxT-close-modal-button"
                    onClick={handleCloseModal}
                  >
                    <XMarkIcon />
                  </button>
                  <MyTasksContent
                    selectedTask={selectedTask}
                    isClockedIn={
                      !!selectedTask && 
                      (selectedTask.clockInAt || selectedTask.rawVisit?.clockInAt) &&
                      !(selectedTask.clockOutAt || selectedTask.rawVisit?.clockOutAt)
                    }
                    taskStatus={
                      selectedTask ? getTaskStatus(selectedTask) : "Not Started"
                    }
                    onClockToggle={
                      selectedTask
                        ? async (task, clockData) => {
                            try {
                              if (clockedInTasks[selectedTask.task]) {
                                handleClockOutTask(task, clockData, false);
                              } else {
                                handleClockInTask(task, clockData, false);
                              }
                              // Refresh visits data after clock toggle
                              await refreshVisits();
                            } catch (error) {
                              // Handle error if needed
                            }
                          }
                        : null
                    }
                    extraTime={
                      selectedTask ? getExtraTimeLabel(selectedTask) || "" : ""
                    }
                    offTime={
                      selectedTask ? getOffTimeLabel(selectedTask) || "" : ""
                    }
                    hasRunningTask={!!runningTaskName}
                    runningTaskName={runningTaskName}
                    onShowAlert={showAlertMessage}
                    history={taskHistory[selectedTask?.task] || []}
                    actualClockIn={actualClockInTimes[selectedTask?.task]}
                    actualClockOut={actualClockOutTimes[selectedTask?.task]}
                    formatDuration={formatDuration}
                  />
                </motion.div>
              </motion.div>
            )}
            {showAlert && (
              <motion.div
                className="alert-message"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5 }}
              >
                {alertMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
export default MyTasks;

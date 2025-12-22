import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { FiMoreVertical } from "react-icons/fi";
import { TbMoodEmpty } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import SideNavBar from "../Home/SideNavBar";
import "./styles/TasksPage.css";
import SortOptions from "../../../components/SortOptions/SortOptions";
import { CiGrid41 } from "react-icons/ci";
import { FilterIcon } from "../../../assets/icons/FilterIcon";
import StatusBadge from "../../../components/StatusBadge";
import Table from "../../../components/Table/Table";
import AnimatedCounter from "../../../components/AnimatedCounter";
import { fetchAllTasks, deleteTask } from "../Home/HomeService";
import { apiClient } from "../../../config";
// import AddTaskModal from "./modals/AddTaskModal";
// import DeleteTaskModal from "./modals/DeleteTaskModal";
// import EditTaskModal from "./modals/EditTaskModal";
// import ReassignTaskModal from "./modals/ReassignTaskModal";

const formatCareType = (careType) => {
  if (!careType) return "Double handed call";
  switch (careType) {
    case "DOUBLE_HANDED_CALL":
      return "Double handed call";
    case "SPECIALCARE":
      return "Special";
    case "SINGLE_HANDED_CALL":
    default:
      return "Single handed call";
  }
};

const CardView = ({ tasks, isLoading }) => {
  if (isLoading) return <div>Loading...</div>;
  if (!tasks.length) return <div>No visits found</div>;

  return (
    <div className="card-view-container">
      {tasks.map((visit, index) => (
        <div key={visit.id} className="task-card">
          <div className="task-card-header">
            <img
              src={`https://i.pravatar.cc/40?img=${index + 1}`}
              alt={visit.careType}
              className="task-avatar"
            />
            <div>
              <h4>{formatCareType(visit.careType)}</h4>
              <p className="task-date">
                {new Date(visit.startDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="task-content">
            <p className="task-about">{formatCareType(visit.careType)}</p>
            <div className="task-priority medium">
              {visit.tasks?.length || 0} tasks
            </div>
            <StatusBadge status={visit.status} />
          </div>
          <div className="task-actions">
            <button className="action-button">View</button>
            {/* <button className="action-button">Edit</button> */}
            <button className="action-button">Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper function to calculate percentage change
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const generateDummyTaskData = () => {
  const names = ["Precious Wen", "Tonna Eziobu", "Kenny Greg", "Chiny Joy"];
  const priorities = ["High", "Medium", "Low"];
  const tasks = [
    "Client site inspection",
    "Property assessment",
    "Customer meeting",
    "Site survey",
  ];
  const progresses = ["Scheduled", "Completed"];

  return names.flatMap((name, nameIndex) =>
    tasks.map((task, taskIndex) => ({
      id: `${nameIndex}-${taskIndex}`,
      name,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      about: task,
      progress: progresses[Math.floor(Math.random() * progresses.length)],
      actions: "View | Edit | Delete | Reassign",
      due_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      assigned_to: name,
      created_at: new Date(
        Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000
      ).toISOString(),
    }))
  );
};

const TasksPage = () => {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get("status");

  const initialStatusFilter =
    statusParam === "completed"
      ? "completed"
      : statusParam === "pending"
      ? "pending"
      : statusParam === "in_progress"
      ? "in_progress"
      : statusParam === "cancelled"
      ? "cancelled"
      : "all";

  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [searchTerm, setSearchTerm] = useState("");
  const [shrinkNav, setShrinkNav] = useState(false);
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [activePopup, setActivePopup] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table");
  const itemsPerPage = 10;
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);

  // Track previous counts for calculating percentage changes
  const [previousStats, setPreviousStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
  });

  // Calculate statistics from visits data
  const statistics = useMemo(() => {
    const scheduledVisits = tasks.filter(
      (visit) => visit.status === "SCHEDULED"
    ).length;
    const inProgressVisits = tasks.filter(
      (visit) => visit.status === "IN_PROGRESS"
    ).length;
    const completedVisits = tasks.filter(
      (visit) => visit.status === "COMPLETED"
    ).length;
    const cancelledVisits = tasks.filter(
      (visit) => visit.status === "CANCELLED"
    ).length;

    return {
      pending: scheduledVisits,
      inProgress: inProgressVisits,
      completed: completedVisits,
      cancelled: cancelledVisits,
    };
  }, [tasks]);

  // Calculate percentage changes based on this week vs last week
  const percentageChanges = useMemo(() => {
    const now = new Date();
    const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const lastWeekEnd = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const countThisWeek = (status) =>
      tasks.filter(
        (visit) =>
          new Date(visit.createdAt) >= thisWeekStart && visit.status === status
      ).length;
    const countLastWeek = (status) =>
      tasks.filter(
        (visit) =>
          new Date(visit.createdAt) >= lastWeekStart &&
          new Date(visit.createdAt) < lastWeekEnd &&
          visit.status === status
      ).length;

    return {
      pending: calculatePercentageChange(
        countThisWeek("SCHEDULED"),
        countLastWeek("SCHEDULED")
      ),
      inProgress: calculatePercentageChange(
        countThisWeek("IN_PROGRESS"),
        countLastWeek("IN_PROGRESS")
      ),
      completed: calculatePercentageChange(
        countThisWeek("COMPLETED"),
        countLastWeek("COMPLETED")
      ),
      cancelled: calculatePercentageChange(
        countThisWeek("CANCELLED"),
        countLastWeek("CANCELLED")
      ),
    };
  }, [tasks]);

  // Memoized table columns to prevent unnecessary rerenders
  const tableColumns = useMemo(
    () => [
      {
        key: "careType",
        header: "Care Type",
        render: (visit) => formatCareType(visit.careType),
      },
      {
        key: "status",
        header: "Status",
        render: (visit) => <StatusBadge status={visit.status} />,
      },
      {
        key: "visitDate",
        header: "Visit Date",
        render: (visit) => {
          const startDate = new Date(visit.startDate);
          return startDate.toLocaleDateString();
        },
      },
      {
        key: "visitTime",
        header: "Visit Time",
        render: (visit) => {
          const startDate = new Date(visit.startDate);
          const endDate = new Date(visit.endDate);
          return `${startDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })} - ${endDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`;
        },
      },
      {
        key: "tasks",
        header: "Number of Visits",
        render: (visit) => (
          <div className="task-count">{visit.tasks?.length || 0} tasks</div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        render: (task) => (
          <div className="actions-cell">
            <div className="actions-container">
              <motion.button
                className="actions-button"
                onClick={(e) => togglePopup(task.id, e)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiMoreVertical />
              </motion.button>
              <AnimatePresence>
                {activePopup === task.id && (
                  <motion.div
                    className="actions-popup"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <motion.button
                      onClick={(e) => handleActionClick("view", task, e)}
                      whileHover={{ x: 5 }}
                    >
                      View Visit
                    </motion.button>
                    <motion.button
                      onClick={(e) => handleActionClick("edit", task, e)}
                      whileHover={{ x: 5 }}
                    >
                      {/* Edit Visit
                    </motion.button>
                    <motion.button
                      onClick={(e) => handleActionClick("reassign", task, e)}
                      whileHover={{ x: 5 }}
                    >
                      Reassign Visit
                    </motion.button>
                    <motion.button
                      onClick={(e) => handleActionClick("delete", task, e)}
                      whileHover={{ x: 5 }}
                    > */}
                      Delete Visit
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ),
      },
    ],
    [activePopup]
  ); // Only recreate when activePopup changes

  const sortOptions = useMemo(
    () => [
      { value: "name-asc", label: "Care Type (A-Z)" },
      { value: "name-desc", label: "Care Type (Z-A)" },
      { value: "due_date-asc", label: "Visit Date (Earliest)" },
      { value: "due_date-desc", label: "Visit Date (Latest)" },
      { value: "priority-asc", label: "Tasks (Fewest)" },
      { value: "priority-desc", label: "Tasks (Most)" },
    ],
    []
  );

  useEffect(() => {
    handleFetchTasks();
  }, []);

  const getFilteredTasks = (visits, statusFilter, searchTerm) => {
    return visits.filter((visit) => {
      if (statusFilter !== "all") {
        if (statusFilter === "completed" && visit.status !== "COMPLETED")
          return false;
        if (statusFilter === "pending" && visit.status !== "SCHEDULED")
          return false;
        if (statusFilter === "in_progress" && visit.status !== "IN_PROGRESS")
          return false;
        if (statusFilter === "cancelled" && visit.status !== "CANCELLED")
          return false;
      }
      if (searchTerm) {
        return (
          visit.careType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          visit.status?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return true;
    });
  };

  useEffect(() => {
    setFilteredTasks(getFilteredTasks(tasks, statusFilter, searchTerm));
  }, [tasks, statusFilter, searchTerm]);

  // Store previous stats when component unmounts or before refresh
  useEffect(() => {
    return () => {
      // Save current stats to localStorage before component unmounts
      localStorage.setItem("previousTaskStats", JSON.stringify(statistics));
    };
  }, [statistics]);

  const handleUpdateSuccess = useCallback((updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  }, []);

  const handleFetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get previous stats from localStorage
      const savedStats = localStorage.getItem("previousTaskStats");
      if (savedStats) {
        setPreviousStats(JSON.parse(savedStats));
      }

      const response = await apiClient.get("/api/rostering/tasks/visits");
      const visitsData = response.data.items || [];
      // Sort by creation date (newest first)
      const sortedVisits = visitsData.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setTasks(sortedVisits || []);
      setFilteredTasks(
        getFilteredTasks(sortedVisits || [], statusFilter, searchTerm)
      );
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching visits:", error);
      setTasks([]);
      setFilteredTasks([]);
      setIsLoading(false);
    }
  }, []);

  const handleSortChange = useCallback(
    (value) => {
      let sorted = [...filteredTasks];

      switch (value) {
        case "name-asc":
          sorted.sort((a, b) => {
            const careTypeA = a.careType || "";
            const careTypeB = b.careType || "";
            return careTypeA.localeCompare(careTypeB);
          });
          break;
        case "name-desc":
          sorted.sort((a, b) => {
            const careTypeA = a.careType || "";
            const careTypeB = b.careType || "";
            return careTypeB.localeCompare(careTypeA);
          });
          break;
        case "due_date-asc":
          sorted.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
          break;
        case "due_date-desc":
          sorted.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
          break;
        case "priority-asc":
          sorted.sort(
            (a, b) => (a.tasks?.length || 0) - (b.tasks?.length || 0)
          );
          break;
        case "priority-desc":
          sorted.sort(
            (a, b) => (b.tasks?.length || 0) - (a.tasks?.length || 0)
          );
          break;
        default:
          break;
      }

      setFilteredTasks(sorted);
    },
    [filteredTasks]
  );

  const handleSearch = useCallback(
    (term) => {
      setFilteredTasks(getFilteredTasks(tasks, statusFilter, term));
      setCurrentPage(1);
    },
    [tasks, statusFilter, getFilteredTasks]
  );

  const togglePopup = useCallback(
    (id, e) => {
      e.stopPropagation();
      setActivePopup(activePopup === id ? null : id);
    },
    [activePopup]
  );

  const closePopups = useCallback(() => {
    setActivePopup(null);
  }, []);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTasks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

  const handleActionClick = useCallback(
    (action, task, e) => {
      e.stopPropagation();
      closePopups();
      setSelectedTask(task);

      switch (action) {
        case "view":
          navigate(`/company/visits/view/${task.id}`);
          break;
        // case "edit":
        //   setIsEditModalOpen(true);
        //   break;
        // case "reassign":
        //   setIsReassignModalOpen(true);
        //   break;
        case "delete":
          // Call delete API
          const confirmDelete = window.confirm(
            "Are you sure you want to delete this visit?"
          );
          if (confirmDelete) {
            deleteTask(task.id)
              .then(() => {
                handleFetchTasks(); // Refresh the list
              })
              .catch((error) => {
                console.error("Error deleting visit:", error);
                alert("Failed to delete visit. Please try again.");
              });
          }
          break;
        default:
          break;
      }
    },
    [closePopups, navigate]
  );

  const handleViewToggle = useCallback(() => {
    setViewMode(viewMode === "table" ? "card" : "table");
  }, [viewMode]);

  // Format percentage for display
  const formatPercentage = useCallback((value) => {
    if (value === 0) return "0% vs last week";
    const direction = value > 0 ? "up" : "down";
    const absValue = Math.abs(value).toFixed(1);
    return `${absValue}% ${direction} vs last week`;
  }, []);

  // Memoized statistics cards to prevent unnecessary rerenders
  const statisticsCards = useMemo(() => {
    return [
      {
        title: "Scheduled Visits",
        count: statistics.pending,
        className: "pending",
        percentage: percentageChanges.pending,
      },
      {
        title: "In Progress Visits",
        count: statistics.inProgress,
        className: "in-progress",
        percentage: percentageChanges.inProgress,
      },
      {
        title: "Completed Visits",
        count: statistics.completed,
        className: "completed",
        percentage: percentageChanges.completed,
      },
      {
        title: "Cancelled Visits",
        count: statistics.cancelled,
        className: "cancelled",
        percentage: percentageChanges.cancelled,
      },
    ].map((card, idx) => (
      <motion.div
        key={idx}
        className={`tasks-statistics-card ${card.className}`}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <h3 className="tasks-statistics-title">{card.title}</h3>
        <p className="tasks-statistics-count">
          <AnimatedCounter value={card.count} />
        </p>
        <div
          className={`tasks-status-percentage ${
            card.percentage > 0
              ? "positive"
              : card.percentage < 0
              ? "negative"
              : "neutral"
          }`}
        >
          <span
            className={
              card.percentage > 0
                ? "triangle-up"
                : card.percentage < 0
                ? "triangle-down"
                : ""
            }
          >
            {card.percentage > 0 ? "▲" : card.percentage < 0 ? "▼" : ""}
          </span>
          <span>{formatPercentage(card.percentage)}</span>
        </div>
      </motion.div>
    ));
  }, [statistics, percentageChanges, formatPercentage]);

  return (
    <motion.div
      className={`DB-Envt ${shrinkNav ? "ShrinkNav" : ""}`}
      onClick={closePopups}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SideNavBar setShrinkNav={setShrinkNav} />
      <div className="Main-DB-Envt">
        <div className="DB-Envt-Container">
          <motion.div
            className="tasks-page"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="tasks-header">
              <h2>Visits</h2>
              <p className="tasks-description">
                View and manage all current employee visits, set priorities and
                track progress
              </p>
            </div>

            {/* Status Cards - using memoized component */}
            <div className="tasks-statistics-cards-container">
              {statisticsCards}
            </div>

            <div className="tasks-list-options">
              <div className="search-input-container">
                <CiSearch />
                <input
                  id="search"
                  name="search"
                  type="search"
                  placeholder="Search visits or employees"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleSearch(e.target.value);
                  }}
                />
              </div>

              <button onClick={handleViewToggle} className="view-toggle">
                View&nbsp;&nbsp;
                {viewMode === "table" ? <FilterIcon /> : <CiGrid41 />}
              </button>

              <SortOptions
                options={sortOptions}
                onSortChange={handleSortChange}
              />
            </div>

            {viewMode === "table" ? (
              <div className="tasks-list-table">
                <Table
                  columns={tableColumns}
                  data={currentItems}
                  isLoading={isLoading}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  emptyStateIcon={<TbMoodEmpty />}
                  emptyStateMessage="No visits found"
                  emptyStateDescription="Visits will appear here once scheduled"
                />
              </div>
            ) : (
              <CardView tasks={currentItems} isLoading={isLoading} />
            )}
          </motion.div>
        </div>
      </div>
      {/* <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onTaskAdded={handleFetchTasks}
      />
      <DeleteTaskModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        task={selectedTask}
        onDeleteSuccess={handleFetchTasks}
      />
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={selectedTask}
        onUpdateSuccess={handleUpdateSuccess}
      />
      <ReassignTaskModal
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        task={selectedTask}
        onReassignSuccess={handleUpdateSuccess}
      /> */}
    </motion.div>
  );
};

export default TasksPage;

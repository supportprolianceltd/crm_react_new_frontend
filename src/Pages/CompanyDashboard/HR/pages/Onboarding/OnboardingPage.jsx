import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "../../HR.css";
import Table from "../../../../../components/Table/Table";
import StatusBadge from "../../../../../components/StatusBadge";

// Memoized AnimatedCounter component to prevent unnecessary rerenders
const AnimatedCounter = React.memo(({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Only animate if the value has actually changed
    if (displayValue !== value) {
      const duration = 1000;
      const frameDuration = 1000 / 60;
      const totalFrames = Math.round(duration / frameDuration);
      let frame = 0;
      const startValue = displayValue;

      const counter = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const currentValue = Math.round(
          startValue + (value - startValue) * progress
        );

        setDisplayValue(currentValue);

        if (frame === totalFrames) {
          clearInterval(counter);
        }
      }, frameDuration);

      return () => clearInterval(counter);
    }
  }, [value]); // Only depend on value changes

  return <span>{displayValue}</span>;
});

// Helper function to calculate percentage change
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Generate dummy onboarding data
const generateDummyOnboardingData = () => {
  const names = [
    "Emma Johnson",
    "Liam Smith",
    "Olivia Williams",
    "Noah Brown",
    "Ava Jones",
    "William Garcia",
    "Sophia Miller",
    "James Davis",
    "Isabella Rodriguez",
    "Logan Martinez",
    "Mia Hernandez",
    "Benjamin Lopez",
    "Charlotte Gonzalez",
    "Lucas Wilson",
    "Amelia Anderson",
  ];

  const roles = [
    "Software Engineer",
    "Product Manager",
    "UX Designer",
    "Data Analyst",
    "Marketing Specialist",
    "Sales Representative",
    "HR Coordinator",
    "Accountant",
  ];

  const stages = [
    "Paperwork",
    "IT Setup",
    "Training",
    "Team Introduction",
    "Final Review",
  ];

  const statuses = ["in-progress", "completed", "pending", "declined"];

  const data = [];

  for (let i = 0; i < 15; i++) {
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    const randomStage = stages[Math.floor(Math.random() * stages.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomCompletion = Math.floor(Math.random() * 100);

    // Generate a random date within the last 30 days
    const randomDaysAgo = Math.floor(Math.random() * 30);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - randomDaysAgo);

    data.push({
      id: i + 1,
      name: randomName,
      role: randomRole,
      startDate: startDate.toLocaleDateString(),
      currentStage: randomStage,
      completion: randomCompletion,
      status: randomStatus,
    });
  }

  return data;
};

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [onboardings, setOnboardings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Track previous counts for calculating percentage changes
  const [previousStats, setPreviousStats] = useState({
    total: 0,
    pending: 0,
    declined: 0,
  });

  // Calculate statistics from onboarding data
  const statistics = useMemo(() => {
    const totalOnboarded = onboardings.length;
    const pendingTasks = onboardings.filter(
      (onboarding) =>
        onboarding.status === "pending" || onboarding.status === "in-progress"
    ).length;
    const declinedRequests = onboardings.filter(
      (onboarding) => onboarding.status === "declined"
    ).length;

    return {
      total: totalOnboarded,
      pending: pendingTasks,
      declined: declinedRequests,
    };
  }, [onboardings]);

  // Calculate percentage changes
  const percentageChanges = useMemo(() => {
    return {
      total: calculatePercentageChange(statistics.total, previousStats.total),
      pending: calculatePercentageChange(
        statistics.pending,
        previousStats.pending
      ),
      declined: calculatePercentageChange(
        statistics.declined,
        previousStats.declined
      ),
    };
  }, [statistics, previousStats]);

  // Memoized table columns to prevent unnecessary rerenders
  const tableColumns = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
      },
      {
        key: "role",
        header: "Role",
      },
      {
        key: "startDate",
        header: "Start Date",
      },
      {
        key: "currentStage",
        header: "Current Stage",
      },
      {
        key: "completion",
        header: "Completion %",
        render: (onboarding) => (
          <div className="completion-bar-container">
            <div className="completion-bar">
              <div
                className="completion-progress"
                style={{ width: `${onboarding.completion}%` }}
              ></div>
            </div>
            <span className="completion-text">{onboarding.completion}%</span>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (onboarding) => (
          <StatusBadge
            status={
              onboarding.completion === 100 ? "completed" : onboarding.status
            }
          />
        ),
      },
    ],
    []
  );

  useEffect(() => {
    handleFetchOnboardings();
  }, []);

  // Store previous stats when component unmounts or before refresh
  useEffect(() => {
    return () => {
      // Save current stats to localStorage before component unmounts
      localStorage.setItem(
        "previousOnboardingStats",
        JSON.stringify(statistics)
      );
    };
  }, [statistics]);

  const handleFetchOnboardings = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get previous stats from localStorage
      const savedStats = localStorage.getItem("previousOnboardingStats");
      if (savedStats) {
        setPreviousStats(JSON.parse(savedStats));
      }

      // Simulate API call with timeout
      setTimeout(() => {
        const dummyData = generateDummyOnboardingData();
        setOnboardings(dummyData);
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error("Error fetching onboarding data:", error);
      setOnboardings([]);
      setIsLoading(false);
    }
  }, []);

  // Format percentage for display
  const formatPercentage = useCallback((value) => {
    if (value === 0) return "0% this week";
    const direction = value > 0 ? "up" : "down";
    const absValue = Math.abs(value).toFixed(1);
    return `${absValue}% ${direction} this week`;
  }, []);

  // Memoized statistics cards to prevent unnecessary rerenders
  const statisticsCards = useMemo(() => {
    return [
      {
        title: "Total Onboarded",
        count: statistics.total,
        className: "total",
        percentage: percentageChanges.total,
      },
      {
        title: "Pending Tasks",
        count: statistics.pending,
        className: "pending",
        percentage: percentageChanges.pending,
      },
      {
        title: "Declined Requests",
        count: statistics.declined,
        className: "declined",
        percentage: percentageChanges.declined,
      },
    ].map((card, idx) => (
      <motion.div
        key={idx}
        className={`onboarding-list-statistics-card ${card.className}`}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <h3 className="onboarding-list-statistics-title">{card.title}</h3>
        <p className="onboarding-list-statistics-count">
          <AnimatedCounter value={card.count} />
        </p>
        <div
          className={`requests-status-percentage ${
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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = onboardings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(onboardings.length / itemsPerPage);

  return (
    <motion.div
      className="onboarding-list-page"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="onboarding-list-header">
        <div>
          <h2>Onboarding Overview</h2>
          <p className="onboarding-list-description">
            Track new hires as they progress through their onboarding journey
          </p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="onboarding-list-statistics-cards-container">
        {statisticsCards}
      </div>

      <div className="onboarding-list-table">
        <h3>Onboarding Task</h3>
        <Table
          columns={tableColumns}
          data={currentItems}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          emptyStateMessage="No onboarding records found"
          emptyStateDescription="New hires will appear here once they start the onboarding process"
          onRowClick={(row) => navigate(`/company/hr/onboarding/${row.id}`)}
        />
      </div>
    </motion.div>
  );
};

export default OnboardingPage;

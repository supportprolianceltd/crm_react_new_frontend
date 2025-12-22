import React, { useEffect, useState, useMemo, useCallback } from "react";
import { BsFillClockFill } from "react-icons/bs";
import { fetchEmployees } from "../../../Employees/config/apiService";
import StatusBadge from "../../../../../components/StatusBadge";
import "../../HR.css";
import { Link } from "react-router-dom";

// Memoized AnimatedCounter component to prevent unnecessary rerenders
const AnimatedCounter = React.memo(({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Only animate if the value has actually changed and is a valid number
    const numericValue = Number(value) || 0;
    if (displayValue !== numericValue) {
      const duration = 1000;
      const frameDuration = 1000 / 60;
      const totalFrames = Math.round(duration / frameDuration);
      let frame = 0;
      const startValue = displayValue;

      const counter = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const currentValue = Math.round(
          startValue + (numericValue - startValue) * progress
        );

        setDisplayValue(currentValue);

        if (frame === totalFrames) {
          clearInterval(counter);
        }
      }, frameDuration);

      return () => clearInterval(counter);
    }
  }, [value, displayValue]); // Depend on both value and displayValue

  return <span>{displayValue}</span>;
});

// Helper function to calculate percentage change
const calculatePercentageChange = (current, previous) => {
  const currentNum = Number(current) || 0;
  const previousNum = Number(previous) || 0;

  if (previousNum === 0) return currentNum > 0 ? 100 : 0;
  return ((currentNum - previousNum) / previousNum) * 100;
};

const OverviewPage = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  // Track previous counts for calculating percentage changes
  const [previousStats, setPreviousStats] = useState({
    total: 0,
    newHire: 0,
    active: 0,
    onLeave: 0,
    contractsExpiring: 0,
  });

  // Fetch employees data
const handleFetchEmployees = useCallback(async () => {
  setIsLoading(true);
  try {
    const savedStats = localStorage.getItem("previousOverviewStats");
    if (savedStats) {
      const parsedStats = JSON.parse(savedStats);
      setPreviousStats({
        total: Number(parsedStats.total) || 0,
        newHire: Number(parsedStats.newHire) || 0,
        active: Number(parsedStats.active) || 0,
        onLeave: Number(parsedStats.onLeave) || 0,
        contractsExpiring: Number(parsedStats.contractsExpiring) || 0,
      });
    }

    const response = await fetchEmployees();

    // Ensure it's always an array
    let employeesData = [];
    if (Array.isArray(response)) {
      employeesData = response;
    } else if (response?.data && Array.isArray(response.data)) {
      employeesData = response.data;
    }

    setEmployees(employeesData);
  } catch (error) {
    console.error("Error fetching employees:", error);
    setEmployees([]);
  } finally {
    setIsLoading(false);
  }
}, []);


  useEffect(() => {
    handleFetchEmployees();
  }, [handleFetchEmployees]);

  // Calculate statistics from employees data with proper number conversion
  const statistics = useMemo(() => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(
      (emp) => emp.status === "active"
    ).length;

    // Calculate new hires (employees created in the last 7 days)
    const newHire = employees.filter((emp) => {
      if (!emp.created_at && !emp.hire_date) return false;
      try {
        const createdDate = new Date(emp.created_at || emp.hire_date);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return createdDate >= sevenDaysAgo;
      } catch (error) {
        return false;
      }
    }).length;

    // Calculate employees on leave (default to 0 if no leave data)
    const onLeave = employees.filter(
      (emp) => emp.leave_status === "on_leave" || emp.on_leave === true
    ).length;

    // Calculate contracts expiring in the next 30 days
    const contractsExpiring = employees.filter((emp) => {
      if (!emp.contract_end_date) return false;
      try {
        const endDate = new Date(emp.contract_end_date);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return endDate <= thirtyDaysFromNow && endDate > new Date();
      } catch (error) {
        return false;
      }
    }).length;

    // Ensure all values are numbers
    return {
      total: Number(totalEmployees) || 0,
      newHire: Number(newHire) || 0,
      active: Number(activeEmployees) || 0,
      onLeave: Number(onLeave) || 0,
      contractsExpiring: Number(contractsExpiring) || 0,
    };
  }, [employees]);

  // Store previous stats when component unmounts or before refresh
  useEffect(() => {
    return () => {
      // Save current stats to localStorage before component unmounts
      localStorage.setItem("previousOverviewStats", JSON.stringify(statistics));
    };
  }, [statistics]);

  // Calculate percentage changes with number validation
  const percentageChanges = useMemo(() => {
    return {
      total: calculatePercentageChange(statistics.total, previousStats.total),
      newHire: calculatePercentageChange(
        statistics.newHire,
        previousStats.newHire
      ),
      active: calculatePercentageChange(
        statistics.active,
        previousStats.active
      ),
      contractsExpiring: calculatePercentageChange(
        statistics.contractsExpiring,
        previousStats.contractsExpiring
      ),
    };
  }, [statistics, previousStats]);

  // Format percentage for display
  const formatPercentage = useCallback((value) => {
    const numericValue = Number(value) || 0;
    if (numericValue === 0) return "0% this week";
    const direction = numericValue > 0 ? "up" : "down";
    const absValue = Math.abs(numericValue).toFixed(1);
    return `${absValue}% ${direction} this week`;
  }, []);

  // Get recent onboarding data (last 3 employees)
  const recentOnboarding = useMemo(() => {
    return employees
      .sort(
        (a, b) =>
          new Date(b.created_at || b.id) - new Date(a.created_at || a.id)
      )
      .slice(0, 3)
      .map((emp) => ({
        id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        time: emp.created_at
          ? new Date(emp.created_at).toLocaleDateString()
          : "Recent",
        status: emp.status || "in-progress",
      }));
  }, [employees]);

  // Memoized statistics cards with number validation
  const statisticsCards = useMemo(() => {
    const cards = [
      {
        title: "Total Employees",
        count: statistics.total,
        className: "total",
        percentage: percentageChanges.total,
      },
      {
        title: "New Hire",
        count: statistics.newHire,
        className: "new-hire",
        percentage: percentageChanges.newHire,
      },
      {
        title: "Active Staff/On Leave",
        count: `${statistics.active}/${statistics.onLeave}`,
        className: "active",
        percentage: percentageChanges.active,
      },
      {
        title: "Upcoming Contract Expiration",
        count: statistics.contractsExpiring,
        className: "contracts",
        percentage: percentageChanges.contractsExpiring,
      },
    ];

    return cards.map((card, idx) => {
      // Ensure count is a valid number for AnimatedCounter
      const validCount = Number(card.count) || 0;

      return (
        <div
          key={idx}
          className={`employees-list-statistics-card ${card.className}`}
        >
          <h3 className="employees-list-statistics-title">{card.title}</h3>
          <p className="employees-list-statistics-count">
            {card.title === "Active Staff/On Leave" ? (
              // For the combined display, don't use AnimatedCounter
              `${statistics.active}/${statistics.onLeave}`
            ) : (
              // For single numbers, use AnimatedCounter
              <AnimatedCounter value={validCount} />
            )}
          </p>
          <div
            className={`employees-list-statistics-percentage ${
              card.percentage > 0
                ? "positive"
                : card.percentage < 0
                ? "negative"
                : "neutral"
            }`}
          >
            <span>
              {card.percentage > 0 ? "▲" : card.percentage < 0 ? "▼" : ""}
            </span>
            <span>{formatPercentage(card.percentage)}</span>
          </div>
        </div>
      );
    });
  }, [statistics, percentageChanges, formatPercentage]);

  return (
    <div className="overview-container">
      <header className="overview-header">
        <h2>Welcome Back, {user?.first_name}!</h2>
        <input
          type="text"
          className="search-bar"
          placeholder="Search employee, request"
        />
      </header>

      <div className="employees-list-statistics-cards-container">
        {statisticsCards}
      </div>

      <div className="overview-sections">
        {/* Recent Onboarding */}
        <div className="overview-card">
          <div className="overview-card-header">
            <h3>Recent Onboarding</h3>
            <Link to={`/company/hr/onboarding`}>See All</Link>
          </div>
          <ul className="onboarding-list">
            {recentOnboarding.map((employee) => (
              <li key={employee.id}>
                <div>
                  <p className="name">{employee.name}</p>
                  <p className="time">{employee.time}</p>
                </div>
                <StatusBadge status={employee.status} />
              </li>
            ))}
            {recentOnboarding.length === 0 && (
              <li className="no-data">No recent onboarding data</li>
            )}
          </ul>
        </div>

        {/* Alerts & Notifications */}
        <div className="overview-card">
          <div className="overview-card-header">
            <h3>Alerts & Notifications</h3>
            <a href="#">See All</a>
          </div>
          <ul className="notifications-list">
            {statistics.contractsExpiring > 0 && (
              <li>
                ⚠ {statistics.contractsExpiring} contract(s) expiring soon
              </li>
            )}
            {statistics.onLeave > 0 && (
              <li>⚠ {statistics.onLeave} employee(s) currently on leave</li>
            )}
            {employees.filter((emp) => !emp.profile_complete).length > 0 && (
              <li>⚠ Employees pending profile completion</li>
            )}
            {/* {statistics.newHire > 0 && ( */}
            <li>⭐ {statistics.newHire} new hire(s) this week</li>
            {/* )} */}
            {statistics.contractsExpiring === 0 &&
              statistics.onLeave === 0 &&
              employees.filter((emp) => !emp.profile_complete).length === 0 && (
                <li>✅ All systems normal - no alerts</li>
              )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;

import { useState } from "react";
import "./TravelLogistics.css";
import { FiCheckCircle, FiUsers, FiXCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCounter from "../../components/AnimatedCounter";
import {
  BusIcon,
  CalendarDaysIcon,
  CarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { IconWalk } from "@tabler/icons-react";
import { parse } from "date-fns";

export default function TravelLogistics() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedDay, setSelectedDay] = useState(null);
  const [filteredVisits, setFilteredVisits] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 24)); // Nov 24, 2025

  const clientsVisits = [
    {
      id: 1,
      name: "Mrs. Betty Alen",
      date: "Nov-30-25",
      time: "8:00 AM - 9:00 AM",
      distance: "26.3 Miles",
      status: "completed",
      mode: "walking",
      days: "MON",
    },
    {
      id: 2,
      name: "Mr. John Doe",
      date: "Nov-30-25",
      time: "9:30 AM - 10:30 AM",
      distance: "18.4 Miles",
      status: "completed",
      mode: "car",
      days: "MON",
    },
    {
      id: 3,
      name: "Mrs. Alice Smith",
      date: "Nov-30-25",
      time: "8:00 AM - 9:00 AM",
      distance: "14.2 Miles",
      status: "No clock-in",
      mode: "car",
      days: "MON",
    },
    {
      id: 4,
      name: "Ms. Emma Brown",
      date: "Nov-30-25",
      time: "1:00 PM - 2:00 PM",
      distance: "10 Miles",
      status: "completed",
      mode: "walking",
      days: "MON",
    },
    {
      id: 5,
      name: "Dr. Michael Johnson",
      date: "Nov-30-25",
      time: "1:00 PM - 2:00 PM",
      distance: "19.5 Miles",
      status: "completed",
      mode: "walking",
      days: "TUE",
    },
    {
      id: 6,
      name: "Miss Sarah Wilson",
      date: "Nov-30-25",
      time: "1:00 PM - 2:00 PM",
      distance: "6.5 Miles",
      status: "No clock-in",
      mode: "car",
      days: "WED",
    },
    {
      id: 7,
      name: "Mr. David Lee",
      date: "Nov-30-25",
      time: "1:00 PM - 2:00 PM",
      distance: "9.6 Miles",
      status: "No clock-in",
      mode: "walking",
      days: "WED",
    },
    {
      id: 8,
      name: "Mrs. Jessica Davis",
      date: "Nov-30-25",
      time: "2:00 PM - 3:00 PM",
      distance: "12.7 Miles",
      status: "completed",
      mode: "car",
      days: "THU",
    },
    {
      id: 9,
      name: "Mr. Robert Martinez",
      date: "Nov-30-25",
      time: "10:00 AM - 11:00 AM",
      distance: "18 Miles",
      status: "completed",
      mode: "walking",
      days: "FRI",
    },
    {
      id: 10,
      name: "Ms. Lisa Anderson",
      date: "Nov-30-25",
      time: "3:00 PM - 4:00 PM",
      distance: "17 Miles",
      status: "No clock-in",
      mode: "car",
      days: "SAT",
    },
  ];

  const weeksToDays = [
    { days: "MON" },
    { days: "TUE" },
    { days: "WED" },
    { days: "THU" },
    { days: "FRI" },
    { days: "SAT" },
    { days: "SUN" },
  ];

  // Calculate distance based on filtered data
  const calculateDistanceCovered = (data) => {
    return data.reduce((total, visit) => {
      if (visit.status === "completed") {
        const dist = parseFloat(visit.distance);
        return total + (isNaN(dist) ? 0 : dist);
      }
      return total;
    }, 0);
  };

  // const distanceCovered = calculateDistanceCovered(clientsVisits);

  // Display data based on filter
  const displayData =
    selectedDay && filteredVisits.length > 0 ? filteredVisits : clientsVisits;

  // Calculate distance for filtered data
  const filteredDistanceCovered = parseFloat(
    calculateDistanceCovered(displayData).toFixed(2)
  );

  const statusCounts = {
    totalDistance: filteredDistanceCovered,
    completed: displayData.filter((trav) => trav.status === "completed").length,
    missed: displayData.filter((trav) => trav.status === "No clock-in").length,
  };

  const handleFilterTabClick = (filter) => {
    setActiveFilter(filter);
  };

  const handleDayFilterTabClick = (day) => {
    setSelectedDay(day);
    const filtered = clientsVisits.filter((cv) => cv.days === day);
    setFilteredVisits(filtered);
  };

  const handleShowAll = () => {
    setSelectedDay(null);
    setFilteredVisits(clientsVisits);
  };

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

  const goPrev = () =>
    setCurrentDate(
      (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7)
    );
  const goNext = () =>
    setCurrentDate(
      (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7)
    );
  const goToday = () => setCurrentDate(new Date());

  return (
    <div className="main-travel-logistics">
      <div className="header-travel-logistics">
        <h2>Travel & Logistics</h2>
      </div>

      {/* Distance Cards */}
      <div className="travel-status-cards-container">
        {/* Status Cards */}
        {[
          {
            title: "Total Distance Completed",
            count: statusCounts.totalDistance,
            className: "total-distance-completed",
            icon: <FiUsers />,
            filter: "totalDistance",
            unit: "Miles",
          },
          {
            title: "Completed Visits",
            count: statusCounts.completed,
            className: "accepted",
            icon: <FiCheckCircle />,
            filter: "completed",
            unit: "",
          },
          {
            title: "Missed Visits",
            count: statusCounts.missed,
            className: "pending",
            icon: <FiXCircle />,
            filter: "missed",
            unit: "",
          },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            className={`travel-status-card ${card.className} ${
              activeFilter === card.filter ? "active" : ""
            }`}
            onClick={() => handleFilterTabClick(card.filter)}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{ cursor: "pointer" }}
          >
            <h3 className="travel-status-card-title">{card.title}</h3>
            <p className="travel-status-card-count">
              {typeof card.count === "number" && card.unit ? (
                <>
                  <span className="unit-label">
                    {" "}
                    {card.count.toFixed(1)} {card.unit}
                  </span>
                </>
              ) : (
                <AnimatedCounter value={card.count} />
              )}
            </p>
            <div className="travel-status-card-icon">{card.icon}</div>
          </motion.div>
        ))}
      </div>

      <div className="travel-date-header">
        <div className="travel-header-left">
          <button className="travel-today-btn" onClick={goToday}>
            <CalendarDaysIcon className="w-4 h-4" />
            Today
          </button>
          <div className="prev-button" onClick={goPrev}>
            <ChevronLeftIcon className="w-4 h-4" />
          </div>
          <button className="nxt-button" onClick={goNext}>
            <ChevronRightIcon className="w-4 h-4" />
          </button>
          <span className="travel-date-range">{formatDateRange()}</span>
        </div>

        <div className="travel-header-right">
          <div className="view-toggle">
            <button className="view-btn active">Weekly</button>
            {/* <button className="view-btn">Monthly</button> */}
          </div>
        </div>
      </div>

      {/* Week Days Filter */}
      <div className="week-days-container">
        <button
          className={`show-all-btn ${selectedDay === null ? "active" : ""}`}
          onClick={handleShowAll}
        >
          All Days
        </button>
        <div className="week-days">
          {weeksToDays.map((day) => (
            <button
              key={day.days}
              className={`day-btn ${selectedDay === day.days ? "active" : ""}`}
              onClick={() => handleDayFilterTabClick(day.days)}
            >
              {day.days}
            </button>
          ))}
        </div>
      </div>

      {/* Display Active Filter Info */}
      {selectedDay && (
        <div className="filter-info">
          <p>
            Showing visits for <strong>{selectedDay}</strong> (
            {displayData.length} visit{displayData.length !== 1 ? "s" : ""})
          </p>
        </div>
      )}

      {/* Travel Logistics Grid */}
      <div className="travel-logistics-content">
        <div className="travel-logistics-grid">
          <AnimatePresence>
            {displayData.map((cv, idx) => (
              <motion.div
                key={cv.id}
                className={`travel-logistics-items ${
                  cv.status === "completed"
                    ? "travel-status-item-completed"
                    : "travel-status-item-missed"
                }`}
                whileHover={{
                  boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div className="travel-item-content">
                  <div className="travel-info-header">
                    <p className="travel-client-name">{cv.name}</p>
                    <p className="travel-client-date">{cv.date}</p>
                    <p className="travel-client-desc">{cv.time}</p>
                  </div>

                  {cv.status === "completed" ? (
                    <div className="travel-specs">
                      <div className="travel-mode">
                        {cv.mode === "car" ? (
                          <CarIcon size={16} />
                        ) : cv.mode === "bus" ? (
                          <BusIcon size={16} />
                        ) : (
                          <IconWalk size={16} />
                        )}
                        <p className="travel-client-desc">{cv.mode}</p>
                      </div>
                      <p className="travel-client-desc">{cv.distance}</p>
                    </div>
                  ) : (
                    ""
                  )}
                </div>

                <div
                  className={`travel-status ${
                    cv.status === "completed"
                      ? "travel-status-completed"
                      : "travel-status-missed"
                  }`}
                >
                  {cv.status === "completed" ? (
                    <FiCheckCircle className="travel-status-icon" />
                  ) : (
                    <FiXCircle className="travel-status-icon" />
                  )}
                  <p>{cv.status}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {displayData.length === 0 && (
          <div className="no-data-message">
            <p>No visits found for {selectedDay}</p>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDaysIcon,
  PencilIcon,
  UsersIcon,
  CheckCircleIcon,
  UserIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { apiClient } from '../../../../config';
import '../../../../components/SkeletonLoader.jsx';
import { fetchBulkUserDetails } from '../config/apiConfig';

import { IconWalk, IconBus, IconCar, IconCaretDown } from "@tabler/icons-react";
import CalendarDropdown from "../../../../components/CalendarDropdown/CalendarDropdown";

const OverviewVisits = ({ visits = [], allVisits = [], carerProfiles = {}, selectedDate, onDateChange, isLoading = false }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  const handleToggleCalendar = () => setShowCalendar((s) => !s);

  const handleDateSelect = (date) => {
    onDateChange(date);
    setShowCalendar(false);
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    }

    function handleKey(e) {
      if (e.key === "Escape") setShowCalendar(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  // Helper functions
  const getVisitStatus = (status) => {
    const statusMap = {
      SCHEDULED: { label: "Pending", class: "pending" },
      ASSIGNED: { label: "Pending", class: "pending" },
      IN_PROGRESS: { label: "In Progress", class: "in-progress" },
      COMPLETED: { label: "Completed", class: "completed" },
      CANCELLED: { label: "Cancelled", class: "cancelled" },
      NO_SHOW: { label: "No Show", class: "no-show" },
    };
    return statusMap[status] || { label: "Unknown", class: "unknown" };
  };

  const getCareTypeDisplay = (careType) => {
    return (
      careType
        ?.replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase()) || "Visit"
    );
  };

  const getCarerInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase();
  };

  const calculateProgress = (visit) => {
    const totalTasks = visit.tasks?.length || 0;
    if (totalTasks === 0) return 0;
    const completedTasks =
      visit.tasks?.filter((task) => task.status === "COMPLETED").length || 0;
    return Math.round((completedTasks / totalTasks) * 100);
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "Never";
    const now = new Date();
    const updated = new Date(dateString);
    const diffMs = now - updated;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}hr ${diffMins % 60}min ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };
  // Small tooltip wrapper used for count badges
  const BadgeWithTooltip = ({ type = "single", count = 1, children }) => {
    const [hover, setHover] = useState(false);
    const header =
      type === "single" ? "Single handed call" : "Double handed call";
    const body =
      type === "single"
        ? "This client has a carer allocated for visit."
        : "This client has two (2) carers allocated for visit.";

    // Choose an icon based on type
    const TooltipIcon =
      type === "single" ? (
        <UserIcon className="w-5 h-5 text-blue-500" />
      ) : (
        <UsersIcon className="w-5 h-5 text-purple-500" />
      );

    return (
      <div
        style={{ position: "relative", display: "inline-block" }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <span>
          {children} {count}
        </span>

        <AnimatePresence>
          {hover && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.12 }}
              className="RRsyts-tooltip-root"
            >
              <span>{TooltipIcon}</span>
              <h4>{header}</h4>
              <h6>{body}</h6>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const TransportTooltip = ({
    type = "walk",
    distance = "1km",
    name = "The carer",
  }) => {
    const [hover, setHover] = useState(false);

    // icon + text content
    const transportInfo = {
      walk: {
        icon: <IconWalk className="w-5 h-5 text-green-600" />,
        header: "Walking",
        body: `${name} walks ${distance} to the client’s place.`,
      },
      car: {
        icon: <IconCar className="w-5 h-5 text-blue-600" />,
        header: "Private Car",
        body: `${name} drives a private car for ${distance} to the client’s place.`,
      },
      bus: {
        icon: <IconBus className="w-5 h-5 text-yellow-600" />,
        header: "Public Transportation",
        body: `${name} uses public transportation to travel ${distance} to the client’s place.`,
      },
    };

    const { icon, header, body } = transportInfo[type] || transportInfo.walk;

    return (
      <div
        style={{ position: "relative", display: "inline-block" }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {/* Main icon section */}
        <span className="inline-flex items-center gap-1 cursor-pointer">
          {icon} <ArrowsRightLeftIcon className="w-4 h-4" /> {distance}
        </span>

        {/* Tooltip */}
        <AnimatePresence>
          {hover && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="RRsyts-tooltip-root"
            >
              <div className="flex items-center gap-2 mb-1">
                <span>{icon}</span>
                <h4>{header}</h4>
              </div>
              <h6>{body}</h6>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="OverviewVisits">
      <div className="OverviewVisits-Top">
        <div className="OverviewVisits-Top-1">
          <h3>
            <CalendarDaysIcon /> Visits
          </h3>
          <div style={{ position: "relative", display: "inline-block" }}>
            <button
              onClick={handleToggleCalendar}
              aria-label="Open visits date"
            >
              {selectedDate.toLocaleDateString("en-GB", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
              <IconCaretDown stroke={0} fill="currentColor" />
            </button>

            {showCalendar && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  zIndex: 100,
                }}
                ref={calendarRef}
              >
                <CalendarDropdown
                  selectedDate={selectedDate}
                  onSelect={handleDateSelect}
                  onClose={() => setShowCalendar(false)}
                />
              </div>
            )}
          </div>
        </div>
        <div className="OverviewVisits-Top-2">
          <Link to="visits">Seel all</Link>
        </div>
      </div>

      <div className="Rost-Gen-Table-Sec">
        <table>
          <thead>
            <tr>
              <th>
                <i className="table-Indis"></i>
              </th>
              <th>
                <span>
                  <PencilIcon /> Client Name
                </span>
              </th>
              <th>
                <span>
                  <UsersIcon /> Assign
                </span>
              </th>
              <th>
                <span>
                  <CheckCircleIcon /> Status
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Skeleton loader rows
              [...Array(3)].map((_, index) => (
                <tr key={index}>
                  <td>
                    <i className="table-Indis"></i>
                  </td>
                  <td>
                    <div className="HGh-Tabl-Gbs">
                      <div className="HGh-Tabl-Gbs-Tit">
                        <div className="skeleton" style={{width: '150px', height: '16px', borderRadius: '4px'}}></div>
                      </div>
                      <div className="HGh-Tabl-Gbs-Badgs">
                        <div className="skeleton" style={{width: '100px', height: '14px', borderRadius: '4px', marginTop: '8px'}}></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="HGh-Tabl-Gbs">
                      <div className="HGh-Tabl-Gbs-Tit">
                        <div className="skeleton" style={{width: '120px', height: '16px', borderRadius: '4px'}}></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="Prog-Ok">
                      <div className="Prog-Ok-PPLa">
                        <div className="skeleton" style={{width: '80px', height: '14px', borderRadius: '4px'}}></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : visits.length > 0 ? (
              visits.map((visit, index) => {
                const assignees = visit.assignees || [];
                const assigneeCount = assignees.length;
                const status = getVisitStatus(visit.status);
                const progress = calculateProgress(visit);
                const isDoubleHanded = assigneeCount > 1;

                return (
                  <tr key={visit.id || index}>
                    <td>
                      <i className="table-Indis"></i>
                    </td>

                    {/* Client Name */}
                    <td>
                      <div className="HGh-Tabl-Gbs">
                        <div className="HGh-Tabl-Gbs-Tit">
                          <p>{visit.client_name || 'Unknown Client'}</p>
                        </div>
                        <div className="HGh-Tabl-Gbs-Badgs">
                          <span className="text-gray-600 text-sm">
                            {getCareTypeDisplay(visit.careType)}
                          </span>
                          {assigneeCount > 0 && (
                            <>
                              {" • "}
                              <BadgeWithTooltip
                                type={isDoubleHanded ? "double" : "single"}
                                count={assigneeCount}
                              >
                                {isDoubleHanded ? <UsersIcon /> : <UserIcon />}
                              </BadgeWithTooltip>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Assignees */}
                    <td>
                      {assigneeCount === 0 ? (
                        <div className="HGh-Tabl-Gbs">
                          <div className="HGh-Tabl-Gbs-Tit">
                            <p className="text-gray-500">No assigned carers</p>
                          </div>
                        </div>
                      ) : assigneeCount === 1 ? (
                        // Single assignee
                        (() => {
                          const assignee = assignees[0];
                          const carerId =
                            assignee.carerId ||
                            assignee.id ||
                            assignee.employeeId;
                          const profile = carerProfiles[carerId];
                          const firstName = profile?.first_name || "";
                          const lastName = profile?.last_name || "";
                          const fullName =
                            `${firstName} ${lastName}`.trim() ||
                            "Unknown Carer";
                          const isDriver = profile?.profile?.is_driver;
                          const transportType = isDriver ? "car" : "walk";
                          const distance = assignee.distance || "N/A";

                          return (
                            <div className="HGh-Tabl-Gbs">
                              <div className="HGh-Tabl-Gbs-Tit">
                                <h3>
                                  {profile?.profile?.profile_image_url ? (
                                    <img
                                      src={profile.profile.profile_image_url}
                                      alt={fullName}
                                    />
                                  ) : (
                                    <b>
                                      {getCarerInitials(firstName, lastName)}
                                    </b>
                                  )}
                                  <span className="Cree-Name">
                                    <span>{fullName}</span>
                                  </span>
                                </h3>
                              </div>
                              <div className="HGh-Tabl-Gbs-Badgs">
                                <TransportTooltip
                                  type={transportType}
                                  distance={distance}
                                  name={fullName}
                                />
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        // Multiple assignees
                        <div className="Double-Part">
                          {assignees.slice(0, 2).map((assignee, idx) => {
                            const carerId =
                              assignee.carerId ||
                              assignee.id ||
                              assignee.employeeId;
                            const profile = carerProfiles[carerId];
                            const firstName = profile?.first_name || "";
                            const lastName = profile?.last_name || "";
                            const fullName =
                              `${firstName} ${lastName}`.trim() ||
                              "Unknown Carer";
                            const isDriver = profile?.profile?.is_driver;
                            const transportType = isDriver ? "car" : "walk";
                            const distance = assignee.distance || "N/A";

                            return (
                              <div
                                key={carerId || idx}
                                className="assignee-item"
                              >
                                <div className="HGh-Tabl-Gbs">
                                  <div className="HGh-Tabl-Gbs-Tit">
                                    <h3>
                                      <div className="BBGb-Stha">
                                        {profile?.profile?.profile_image_url ? (
                                          <img
                                            src={
                                              profile.profile.profile_image_url
                                            }
                                            alt={fullName}
                                          />
                                        ) : (
                                          <b>
                                            {getCarerInitials(
                                              firstName,
                                              lastName
                                            )}
                                          </b>
                                        )}
                                      </div>
                                      <span className="Cree-Name">
                                        <span>{fullName}</span>
                                      </span>
                                    </h3>
                                  </div>
                                  <div className="HGh-Tabl-Gbs-Badgs">
                                    <TransportTooltip
                                      type={transportType}
                                      distance={distance}
                                      name={fullName}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          {assignees.length > 2 && (
                            <div className="additional-assignees">
                              <div className="BBGb-Stha">
                                <b>+{assignees.length - 2}</b>
                              </div>
                              <div className="HGh-Tabl-Gbs">
                                <div className="HGh-Tabl-Gbs-Tit">
                                  <p>More carers...</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td>
                      <div className="Prog-Ok">
                        <div className="Prog-Ok-PPLa">
                          <span className={`vist-pro-status ${status.class}`}>
                            {status.label}
                          </span>
                          <h4>{progress} / 100 (%)</h4>
                        </div>
                        <p>
                          Updated: <span>{getTimeAgo(visit.updatedAt)}</span>
                        </p>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={4}
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  No visits scheduled for this date
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OverviewVisits;

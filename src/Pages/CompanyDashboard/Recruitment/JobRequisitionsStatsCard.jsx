import React from "react";
import {
  ClipboardDocumentListIcon,
  FolderOpenIcon,
  ClockIcon,
  LockClosedIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import CountUp from "react-countup";
import PropTypes from "prop-types";

const JobRequisitionStatsCards = ({
  stats,
  lastUpdateTime,
  lastUpdatedDate,
  formatTime,
  formatDate,
}) => {
  const cards = [
    {
      icon: ClipboardDocumentListIcon,
      label: "Total Job Requisitions",
      value: stats.total,
    },
    {
      icon: FolderOpenIcon,
      label: "Accepted Requisitions",
      value: stats.accepted,
    },
    {
      icon: ClockIcon,
      label: "Pending Approvals",
      value: stats.pending,
    },
    {
      icon: LockClosedIcon,
      label: "Rejected Requisitions",
      value: stats.rejected,
    },
  ];

  return (
    <div className="glo-Top-Cards">
      {cards.map((item, idx) => (
        <div key={idx} className={`glo-Top-Card card-${idx + 1} Gen-Boxshadow`}>
          <div className="ffl-TOp">
            <span>
              <item.icon className="w-6 h-6" />
            </span>
            <p>{item.label}</p>
          </div>
          <h3>
            <ArrowTrendingUpIcon className="w-5 h-5" />
            <CountUp end={item.value} duration={2} />
            <span className="ai-check-span">
              Last checked - {formatTime(lastUpdateTime)}
            </span>
          </h3>
          <h5>
            Last Update{" "}
            <span>{lastUpdatedDate ? formatDate(lastUpdatedDate) : "N/A"}</span>
          </h5>
        </div>
      ))}
    </div>
  );
};

export default JobRequisitionStatsCards;

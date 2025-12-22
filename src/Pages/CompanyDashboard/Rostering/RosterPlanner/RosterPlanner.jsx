import { NavLink } from "react-router-dom";
import { ChevronRightIcon as ChevronRightOutline } from "@heroicons/react/24/outline";
import "./RosterPlanner.css";
const RosterPlanner = () => {
  return (
    <div className="RosterPlanner page-container">
      <div className="page-header">
        <div className="GGH-TOP-1">
          <h2>Roster Planner</h2>
        </div>
        <p className="page-subtitle">Select an option to get started</p>
      </div>
      <div className="options-grid">
        <NavLink to="cluster" className="option-card">
          <div className="option-content">
            <div className="option-text">
              <h2>Cluster</h2>
              <p>Manage cluster configurations and groupings</p>
            </div>
            <ChevronRightOutline className="chevron-icon" />
          </div>
        </NavLink>
        <NavLink to="settings" className="option-card">
          <div className="option-content">
            <div className="option-text">
              <h2>Rostering Settings</h2>
              <p>Configure rostering rules and preferences</p>
            </div>
            <ChevronRightOutline className="chevron-icon" />
          </div>
        </NavLink>
      </div>
    </div>
  );
};
export default RosterPlanner;

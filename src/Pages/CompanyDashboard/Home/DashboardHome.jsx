import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import SideNavBar from "./SideNavBar";
import Home from "./Home";
import About from "./About";
import OnboardingDocuments from "../OnboardingDocuments/OnboardingDocuments";
import ClientCreation from "./ClientPage/ClientCreation/ClientCreation";
import EmailSettings from "../Recruitment/EmailSettings";
import "./DashboardHome.css";
import Calendar from "../Calendar/Calendar";


const DashboardHome = () => {
  const [shrinkNav, setShrinkNav] = useState(false);

  return (
    <div className={`DB-Envt ${shrinkNav ? "ShrinkNav" : ""}`}>
      <SideNavBar setShrinkNav={setShrinkNav} />
      <div className="Main-DB-Envt">
        <div className="DB-Envt-Container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/onboarding-documents"
              element={<OnboardingDocuments />}
            />
            <Route path="/client-creation" element={<ClientCreation />} />
            <Route
              path="/settings/email-configurations"
              element={<EmailSettings />}
            />
            <Route path="/calendar" element={<Calendar />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// import Home from './Home';

// // Import each card page component
// import TotalTasksToday from './pages/TotalTasksToday';
// import CompletedTasks from './pages/CompletedTasks';
// import PendingTasks from './pages/PendingTasks';
// import ProjectProgress from './pages/ProjectProgress';

// import DailyIncome from './pages/DailyIncome';
// import ExpensesToday from './pages/ExpensesToday';
// import OutstandingPayments from './pages/OutstandingPayments';
// import BudgetUtilization from './pages/BudgetUtilization';

// import ActiveEmployeesToday from './pages/ActiveEmployeesToday';
// import ActiveTasksInProgress from './pages/ActiveTasksInProgress';
// import TasksCompletedToday from './pages/TasksCompletedToday';
// import Productivity from './pages/Productivity';

// import NewServiceRequests from './pages/NewServiceRequests';
// import ResolvedToday from './pages/ResolvedToday';
// import EscalatedIssues from './pages/EscalatedIssues';
// import CustomerSatisfaction from './pages/CustomerSatisfaction';

// const App = () => (
//   <Router>
//     <Routes>
//       <Route path="/" element={<Navigate to="/dashboard" replace />} />
//       <Route path="/dashboard" element={<Home />} />

//       {/* Operations */}
//       <Route path="/company/total-tasks-today" element={<TotalTasksToday />} />
//       <Route path="/company/completed-tasks" element={<CompletedTasks />} />
//       <Route path="/company/pending-tasks" element={<PendingTasks />} />
//       <Route path="/company/project-progress" element={<ProjectProgress />} />

//       {/* Finance */}
//       <Route path="/company/daily-income" element={<DailyIncome />} />
//       <Route path="/company/expenses-today" element={<ExpensesToday />} />
//       <Route path="/company/outstanding-payments" element={<OutstandingPayments />} />
//       <Route path="/company/budget-utilization" element={<BudgetUtilization />} />

//       {/* Workforce */}
//       <Route path="/company/active-employees-today" element={<ActiveEmployeesToday />} />
//       <Route path="/company/active-tasks-in-progress" element={<ActiveTasksInProgress />} />
//       <Route path="/company/tasks-completed-today" element={<TasksCompletedToday />} />
//       <Route path="/company/productivity" element={<Productivity />} />

//       {/* Service/Request */}
//       <Route path="/company/new-service-requests" element={<NewServiceRequests />} />
//       <Route path="/company/resolved-today" element={<ResolvedToday />} />
//       <Route path="/company/escalated-issues" element={<EscalatedIssues />} />
//       <Route path="/company/customer-satisfaction" element={<CustomerSatisfaction />} />
//     </Routes>
//   </Router>
// );

// export default App;

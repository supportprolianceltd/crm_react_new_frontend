import { useState, useEffect, useMemo } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "./Recruitment.css";
import SideNavBar from "./SideNavBar";
import RecruitmentHome from "./RecruitmentHome";
import JobAdverts from "./JobAdverts";
import Applications from "./Applications";
import ViewApplications from "./ViewApplications";
import Schedule from "./Schedule";
import ScheduleList from "./ScheduleList";
import InterviewDetailsPage from "../InterviewDetailsPage";
import EmploymentDecisionPage from "./EmploymentDecisionPage";
import APISettings from "./APISettings";
import EmailSettings from "./EmailSettings";
import RecycleBin from "./RecycleBin";
import NotificationSettings from "./NotificationSettings";
import UpcomingInterviewReminder from "./UpcomingInterviewReminder";
import UpdateCompanyProfile from "./UpdateCompanyProfile";
import { fetchSchedules } from "./ApiService";
import NewStaffComplianceCheckPage from "../Compliance/pages/NewStaffComplianceCheckPage";
import ExistingStaffComplianceCheckPage from "../Compliance/pages/ExistingStaffComplianceCheckPage";
import StaffDetailsComplianceCheckPage from "../Compliance/pages/StaffDetailsComplianceCheckPage";
import ExistingStaffDetailsComplianceCheckPage from "../Compliance/pages/ExistingStaffDetailsComplianceCheckPage";

const Recruitment = () => {
  const navigate = useNavigate();
  const user = useMemo(() => JSON.parse(localStorage.getItem("user")), []);

  // Redirect to staff dashboard if user does not have access
  useEffect(() => {
    if (!user?.profile?.system_access_recruitment) {
      navigate("/staff", { replace: true });
    }
  }, [user, navigate]);

  if (!user?.profile?.system_access_recruitment) {
    navigate("/staff", { replace: true });

    return null; // Prevents rendering sub-routes/content
  }

  const [shrinkNav, setShrinkNav] = useState(false);
  const [currentInterview, setCurrentInterview] = useState(null);
  const location = useLocation();

  // Check if the current route is for interview details
  const isInterviewDetailsPage =
    location.pathname.includes("/interview-details");

  // useEffect(() => {
  //   const fetchUpcoming = async () => {
  //     try {
  //       const scheduleData = await fetchSchedules({});

  //       const now = new Date();

  //       // Filter interviews: only ones within the next 5 min or already started (within 30 min)
  //       const activeInterviews = scheduleData?.results?.filter((item) => {
  //         const start = new Date(item.interview_start_date_time);
  //         const end = new Date(start.getTime() + 30 * 60 * 1000);
  //         return now >= new Date(start.getTime() - 5 * 60 * 1000) && now <= end;
  //       });

  //       if (activeInterviews.length > 0) {
  //         // Always show the one with the nearest start time
  //         const nearest = activeInterviews.sort(
  //           (a, b) =>
  //             new Date(a.interview_start_date_time) -
  //             new Date(b.interview_start_date_time)
  //         )[0];

  //         setCurrentInterview((prev) =>
  //           !prev || prev.id !== nearest.id ? nearest : prev
  //         );
  //       } else {
  //         setCurrentInterview(null);
  //       }
  //     } catch (err) {
  //       console.error("Error fetching interviews:", err);
  //     }
  //   };

  //   fetchUpcoming();
  //   const interval = setInterval(fetchUpcoming, 10000); // check every 10s
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <div className={`DB-Envt ${shrinkNav ? "ShrinkNav" : ""}`}>
      {!isInterviewDetailsPage && <SideNavBar setShrinkNav={setShrinkNav} />}
      <div
        className={isInterviewDetailsPage ? "FullScreen-Envt" : "Main-DB-Envt"}
      >
        <div className="DB-Envt-Container">
          {/* {currentInterview && !isInterviewDetailsPage && (
            <UpcomingInterviewReminder
              interview={currentInterview}
              onEnd={() => setCurrentInterview(null)}
            />
          )} */}

          <Routes>
            <Route path="/" element={<RecruitmentHome />} />
            <Route path="/job-adverts" element={<JobAdverts />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/view-applications" element={<ViewApplications />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/schedule-list" element={<ScheduleList />} />
            <Route
              path="/interview-details/:room/:jwt"
              element={<InterviewDetailsPage />}
            />
            <Route
              path="/employment-decision"
              element={<EmploymentDecisionPage />}
            />
            <Route
              path="/compliance/new-staff"
              element={<NewStaffComplianceCheckPage />}
            />
            <Route
              path="/compliance/existing-staff"
              element={<ExistingStaffComplianceCheckPage />}
            />
            <Route
              path="/compliance/new-staff/:applicantId"
              element={<StaffDetailsComplianceCheckPage />}
            />
            <Route
              path="/compliance/existing-staff/:employeeId"
              element={<ExistingStaffDetailsComplianceCheckPage />}
            />
            <Route path="/settings/api-settings" element={<APISettings />} />
            <Route
              path="/settings/email-configuration"
              element={<EmailSettings />}
            />
            <Route path="/settings/recycle-bin" element={<RecycleBin />} />
            <Route
              path="/settings/notification-settings"
              element={<NotificationSettings />}
            />
            <Route
              path="/settings/update-company-profile"
              element={<UpdateCompanyProfile />}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Recruitment;

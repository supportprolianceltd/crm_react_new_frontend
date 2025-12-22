import React, { useState, useEffect } from "react";
import {
  IconHeartHandshake, // Care Type
  IconUser, // Carer / People
  IconCalendarEvent, // Dates
  IconStethoscope, // Medical condition
  IconAlertTriangle, // Allergies / Warning
  IconActivity, // Risk level
  IconClock, // Daily routine
  IconRosette, // Religious preferences
  IconGenderMale, // Sexuality
} from "@tabler/icons-react";

import RecentActivities from "./RecentActivities";
import { fetchClientVisits, fetchCarePlanByClient, fetchCarePlanCarers } from "../../../config/apiConfig";
import "../../../../../../components/SkeletonLoader.jsx";

// Reusable Stat Card Component
const StatCard = ({ label, value, isLoading }) => (
  <li>
    <a href="#">
      {isLoading ? (
        <>
          <p>
            <span className="skeleton" style={{width: '100px', height: '16px', borderRadius: '4px', display: 'inline-block'}}></span>
          </p>
          <h3>
            <span className="skeleton" style={{width: '60px', height: '28px', borderRadius: '4px', marginTop: '8px'}}></span>
          </h3>
        </>
      ) : (
        <>
          <p>{label}</p>
          <h3>{value}</h3>
        </>
      )}
    </a>
  </li>
);

const Home = ({ clientData }) => {
  const statusClass =
    clientData?.status?.toLowerCase().replace(/\s+/g, "-") || "active";

  const [stats, setStats] = useState({
    totalVisits: 0,
    tasksCompleted: 0,
    completedVisits: 0,
    totalTasks: 0,
  });
  const [carePlan, setCarePlan] = useState(null);
  const [totalCarers, setTotalCarers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!clientData?.id) return;

      try {
        setLoading(true);
        
        // Fetch care plan
        const carePlanData = await fetchCarePlanByClient(clientData.id);
        
        // Store care plan data (it's an array, get first item)
        if (carePlanData && carePlanData.length > 0) {
          setCarePlan(carePlanData[0]);
        }
        
        // Fetch carers assigned to client
        const carersData = await fetchCarePlanCarers(clientData.id);
        if (carersData?.totalCarers) {
          setTotalCarers(carersData.totalCarers);
        }
        
        const visitsData = await fetchClientVisits(clientData.id);
        
        if (visitsData?.items) {
          const totalVisits = visitsData.total || 0;
          
          // Count completed tasks and total tasks across all visits
          let completedTasksCount = 0;
          let totalTasksCount = 0;
          // Count completed visits (visits with clockInAt and clockOutAt)
          let completedVisitsCount = 0;
          
          visitsData.items.forEach(visit => {
            if (visit.tasks && Array.isArray(visit.tasks)) {
              totalTasksCount += visit.tasks.length;
              completedTasksCount += visit.tasks.filter(
                task => task.status === "COMPLETED"
              ).length;
            }
            
            // A visit is completed if both clockInAt and clockOutAt exist
            if (visit.clockInAt && visit.clockOutAt) {
              completedVisitsCount++;
            }
          });

          setStats({
            totalVisits,
            tasksCompleted: completedTasksCount,
            completedVisits: completedVisitsCount,
            totalTasks: totalTasksCount,
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [clientData?.id]);

  return (
    <div className="Prof-Home-Sec">
      <div className="Prof-HS-Top">
        <div className="Prof-HS-Top-1">
          <div className="Prof-HS-Top-1-Main">
            {clientData?.profilePicture ? (
              <img src={clientData.profilePicture} />
            ) : (
              <b>{clientData?.initials}</b>
            )}
          </div>
        </div>
        <div className="Prof-HS-Top-2">
          <div>
            <h3>
              {clientData?.firstName}&nbsp;
              {clientData?.lastName}&nbsp;
              <span className={`status ${statusClass}`}>
                {clientData?.status || "Active"}
              </span>
            </h3>
            <p>Currently under 24/7 Care Plan</p>
            <ul>
              <li>ID: {clientData?.client_id || "67543"}</li>
              <li>{clientData?.contactNumber}</li>
              <li>{clientData?.email}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="GGH-Sub">
        <ul>
          <StatCard 
            label="Total Visit" 
            value={stats.totalVisits} 
            isLoading={loading} 
          />
          <StatCard 
            label="Task Completed" 
            value={stats.tasksCompleted} 
            isLoading={loading} 
          />
          <StatCard 
            label="Completed Visits" 
            value={stats.completedVisits} 
            isLoading={loading} 
          />
          <StatCard 
            label="Total Tasks" 
            value={stats.totalTasks} 
            isLoading={loading} 
          />
        </ul>
      </div>

      <div className="CCargs-JHH-Seccs">
        {/* Care Summary */}
        <div className="CCargs-JHH-Card">
          <div className="CCargs-JHH-Card-Top">
            <h3>Care Summary</h3>
          </div>
          <div className="CCargs-JHH-Card-Main">
            {loading ? (
              <>
                {[...Array(3)].map((_, index) => (
                  <div className="CCargs-JHH-Card-Part" key={index}>
                    <span>
                      <div className="skeleton" style={{width: '24px', height: '24px', borderRadius: '50%'}}></div>
                    </span>
                    <div>
                      <h5><div className="skeleton" style={{width: '100px', height: '14px', borderRadius: '4px', marginBottom: '8px'}}></div></h5>
                      <div className="skeleton" style={{width: '140px', height: '16px', borderRadius: '4px'}}></div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="CCargs-JHH-Card-Part">
                  <span>
                    <IconHeartHandshake stroke={1.5} />
                  </span>
                  <div>
                    <h5>Care Type</h5>
                    <p>{carePlan?.careRequirements?.careType?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) || "N/A"}</p>
                  </div>
                </div>

                <div className="CCargs-JHH-Card-Part">
                  <span>
                    <IconUser stroke={1.5} />
                  </span>
                  <div>
                    <h5>Assigned Carer(s)</h5>
                    <p>{totalCarers} {totalCarers === 1 ? 'Carer' : 'Carers'}</p>
                  </div>
                </div>

                <div className="CCargs-JHH-Card-Part">
                  <span>
                    <IconCalendarEvent stroke={1.5} />
                  </span>
                  <div>
                    <h5>Start of Care</h5>
                    <p>
                      {carePlan?.careRequirements?.contractStart 
                        ? new Date(carePlan.careRequirements.contractStart).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Health & Medical */}
        <div className="CCargs-JHH-Card">
          <div className="CCargs-JHH-Card-Top">
            <h3>Health & Medical</h3>
          </div>
          <div className="CCargs-JHH-Card-Main">
            {loading ? (
              <>
                {[...Array(3)].map((_, index) => (
                  <div className="CCargs-JHH-Card-Part" key={index}>
                    <span>
                      <div className="skeleton" style={{width: '24px', height: '24px', borderRadius: '50%'}}></div>
                    </span>
                    <div>
                      <h5><div className="skeleton" style={{width: '120px', height: '14px', borderRadius: '4px', marginBottom: '8px'}}></div></h5>
                      <div className="skeleton" style={{width: '100px', height: '16px', borderRadius: '4px'}}></div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="CCargs-JHH-Card-Part">
                  <span>
                    <IconStethoscope stroke={1.5} />
                  </span>
                  <div>
                    <h5>Key Medical Condition</h5>
                    <p>{carePlan?.medicalInfo?.primaryDiagnosis || "None"}</p>
                  </div>
                </div>

                <div className="CCargs-JHH-Card-Part">
                  <span>
                    <IconAlertTriangle stroke={1.5} />
                  </span>
                  <div>
                    <h5>Allergies</h5>
                    <p>
                      {carePlan?.medicalInfo?.clientAllergies?.length > 0
                        ? carePlan.medicalInfo.clientAllergies.join(', ')
                        : "None"}
                    </p>
                  </div>
                </div>

                <div className="CCargs-JHH-Card-Part">
                  <span>
                    <IconActivity stroke={1.5} />
                  </span>
                  <div>
                    <h5>Risk Level</h5>
                    <p>
                      {clientData?.risk
                        ? clientData.risk.charAt(0).toUpperCase() +
                          clientData.risk.slice(1)
                        : "High"}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Routine & Preferences */}
        <div className="CCargs-JHH-Card">
          <div className="CCargs-JHH-Card-Top">
            <h3>Routine & Preferences</h3>
          </div>
          <div className="CCargs-JHH-Card-Main">
            {loading ? (
              <>
                {[...Array(3)].map((_, index) => (
                  <div className="CCargs-JHH-Card-Part" key={index}>
                    <span>
                      <div className="skeleton" style={{width: '24px', height: '24px', borderRadius: '50%'}}></div>
                    </span>
                    <div>
                      <h5><div className="skeleton" style={{width: '110px', height: '14px', borderRadius: '4px', marginBottom: '8px'}}></div></h5>
                      <div className="skeleton" style={{width: '130px', height: '16px', borderRadius: '4px'}}></div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="CCargs-JHH-Card-Part">
                  <span>
                    <IconClock stroke={1.5} />
                  </span>
                  <div>
                    <h5>Daily Routine</h5>
                    <p>{carePlan?.routine?.dailyRoutine || "No routine specified"}</p>
                  </div>
                </div>

                <div className="CCargs-JHH-Card-Part">
                  <span>
                    <IconRosette stroke={1.5} />
                  </span>
                  <div>
                    <h5>Religious Preferences</h5>
                    <p>{carePlan?.cultureValues?.religiousBackground || "Not specified"}</p>
                  </div>
                </div>

                <div className="CCargs-JHH-Card-Part">
                  <span>
                    <IconGenderMale stroke={1.5} />
                  </span>
                  <div>
                    <h5>Gender Identity</h5>
                    <p>{clientData?.genderIdentity || "N/A"}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <RecentActivities />
    </div>
  );
};

export default Home;

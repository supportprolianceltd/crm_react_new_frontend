import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Clients.css";
import {
  PlusIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import {
  IconCircleCheck,
  IconClockPause,
  IconCircleX,
  IconCaretDown,
  IconUserHeart,
} from "@tabler/icons-react";
import { fetchEmployeesForRostering } from "./config/apiConfig";
import LoadingState from "../../../../components/LoadingState";
import "./styles/style.css";

const Carers = ({ openCoverageModal }) => {
  const navigate = useNavigate();
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [employeesData, setEmployeessData] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const users = await fetchEmployeesForRostering();

        // console.log(users)

        // Map to the expected structure based on API response
        const mappedEmployees = users.map((user) => {
          const profile = user.profile || {};
          const firstName = user.first_name || "";
          const lastName = user.last_name || "";
          return {
            id: user.id,
            employee_id: profile.employee_id || " ", // Use profile employee_id first
            firstName,
            lastName,
            profilePicture: profile.profile_picture || null, // Correct field name
            currentCare: user.status === "active",
            clients: 0, // Not present in API; set default or fetch separately
            status: user.status
              ? user.status.charAt(0).toUpperCase() + user.status.slice(1)
              : "Active",
            cluster: profile.department || user.branch || "N/A", // Use department or branch
            users: 0, // Not present; set default
            initials: `${firstName.charAt(0)}${lastName.charAt(
              0
            )}`.toUpperCase(),
            title: "", // Not present
            contactNumber: profile.personal_phone,
            altContactNumber: profile.work_phone,
            maritalStatus: profile.marital_status,
            country: profile.country,
            state: profile.state,
            town: profile.city,
            postcode: profile.zip_code,
            addressLine: profile.street,
            nextOfKinFullName: profile.next_of_kin,
            nextOfKinEmail: profile.next_of_kin_email,
            nextOfKinContactNumber: profile.next_of_kin_phone_number,
            nextOfKinAltContactNumber: profile.next_of_kin_alternate_phone,
            nextOfKinRelationship: profile.relationship_to_next_of_kin,
            role: user.role || profile.job_role, // For BasicInfo
          };
        });
        mappedEmployees.sort((a, b) => {
          const numA = parseInt(a.employee_id.split("-")[1]);
          const numB = parseInt(b.employee_id.split("-")[1]);
          return numA - numB;
        });
        setEmployeessData(mappedEmployees);
      } catch (error) {
        // No fallback; set to empty array
        setEmployeessData([]);
      } finally {
        setIsLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, []);
  const statusCounts = useMemo(() => {
    const counts = { active: 0, tempInactive: 0, inactive: 0 };
    employeesData.forEach((employee) => {
      if (employee.status === "Active") {
        counts.active++;
      } else if (employee.status === "Temporarily inactive") {
        counts.tempInactive++;
      } else if (employee.status === "Inactive") {
        counts.inactive++;
      }
    });
    return counts;
  }, [employeesData]);

  // Navigate to dashboard with employee data
  const goToDashboard = (employee) => {
    navigate("/company/rostering/employee-profile", { state: employee });
  };

  if (isLoadingEmployees) {
    return <LoadingState text="Loading employees..." />;
  }

  return (
    <div className="Rostering-Overview-sec">
      <div className="TOT-Rost-Sec">
        <div className="RostDB-Envt-Container">
          {/* Header */}
          <div className="GGH-TOP">
            <div className="GGH-TOP-1">
              <p>{formattedDate}</p>
              <h2>Employees</h2>
            </div>
            <div className="GGH-TOP-2">
              <div className="cccll-Gbajjs">
                <div className="cccll-Gbajjs-Main">
                  {/* <a href="#" className="Create-NN-Susr Gradient-Btn"><PlusIcon /> Create new employee</a> */}
                  <button className="Gradient-Btn" onClick={openCoverageModal}>
                    <MapPinIcon /> Coverage Map
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Status buttons */}
          <div className="UJu-OOK">
            <button>
              <span>
                <IconCircleCheck size={20} />
                <b>{statusCounts.active}</b> Active
              </span>
            </button>
            <button>
              <span>
                <IconClockPause size={20} />
                <b>{statusCounts.tempInactive}</b> Temporarily inactive
              </span>
            </button>
            <button>
              <span>
                <IconCircleX size={20} />
                <b>{statusCounts.inactive}</b> Inactive
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="RostDB-Envt-Container">
        <div className="GLak-BOxsag">
          <div className="GLak-BOxsag-Top">
            <div className="GLak-BOxsag-Top-1">
              <div className="Searchh-Sec">
                <span>
                  <MagnifyingGlassIcon />
                </span>
                <input type="text" placeholder="Search employees" />
              </div>
            </div>
            <div className="GLak-BOxsag-Top-2">
              <button className="CLust-Btn">
                Clusters <IconCaretDown stroke={0} fill="currentColor" />
              </button>
            </div>
          </div>

          <div className="EMUSED-Gen-Table-Sec OIKu-TTAbe">
            <table>
              <thead>
                <tr>
                  <th>
                    <i className="table-Indis"></i>
                  </th>
                  <th>
                    <span>ID</span>
                  </th>
                  <th>
                    <span>Employee ID</span>
                  </th>
                  <th>
                    <span>
                      Employee Name&nbsp;
                      <IconCaretDown stroke={0} fill="currentColor" />
                    </span>
                  </th>
                  <th></th>
                  <th>
                    <span>Clients </span>
                  </th>
                  <th>
                    <span>
                      Status <IconCaretDown stroke={0} fill="currentColor" />
                    </span>
                  </th>
                  <th>
                    <span>
                      Cluster <IconCaretDown stroke={0} fill="currentColor" />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {employeesData.map((employee, index) => (
                  <tr
                    key={employee.id || index}
                    onClick={() => goToDashboard(employee)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      <i className="table-Indis"></i>
                    </td>
                    <td>{index + 1}</td>
                    <td>{employee.employee_id}</td>
                    <td>
                      <div className="cclk-TAG">
                        <p>
                          {employee.firstName}&nbsp;{employee.lastName}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="GYHg-PArt">
                        <div className="GYHg-PArt-TOp">
                          <span>
                            {employee.profilePicture ? (
                              <img
                                src={employee.profilePicture}
                                alt={`${employee.firstName} ${employee.lastName}`}
                                className="profile-img"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className="profile-initials"
                              style={{
                                display: employee.profilePicture
                                  ? "none"
                                  : "flex",
                              }}
                            >
                              {employee.initials}
                            </div>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>{employee.clients}</td>
                    <td>
                      <span
                        className={`vist-pro-status ${employee?.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {employee?.status}
                      </span>
                    </td>
                    <td style={{ width: "50px" }}>
                      <div className="Clusttt-TTd">
                        <p>{employee.cluster}</p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carers;

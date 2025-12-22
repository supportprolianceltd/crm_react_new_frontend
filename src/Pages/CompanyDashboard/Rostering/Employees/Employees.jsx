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

import { fetchEmployeesForRostering } from "../Carers/config/apiConfig";

import EmployeeImg1 from "../Img/Careers/1.jpg";
import LoadingState from "../../../../components/LoadingState";

const Employees = ({ openCoverageModal }) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const navigate = useNavigate();
  const [employeesData, setEmployeesData] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const loadEmployees = async () => {
      setIsLoadingEmployees(true);
      try {
        const users = await fetchEmployeesForRostering();

        // Map to the expected structure based on API response
        const mappedEmployees = users.map((user) => {
          const profile = user.profile || {};
          const firstName = user.first_name || "";
          const lastName = user.last_name || "";
          const email = user.email || "";
          return {
            id: user.id,
            employee_id: profile.employee_id,
            firstName,
            lastName,
            email,
            profilePicture: profile.profile_image_url || null,
            currentCare: user.status === "active",
            clients: 0, // Not present in API; set default or fetch separately
            status: user.status
              ? user.status.charAt(0).toUpperCase() + user.status.slice(1)
              : "Active",
            cluster: profile.department, // Use department as cluster
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
            skills: profile.skills,
            availability: profile.availability,
          };
        });
        mappedEmployees.sort((a, b) => {
          // Handle cases where employee_id might be undefined or not in expected format
          if (!a.employee_id || !b.employee_id) {
            return 0;
          }

          const aParts = a.employee_id.split("-");
          const bParts = b.employee_id.split("-");

          if (aParts.length < 2 || bParts.length < 2) {
            return 0;
          }

          const numA = parseInt(aParts[1]);
          const numB = parseInt(bParts[1]);

          if (isNaN(numA) || isNaN(numB)) {
            return 0;
          }

          return numA - numB;
        });
        setEmployeesData(mappedEmployees);
      } catch (error) {
        setEmployeesData([]);
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

  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return employeesData;
    const term = searchTerm.toLowerCase();
    return employeesData.filter((emp) => {
      return (
        (emp.firstName && emp.firstName.toLowerCase().includes(term)) ||
        (emp.lastName && emp.lastName.toLowerCase().includes(term)) ||
        (emp.email && emp.email.toLowerCase().includes(term)) ||
        (emp.employee_id && emp.employee_id.toLowerCase().includes(term)) ||
        (emp.postcode && emp.postcode.toLowerCase().includes(term))
      );
    });
  }, [employeesData, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / pageSize)
  );

  const pagedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Navigate to dashboard with employee data
  const goToDashboard = (employee) => {
    navigate("/company/rostering/employee-profile", { state: employee });
  };

  if (isLoadingEmployees) {
    return <LoadingState text="Loading employees..." />;
  }

  // console.log("employeesData")
  // console.log(employeesData)
  // console.log("employeesData")

  return (
    <div className="Rostering-Overview-sec">
      <div className="TOT-Rost-Sec">
        <div className="RostDB-Envt-Container">
          {/* Header */}
          <div className="GGH-TOP">
            <div className="GGH-TOP-1">
              {/* <p>{formattedDate}</p> */}
              <h2>Employees</h2>
            </div>
            <div className="GGH-TOP-2">
              <div className="cccll-Gbajjs">
                <div className="cccll-Gbajjs-Main">
                  {/* <a href="#" className="Create-NN-Susr Gradient-Btn"><PlusIcon /> Create new employee</a> */}
                  {/* <button className="Gradient-Btn" onClick={openCoverageModal}>
                    <MapPinIcon /> Coverage Map
                  </button> */}
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
            {/* <button>
              <span>
                <IconClockPause size={20} />
                <b>{statusCounts.tempInactive}</b> Temporarily inactive
              </span>
            </button> */}
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
                <input
                  type="text"
                  placeholder="Search employees by name, email, id or postcode"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              ></div>
            </div>
            {/* <div className="GLak-BOxsag-Top-2">
              <button className="CLust-Btn">
                Clusters <IconCaretDown stroke={0} fill="currentColor" />
              </button>
            </div> */}
          </div>

          <div className="EMUSED-Gen-Table-Sec OIKu-TTAbe">
            <table>
              <thead>
                <tr>
                  <th>
                    <span>S/N</span>
                  </th>
                  <th>
                    <span>Employee ID</span>
                  </th>
                  <th>
                    <span>Employee Name</span>
                  </th>
                  <th>Employee Email</th>
                  {/* <th>
                    <span>Clients </span>
                  </th> */}
                  <th>
                    <span>Status</span>
                  </th>
                  {/* <th>
                    <span>Cluster</span>
                  </th> */}
                </tr>
              </thead>
              <tbody>
                {pagedEmployees.map((employee, index) => {
                  const globalIndex = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr
                      key={employee.id || globalIndex}
                      onClick={() => goToDashboard(employee)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{globalIndex}</td>
                      <td>{employee.employee_id}</td>
                      <td>
                        <div className="cclk-TAG">
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
                          <p>
                            {employee.firstName}&nbsp;{employee.lastName}
                          </p>
                        </div>
                      </td>
                      <td>{employee.email}</td>
                      <td>
                        <span
                          className={`vist-pro-status ${employee?.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {employee?.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="new-pagination-control">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="new-controls-btn"
          >
            &lt;
          </button>
          <span className="pagination-num">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="new-controls-btn"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Employees;

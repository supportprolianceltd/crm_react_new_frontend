import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeftIcon, ChevronRightIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import SideNavBar from "../Home/SideNavBar";
import "../../CompanyDashboard/Clients/styles/styles.css";
import "../../../components/Table/styles.css";
import AttendanceAnalytics from "./AttendanceAnalytics";
import MembImg1 from "../../../assets/Img/memberIcon1.jpg"
import MembImg2 from "../../../assets/Img/memberIcon2.jpg"
import DefaulUser from "../../../assets/Img/memberIcon.png";
import { apiClient } from "../../../config";
import { getWeekRange } from "../../../utils/helpers"; // Add this import for week filtering

// Helper function to format time from ISO string
const formatTime = (isoString) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
};

// Helper function to get initials for users without profile images
const getInitials = (name) => {
  if (!name) return '';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

// Helper function to determine if user is currently active (clocked in but not out)
const isUserActive = (attendance) => {
  return attendance.clockInTime && !attendance.clockOutTime;
};

// Helper function to format status for display
const formatStatus = (status) => {
  if (!status) return 'on-time';
  return status.toLowerCase().replace('_', '-');
};


const formatDate = (date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const Attendance = () => {
  const [filters, setFilters] = useState({
    period: "All Dates",
    date: null,
    month: "Month",
    year: "Year",
  });
  const [cardFilter, setCardFilter] = useState(null); // New state for card-based filtering

  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredAttendanceData, setFilteredAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const startIndex = (currentPage - 1) * rowsPerPage;

  // Fetch attendance and user data
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch attendance data
        const attendanceResponse = await apiClient.get('/api/rostering/attendance');
        const attendanceList = Array.isArray(attendanceResponse.data) ? attendanceResponse.data : [];
        
        // Fetch users data
        const usersResponse = await apiClient.get('/api/user/users');
        const usersList = Array.isArray(usersResponse.data.results) 
          ? usersResponse.data.results 
          : Array.isArray(usersResponse.data) 
          ? usersResponse.data 
          : [];
        
        setUsers(usersList);
        
        // Create a lookup map for users by email
        const usersMap = {};
        usersList.forEach(user => {
          usersMap[user.email] = user;
        });
        
        // Merge attendance data with user information
        const mergedData = attendanceList.map(attendance => {
          const user = usersMap[attendance.staffId] || {};
          const profile = user.profile || {};
          
          return {
            id: user.id || attendance.staffId,
            attendanceId: attendance.attendanceId,
            carerVisitId: attendance.carerVisitId,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || attendance.staffId,
            email: attendance.staffId,
            role: user.role || 'Unknown',
            department: profile.department || 'Not specified',
            clockIn: formatTime(attendance.clockInTime),
            clockInTime: attendance.clockInTime,
            clockInStatus: formatStatus(attendance.entryStatus),
            clockOut: formatTime(attendance.clockOutTime),
            clockOutTime: attendance.clockOutTime,
            clockOutStatus: formatStatus(attendance.exitStatus),
            remark: attendance.remark || 'No remarks',
            image: profile.profile_image_url || DefaulUser,
            active: isUserActive(attendance),
            rawAttendance: attendance,
            rawUser: user,
            date: attendance.date // Ensure date is available for filtering
          };
        });
        
        setAttendanceData(mergedData);
        // Don't set filtered here; let the useEffect below handle it
        
      } catch (err) {
        console.error('Failed to fetch attendance data:', err);
        setError(err?.response?.data?.message || err.message || 'Failed to fetch attendance data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttendanceData();
  }, []);

  // Filter data based on period/date/month/year and card filter
  useEffect(() => {
    let filtered = attendanceData;

    // Period/Date/Month/Year filtering (mirroring AttendanceAnalytics logic)
    if (filters.date) {
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date || entry.rawAttendance.date);
        return (
          entryDate.getFullYear() === filters.date.getFullYear() &&
          entryDate.getMonth() === filters.date.getMonth() &&
          entryDate.getDate() === filters.date.getDate()
        );
      });
    } else if (filters.period === "Today") {
      const today = new Date();
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date || entry.rawAttendance.date);
        return entryDate.toDateString() === today.toDateString();
      });
    } else if (filters.period === "This Week") {
      const today = new Date();
      const { start, end } = getWeekRange(today);
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date || entry.rawAttendance.date);
        return entryDate >= start && entryDate <= end;
      });
    } else if (filters.month !== "Month" && filters.year !== "Year") {
      const monthIndex = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ].indexOf(filters.month);
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date || entry.rawAttendance.date);
        return (
          entryDate.getMonth() === monthIndex &&
          entryDate.getFullYear() === Number(filters.year)
        );
      });
    } else if (filters.month !== "Month") {
      const monthIndex = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ].indexOf(filters.month);
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date || entry.rawAttendance.date);
        return entryDate.getMonth() === monthIndex;
      });
    } else if (filters.year !== "Year") {
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date || entry.rawAttendance.date);
        return entryDate.getFullYear() === Number(filters.year);
      });
    }
    // If no filters, show all (for "All Dates")

    // Apply card filter on top
    if (cardFilter === 'present') {
      filtered = filtered.filter((entry) => entry.clockInTime);
    } else if (cardFilter === 'absent') {
      filtered = filtered.filter((entry) => !entry.clockInTime);
    } else if (cardFilter === 'late') {
      filtered = filtered.filter((entry) => entry.clockInStatus === 'late-entry');
    } else if (cardFilter === 'total' || cardFilter === 'average') {
      // Reset to all for total and average
      setCardFilter(null);
    }
    // For 'average', do nothing (shows all within period)

    setFilteredAttendanceData(filtered);
  }, [filters, cardFilter, attendanceData]);

   // Pagination calculations
  const totalPages = Math.ceil(filteredAttendanceData.length / rowsPerPage);
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredAttendanceData.slice(startIndex, endIndex);

  // Handle page navigation
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    setFilteredAttendanceData(
      filteredAttendanceData.filter(
        (employee) => !selectedRows.includes(employee.id)
      )
    );
    setSelectedRows([]);
    setCurrentPage(1); // Reset to first page after deletion
  };

  // Handle row selection
  const handleRowSelection = (employeeId) => {
    setSelectedRows((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

 

        
   // Dropdown component for the action button
    const ActionDropdown = ({ employeeId, isLastRow }) => {
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef(null);

      // Handle click outside to close dropdown
        useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        const dropdownVariants = {
        hidden: {
            opacity: 0,
            y: -10,
            scale: 0.95,
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
            duration: 0.2,
            ease: "easeOut",
            },
        },
        exit: {
            opacity: 0,
            y: -10,
            scale: 0.95,
            transition: {
            duration: 0.2,
            ease: "easeIn",
            },
        },
        };

        return (
        <div className="relative" ref={dropdownRef}>
            <button
            aria-label="More options"
            title="More options"
            className="mmmo-BBTH-Drop"
            onClick={() => setIsOpen((s) => !s)}
            >
            <EllipsisHorizontalIcon />
            </button>
            {isOpen && (
            <motion.div
                className={`dropdown-menu ${isLastRow ? "last-row-dropdown" : "not-last-row-dropdown"}`}
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <Link to={`/company/employees/`} onClick={() => setIsOpen(false)}>
                Profile
                </Link>
                {/* <Link
                to={`/attendance-history/${employeeId}`}
                onClick={() => setIsOpen(false)}
                >
                History
                </Link> */}
            </motion.div>
            )}
        </div>
        );
    };

    

    
  return (
    <>
        <SideNavBar />
         <div className="Main-DB-Envt">
            <div className="DB-Envt-Container"> <br />
              <h2>Staff Attendance Page</h2>

       <AttendanceAnalytics
        filters={filters}
        setFilters={setFilters}
        attendanceData={attendanceData}
        onCardClick={setCardFilter} // New prop to handle card clicks
      />

      <br />
        {error && (
          <div style={{ 
            color: 'var(--danger-color, #c53030)', 
            padding: '1rem', 
            marginBottom: '1rem',
            backgroundColor: '#fed7d7',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}
        
        <div className="table-container">
            <table className="Gen-Sys-table OIk-TTTatgs">
                <thead>
                 <tr>
                    {/* <th>
                    <input
                        type="checkbox"
                        checked={
                        selectedRows.length === paginatedData.length &&
                        paginatedData.length > 0
                        }
                        onChange={() => {
                        if (selectedRows.length === paginatedData.length) {
                            setSelectedRows([]);
                        } else {
                            setSelectedRows(
                            paginatedData.map((employee) => employee.id)
                            );
                        }
                        }}
                        disabled={loading}
                        />
                     </th> */}
                    <th>S/N</th>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Clock In Time</th>
                    <th>Clock Out Time</th>
                    <th>Remark</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '2rem' }}>
                      Loading attendance data...
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '2rem' }}>
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((employee, index) => (
                    <tr key={employee.attendanceId}>
                    {/* <td>
                        <input
                        type="checkbox"
                        checked={selectedRows.includes(employee.id)}
                        onChange={() => handleRowSelection(employee.id)}
                        />
                    </td> */}
                    <td>{startIndex + index + 1}</td>
                    <td>{employee.id}</td>
                    <td>
                        <div 
                        className="Proliks-Seec"
                        onClick={() => {
                            setSelectedEmployee(employee);
                            setShowEmployeeModal(true);
                        }}
                        style={{ cursor: 'pointer' }}
                        >
                        <div className="Proliks-1">
                            <span>
                            <img src={employee.image} alt={employee.name} />
                            <i
                                className={
                                employee.active
                                    ? "active-AttDnc"
                                    : "In-active-AttDnc"
                                }
                                aria-label={
                                employee.active
                                    ? "Active employee"
                                    : "Inactive employee"
                                }
                            ></i>
                            </span>
                        </div>
                        <div className="Proliks-2">
                            <div>
                            <h4>{employee.name}</h4>
                            </div>
                        </div>
                        </div>
                    </td>
                    <td>{employee.role}</td>
                    <td>{employee.department}</td>
                    <td>
                        <div className="DDa-Statuss">
                        <p>{employee.clockIn}</p>
                        <span className={employee.clockInStatus}>
                            {employee.clockInStatus.replace("-", " ")}
                        </span>
                        </div>
                    </td>
                    <td>
                        <div className="DDa-Statuss">
                        <p>{employee.clockOut}</p>
                        <span className={employee.clockOutStatus}>
                            {employee.clockOutStatus.replace("-", " ")}
                        </span>
                        </div>
                    </td>
                    <td className="remack-SmmmnRy">
                        <span>{employee.remark}</span>
                    </td>
                    <td>
                        <ActionDropdown
                        employeeId={employee.id}
                        isLastRow={index === paginatedData.length - 1}
                        />
                    </td>
                    </tr>
                  ))
                )}
                </tbody>
            </table>
            <div className="pagination-section">
                <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
                selectedCount={selectedRows.length}
                onBulkDelete={handleBulkDelete}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
                />
            </div>
        </div>

            {/* Employee Details Modal */}
      
            {showEmployeeModal && selectedEmployee && (
            <div className="modal-overlay" onClick={() => setShowEmployeeModal(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="employee-header-info">
                    <img 
                        src={selectedEmployee.image} 
                        alt={selectedEmployee.name} 
                        className="modal-employee-image"
                    />
                    <div>
                        <h3>{selectedEmployee.name}</h3>
                        <p>{selectedEmployee.role} - {selectedEmployee.department}</p>
                    </div>
                    </div>
                    <button 
                    className="modal-close-btn"
                    onClick={() => setShowEmployeeModal(false)}
                    >
                    ×
                    </button>
                </div>
                
                <div className="modal-body">
                    <div className="attendance-info">
                    <h4>Today's Attendance</h4>
                    <div className="time-info">
                        <div className="time-block">
                        <span className="time-label">Clock In</span>
                        <span className="time-value">{selectedEmployee.clockIn}</span>
                        <small className={`status ${selectedEmployee.clockInStatus}`}>
                            {selectedEmployee.clockInStatus.replace("-", " ")}
                        </small>
                        </div>
                        <div className="time-block">
                        <span className="time-label">Clock Out</span>
                        <span className="time-value">{selectedEmployee.clockOut}</span>
                        <span className={`status ${selectedEmployee.clockOutStatus}`}>
                            {selectedEmployee.clockOutStatus.replace("-", " ")}
                        </span>
                        </div>
                    </div>
                    
                    <div className="employee-stats">
                        <div className="stat-item">
                        <span className="stat-label">Status</span>
                        <span className={`stat-value ${selectedEmployee.active ? 'active' : 'inactive'}`}>
                            {selectedEmployee.active ? 'Active' : 'Inactive'}
                        </span>
                        </div>
                        <div className="stat-item">
                        <span className="stat-label">Remark</span>
                        <span className="stat-value">{selectedEmployee.remark}</span>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            )}


        </div>
            </div>

    </>
  ) }


  // PaginationControls Component

  const PaginationControls = ({
    currentPage,
    totalPages,
    rowsPerPage,
    onRowsPerPageChange,
    selectedCount,
    onBulkDelete,
    onPrevPage,
    onNextPage,
  }) => (
    <div className="pagination-controls">
      <div className="Dash-OO-Boas-foot">
        <div className="Dash-OO-Boas-foot-1">
          <div className="items-per-page">
            <p>Number of rows:</p>
            <select
              className="form-select"
              value={rowsPerPage}
              onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
          </div>
        </div>
      </div>
  
      <div className="page-navigation">
        <span className="page-info">
          Page {currentPage} of {totalPages}
        </span>
  
        <div className="page-navigation-Btns">
          <button
            className="page-button"
            onClick={onPrevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            className="page-button"
            onClick={onNextPage}
            disabled={currentPage === totalPages}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
  

export default Attendance;
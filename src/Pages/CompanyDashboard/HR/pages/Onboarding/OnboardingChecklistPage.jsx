import { IoIosArrowRoundBack } from "react-icons/io";
import { useParams, useNavigate } from "react-router-dom";
import "./OnboardingChecklistPage.css";

const OnboardingChecklistPage = () => {
  const { id } = useParams(); // Get ID from URL
  const navigate = useNavigate();

  // Dummy employee + tasks (replace with API call later)
  const employee = {
    id,
    name: "Precious Wen",
    email: "Wenprecious@gmail.com",
    phone: "+23489876578",
    nationality: "Nigeria",
    state: "Rivers State",
    address: "30 Chinda Avenue",
    zip: "54009",
    kinName: "Jimmy",
    kinRelation: "Brother",
    kinPhone: "+2349886565",
    kinAddress: "30 Chinda Avenue",
  };

  const tasks = [
    { title: "Offer Letter Signed", caption: "Caption", status: "Completed" },
    {
      title: "Documents Submitted",
      caption: "ID, Certificates, Tax Forms etc",
      status: "In Progress",
    },
    {
      title: "System Access Granted",
      caption: "Email, HRIS, Payroll, etc",
      status: "Pending",
    },
    {
      title: "Orientation Scheduled",
      caption: "Caption",
      status: "Upload Document",
    },
    { title: "Offer Letter Signed", caption: "Caption", status: "Completed" },
  ];

  return (
    <div className="onboarding-checklist-container">
      <header className="checklist-header">
        <div>
          <IoIosArrowRoundBack onClick={() => navigate(-1)} />
          <div>
            <h2>Onboarding Checklist</h2>
            <p>Manage and view all compliance</p>
          </div>
        </div>
      </header>

      <div className="checklist-content">
        {/* Employee Info */}
        <div className="info-card">
          <div className="info-header">
            <img
              src="https://via.placeholder.com/100"
              alt="profile"
              className="info-image"
            />
            <h2 className="info-name">{employee.name}</h2>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">First Name</span>
              <span className="info-value">{employee.name.split(" ")[0]}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Last Name</span>
              <span className="info-value">{employee.name.split(" ")[1]}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value email">{employee.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Phone Number</span>
              <span className="info-value">{employee.phone}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Nationality</span>
              <span className="info-value">{employee.nationality}</span>
            </div>
            <div className="info-item">
              <span className="info-label">State of Origin</span>
              <span className="info-value">{employee.state}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Address</span>
              <span className="info-value">{employee.address}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Zip Code</span>
              <span className="info-value">{employee.zip}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Next of Kin</span>
              <span className="info-value">{employee.kinName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Relationship</span>
              <span className="info-value">{employee.kinRelation}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Next of Kin Address</span>
              <span className="info-value">{employee.kinAddress}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Phone Number</span>
              <span className="info-value">{employee.kinPhone}</span>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="tasks-card">
          <ul className="tasks-list">
            {tasks.map((task, idx) => (
              <li key={idx} className="task-item">
                <div>
                  <input type="checkbox" />
                  <span className="task-title">{task.title}</span>
                  <p className="task-caption">{task.caption}</p>
                </div>
                <span
                  className={`task-status ${task.status
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {task.status}
                </span>
              </li>
            ))}
          </ul>
          <div className="actions">
            <button className="cancel-btn">Cancel</button>
            <button className="complete-btn">Complete Onboarding</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingChecklistPage;

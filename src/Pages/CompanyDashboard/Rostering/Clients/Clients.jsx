import React, { useState, useEffect, useMemo } from "react";
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
import { fetchClients } from "../config/apiConfig";
import LoadingState from "../../../../components/LoadingState";

const Clients = ({ openCoverageModal }) => {
  const navigate = useNavigate();
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const [clientsData, setClientsData] = useState([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    const loadClients = async () => {
      setIsLoadingClients(true);
      try {
        const data = await fetchClients();
        if (data && data.results) {
          const processed = data.results.map((result, index) => ({
            id: result.id,
            client_id: result.profile.client_id, // Assuming API returns 'id' as client_id
            firstName: result.first_name,
            lastName: result.last_name,
            client_address: result.profile.address_line,
            client_postcode: result.profile.postcode,
            profilePicture: result.profile.photo_url,
            title: result.profile.title,
            dateOfBirth: result.profile.date_of_birth,
            genderIdentity: result.profile.gender_identity,
            preferredName: result.profile.preferred_name,
            contactNumber: result.profile.contact_number,
            altContactNumber: result.profile.alt_contact_number,
            email: result.email,
            maritalStatus: result.profile.marital_status,
            nhisNumber: result.profile.nhis_number,
            primaryContactName: result.profile.primary_contact_name,
            primaryContactPhone: result.profile.primary_contact_phone,
            primaryContactEmail: result.profile.primary_contact_email,
            secondaryContactName: result.profile.secondary_contact_name || "",
            secondaryContactPhone: result.profile.secondary_contact_phone || "",
            secondaryContactEmail: result.profile.secondary_contact_email || "",
            nextOfKinFullName: result.profile.next_of_kin_full_name || "",
            nextOfKinRelationship:
              result.profile.next_of_kin_relationship || "",
            nextOfKinContactNumber:
              result.profile.next_of_kin_contact_number || "",
            nextOfKinAltContactNumber:
              result.profile.next_of_kin_alt_contact_number || "",
            nextOfKinEmail: result.profile.next_of_kin_email || "",
            addressLine: result.profile.address_line || "",
            town: result.profile.town || "",
            county: result.profile.county || "",
            postcode: result.profile.postcode || "",
            typeOfResidence: result.profile.type_of_residence || "",
            livesAlone: result.profile.lives_alone,
            initials:
              result.first_name[0].toLowerCase() +
              result.last_name[0].toLowerCase(),
            risk: ["low", "medium", "high"][index % 3], // Dummy variation
            assignments: 1, // Dummy
            status: result.profile.status,
            cluster: `Cluster ${String.fromCharCode(65 + (index % 5))}`, // Dummy variation
            users: 5 + index * 5, // Dummy variation
            currentCare: result.profile.status === "Active", // Based on status
          }));
          processed.sort((a, b) => {
            const numA = parseInt(a.client_id.split("-")[1]);
            const numB = parseInt(b.client_id.split("-")[1]);
            return numA - numB;
          });
          setClientsData(processed);
        }
      } catch (error) {
        console.error("Error loading clients:", error);
        // Optionally handle error state, e.g., setError(error.message);
      } finally {
        setIsLoadingClients(false);
      }
    };
    loadClients();
  }, []);

  const statusCounts = useMemo(() => {
    const counts = { active: 0, inactive: 0 };
    clientsData.forEach((client) => {
      if (client.status === "Active") {
        counts.active++;
      } else if (client.status === "Inactive") {
        counts.inactive++;
      }
    });
    return counts;
  }, [clientsData]);

  // Filter clients by search term
  const filteredClients = useMemo(() => {
    if (!searchTerm) return clientsData;
    const term = searchTerm.toLowerCase();
    return clientsData.filter((client) => {
      return (
        (client.firstName && client.firstName.toLowerCase().includes(term)) ||
        (client.lastName && client.lastName.toLowerCase().includes(term)) ||
        (client.email && client.email.toLowerCase().includes(term)) ||
        (client.client_id && client.client_id.toLowerCase().includes(term)) ||
        (client.client_postcode &&
          client.client_postcode.toLowerCase().includes(term))
      );
    });
  }, [clientsData, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / pageSize));

  const pagedClients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredClients.slice(start, start + pageSize);
  }, [filteredClients, currentPage, pageSize]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Navigate to dashboard with client data
  const goToDashboard = (client) => {
    navigate("/company/rostering/profile", { state: client });
  };

  if (isLoadingClients) {
    return <LoadingState text="Loading clients..." />;
  }

  return (
    <div className="Rostering-Overview-sec">
      <div className="TOT-Rost-Sec">
        <div className="RostDB-Envt-Container">
          {/* Header */}
          <div className="GGH-TOP">
            <div className="GGH-TOP-1">
              <p>{formattedDate}</p>
              <h2>Clients</h2>
            </div>
            <div className="GGH-TOP-2">
              <div className="cccll-Gbajjs">
                <div className="cccll-Gbajjs-Main">
                  {/* <a href="#" className="Create-NN-Susr Gradient-Btn"><PlusIcon /> Create new service user</a> */}
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
                  placeholder="Search by name, email, client id or postcode"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            {/* <div className="GLak-BOxsag-Top-2">
              <button className="CLust-Btn">
                Clusters <IconCaretDown stroke={0} fill="currentColor" />
              </button>
            </div> */}
          </div>

          <div className="EMUSED-Gen-Table-Sec">
            <table>
              <thead>
                <tr>
                  {/* <th>
                    <i className="table-Indis"></i>
                  </th> */}
                  <th>
                    <span>S/N</span>
                  </th>
                  <th>
                    <span>Client ID</span>
                  </th>
                  <th>
                    <span>Client Name</span>
                  </th>
                  <th>
                    <span>Address & Postcode</span>
                  </th>
                  <th>
                    <span>Status</span>
                  </th>
                  {/* <th>
                    <span>Cluster</span>
                  </th> */}
                </tr>
              </thead>
              <tbody>
                {pagedClients.map((client, index) => {
                  const globalIndex = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr
                      key={client.id || globalIndex}
                      onClick={() => goToDashboard(client)}
                      style={{ cursor: "pointer" }}
                    >
                      <td className="serial-col">{globalIndex}</td>
                      <td>{client.client_id}</td>
                      <td>
                        <div className="cclk-TAG">
                          <p>
                            {client.firstName}&nbsp;{client.lastName}
                          </p>
                        </div>
                      </td>
                      <td>
                        <div className="address-post">
                          <span className="c-post">
                            {client?.client_postcode}
                          </span>
                          <span className="">{client?.client_address}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`vist-pro-status ${client?.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {client?.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {/* bottom pagination */}

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

export default Clients;

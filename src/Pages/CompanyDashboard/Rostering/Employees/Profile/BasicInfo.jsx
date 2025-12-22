import React from "react";
import { PencilIcon } from "@heroicons/react/24/outline";

const BasicInfo = ({ employeeData }) => {
  return (
    <div className="Carrers-Phsyh-Paj">
      <div className="Carrers-Phsyh-Paj-Mains">
        <div className="Info-Palt">
          <div className="Info-Palt-Top">
            <h3>Personal Information</h3>
            {/* <a href="#" className="profil-Edit-Btn btn-primary-bg">
              <PencilIcon /> Edit
            </a> */}
          </div>
          <div className="Info-Palt-Main">
            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>First Name</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{employeeData?.firstName || "Sam"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Last Name</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{employeeData?.lastName || "Tarly"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Role</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{employeeData?.role || "Admin"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Personal Phone Number</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{employeeData?.contactNumber || "+44 123 456 7890"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Work Phone Number</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{employeeData?.altContactNumber || "+44 987 654 3210"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Marital Status</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{employeeData?.maritalStatus || "Single"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Country</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{employeeData?.country || "United Kingdom"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>State</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{employeeData?.state || "England"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>City</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{employeeData?.town || "London"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Post Code</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{employeeData?.postcode || "SW1A 1AA"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Address</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{employeeData?.addressLine || "123 Main Street"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="Info-Palt">
          <div className="Info-Palt-Top">
            <h3>Next of Kin</h3>
            {/* <a href="#" className="profil-Edit-Btn btn-primary-bg">
              <PencilIcon /> Edit
            </a> */}
          </div>
          <div className="Info-Palt-Main">
            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Name</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{employeeData?.nextOfKinFullName || "John Doe"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Email</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{employeeData?.nextOfKinEmail || "john.doe@example.com"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Phone Number</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>
                  {employeeData?.nextOfKinContactNumber || "+44 111 222 3333"}
                </p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Alt. Phone Number</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>
                  {employeeData?.nextOfKinAltContactNumber ||
                    "+44 444 555 6666"}
                </p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Town</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{employeeData?.town || "Manchester"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Post Code</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{employeeData?.postcode || "M1 1AA"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Relationship to Next of Kin</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{employeeData?.nextOfKinRelationship || "Brother"}</p>
              </div>
            </div>

            <div className="Info-TTb-BS">
              <div className="Info-TTb-BS-HYH">
                <h5>Address</h5>
              </div>
              <div className="Info-TTb-BS-HYH">
                <p>{employeeData?.addressLine || "456 Oak Avenue"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;

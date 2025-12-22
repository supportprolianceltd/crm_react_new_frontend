import React from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  IconHeartHandshake, // Care Essentials
  IconClock, // Routine
  IconCoffee, // Nutrition & Hydration
  IconPill, // Medication
  IconShield, // Safety & Risk
  IconWalk, // Mobility Support
  IconMoodSmile, // Psychological Wellbeing
  IconUsers, // Social Activities
  IconFileText, // Administrative Notes
  IconHome2, // Environmental Information
} from "@tabler/icons-react";
import { Edit, Edit2Icon, PencilIcon } from "lucide-react";
import { formatDisplayDate } from "../../../../../../utils/helpers";

const Home = ({ clientData, carePlan }) => {
  console.log("This is the careplan");
  console.log(carePlan);
  const clientId = clientData?.id;
  const base = `/company/rostering/profile/care-plan`;
  // support carePlan being an array (items) or an object
  const plan = Array.isArray(carePlan) ? carePlan[0] : carePlan;

  return (
    <div className="KKC-DAhbs">
      <div className="KKC-DAhbs-Top">
        <p>
          Review and update the individual care plan across different assessment
          areas.
        </p>
        {/* Optionally render summary or dynamic content from carePlan here */}
        {plan && (
          <p className="care-plan-summary">
            Care plan loaded for client {clientId}. Last updated:&nbsp;
            {plan.updatedAt
              ? new Date(plan.updatedAt).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
              : "N/A"}
            .
          </p>
        )}
      </div>
      <div className="KKC-DAhbs-Main">
        <div className="KKC-DAhbs-Main-Grid">
          <Link to={`${base}/care-essentials`}>
            <p>
              <IconHeartHandshake stroke={1.5} /> Care Essentials
            </p>
            <span>
              <ChevronRightIcon />
            </span>
          </Link>

          <Link to={`${base}/routine`}>
            <p>
              <IconClock stroke={1.5} /> Routine
            </p>
            <span>
              <ChevronRightIcon />
            </span>
          </Link>

          <Link to={`${base}/nutrition`}>
            <p>
              <IconCoffee stroke={1.5} /> Nutrition & Hydration
            </p>
            <span>
              <ChevronRightIcon />
            </span>
          </Link>

          <Link to={`${base}/medication`}>
            <p>
              <IconPill stroke={1.5} /> Medication
            </p>
            <span>
              <ChevronRightIcon />
            </span>
          </Link>

          <Link to={`${base}/risk-assessments`}>
            <p>
              <IconShield stroke={1.5} /> Risk Assessments
            </p>
            <span>
              <ChevronRightIcon />
            </span>
          </Link>

          <Link to={`${base}/moving-handing`}>
            <p>
              <IconWalk stroke={1.5} /> Moving & Handling
            </p>
            <span>
              <ChevronRightIcon />
            </span>
          </Link>

          <Link to={`${base}/wellbeing`}>
            <p>
              <IconMoodSmile stroke={1.5} /> Psychological Wellbeing
            </p>
            <span>
              <ChevronRightIcon />
            </span>
          </Link>

          <Link to={`${base}/social-support`}>
            <p>
              <IconUsers stroke={1.5} /> Social Support
            </p>
            <span>
              <ChevronRightIcon />
            </span>
          </Link>

          <Link to={`${base}/administrative-notes`}>
            <p>
              <IconFileText stroke={1.5} /> Administrative Notes
            </p>
            <span>
              <ChevronRightIcon />
            </span>
          </Link>

          {/* ✅ New Environmental Information Section */}
          <Link to={`${base}/environmental-information`}>
            <p>
              <IconHome2 stroke={1.5} /> Environmental Information
            </p>
            <span>
              <ChevronRightIcon />
            </span>
          </Link>
        </div>
        {/* Agreed visit time */}
        <div className="agreed-visit-time">
          <h2>Agreed Visit Time</h2>
          <p>
            View and manage the client’s preferred visit time. These agreed
            times help ensure visits fit naturally into their day
          </p>
          {/* visit days - render from carePlan.careRequirements.schedules */}
          <div className="visit-days-sec">
            {(() => {
              const schedules = plan?.careRequirements?.schedules || [];
              const weekOrder = [
                "MONDAY",
                "TUESDAY",
                "WEDNESDAY",
                "THURSDAY",
                "FRIDAY",
                "SATURDAY",
                "SUNDAY",
              ];

              const formatTime = (iso) => {
                if (!iso) return "";
                try {
                  const d = new Date(iso);
                  return d.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });
                } catch (e) {
                  return iso;
                }
              };

              return weekOrder.map((day) => {
                const schedule = schedules.find((s) => s.day === day) || {
                  enabled: false,
                  slots: [],
                };
                return (
                  <div key={day} className="visit-days-cen">
                    <div className="visit-title">
                      <p className="">
                        {day.charAt(0) + day.slice(1).toLowerCase()}
                      </p>
                      <div className="edit-button">
                        Edit <PencilIcon />
                      </div>
                    </div>
                    <div className="visit-times">
                      {schedule.enabled &&
                      schedule.slots &&
                      schedule.slots.length > 0 ? (
                        schedule.slots.map((slot, idx) => (
                          <div key={slot.externalId || idx}>
                            <p className="visit-time-t">Start Time</p>
                            <p>{formatTime(slot.startTime)}</p>
                            <p className="visit-time-t">End Time</p>
                            <p>{formatTime(slot.endTime)}</p>
                          </div>
                        ))
                      ) : (
                        <div>
                          <p>No visits scheduled.</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
          <div className="visit-duration">
            <div className="visit-title-cont">
              <p className="">Contract Duration</p>
              {/* <button
                  className="edit-button"
                  onClick={() => handleEditToggle("profile")}
                >
                  {isEditing.profile ? (
                    <>
                      Cancel <IoMdClose />
                    </>
                  ) : (
                    <>
                      Edit <PencilIcon />
                    </>
                  )}
              </button> */}
              <div className="edit-button">
                Edit <PencilIcon />
              </div>
            </div>
            <div className="visit-times">
              <div>
                <p className="visit-time-t">Start Date</p>
                <p>
                  {formatDisplayDate(plan?.careRequirements?.contractStart)}
                </p>
                <p className="visit-time-t">End Date</p>
                <p>{formatDisplayDate(plan?.careRequirements?.contractEnd)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

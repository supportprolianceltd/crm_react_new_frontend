import React, { useState } from "react";
import "./RosteringSettings.css";
import ToggleButton from "../../../../components/ToggleButton";

import { fetchTimezoneChoices } from "./ApiService";
import axios from "axios";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

const RosteringSettings = (schedule) => {
  const [formData, setFormData] = useState({
    // ClusterLocationInputType: "Zip Code",
    // clientType: "Elderly",
    // careRequirements: "Medication",
    // distanceSelector: "Miles",
    // clientAvailability: "",
    // skillQualification: "Care Experience",
    clockInRadius: 5,
    breakTime: 40,
    restHours: 2,
    restTime: 11,
    driveDistance: 20,
    walkDistance: 8,
    // consecutiveWorkHours: 8,
    // restDays: 1,
    // allowSoftBreaches: "",
    // breachReason: "input reason",
    // visitDuration: "4",
    // visitFrequency: "",
    // bufferMins: 5,
    // visitTime: "Morning",
    // triggerConditions: "Overlapping Visits",
    companyTimeZone: "",
    // clusterTimeZone: [],
  });

    const [tipOpen, setTipOpen] = React.useState(false);

  const [allowRestBreach, setAllowRestBreach] = useState(false);
  const [timezone, setTimezone] = useState(schedule.timezone || "UTC");
  const [timezoneChoices, setTimezoneChoices] = useState([]);
 const [showVisitToggle, setShowVisitToggle] = useState(false)
  const fetchTimeZoneData = async () => {
    const [timezoneData] = await Promise.all([fetchTimezoneChoices()]);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : parseInt(value) || value, // Handle text inputs too
    }));
  };

  // const handleToggleChange = (fieldName, newState) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     [fieldName]: newState,
  //   }));
  // };
  const handleToolTip = () => {

  }
  const handleToggleChange = () => {
    setShowVisitToggle((prev) => !prev)
  };

  const handleSave = () => {
    // Implement save logic (e.g., API call)
    console.log("Saving form data:", formData);
    // Optional: Add toast/success message here
  };

  return (
    <div className="roster-settings-container">
      <header className="settings-header">
        <h1>Rostering Rules & Settings</h1>

        <div className="settings-actions">
          <button className="cancel-btn">Cancel</button>
          <button className="save-btn" onClick={handleSave}>
            Save
          </button>
        </div>
      </header>

      <div className="settings-sec">
        {/* Cluster Settings */}

        <section>
          <header className="settings-header">
            <h1>Cluster Settings</h1>
          </header>
          <div className="settings-section">
            {/* <div className="subsection">
              <h2>Geographical Location</h2>

              <div className="outer-form-section">
                <div
                  className="form-group full-width"
                  style={{ marginBottom: 0, width: "100%" }}
                >
                  <label htmlFor="minDistanceClusters">
                    Cluster  input type
                  </label>
                  <div className="roster-settings-input">
                    <select
                      type="text"
                      id="ClusterLocationInputType"
                      name="ClusterLocationInputType"
                      value={formData.ClusterLocationInputType}
                      onChange={handleInputChange}
                      placeholder="Zip code / address / region"
                      options="Zip code / address / region sector"
                    >
                      <option value="Zip Code">Zip Code</option>
                      <option value="Address">Address</option>
                      <option value="Region Sector">Region Sector</option>
                    </select>
                  </div>
                </div>
              </div>
            </div> */}

            
{/* 
            <div className="subsection">
              <h2>Care Requirements</h2>

              <div className="outer-form-section">
                <div
                  className="form-group full-width"
                  style={{ marginBottom: 0, width: "100%" }}
                >
                  <label htmlFor="minDistanceClusters">Care Requirements</label>
                  <div className="roster-settings-input">
                    <input
                      type="text"
                      id="careRequirements"
                      name="careRequirements"
                      value={formData.careRequirements}
                      onChange={handleInputChange}
                    />
                    <select
                      id="careRequirements"
                      name="careRequirements"
                      onChange={handleInputChange}
                    >
                      <option value="Medication">Medication</option>
                      <option value="Psychological Care">
                        Psychological Care
                      </option>
                      <option value="Mobility Assistance">
                        Mobility Assistance
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div> */}
            
            <div className="subsection">
              <div 
                className= {`cluster-header ${tipOpen ? "open" : ""}`}
                onClick={() => setTipOpen((o) => !o)}
                >

                <p>Clock In Radius</p>
                <QuestionMarkCircleIcon 
                  onClick={handleToolTip}
                className="cluster-header-icon" width={20} height={20} />

                <div className= "cluster-header-icon-tip">
                  <p>The distance a staff must be from a client's house before the can clock in</p>
                </div>

              </div>


              <div className="outer-form-section">
                <div
                  className="form-group full-width"
                  style={{ marginBottom: 0, width: "100%" }}
                >
                  <label htmlFor="minDistanceClusters">Clock In Radius</label>
                  <div className="roster-settings-input">
                    <input
                      type="number"
                      id="clockInRadius"
                      name="clockInRadius"
                      value={formData.clockInRadius}
                      onChange={handleInputChange}
                    >
                    </input>
                    <span className="unit">Meters</span>
                  </div>
                  {/* <small>Cluster Distance limit</small> */}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Staff Assignment Criteria */}

        {/* <section>
          <header className="settings-header">
            <h1>Staff Assignment Criteria</h1>
          </header>
          <div className="settings-section">
            <div className="subsection">
              <h2>Proximity Range</h2>

              <div className="outer-form-section">
                <div
                  className="form-group full-width"
                  style={{ marginBottom: 0, width: "100%" }}
                >
                  <label htmlFor="minDistanceClusters">
                    Distance Range Selector
                  </label>
                  <div className="roster-settings-input">
                    <select
                      type="text"
                      id="distanceSelector"
                      name="distanceSelector"
                      value={formData.distanceSelector}
                      onChange={handleInputChange}
                    >
                      <option value="Miles">Miles</option>
                      <option value="KM">Kilometers</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="subsection">
              <h2>Availability</h2>

              <div className="outer-form-section">
                <div
                  className="form-group full-width"
                  style={{ marginBottom: 0, width: "100%" }}
                >
                  <label htmlFor="minDistanceClusters">
                    Time Availability based on client's preferred time
                  </label>
                  <div className="roster-settings-input">
                    <input
                      type="text"
                      id="clientAvailability"
                      name="clientAvailability"
                      value={formData.clientAvailability}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="subsection">
              <h2>Skills & Qualifications</h2>

              <div className="outer-form-section">
                <div
                  className="form-group full-width"
                  style={{ marginBottom: 0, width: "100%" }}
                >
                  <label htmlFor="minDistanceClusters">
                    Select Skills & Qualifications
                  </label>
                  <div className="roster-settings-input">
                    <input
                      type="text"
                      id="skillQualification"
                      name="skillQualification"
                      value={formData.skillQualification}
                      onChange={handleInputChange}
                    />
                    <select
                      id="skillQualification"
                      name="skillQualification"
                      value={formData.skillQualification}
                      onChange={handleInputChange}
                    >
                      <option value="Psychological Care">
                        Care Experience
                      </option>
                      <option value="Medication">Certifications</option>
                      <option value="Mobility Assistance">Languages</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section> */}

        {/* Rest Rule Settings */}

        <section>
          <header className="settings-header">
            <h1>Rest Rule Settings</h1>
          </header>
          <div className="working-time-section">
            <h2>Rest Period Requirements</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="wtdMaxFull">Break duration</label>
                <div className="roster-settings-input">
                  <input
                    type="number"
                    id="breakTime"
                    name="breakTime"
                    value={formData.breakTime}
                    onChange={handleInputChange}
                  />
                  <span className="unit">Minutes</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="wtdMaxFull">
                  Minimum rest time after a day's shift
                </label>
                <div className="roster-settings-input">
                  <input
                    type="number"
                    id="restTime"
                    name="restTime"
                    value={formData.restTime}
                    onChange={handleInputChange}
                  />
                  <span className="unit">Hours</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="wtdMaxFull">
                  Minimum rest time between shifts
                </label>
                <div className="roster-settings-input">
                  <input
                    type="number"
                    id="restHours"
                    name="restHours"
                    value={formData.restHours}
                    onChange={handleInputChange}
                  />
                  <span className="unit">Hours</span>
                </div>
              </div>

              {/* <div className="form-group">
                <label htmlFor="restHours">
                  Maximum Consecutive Working Hours
                </label>

                <div className="roster-settings-input">
                  <input
                    type="number"
                    id="consecutiveWorkHours"
                    name="consecutiveWorkHours"
                    value={formData.consecutiveWorkHours}
                    onChange={handleInputChange}
                  />
                  <span className="unit">Hours</span>
                </div>
              </div> */}

              {/* <div className="form-group">
                <label htmlFor="restHours">Required Rest Days Per Week</label>

                <div className="roster-settings-input">
                  <input
                    type="number"
                    id="restDays"
                    name="restDays"
                    value={formData.restDays}
                    onChange={handleInputChange}
                  />
                  <span className="unit">Day(s)</span>
                </div>
              </div> */}
            </div>
            <br />

            {/* <div className="working-time-section">
              <h2>Rest Rule Exceptions</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="restHours">
                    Emergency or Critical Needs Overide
                  </label>

                </div>
              </div>
            </div> */}
          </div>
        </section>

        {/* Visit Settings */}
        <section>
          <header className="settings-header">
            <h1>Visit Settings (Optional)</h1>
          </header>

         <div className="visit-toggle-settings"> 
          
          <p>Toggle to set visit settings</p>

          <div className="toggle-container">
            <ToggleButton
                isOn={showVisitToggle}
              onToggle={handleToggleChange}
              showTick={true}
            />
          </div></div>

              {showVisitToggle && (
                <div className="settings-section">
                    <div className="subsection">
                      <h2>Car</h2>

                      <div className="outer-form-section">
                        <div
                          className="form-group full-width"
                          style={{ marginBottom: 0, width: "100%" }}
                        >
                          <label htmlFor="minDistanceClusters">
                            Maximum Driving Distance
                          </label>
                          <div className="roster-settings-input">
                            <input
                              type="number"
                              id="driveDistance"
                              name="driveDistance"
                              value={formData.driveDistance}
                              onChange={handleInputChange}
                            />
                            <span className="unit">Kilometers</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="subsection">
              <h2>Walk</h2>

              <div className="outer-form-section">
                <div
                  className="form-group"
                  style={{ marginBottom: 0, width: "100%" }}
                >
                  <label htmlFor="walkDistance">Maximum Walking Distance</label>
                  <div className="roster-settings-input">
                    <input
                      type="number"
                      id="walkDistance"
                      name="walkDistance"
                      value={formData.walkDistance}
                      onChange={handleInputChange}
                    />
                    <span className="unit">Kilometers</span>
                  </div>
                  {/* <small>Extra time between visits to absorb delays</small> */}
                </div>
              </div>
                    </div>

            {/* <div className="subsection">
              <h2>Visit Frequency</h2>

              <div className="outer-form-section">
                <div
                  className="form-group full-width"
                  style={{ marginBottom: 0, width: "100%" }}
                >
                  <label htmlFor="minDistanceClusters">
                    Set Visit Frequency
                  </label>
                  <div className="roster-settings-input">
                    <select
                      type="text"
                      id="visitFrequency"
                      name="visitFrequency"
                      value={formData.visitFrequency}
                      onChange={handleInputChange}
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Bi-Weekly">Bi-Weekly</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                </div>
              </div>
            </div> */}

          
                </div>
                  )}
         
        </section> 



        {/* Time Window */}
        {/* <section>
          <header className="settings-header">
            <h1>Time Windows</h1>
          </header>
          <div className="working-time-section">
            <div className="form-row">
              <div className="outer-form-section">
                <div
                  className="form-group full-width"
                  style={{ marginBottom: 0, width: "100%" }}
                >
                  <label htmlFor="minDistanceClusters">
                    Select Visit Time Windows
                  </label>
                  <div className="roster-settings-input">
                    <input
                      type="text"
                      id="visitTime"
                      name="visitTime"
                      value={formData.visitTime}
                      onChange={handleInputChange}
                    />
                    <select
                      id="visitTime"
                      name="visitTime"
                      value={formData.visitTime}
                      onChange={handleInputChange}
                    >
                      <option value="Morning">Morning</option>
                      <option value="Afternoon">Afternoon</option>
                      <option value="Evening">Evening</option>
                      <option value="Night">Night</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="outer-form-section">
                <div
                  className="form-group full-width"
                  style={{ marginBottom: 0, width: "100%" }}
                >
                  <label htmlFor="minDistanceClusters">
                    Conflict Trigger Conditions
                  </label>
                  <div className="roster-settings-input">
                    <input
                      type="text"
                      id="triggerConditions"
                      name="triggerConditions"
                      value={formData.triggerConditions}
                      onChange={handleInputChange}
                    />
                    <select
                      id="triggerConditions"
                      name="triggerConditions"
                      value={formData.triggerConditions}
                      onChange={handleInputChange}
                    >
                      <option value="Overlapping Visits">
                        Overlapping Visits
                      </option>
                      <option value="Insufficient Travel Time">
                        Insufficient Travel Time
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <br />
          </div>
        </section> */}

        {/* Time Zone */}
        {/* <section>
          <header className="settings-header">
            <h1>Time Zone Settings</h1>
          </header>
          <div className="working-time-section">

            <div className="form-row">

              <div className="outer-form-section">
                <div
                  className="form-group full-width"
                  style={{ marginBottom: 0, width: "100%" }}
                >
                  <label htmlFor="minDistanceClusters">Company Time Zone</label>
                  <div className="roster-settings-input">
                  
                    <select
                      id="companyTimeZone"
                      name="companyTimeZone"
                      value={formData.companyTimeZone}
                      onChange={handleInputChange}
                    >
                      <option value="-12:00">
                        (GMT -12:00) Eniwetok, Kwajalein
                      </option>
                      <option value="-11:00">
                        (GMT -11:00) Midway Island, Samoa
                      </option>
                      <option value="-10:00">(GMT -10:00) Hawaii</option>
                      <option value="-09:50">(GMT -9:30) Taiohae</option>
                      <option value="-09:00">(GMT -9:00) Alaska</option>
                      <option value="-08:00">
                        (GMT -8:00) Pacific Time (US &amp; Canada)
                      </option>
                      <option value="-07:00">
                        (GMT -7:00) Mountain Time (US &amp; Canada)
                      </option>
                      <option value="-06:00">
                        (GMT -6:00) Central Time (US &amp; Canada), Mexico City
                      </option>
                      <option value="-05:00">
                        (GMT -5:00) Eastern Time (US &amp; Canada), Bogota, Lima
                      </option>
                      <option value="-04:50">(GMT -4:30) Caracas</option>
                      <option value="-04:00">
                        (GMT -4:00) Atlantic Time (Canada), Caracas, La Paz
                      </option>
                      <option value="-03:50">(GMT -3:30) Newfoundland</option>
                      <option value="-03:00">
                        (GMT -3:00) Brazil, Buenos Aires, Georgetown
                      </option>
                      <option value="-02:00">(GMT -2:00) Mid-Atlantic</option>
                      <option value="-01:00">
                        (GMT -1:00) Azores, Cape Verde Islands
                      </option>
                      <option value="+00:00" selected="selected">
                        (GMT) Western Europe Time, London, Lisbon, Casablanca
                      </option>
                      <option value="+01:00">
                        (GMT +1:00) Brussels, Copenhagen, Madrid, Paris
                      </option>
                      <option value="+02:00">
                        (GMT +2:00) Kaliningrad, South Africa
                      </option>
                      <option value="+03:00">
                        (GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg
                      </option>
                      <option value="+03:50">(GMT +3:30) Tehran</option>
                      <option value="+04:00">
                        (GMT +4:00) Abu Dhabi, Muscat, Baku, Tbilisi
                      </option>
                      <option value="+04:50">(GMT +4:30) Kabul</option>
                      <option value="+05:00">
                        (GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent
                      </option>
                      <option value="+05:50">
                        (GMT +5:30) Bombay, Calcutta, Madras, New Delhi
                      </option>
                      <option value="+05:75">
                        (GMT +5:45) Kathmandu, Pokhara
                      </option>
                      <option value="+06:00">
                        (GMT +6:00) Almaty, Dhaka, Colombo
                      </option>
                      <option value="+06:50">
                        (GMT +6:30) Yangon, Mandalay
                      </option>
                      <option value="+07:00">
                        (GMT +7:00) Bangkok, Hanoi, Jakarta
                      </option>
                      <option value="+08:00">
                        (GMT +8:00) Beijing, Perth, Singapore, Hong Kong
                      </option>
                      <option value="+08:75">(GMT +8:45) Eucla</option>
                      <option value="+09:00">
                        (GMT +9:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk
                      </option>
                      <option value="+09:50">
                        (GMT +9:30) Adelaide, Darwin
                      </option>
                      <option value="+10:00">
                        (GMT +10:00) Eastern Australia, Guam, Vladivostok
                      </option>
                      <option value="+10:50">
                        (GMT +10:30) Lord Howe Island
                      </option>
                      <option value="+11:00">
                        (GMT +11:00) Magadan, Solomon Islands, New Caledonia
                      </option>
                      <option value="+11:50">
                        (GMT +11:30) Norfolk Island
                      </option>
                      <option value="+12:00">
                        (GMT +12:00) Auckland, Wellington, Fiji, Kamchatka
                      </option>
                      <option value="+12:75">
                        (GMT +12:45) Chatham Islands
                      </option>
                      <option value="+13:00">
                        (GMT +13:00) Apia, Nukualofa
                      </option>
                      <option value="+14:00">
                        (GMT +14:00) Line Islands, Tokelau
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="outer-form-section">
                <div
                  className="form-group full-width"
                  style={{ marginBottom: 0, width: "100%" }}
                >
                  <label htmlFor="minDistanceClusters">
                    Cluster Time Zone (Optional)
                  </label>
                  <div className="roster-settings-input">
                    <input
                      type="text"
                      id="clusterTimeZone"
                      name="clusterTimeZone"
                      value={formData.clusterTimeZone}
                      onChange={handleInputChange}
                    />
                    <select
                      id="clusterTimeZone"
                      name="clusterTimeZone"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    >
                      {timezoneChoices.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <br />
          </div>
        </section> */}
      </div>
    </div>
  );
};

export default RosteringSettings;

import React from "react";
import { PencilIcon } from "@heroicons/react/24/outline";

const LifeHistory = () => {
  return (
    <div className="Info-Palt">
      <div className="Info-Palt-Top">
        <h3>Life History</h3>
        {/* <a href='#' className='profil-Edit-Btn btn-primary-bg'><PencilIcon /> Edit</a> */}
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <p>History Snapshot/Personal Biography</p>
          <h4>
            John grew up in a working-class family in Manchester. His father was
            a railway engineer, and his mother worked as a seamstress. text
          </h4>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Job</h3>
          <div className="JUH-PART">
            <p>
              {" "}
              Do they have any current jobs or past jobs that are important to
              them?
            </p>
            <h4>Yes</h4>
          </div>
          <div className="JUH-PART">
            <p>Tell us about it</p>
            <h4>
              John Miller began his working life as an apprentice mechanic in a
              small Manchester garage before joining Royal Mail as a postman
            </h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>People</h3>
          <div className="JUH-PART">
            <p>Anyone important person in their life?</p>
            <h4>Yes</h4>
          </div>
          <div className="JUH-PART">
            <p>Tell us who</p>
            <h4>
              {" "}
              After retiring, he shared his knowledge as a part-time lecturer at
              a local technical college and later volunteered at an Oxfam
              charity shop, staying active in his home.
            </h4>
          </div>
        </div>
      </div>

      <div className="Info-Palt-Main No-Grid">
        <div className="Info-TTb-BS-HYH">
          <h3>Location</h3>
          <div className="JUH-PART">
            <p>Any significant place or location in their life?</p>
            <h4>Yes</h4>
          </div>
          <div className="JUH-PART">
            <p>How do these locations affect their care needs?</p>
            <h4>
              Feels safe and relaxed when visiting the park near her old house
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifeHistory;

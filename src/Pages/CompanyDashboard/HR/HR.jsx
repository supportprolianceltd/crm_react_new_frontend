import React from "react";
import { Route, Routes } from "react-router-dom";
import HRHome from "./HRHome";
import "./HR.css";

const HR = () => {
  return (
    <div className="DB-Envt">
      <div className="Main-DB-Envt">
        <div className="DB-Envt-Container">
          <Routes>
            <Route path="/" element={<HRHome />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default HR;

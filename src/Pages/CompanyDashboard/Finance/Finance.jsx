import { useEffect, useMemo } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import FinanceHome from "./FinanceHome";
import "./Finance.css";

const Finance = () => {
  const navigate = useNavigate();
  const user = useMemo(() => JSON.parse(localStorage.getItem("user")), []);

  // Redirect to staff dashboard if user does not have access
  useEffect(() => {
    if (!user?.profile?.system_access_finance) {
      navigate("/staff", { replace: true });
    }
  }, [user, navigate]);

  if (!user?.profile?.system_access_finance) {
    navigate("/staff", { replace: true });

    return null; // Prevents rendering sub-routes/content
  }

  return (
    <div className="DB-Envt">
      <div className="Main-DB-Envt">
        <div className="DB-Envt-Container">
          <Routes>
            <Route path="/" element={<FinanceHome />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Finance;

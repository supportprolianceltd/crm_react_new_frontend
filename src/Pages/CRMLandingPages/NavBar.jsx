import { useState, useRef, useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import { LogoIcon } from "../../assets/icons/LogoIcon";

import RecruitmentIcon from "../../assets/icons/RecruitmentIcon";
import AuditComplianceIcon from "../../assets/icons/AuditComplianceIcon";
import PayrollIcon from "../../assets/icons/PayrollIcon";
import HumanResourcesIcon from "../../assets/icons/HumanResourcesIcon";
import FinanceIcon from "../../assets/icons/FinanceIcon";
import RosteringIcon from "../../assets/icons/RosteringIcon";
import TrainingIcon from "../../assets/icons/TrainingIcon";

function NavBar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const dropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();
  const mobileMenuRef = useRef(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileShowDropdown, setMobileShowDropdown] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  // Check authentication status on mount
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    setIsAuthenticated(!!accessToken);
  }, []);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle scroll for nav styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  const toggleProfileDropdown = () => setShowProfileDropdown((prev) => !prev);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tenantId");
    localStorage.removeItem("tenantSchema");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <nav className={`Fritop-Nav ${isScrolling ? "scrolling-nav" : ""}`}>
      <div className="large-container">
        <div className="nav-content">
          <Link to="/">
            <LogoIcon />
          </Link>

          {/* Desktop Navbar options */}
          <ul className="Frs-Url">
            {/* <li>
              <Link to="/contact-sales">Resources</Link>
            </li> */}
            <li ref={dropdownRef}>
              <span
                onClick={toggleDropdown}
                className="cursor-pointer flex items-center gap-1 nav-dropp"
              >
                Products{" "}
                <ChevronDownIcon
                  className={` chevron-icon ${showDropdown ? "rotate" : ""}`}
                  style={{ color: "#4A5565" }}
                />
              </span>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    className="All-NAv-DropDown Gen-Boxshadow"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link
                      to="/recruitment"
                      onClick={() => setShowDropdown(false)}
                    >
                      <RecruitmentIcon stroke="#7226FF" />
                      <div className="product-items">
                        <h4>Recruitment</h4>
                        <p>Simplify hiring and onboarding.</p>
                      </div>
                    </Link>

                    <Link
                      to="/rostering"
                      onClick={() => setShowDropdown(false)}
                    >
                      <RosteringIcon stroke="#7226FF" />

                      <div className="product-items">
                        <h4>Rostering</h4>
                        <p>AI scheduling that assigns carers intelligently</p>
                      </div>
                    </Link>

                    <Link to="/admin" onClick={() => setShowDropdown(false)}>
                      <TrainingIcon stroke="#7226FF" />

                      <div className="product-items">
                        <h4>Admin</h4>
                        <p>Manage users, access and settings</p>
                      </div>
                    </Link>

                    <Link
                      to="/human-resources"
                      onClick={() => setShowDropdown(false)}
                    >
                      <HumanResourcesIcon stroke="#7226FF" />

                      <div className="product-items">
                        <h4>Human Resources</h4>
                        <p>Track employee data, attendance and benefits</p>
                      </div>
                    </Link>

                    <Link
                      to="/audit-compliance"
                      onClick={() => setShowDropdown(false)}
                    >
                      <AuditComplianceIcon stroke="#7226FF" />
                      <div className="product-items">
                        <h4>Audit & Compliance</h4>
                        <p>Track employee data, attendance and benefits</p>
                      </div>
                    </Link>

                    <Link to="/finance" onClick={() => setShowDropdown(false)}>
                      <FinanceIcon stroke="#7226FF" />

                      <div className="product-items">
                        <h4>Finance</h4>
                        <p>
                          Payroll system, monitor budgets, invoices, and
                          expenses
                        </p>
                      </div>
                    </Link>

                    <Link to="/training" onClick={() => setShowDropdown(false)}>
                      <TrainingIcon stroke="#7226FF" />

                      <div className="product-items">
                        <h4>Training</h4>
                        <p>Manage courses, learners, and certificates</p>
                      </div>
                    </Link>

                    <Link
                      to="/assets-management"
                      onClick={() => setShowDropdown(false)}
                    >
                      <PayrollIcon stroke="#7226FF" />

                      <div className="product-items">
                        <h4>Assets management</h4>
                        <p>Smart AI system that ensures assets are managed</p>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>

            <li>
              <Link to="/about">About</Link>
            </li>

            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>

          <div className="nav-btns">
            <div>
              {isAuthenticated ? (
                <Link to="/company">
                  <button className="crm-loggedIn-btn">Account</button>
                </Link>
              ) : (
                <Link to="/login">
                  <button className="crm-login-btn">Login</button>
                </Link>
              )}
            </div>

            <div>
              {isAuthenticated ? (
                ""
              ) : (
                <Link to="/book-a-demo">
                  <button className="hero-demo-btn">
                    Request for Demo
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="8"
                      height="11"
                      viewBox="0 0 8 11"
                      fill="none"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M0.405377 0.0804408C0.653818 -0.0486197 0.95112 -0.0207676 1.17333 0.152385L7.04 4.72381C7.22466 4.8677 7.33333 5.09352 7.33333 5.33333C7.33333 5.57315 7.22466 5.79897 7.04 5.94286L1.17333 10.5143C0.95112 10.6874 0.653818 10.7153 0.405377 10.5862C0.156935 10.4572 0 10.1933 0 9.90476V0.761909C0 0.473321 0.156935 0.209501 0.405377 0.0804408ZM1.46667 2.28572V8.38095L5.37778 5.33333L1.46667 2.28572Z"
                        fill="white"
                      />
                    </svg>
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Navbar options */}
          <div className="Fritop-Nav-Mobile">
            <button
              onClick={toggleMobileMenu}
              style={{ background: "none", border: "none" }}
            >
              <FiMenu size={24} />
            </button>
          </div>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                {/* Background overlay */}
                <motion.div
                  className="Offcanvas-Overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />

                {/* Offcanvas Panel */}
                <motion.div
                  ref={mobileMenuRef}
                  className="Offcanvas-Menu"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{ background: "none", border: "none" }}
                    >
                      <FiX size={24} />
                    </button>
                  </div>

                  <ul className="mobile-menu-links">
                    <li>
                      <span
                        onClick={() => setMobileShowDropdown((prev) => !prev)}
                        className="products-icon-mobile"
                      >
                        Products
                        <ChevronDownIcon
                          className={`inline w-1 h-1 ml-1 transition-transform duration-300 ${
                            mobileShowDropdown ? "rotate-180" : ""
                          }`}
                        />
                      </span>

                      <AnimatePresence>
                        {mobileShowDropdown && (
                          <motion.div
                            className="mobile-dropdown"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ul>
                              <li>
                                <Link
                                  to="/recruitment"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  Recruitment
                                </Link>
                              </li>
                              <li>
                                <Link
                                  to="/compliance"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  Compliance
                                </Link>
                              </li>
                              <li>
                                <Link
                                  to="/training"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  Training
                                </Link>
                              </li>
                              <li>
                                <Link
                                  to="/assets-management"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  Assets Management
                                </Link>
                              </li>
                              <li>
                                <Link
                                  to="/rostering"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  Rostering
                                </Link>
                              </li>
                              <li>
                                <Link
                                  to="/human-resources"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  HR
                                </Link>
                              </li>
                              <li>
                                <Link
                                  to="/finance"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  Finance
                                </Link>
                              </li>
                              <li>
                                <Link
                                  to="/admin"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  Admin
                                </Link>
                              </li>
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                    <li>
                      <Link
                        to="/about"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        About
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/contact"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Contact
                      </Link>
                    </li>

                    {/* <li className="nav-btns">
                      <div>
                        {isAuthenticated ? (
                          <Link to="/company">
                            <button className="crm-loggedIn-btn">
                              Account
                            </button>
                          </Link>
                        ) : (
                          <Link to="/login">
                            <button className="crm-login-btn">Login</button>
                          </Link>
                        )}
                      </div>

                      <div>
                        {isAuthenticated ? (
                          ""
                        ) : (
                          <Link to="/book-a-demo">
                            <button className="hero-demo-btn">
                              Request for Demo
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="8"
                                height="11"
                                viewBox="0 0 8 11"
                                fill="none"
                              >
                                <path
                                  fill-rule="evenodd"
                                  clip-rule="evenodd"
                                  d="M0.405377 0.0804408C0.653818 -0.0486197 0.95112 -0.0207676 1.17333 0.152385L7.04 4.72381C7.22466 4.8677 7.33333 5.09352 7.33333 5.33333C7.33333 5.57315 7.22466 5.79897 7.04 5.94286L1.17333 10.5143C0.95112 10.6874 0.653818 10.7153 0.405377 10.5862C0.156935 10.4572 0 10.1933 0 9.90476V0.761909C0 0.473321 0.156935 0.209501 0.405377 0.0804408ZM1.46667 2.28572V8.38095L5.37778 5.33333L1.46667 2.28572Z"
                                  fill="white"
                                />
                              </svg>
                            </button>
                          </Link>
                        )}
                      </div>
                    </li> */}

                    <li>
                      {isAuthenticated ? (
                        <Link
                          to="/company"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="crm-loggedIn-btn"
                        >
                          Account
                        </Link>
                      ) : (
                        <Link
                          to="/login"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="crm-login-btn"
                        >
                          Login
                        </Link>
                      )}
                    </li>

                    <li>
                      <Link
                        to="/book-a-demo"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="hero-demo-btn"
                      >
                        Request a Demo
                      </Link>
                    </li>
                  </ul>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;

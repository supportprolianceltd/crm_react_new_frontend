import { useState, useRef, useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDownIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import LOGO from "../../assets/Img/logo.png";

function TenantNavBar() {
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
        <div className="Fritop-Nav-content">
          <Link to="/company/tenants" className="Nav-Brand">
            <img src={LOGO} alt="logo" />
            <span>Global Admin</span>
          </Link>

          {/* Desktop Navbar options */}
          <ul className="Frs-Url">
            <li ref={dropdownRef}>
              <span
                onClick={toggleDropdown}
                className="cursor-pointer flex items-center gap-1"
              >
                Tenants{" "}
                <ChevronDownIcon
                  className={`chevron-icon ${showDropdown ? "rotate" : ""}`}
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
                      to="/company/tenants"
                      onClick={() => setShowDropdown(false)}
                    >
                      Tenants List
                    </Link>
                    <Link
                      to="/company/tenants/create"
                      onClick={() => setShowDropdown(false)}
                    >
                      Create Tenant
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>

            {isAuthenticated && (
              <li>
                <div
                  className="AAPpl-NAvsb"
                  onClick={toggleProfileDropdown}
                  ref={profileDropdownRef}
                >
                  <div className="AAPpl-NAvsb-Main">
                    <div className="AAPpl-NAvsb-1">
                      <span>PG</span>
                    </div>
                    <div className="AAPpl-NAvsb-2">
                      <h3>Global Admin</h3>
                      <p>admin@example.com</p>
                    </div>
                    <div className="AAPpl-NAvsb-3">
                      <ChevronDownIcon
                        className={`${showProfileDropdown ? "rotate" : ""}`}
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {showProfileDropdown && (
                      <motion.div
                        className="All_Drop_Down ooaujs-Po Gen-Boxshadow"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Link
                          to="/"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <QuestionMarkCircleIcon /> Help & Support
                        </Link>
                        <button
                          className="logout-btn btn-primary-bg"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowProfileDropdown(false);
                            handleLogout();
                          }}
                        >
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </li>
            )}
          </ul>

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
                      >
                        Tenants
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
                                  to="/company/tenants"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  Tenants List
                                </Link>
                              </li>
                              <li>
                                <Link
                                  to="/company/tenants/create"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  Create Tenant
                                </Link>
                              </li>
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                    {isAuthenticated && (
                      <li>
                        <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                          Help & Support
                        </Link>
                      </li>
                    )}
                    {isAuthenticated && (
                      <li>
                        <button
                          className="logout-btn btn-primary-bg"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            handleLogout();
                          }}
                        >
                          Logout
                        </button>
                      </li>
                    )}
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

export default TenantNavBar;

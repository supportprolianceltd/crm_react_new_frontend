import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { updateEmployee } from "../CompanyDashboard/Employees/config/apiService";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const TermsAndConditions = () => {
  const { id } = useParams();
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const contentRef = useRef(null);

  // Check if user is logged in and load data appropriately
  useEffect(() => {
    // First, check localStorage
    let storedUserStr = localStorage.getItem("user");
    let accessToken = localStorage.getItem("accessToken");

    if (storedUserStr && accessToken) {
      const userData = JSON.parse(storedUserStr);
      setUser(userData);
      // If user already accepted terms, redirect to staff page
      if (userData.has_accepted_terms) {
        navigate(`/staff`, { replace: true });
        return;
      }
      return;
    }

    // If no local data, check sessionStorage for temp data (terms not accepted yet)
    const tempUserStr = sessionStorage.getItem("tempUser");
    const tempAccessToken = sessionStorage.getItem("tempAccessToken");

    if (!tempUserStr || !tempAccessToken) {
      navigate("/login", { replace: true });
      return;
    }

    const tempUserData = JSON.parse(tempUserStr);
    // Explicitly set has_accepted_terms to false since we're showing terms
    const userData = { ...tempUserData, has_accepted_terms: false };
    setUser(userData);
    // No need to check acceptance here as it's false
  }, [navigate]);

  // Check if user has scrolled to bottom
  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20;
      const totalScrollDistance = scrollHeight - clientHeight;
      const scrollPercentage = (scrollTop / totalScrollDistance) * 100;
      setIsScrolledToBottom(isAtBottom);
      setIsScrolled(scrollPercentage >= 95);
    }
  };

 // Initialize scroll handling and check initial position
  useEffect(() => {
    const contentElement = contentRef.current;
    if (contentElement) {
      // Check initial scroll position
      const initialCheck = () => {
        handleScroll();
      };

      // Add scroll listener
      contentElement.addEventListener("scroll", handleScroll);
      
      // Run initial check after a short delay to ensure content is rendered
      const timer = setTimeout(initialCheck, 300);

      // Add resize listener to handle window size changes
      window.addEventListener('resize', handleScroll);
      
      return () => {
        contentElement.removeEventListener("scroll", handleScroll);
        window.removeEventListener('resize', handleScroll);
        clearTimeout(timer);
      };
    }
  }, []);

  // Re-check scroll position when content changes
  useEffect(() => {
    if (contentRef.current) {
      handleScroll();
    }
  }, [user]);
  
  const handleAccept = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    console.log("Terms acceptance: Starting handleAccept for user", user.id);
    console.log("Temp tokens available:", !!sessionStorage.getItem("tempAccessToken"));
    console.log("Local tokens available:", !!localStorage.getItem("accessToken"));
    try {
      // Move temporary tokens to permanent storage if they exist (before API call so it can use them)
      const tempAccessToken = sessionStorage.getItem("tempAccessToken");
      if (tempAccessToken) {
        localStorage.setItem("accessToken", tempAccessToken);
        localStorage.setItem(
          "refreshToken",
          sessionStorage.getItem("tempRefreshToken")
        );
        localStorage.setItem(
          "tenantId",
          sessionStorage.getItem("tempTenantId")
        );
        localStorage.setItem(
          "tenantUniqueId",
          sessionStorage.getItem("tempTenantUniqueId")
        );
        localStorage.setItem(
          "tenantSchema",
          sessionStorage.getItem("tempTenantSchema")
        );
        localStorage.setItem(
          "tenantDomain",
          sessionStorage.getItem("tempTenantDomain")
        );
      }

      // Update the user's terms acceptance status
      console.log("Terms acceptance: Calling updateEmployee");
      await updateEmployee(user.id, { has_accepted_terms: true });
      console.log("Terms acceptance: updateEmployee succeeded");

      // Clear temporary storage after successful API call
      if (tempAccessToken) {
        [
          "tempAccessToken",
          "tempRefreshToken",
          "tempTenantId",
          "tempTenantUniqueId",
          "tempTenantSchema",
          "tempTenantDomain",
          "tempUser",
        ].forEach((key) => sessionStorage.removeItem(key));
      }

      // Update local user data with acceptance flag
      const updatedUser = { ...user, has_accepted_terms: true };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      navigate("/staff", { replace: true });
    } catch (err) {
      console.error("Terms acceptance error:", err);
      console.log("Terms acceptance: updateEmployee failed with error", err.response?.status, err.response?.data);
      setError("Failed to accept terms. Please try again.");
      // If token is invalid, redirect to login
      if (err.response?.status === 401) {
        console.log("Terms acceptance: 401 error, clearing storage and redirecting to login");
        // Clear all storage
        [
          "accessToken",
          "refreshToken",
          "tenantId",
          "tenantUniqueId",
          "tenantSchema",
          "tenantDomain",
          "user",
        ].forEach((key) => localStorage.removeItem(key));
        [
          "tempAccessToken",
          "tempRefreshToken",
          "tempTenantId",
          "tempTenantUniqueId",
          "tempTenantSchema",
          "tempTenantDomain",
          "tempUser",
        ].forEach((key) => sessionStorage.removeItem(key));
        navigate("/login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = () => {
    // Clear all authentication data from both storage locations
    [
      "accessToken",
      "refreshToken",
      "tenantId",
      "tenantUniqueId",
      "tenantSchema",
      "tenantDomain",
      "user",
    ].forEach((key) => localStorage.removeItem(key));
    [
      "tempAccessToken",
      "tempRefreshToken",
      "tempTenantId",
      "tempTenantUniqueId",
      "tempTenantSchema",
      "tempTenantDomain",
      "tempUser",
    ].forEach((key) => sessionStorage.removeItem(key));
    navigate("/login", { replace: true });
  };

  const scrollToBottom = () => {
    if (contentRef.current) {
      const scrollHeight = contentRef.current.scrollHeight;
      const clientHeight = contentRef.current.clientHeight;
      
      contentRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: "smooth",
      });
      setTimeout(() => {
        handleScroll();
      }, 1000);
    }
  };
  
  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setIsScrolledToBottom(false);
      setIsScrolled(false);
    }
  };  

  let scrollButton = null;
    if (isScrolledToBottom) {
      scrollButton = (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          className="terms-scroll-button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <span>Back to Top</span>
          <IoIosArrowUp />
        </motion.button>
      );
    } else {
      scrollButton = (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToBottom}
          className="terms-scroll-button scroll-to-bottom"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <span>Scroll to bottom</span>
          <IoIosArrowDown />
        </motion.button>
      );
    }

  if (!user) {
    return <div className="terms-loading">Loading...</div>;
  }

  return (
    <motion.div
      className="terms-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="terms-card"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="terms-header">
          <motion.h2
            className="terms-title"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            Terms and Conditions
          </motion.h2>
          <div className="terms-subtitle">Issue: 01; Date: 01.09.2025</div>
          <p className="terms-intro">
            By accessing or using the Platform, whether as a staff member or
            client, you agree to be legally bound by the terms herein.
          </p>
        </div>
        {/* Scrollable container */}
        <div ref={contentRef} className="terms-content">
          <h3>1. DEFINITIONS</h3>
          <ul>
            <li>
              <strong>User:</strong> Any person (including staff and clients)
              who has been granted access to the Platform.
            </li>
            <li>
              <strong>Client:</strong> A subscriber of the Platform services,
              either individual or organisation.
            </li>
            <li>
              <strong>Staff:</strong> Employees, contractors, or representatives
              of the Provider or Clients who are granted access to the Platform.
            </li>
            <li>
              <strong>Data:</strong> All information entered into, processed, or
              stored within the Platform.
            </li>
            <li>
              <strong>UK Data Protection Law:</strong> Includes the Data
              Protection Act 2018 and the UK GDPR.
            </li>
            <li>
              <strong>HIPAA:</strong> The Health Insurance Portability and
              Accountability Act of 1996, as applicable.
            </li>
          </ul>
          <h3>2. ACCEPTANCE OF TERMS</h3>
          <p>
            Access or use of the Platform is conditioned on your acceptance of
            and compliance with these Terms. If you do not agree with these
            Terms, you are prohibited from accessing or using the Platform.
          </p>
          <h3>3. LICENSE TO USE</h3>
          <p>
            Subject to compliance with these Terms, the Provider grants the User
            a limited, non-exclusive, non-transferable, revocable license to use
            the Platform solely for its intended purpose.
          </p>
          <h3>4. USER RESPONSIBILITIES</h3>
          <p>Users must:</p>
          <ul>
            <li>
              Provide accurate, current, and complete information when
              registering and using the Platform.
            </li>
            <li>
              Maintain confidentiality of login credentials and account
              information.
            </li>
            <li>
              Immediately notify the Provider of any unauthorized use or
              security breach.
            </li>
          </ul>
          <h3>5. PROHIBITED USES</h3>
          <p>
            Users are strictly prohibited from engaging in any of the following:
          </p>
          <h4>5.1 Tampering and Unauthorized Access</h4>
          <ul>
            <li>
              Modifying, decompiling, reverse engineering, disassembling, or
              tampering with any part of the Platform or its code.
            </li>
            <li>
              Attempting to gain unauthorized access to any part of the Platform
              or related systems or networks.
            </li>
            <li>
              Circumventing or attempting to circumvent security features or
              authentication mechanisms.
            </li>
          </ul>
          <h4>5.2 Data Misuse and Manipulation</h4>
          <ul>
            <li>
              Entering, uploading, or transmitting false, misleading, or
              fraudulent information.
            </li>
            <li>
              Manipulating, altering, or forging records, transactions, or
              system-generated reports.
            </li>
            <li>
              Misrepresenting data for personal, commercial, or organizational
              gain.
            </li>
          </ul>
          <h4>5.3 Malicious and Illegal Activity</h4>
          <ul>
            <li>
              Using the Platform to upload or distribute malware, viruses, or
              harmful code.
            </li>
            <li>
              Using the Platform to engage in or promote unlawful activity,
              including fraud, identity theft, or harassment.
            </li>
            <li>
              Using the Platform to infringe on the rights (including
              intellectual property rights) of others.
            </li>
          </ul>
          <h4>5.4 Misrepresentation and Impersonation</h4>
          <ul>
            <li>
              Impersonating any person or entity, or falsely stating affiliation
              with any person or entity.
            </li>
            <li>
              Falsifying information to gain unauthorized access or privileges.
            </li>
          </ul>
          <h4>5.5 Disruption</h4>
          <ul>
            <li>
              Engaging in actions that interfere with or disrupt the integrity
              or performance of the Platform.
            </li>
            <li>
              Launching automated systems (e.g., bots, spiders) that overload
              the Platform.
            </li>
          </ul>
          <h4>5.6 Misuse of Role-Based Permissions</h4>
          <ul>
            <li>
              Using administrative or privileged access to bypass or override
              audit trails, controls, or internal protocols without proper
              authorization.
            </li>
          </ul>
          <h3>6. COMPLIANCE WITH LAWS</h3>
          <h4>6.1 UK Laws</h4>
          <p>
            Users must comply with all applicable UK laws, including but not
            limited to:
          </p>
          <ul>
            <li>Data Protection Act 2018</li>
            <li>UK General Data Protection Regulation (UK GDPR)</li>
            <li>Computer Misuse Act 1990</li>
            <li>Equality Act 2010</li>
            <li>Bribery Act 2010</li>
          </ul>
          <h4>6.2 HIPAA Compliance (For Health Data Users)</h4>
          <p>
            Where the Platform is used to process Protected Health Information
            (PHI), the User agrees to:
          </p>
          <ul>
            <li>
              Comply with the HIPAA Privacy Rule, Security Rule, and Breach
              Notification Rule.
            </li>
            <li>
              Ensure that PHI is accessed, used, and disclosed only as
              permitted.
            </li>
            <li>
              Immediately report any data breach or suspected unauthorized
              access to PHI.
            </li>
          </ul>
          <h3>7. DATA PROTECTION AND PRIVACY</h3>
          <ul>
            <li>
              The Provider will process all personal data in accordance with its
              Privacy Policy and applicable data protection laws.
            </li>
            <li>
              The User agrees not to upload or store personal data of third
              parties unless it has obtained the necessary consents or lawful
              basis to do so.
            </li>
          </ul>
          <h3>8. INTELLECTUAL PROPERTY</h3>
          <p>
            All intellectual property rights in the Platform, including but not
            limited to source code, designs, and data architecture, remain the
            exclusive property of the Provider. Users are granted no ownership
            rights and must not copy, reproduce, or exploit any part of the
            Platform.
          </p>
          <h3>9. SUSPENSION AND TERMINATION</h3>
          <p>
            The Provider reserves the right to suspend or terminate access to
            the Platform, without prior notice, for:
          </p>
          <ul>
            <li>Breach of any provision in this Agreement.</li>
            <li>Suspicion or evidence of fraudulent or malicious activity.</li>
            <li>Legal or regulatory requirements.</li>
          </ul>
          <h3>10. AUDIT RIGHTS</h3>
          <p>
            The Provider reserves the right to audit usage and activity logs for
            compliance, including investigations into suspicious or unauthorized
            activity.
          </p>
          <h3>11. LIABILITY</h3>
          <p>
            The Platform is provided "as-is" without warranties. The Provider is
            not liable for:
          </p>
          <ul>
            <li>
              Any indirect, incidental, special, or consequential damages.
            </li>
            <li>
              Loss or corruption of data caused by the User's actions or
              negligence.
            </li>
            <li>
              User's failure to comply with applicable laws and regulations.
            </li>
          </ul>
          <h3>12. MODIFICATIONS</h3>
          <p>
            The Provider may update these Terms at any time. Continued use of
            the Platform after such modifications constitutes acceptance.
          </p>
          <h3>13. GOVERNING LAW</h3>
          <p>
            This Agreement shall be governed by and construed in accordance with
            the laws of England and Wales. Any disputes arising from this
            Agreement shall be subject to the exclusive jurisdiction of the
            English courts.
          </p>
          <h3>14. CONTACT INFORMATION</h3>
          <p>For questions or concerns about these Terms, please contact:</p>
          <address>
            <strong>E3 Operating Systems Ltd</strong>
            <br />
            Email: privacy@e3os.co.uk
            <br />
            Phone: <br />
            Address:
          </address>
          <div className="terms-signature">
            <p>
              By using the Platform, you confirm that you have read, understood,
              and agreed to be bound by these Terms and Conditions.
            </p>
          </div>
        </div>

        {scrollButton}

        <div className="terms-agreement">
          <motion.label
            className={`terms-checkbox ${isChecked ? "checked" : ""}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
            />
            <span className="checkmark"></span>I have read and agree to the
            terms and conditions
          </motion.label>
        </div>
        <div className="terms-actions">
          <motion.button
            whileHover={isChecked ? { scale: 1.05 } : {}}
            whileTap={isChecked ? { scale: 0.95 } : {}}
            onClick={handleAccept}
            disabled={!isChecked || loading}
            className={`terms-button terms-accept ${
              !isChecked ? "disabled" : ""
            }`}
          >
            {loading ? (
              <span className="terms-button-loading">
                <span className="spinner"></span>
                Accepting...
              </span>
            ) : (
              "Accept & Continue"
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDecline}
            disabled={loading}
            className="terms-button terms-decline"
          >
            Decline
          </motion.button>
        </div>
        {error && (
          <motion.p
            className="terms-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default TermsAndConditions;

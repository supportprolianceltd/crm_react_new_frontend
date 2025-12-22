import React from "react";
import { LogoWhiteIcon } from "../../assets/icons/LogoWhiteIcon";
import CompanyLogo1 from "../../assets/Img/company-logo1.png";
import CompanyLogo2 from "../../assets/Img/company-logo2.png";
import CompanyLogo3 from "../../assets/Img/company-logo3.png";
import CompanyLogo4 from "../../assets/Img/company-logo4.png";
import CompanyLogo5 from "../../assets/Img/company-logo5.png";
import CompanyLogo6 from "../../assets/Img/company-logo6.png";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-section">
        <div className="footer-brand">
          <LogoWhiteIcon />
          <p>
            Design amazing digital experiences that create more happy in the
            world.
          </p>
        </div>

        <div className="footer-content">
          <ul>
            <li className="footer-content-header">Company</li>
            <a href="/about">
              <li>About Us</li>
            </a>
            <Link to="/contact">
              <li>Contact</li>
            </Link>
          </ul>

          <ul>
            <li className="footer-content-header">Product</li>
            <Link to="/recruitment">
              <li>Recruitment</li>
            </Link>
            <Link to="/rostering">
              <li>Rostering</li>
            </Link>
            <Link to="/human-resources">
              <li>Human Resources</li>
            </Link>
            <Link to="/admin">
              <li>System Administrator</li>
            </Link>
            <Link to="/audit-compliance">
              <li>Audit & Compliance</li>
            </Link>
            <Link to="/training">
              <li>Training</li>
            </Link>
            <Link to="/assets-management">
              <li>Assets Management</li>
            </Link>
          </ul>

          <ul>
            <li className="footer-content-header">Legal</li>
            <li>Terms</li>
            <a href="privacy-policy">
              <li>Privacy</li>
            </a>
            <li>Cookies</li>
            {/* <li>Licenses</li>
                  <li>Settings</li> */}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 E3OS. All rights reserved.</p>

        {/* <div className="footer-socials">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M7.55016 21.7502C16.6045 21.7502 21.5583 14.2469 21.5583 7.74211C21.5583 7.53117 21.5536 7.31554 21.5442 7.1046C22.5079 6.40771 23.3395 5.5445 24 4.55554C23.1025 4.95484 22.1496 5.21563 21.1739 5.32898C22.2013 4.71315 22.9705 3.74572 23.3391 2.60601C22.3726 3.1788 21.3156 3.58286 20.2134 3.80085C19.4708 3.01181 18.489 2.48936 17.4197 2.3143C16.3504 2.13923 15.2532 2.32129 14.2977 2.83234C13.3423 3.34339 12.5818 4.15495 12.1338 5.14156C11.6859 6.12816 11.5754 7.23486 11.8195 8.29054C9.86249 8.19233 7.94794 7.68395 6.19998 6.79834C4.45203 5.91274 2.90969 4.66968 1.67297 3.14976C1.0444 4.23349 0.852057 5.51589 1.13503 6.73634C1.418 7.95678 2.15506 9.02369 3.19641 9.72023C2.41463 9.69541 1.64998 9.48492 0.965625 9.10617V9.1671C0.964925 10.3044 1.3581 11.4068 2.07831 12.287C2.79852 13.1672 3.80132 13.7708 4.91625 13.9952C4.19206 14.1934 3.43198 14.2222 2.69484 14.0796C3.00945 15.0577 3.62157 15.9131 4.44577 16.5266C5.26997 17.14 6.26512 17.4808 7.29234 17.5015C5.54842 18.8714 3.39417 19.6144 1.17656 19.6109C0.783287 19.6103 0.390399 19.5861 0 19.5387C2.25286 20.984 4.87353 21.7516 7.55016 21.7502Z"
                    fill="white"
                  />
                </svg>
    
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M22.2234 0H1.77187C0.792187 0 0 0.773438 0 1.72969V22.2656C0 23.2219 0.792187 24 1.77187 24H22.2234C23.2031 24 24 23.2219 24 22.2703V1.72969C24 0.773438 23.2031 0 22.2234 0ZM7.12031 20.4516H3.55781V8.99531H7.12031V20.4516ZM5.33906 7.43438C4.19531 7.43438 3.27188 6.51094 3.27188 5.37187C3.27188 4.23281 4.19531 3.30937 5.33906 3.30937C6.47813 3.30937 7.40156 4.23281 7.40156 5.37187C7.40156 6.50625 6.47813 7.43438 5.33906 7.43438ZM20.4516 20.4516H16.8937V14.8828C16.8937 13.5562 16.8703 11.8453 15.0422 11.8453C13.1906 11.8453 12.9094 13.2937 12.9094 14.7891V20.4516H9.35625V8.99531H12.7687V10.5609H12.8156C13.2891 9.66094 14.4516 8.70938 16.1813 8.70938C19.7859 8.70938 20.4516 11.0813 20.4516 14.1656V20.4516Z"
                    fill="white"
                  />
                </svg>
    
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <g clip-path="url(#clip0_2776_73735)">
                    <path
                      d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.3882 22.954 10.125 23.8542V15.4688H7.07812V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9701 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.34 7.875 13.875 8.80008 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_2776_73735">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div> */}
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';
import './Footer.css';
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube
} from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row align-items-center footer-content">
          {/* Left: Copyright */}
          <div className="col-12 col-md-4 text-md-start text-center copyright">
            &copy; {new Date().getFullYear()} LMS Pro, All rights reserved
          </div>

          {/* Center: Privacy + Company */}
          <div className="col-12 col-md-4 text-center footer-center">
            <a href="/privacy-policy" className="footer-link">Privacy Policy</a>
            <span className="company-name"> | LMS Pro</span>
          </div>

          {/* Right: Social Icons */}
          <div className="col-12 col-md-4 d-flex justify-content-center justify-content-md-end social-icons">
            <a href="https://web.facebook.com/GirlCodeZA/?_rdc=1&_rdr#" aria-label="Facebook"><FaFacebook /></a>
            <a href="https://x.com/GirlCode_za" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://www.instagram.com/girlcode_za/" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://www.linkedin.com/company/girlcodeza/posts/?feedView=all" aria-label="LinkedIn"><FaLinkedinIn /></a>
            <a href="https://www.youtube.com/@GirlCodeZA" aria-label="YouTube"><FaYoutube /></a>
            <a href="https://www.tiktok.com/@girlcodeza" aria-label="TikTok"><SiTiktok /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

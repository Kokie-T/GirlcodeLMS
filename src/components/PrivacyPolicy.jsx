
import React from "react";
import { Link } from "react-router-dom";
import "./PrivacyPolicy.css";

export default function PrivacyPolicy() {
  return (
    <div className="privacy-container">
      <div className="privacy-card">
        <h2 className="mb-3">Privacy Policy</h2>
        <p>
          At LMS Pro, we value your privacy. This policy explains how we collect, use, and protect your information.
        </p>
        <h4>1. Information Collection</h4>
        <p>We collect personal information such as name, email, and usage data to improve your learning experience.</p>

        <h4>2. Use of Information</h4>
        <p>Your information is used to personalize content, track progress, and provide support.</p>

        <h4>3. Data Security</h4>
        <p>We implement reasonable measures to protect your data against unauthorized access or disclosure.</p>

        <h4>4. Sharing of Information</h4>
        <p>We do not sell your personal data. Information may be shared only with trusted service providers.</p>

        <h4>5. Changes to Policy</h4>
        <p>We may update this privacy policy occasionally. Users will be notified of major changes.</p>

        <p className="text-center mt-3">
          <Link to="/">Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

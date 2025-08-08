import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy container py-5">
      <h1 className="mb-4">Privacy Policy</h1>
      <p>
        At LMS Pro, your privacy is important to us. This Privacy Policy outlines the
        types of personal information we collect, how we use it, and how we safeguard it.
      </p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li>Personal details like name, email address, phone number</li>
        <li>Learning progress and activity</li>
        <li>Communication history with facilitators</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To create and manage user accounts</li>
        <li>To personalize learning experiences</li>
        <li>To communicate important announcements and updates</li>
        <li>To comply with legal obligations (e.g., POPIA compliance)</li>
      </ul>

      <h2>3. Data Security</h2>
      <p>
        We use industry-standard measures to protect your data from unauthorized access,
        alteration, or disclosure.
      </p>

      <h2>4. POPI Act Compliance</h2>
      <p>
        LMS Pro is fully compliant with the Protection of Personal Information Act (POPIA). Users
        are required to accept the POPIA terms during account creation.
      </p>

      <h2>5. Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us at
        privacy@lmspro.co.za.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
// src/pages/LandingPage.jsx
import React, { useState } from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import CTA from '../components/CTA';
import SignUp from './SignUp'; // Import the signup modal component

function LandingPage() {
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  // Function to pass to child components for triggering signup
  const handleSignupClick = () => {
    setIsSignupOpen(true);
  };

  return (
    <main>
      {/* Pass signup handler to components that need it */}
      <Hero onSignupClick={handleSignupClick} />
      <Features />
      <CTA onSignupClick={handleSignupClick} />
      
      {/* Signup Modal (conditionally rendered) */}
      {isSignupOpen && (
        <SignUp 
          onClose={() => setIsSignupOpen(false)} 
        />
      )}
    </main>
  );
}

export default LandingPage;
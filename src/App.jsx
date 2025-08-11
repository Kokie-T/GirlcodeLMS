import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';

import SignUp from './pages/SignUp';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import CourseContent from './pages/CourseContent';

import FacilitatorDashboard from './pages/FacilitatorDashboard';
import LearnerDashboard from './pages/LearnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Learnerprofile from './pages/Learnerprofile';
import MyCourses from './pages/MyCourses';  // <---- Import added here
import Help from './pages/Help';

function AppContent() {
  const location = useLocation();

  const showLayout = location.pathname === "/";

  return (
    <>
      {showLayout && <Header />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/course/:id" element={<CourseContent />} />

        {/* Dashboard routes */}
        <Route path="/facilitator-dashboard" element={<FacilitatorDashboard />} />
        <Route path="/learner-dashboard" element={<LearnerDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/learner-profile" element={<Learnerprofile />} />
        <Route path="/courses" element={<MyCourses />} />
        <Route path="/help" element={<Help />} />
      </Routes>
      {showLayout && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

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
import LearnerSettings from './pages/LearnerSettings';
import MyCourses from './pages/MyCourses';  // <---- Import added here
import Assessments from './pages/Assessments'; // create this page
import AssessmentDetail from './pages/AssessmentDetail';
import ManageCourses from './pages/ManageCourses';
import Help from './pages/Help';
import ManageQuizzes from './pages/ManageQuizzes';
import ManageStudents from './pages/ManageStudents';
import NotificationsPage from './pages/NotificationsPage'; // <-- Added import here
import ContactUs from "./pages/contact";
import QuizViewer from "./pages/QuizViewer"; // adjust path
import EnrollStudent from './pages/Enrollstudent';
import CourseManagementPage from "./components/CourseManagementPage";
import GradingPage from "./components/GradingPage";
import LearningMaterialsPage from "./components/LearningMaterialsPage";
import CalendarPage from "./components/CalendarPage";



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
        <Route path="/learner-settings" element={<LearnerSettings />} />
        <Route path="/courses" element={<MyCourses />} />
        <Route path="/assessments" element={<Assessments />} />
        <Route path="/assessments/:id" element={<AssessmentDetail />} />
        <Route path="/managecourses" element={<ManageCourses/>}/>
        <Route path="/managequizzes" element={<ManageQuizzes />} />
        <Route path="/courses" element={<MyCourses />} />
        <Route path="/course/:courseId/quiz" element={<QuizViewer />} />
        <Route path="/managestudents" element={<ManageStudents />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/enrollstudent" element={<EnrollStudent/>}/>
        <Route path="/help" element={<Help />}/>
        <Route path="/notifications" element={<NotificationsPage />} />

        <Route path="/courses" element={<CourseManagementPage/>} />
        <Route path="/grading" element={<GradingPage/>} />
        <Route path="/materials" element={<LearningMaterialsPage/>} />
        <Route path="/calendar" element={<CalendarPage/>} />
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

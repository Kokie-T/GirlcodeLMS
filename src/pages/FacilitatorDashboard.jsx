import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { db } from "../firebase";
import EnrollStudent from "./Enrollstudent";
import Settings from "./Settings";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import {
  FaBook,
  FaQuestionCircle,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

export default function FacilitatorDashboard() {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const [activeTab, setActiveTab] = useState("courses");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [students, setStudents] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  // --------------------- FETCH DATA ---------------------
// Fetch courses and quizzes (independent of courses)
useEffect(() => {
  if (!user) return;

  const fetchCourses = async () => {
    try {
      const q = query(collection(db, "courses"), where("facilitatorId", "==", user.uid));
      const snap = await getDocs(q);
      setCourses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const q = query(collection(db, "quizzes"), where("facilitatorId", "==", user.uid));
      const snap = await getDocs(q);
      setQuizzes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching quizzes:", err);
    }
  };

  fetchCourses();
  fetchQuizzes();
}, [user]);

// Fetch students **after courses are loaded**
useEffect(() => {
  if (!user || courses.length === 0) return;

  const fetchStudents = async () => {
    try {
      const courseIds = courses.map(c => c.id);
      const q = query(collection(db, "users"), where("courses", "array-contains-any", courseIds));
      const snap = await getDocs(q);
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  fetchStudents();
}, [user, courses]); // <-- run when courses change

// Fetch submissions (independent of courses)
useEffect(() => {
  if (!user) return;

  const fetchSubmissions = async () => {
    try {
      const q = query(
        collection(db, "submissions"),
        where("facilitatorId", "==", user.uid),
        orderBy("submittedAt", "desc")
      );
      const snap = await getDocs(q);
      setSubmissions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  fetchSubmissions();
}, [user]);


  // --------------------- LOGOUT ---------------------
  const confirmLogout = async () => {
     try {
       await signOut(auth);
     } catch (err) {
       console.warn("Sign out failed:", err);
     }
     localStorage.clear();
     setShowLogoutConfirm(false);
     navigate("/login");
   };
 
  // --------------------- RENDER TABS ---------------------
  const renderCoursesTab = () => {
    if (courses.length === 0) return <p className="text-gray-600">No courses yet.</p>;
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {courses.map(c => (
          <div
            key={c.id}
            className="bg-white p-5 rounded-lg shadow hover:shadow-md transition flex flex-col"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-gray-800 font-medium flex-1 truncate">{c.title}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/edit-course/${c.id}`)}
                  className="px-3 py-1 bg-blue-400 text-white rounded hover:bg-blue-500 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={async () => {
                    if (!window.confirm("Delete this course?")) return;
                    await deleteDoc(doc(db, "courses", c.id));
                    setCourses(prev => prev.filter(course => course.id !== c.id));
                  }}
                  className="px-3 py-1 bg-red-400 text-white rounded hover:bg-red-500 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm truncate">{c.description || "No description"}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderQuizzesTab = () => {
    if (quizzes.length === 0) return <p className="text-gray-600">No quizzes yet.</p>;
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {quizzes.map(q => (
          <div key={q.id} className="bg-white p-5 rounded-lg shadow flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-gray-800 font-medium flex-1 truncate">{q.title}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/edit-quiz/${q.id}`)}
                  className="px-3 py-1 bg-blue-400 text-white rounded hover:bg-blue-500 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={async () => {
                    if (!window.confirm("Delete this quiz?")) return;
                    await deleteDoc(doc(db, "quizzes", q.id));
                    setQuizzes(prev => prev.filter(quiz => quiz.id !== q.id));
                  }}
                  className="px-3 py-1 bg-red-400 text-white rounded hover:bg-red-500 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm truncate">{q.description || "No description"}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderStudentsTab = () => {
    if (students.length === 0) return <p className="text-gray-600">No students yet.</p>;
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
          <thead className="bg-blue-400 text-white">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="px-4 py-2">{s.fullname}</td>
                <td className="px-4 py-2">{s.email}</td>
                <td className="px-4 py-2 text-center">
                  <button className="px-3 py-1 bg-blue-400 text-white rounded hover:bg-blue-500 text-sm mr-2">
                    View
                  </button>
                  <button className="px-3 py-1 bg-red-400 text-white rounded hover:bg-red-500 text-sm">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  

  const renderSubmissionsTab = () => {
    if (submissions.length === 0) return <p className="text-gray-600">No submissions yet.</p>;
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
          <thead className="bg-pink-400 text-white">
            <tr>
              <th className="px-4 py-2">Student</th>
              <th className="px-4 py-2">Quiz</th>
              <th className="px-4 py-2">Score</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(sub => (
              <tr key={sub.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="px-4 py-2">{sub.studentName}</td>
                <td className="px-4 py-2">{sub.quizTitle}</td>
                <td className="px-4 py-2 text-center">{sub.score}%</td>
                <td className="px-4 py-2">{sub.submittedAt?.toDate().toLocaleString()}</td>
                <td className="px-4 py-2 text-center">
                  <button className="px-3 py-1 bg-blue-400 text-white rounded hover:bg-blue-500 text-sm">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "courses":
        return renderCoursesTab();
      case "quizzes":
        return renderQuizzesTab();
      case "students":
        return renderStudentsTab();
      case "enroll":
        return <EnrollStudent students={students} courses={courses}/>;
      case "submissions":
        return renderSubmissionsTab();
      case "settings":
        return <Settings/>;
      default:
        return renderCoursesTab();
    }
  };

  // --------------------- JSX ---------------------
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 h-full bg-gradient-to-br from-blue-600 via-cyan-400 to-teal-200 text-white flex flex-col p-5 transform transition-transform duration-300 ease-in-out z-50 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 w-60`}
      >
        <button
          className="md:hidden self-end text-2xl mb-4"
          onClick={() => setIsSidebarOpen(false)}
        >
          <FaTimes />
        </button>

        <h3 className="text-2xl font-bold text-center mb-8">Facilitator</h3>

        <button
          className={`flex items-center gap-3 px-4 py-2 rounded-lg mb-2 transition ${
            activeTab === "courses" ? "bg-white text-blue-600 font-semibold" : "hover:bg-white/20"
          }`}
          onClick={() => setActiveTab("courses")}
        >
          <FaBook /> Courses
        </button>
        <button
          className={`flex items-center gap-3 px-4 py-2 rounded-lg mb-2 transition ${
            activeTab === "quizzes" ? "bg-white text-blue-600 font-semibold" : "hover:bg-white/20"
          }`}
          onClick={() => setActiveTab("quizzes")}
        >
          <FaQuestionCircle /> Quizzes
        </button>
        <button
          className={`flex items-center gap-3 px-4 py-2 rounded-lg mb-2 transition ${
            activeTab === "students" ? "bg-white text-blue-600 font-semibold" : "hover:bg-white/20"
          }`}
          onClick={() => setActiveTab("students")}
        >
          <FaUsers /> Students
        </button>

        <button
          className={`flex items-center gap-3 px-4 py-2 rounded-lg mb-2 transition ${
           activeTab === "enroll" ? "bg-white text-blue-600 font-semibold" : "hover:bg-white/20"
          }`}
          onClick={() => setActiveTab("enroll")}
        >
          <FaUsers /> Enroll Student
       </button>

        <button
          className={`flex items-center gap-3 px-4 py-2 rounded-lg mb-2 transition ${
            activeTab === "submissions" ? "bg-white text-blue-600 font-semibold" : "hover:bg-white/20"
          }`}
          onClick={() => setActiveTab("submissions")}
        >
          <FaUsers /> Submissions
        </button>
        <button
          className={`flex items-center gap-3 px-4 py-2 rounded-lg mb-2 transition ${
            activeTab === "settings" ? "bg-white text-blue-600 font-semibold" : "hover:bg-white/20"
          }`}
          onClick={() => setActiveTab("settings")}
        >
          <FaCog /> Settings
        </button>

        <div className="flex-grow" />
        <button
          className="flex items-center gap-3 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition"
          onClick={() => setShowLogoutConfirm(true)}
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden mb-4 p-2 bg-blue-500 text-white rounded-lg"
          onClick={() => setIsSidebarOpen(true)}
        >
          <FaBars />
        </button>

        <h2 className="text-2xl font-bold mb-4 capitalize">{activeTab}</h2>
        <div className="bg-white rounded-xl shadow p-5">{renderContent()}</div>
      </div>

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <div className="flex-grow" />
              <button
               className="flex items-center gap-3 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition"
               onClick={() => setShowLogoutConfirm(true)}
                >
               <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

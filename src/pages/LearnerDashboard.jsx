import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  HiMenu,
  HiX,
  HiBell,
  HiChatAlt2,
  HiUser,
  HiHome,
  HiBookOpen,
  HiLogout,
} from "react-icons/hi";

// ---------- Sidebar Item ----------
const SidebarItem = ({ icon, name, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:scale-105 transition transform duration-200"
  >
    <span className="text-lg">{icon}</span>
    {name}
  </button>
);

// ---------- Course Card ----------
const CourseCard = ({ course, avgScore, history, expanded, onToggleExpand, onNavigate }) => {
  const isExpanded = expanded[course.id];
  const contentProgress = course.progress || 0;
  const totalWidth = Math.min(contentProgress + avgScore, 100);
  const contentWidth = Math.min(contentProgress, totalWidth);
  const quizWidth = Math.min(avgScore, totalWidth - contentWidth);

  return (
    <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl hover:-translate-y-1 transition-transform duration-300 ease-out flex flex-col gap-3">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-gray-800 font-medium">{course.title}</h3>
        <button
          onClick={() => onToggleExpand(course.id)}
          className="text-blue-500 text-sm"
        >
          {isExpanded ? "Hide History" : "Show History"}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden relative mb-2">
        <div
          className="absolute left-0 top-0 h-4 bg-blue-400 transition-all duration-700 ease-out"
          style={{ width: `${contentWidth}%` }}
        />
        <div
          className="absolute left-0 top-0 h-4 bg-pink-400 transition-all duration-700 ease-out opacity-70"
          style={{ width: `${quizWidth}%` }}
        />
      </div>
      <p className="text-sm text-gray-500 mb-3">
        Content: {contentProgress}%, Quiz Avg: {avgScore}%
      </p>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mb-2">
        <button
          onClick={() => onNavigate(`/quiz/${course.id}`)}
          className="px-3 py-1 bg-gradient-to-r from-blue-400 to-pink-400 text-white rounded-lg text-sm hover:opacity-90 hover:scale-105 transition transform duration-200"
        >
          Take Quiz
        </button>
        <button
          onClick={() => onNavigate(`/course-materials/${course.id}`)}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 hover:scale-105 transition transform duration-200"
        >
          Materials
        </button>
        <button
          onClick={() => onNavigate(`/messages/${course.id}`)}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 hover:scale-105 transition transform duration-200"
        >
          Messages
        </button>
      </div>

      {/* History */}
      {isExpanded && history.length > 0 && (
        <div className="mt-3 bg-gray-50 p-3 rounded-lg">
          <h4 className="font-semibold mb-2">Past Quiz Attempts</h4>
          <ul className="space-y-2 text-gray-700 text-sm">
            {history.map((attempt, idx) => (
              <li key={idx} className="flex justify-between border-b border-gray-200 pb-1">
                <span>Attempt {history.length - idx}</span>
                <span>
                  {attempt.score}% -{" "}
                  {attempt.date.toLocaleDateString()}{" "}
                  {attempt.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ---------- Learner Dashboard ----------
export default function LearnerDashboard() {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [formData, setFormData] = useState({ fullname: "", email: "" });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [results, setResults] = useState({});
  const [history, setHistory] = useState({});
  const [expanded, setExpanded] = useState({});
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // --- Fetch user profile ---
  useEffect(() => {
    if (!user) return;

    const fetchUser = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setFormData({ fullname: data.fullname || "", email: data.email || user.email });
        setAvatar(data.avatar || null);
      }
    };

    fetchUser();
  }, [user]);

  // --- Fetch enrolled courses from enrollments ---
  useEffect(() => {
    if (!user) return;

    const fetchCourses = async () => {
      try {
        const enrollSnap = await getDocs(
          query(collection(db, "enrollments"), where("studentId", "==", user.uid))
        );

        const courseIds = enrollSnap.docs.map(doc => doc.data().courseId);
        if (courseIds.length === 0) return setEnrolledCourses([]);

        const courses = [];
        for (let i = 0; i < courseIds.length; i += 10) {
          const batchIds = courseIds.slice(i, i + 10);
          const batchSnap = await getDocs(
            query(collection(db, "courses"), where("__name__", "in", batchIds))
          );

          batchSnap.docs.forEach(doc => {
            const enrollmentData = enrollSnap.docs.find(e => e.data().courseId === doc.id)?.data();
            courses.push({
              id: doc.id,
              title: doc.data().title || "Untitled Course",
              progress: enrollmentData?.progress || 0,
            });
          });
        }

        setEnrolledCourses(courses);
      } catch (err) {
        console.error("Failed to fetch enrolled courses:", err);
      }
    };

    fetchCourses();
  }, [user]);

  // --- Fetch quiz results ---
  useEffect(() => {
    if (!user) return;

    const fetchResults = async () => {
      const qResults = query(
        collection(db, "results"),
        where("userId", "==", user.uid),
        orderBy("takenAt", "desc")
      );
      const snap = await getDocs(qResults);

      const resMap = {};
      const histMap = {};
      snap.forEach(doc => {
        const data = doc.data();
        if (!histMap[data.courseId]) histMap[data.courseId] = [];
        histMap[data.courseId].push({ score: data.score, date: data.takenAt?.toDate?.() || new Date() });

        if (!resMap[data.courseId]) resMap[data.courseId] = { total: 0, count: 0 };
        resMap[data.courseId].total += data.score;
        resMap[data.courseId].count += 1;
      });

      Object.keys(resMap).forEach(id => {
        resMap[id] = Math.round(resMap[id].total / resMap[id].count);
      });

      setResults(resMap);
      setHistory(histMap);
    };

    fetchResults();
  }, [user]);

  // --- Avatar change ---
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      setAvatar(base64String);
      await updateDoc(doc(db, "users", user.uid), { avatar: base64String });
    };
    reader.readAsDataURL(file);
  };

  // --- Logout ---
  const confirmLogout = () => setShowLogoutModal(true);
  const handleLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", icon: <HiHome />, action: () => {} },
    { name: "My Courses", icon: <HiBookOpen />, action: () => navigate("/courses") },
    { name: "Messages", icon: <HiChatAlt2 />, action: () => navigate("/learner/messages") },
    { name: "Settings", icon: <HiUser />, action: () => navigate("/learner-settings") },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white shadow-lg flex flex-col justify-between transform transition-transform duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div>
          <h2 className="text-2xl font-bold text-center py-6 border-b text-gray-800">
            LMS Pro <br />
            <span className="text-sm text-gray-500">Learner Portal</span>
          </h2>
          <nav className="mt-6 flex flex-col gap-3 px-3">
            {menuItems.map((item, idx) => (
              <SidebarItem key={idx} icon={item.icon} name={item.name} onClick={item.action} />
            ))}
          </nav>
        </div>

        <div className="p-4 border-t">
          <button
            onClick={confirmLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-red-500 text-white hover:bg-red-600 rounded-lg"
          >
            <HiLogout /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Menu */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <HiX size={20} /> : <HiMenu size={20} />}
      </button>

      {/* Main Content */}
      <div className="flex-1 p-6 md:ml-64 overflow-y-auto">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-100 to-pink-100 p-6 rounded-xl mb-8 shadow-sm flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-800">
            Welcome back, {formData.fullname} 👋
          </h1>

          <div className="flex items-center space-x-4 relative">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-full hover:bg-gray-200 transition"
              >
                <HiBell size={28} className="text-red-500" />
                {notifications.some((n) => !n.seen) && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {notifications.filter((n) => !n.seen).length}
                  </span>
                )}
              </button>
            </div>

            {/* Avatar */}
            <div className="relative">
              <div onClick={() => setAvatarMenuOpen(!avatarMenuOpen)} className="cursor-pointer">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-xl border-2 border-white shadow">
                    {formData.fullname?.charAt(0).toUpperCase() || "L"}
                  </div>
                )}
              </div>

              {avatarMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => {
                      setAvatarMenuOpen(false);
                      navigate("/learner-settings");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <HiUser /> Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-red-500"
                  >
                    <HiLogout /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Courses */}
        <section className="grid md:grid-cols-2 gap-6">
          {enrolledCourses.length === 0 && (
            <p className="text-gray-600">You have not enrolled in any courses yet.</p>
          )}
          {enrolledCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              avgScore={results[course.id] ?? 0}
              history={history[course.id] ?? []}
              expanded={expanded}
              onToggleExpand={(id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))}
              onNavigate={navigate}
            />
          ))}
        </section>

        {/* Logout Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-80">
              <h3 className="text-lg font-semibold mb-4">Confirm Logout</h3>
              <p className="mb-6 text-gray-600">Are you sure you want to logout?</p>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

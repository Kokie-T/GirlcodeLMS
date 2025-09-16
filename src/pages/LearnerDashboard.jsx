import React, { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { FaTachometerAlt, FaBook, FaEnvelope, FaSignOutAlt, FaBars, FaTimes, FaCheckSquare, FaScrewdriver } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// ---------- Reusable Cards ----------
const StatsCard = ({ title, value, icon, color }) => (
  <div className={`flex items-center p-4 rounded-xl shadow hover:shadow-xl transition-transform transform hover:-translate-y-1 bg-white dark:bg-gray-800`}>
    <div className={`p-3 rounded-full ${color} text-white mr-4 text-xl`}>{icon}</div>
    <div>
      <h4 className="text-gray-500 dark:text-gray-300 text-sm">{title}</h4>
      <p className="text-gray-800 dark:text-white font-semibold text-lg">{value}</p>
    </div>
  </div>
);

const CourseCard = ({ course, avgScore, history, expanded, onToggleExpand, onNavigate }) => {
  const isExpanded = expanded[course.id];
  const contentProgress = course.progress || 0;
  const totalWidth = Math.min(contentProgress + avgScore, 100);
  const contentWidth = Math.min(contentProgress, totalWidth);
  const quizWidth = Math.min(avgScore, totalWidth - contentWidth);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-xl flex flex-col gap-3 transition-transform transform hover:-translate-y-1">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-gray-800 dark:text-white font-medium">{course.title}</h3>
        <button onClick={() => onToggleExpand(course.id)} className="text-blue-500 text-sm">
          {isExpanded ? "Hide History" : "Show History"}
        </button>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 h-4 rounded-full overflow-hidden relative mb-2">
        <div className="absolute left-0 top-0 h-4 bg-blue-400 transition-all duration-700 ease-out" style={{ width: `${contentWidth}%` }} />
        <div className="absolute left-0 top-0 h-4 bg-pink-400 opacity-70 transition-all duration-700 ease-out" style={{ width: `${quizWidth}%` }} />
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-300 mb-3">Content: {contentProgress}%, Quiz Avg: {avgScore}%</p>

      <div className="flex flex-wrap gap-2 mb-2">
        <button onClick={() => onNavigate(`/quiz/${course.id}`)} className="px-3 py-1 bg-gradient-to-r from-blue-400 to-pink-400 text-white rounded-lg text-sm hover:opacity-90 hover:scale-105 transition transform duration-200">Take Quiz</button>
        <button onClick={() => onNavigate(`/course-materials/${course.id}`)} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-105 transition transform duration-200">Materials</button>
      </div>

      {isExpanded && history.length > 0 && (
        <div className="mt-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
          <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">Past Quiz Attempts</h4>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
            {history.map((attempt, idx) => (
              <li key={idx} className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                <span>Attempt {history.length - idx}</span>
                <span>{attempt.score}% - {attempt.date.toLocaleDateString()} {attempt.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};


// ---------- Overlay Component ----------
const Overlay = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 relative" onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

export const ProfilePopup = ({ user, darkMode, setDarkMode, profileColor, setProfileColor, close }) => (
  <Overlay onClose={close}>
    <button className="absolute top-2 right-2 text-gray-500 dark:text-gray-200" onClick={close}><FaTimes /></button>
    <h2 className="text-lg font-semibold mb-4 dark:text-white">Update Profile</h2>
    <input type="text" value={user.fullname} readOnly className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" />
    <label className="flex items-center gap-2 mb-4 dark:text-white">
      <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} /> Dark Mode
    </label>
    <label className="flex items-center gap-2 mb-4 dark:text-white">
      Avatar Color: <input type="color" value={profileColor} onChange={e => setProfileColor(e.target.value)} />
    </label>
    <button onClick={close} className="bg-blue-500 text-white px-4 py-2 rounded hover:opacity-90">Save</button>
  </Overlay>
);

export const LogoutPopup = ({ onConfirm, onCancel }) => (
  <Overlay onClose={onCancel}>
    <h2 className="text-lg font-semibold mb-4 dark:text-white">Confirm Logout</h2>
    <p className="mb-6 dark:text-gray-300">Are you sure you want to log out?</p>
    <div className="flex justify-end gap-3">
      <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 dark:text-white">Cancel</button>
      <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600">Logout</button>
    </div>
  </Overlay>
);

// ---------- LearnerDashboard ----------
export default function LearnerDashboard() {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");
  const [formData, setFormData] = useState({ fullname: "", email: "" });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [results, setResults] = useState({});
  const [history, setHistory] = useState({});
  const [messages, setMessages] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [profilePopup, setProfilePopup] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [darkMode, setDarkMode] = useState(JSON.parse(localStorage.getItem("darkMode")) || false);
  const [profileColor, setProfileColor] = useState(localStorage.getItem("profileColor") || "#4F46E5");

  const sidebarItems = [
    { icon: <FaTachometerAlt />, label: "Dashboard", path: "/learner-dashboard" },
    { icon: <FaBook />, label: "My Courses", path: "/courses" },
    { icon: <FaEnvelope />, label: "Messages", path: "/learner/messages" },
    { icon: <FaScrewdriver />, label: "Settings", path: "/learner-settings"},
    ];
  // --- Fetch User ---
  useEffect(() => {
    if (!user) return;
    const fetchUser = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setFormData({ fullname: data.fullname || "", email: data.email || user.email });
      }
    };
    fetchUser();
  }, [user]);

  // --- Fetch Courses ---
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "enrollments"), where("studentId", "==", user.uid));
    const unsubscribe = onSnapshot(q, async snapshot => {
      const courseIds = snapshot.docs.map(d => d.data().courseId);
      if (!courseIds.length) return setEnrolledCourses([]);

      const courses = [];
      for (let i = 0; i < courseIds.length; i += 10) {
        const batch = courseIds.slice(i, i + 10);
        const batchDocs = await Promise.all(batch.map(id => getDoc(doc(db, "courses", id))));
        batchDocs.forEach(docSnap => {
          const enrollmentData = snapshot.docs.find(e => e.data().courseId === docSnap.id)?.data();
          courses.push({ id: docSnap.id, title: docSnap.data()?.title || "Untitled", progress: enrollmentData?.progress || 0 });
        });
      }
      setEnrolledCourses(courses);
    });
    return () => unsubscribe();
  }, [user]);

  // --- Fetch Results ---
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "results"), where("userId", "==", user.uid), orderBy("takenAt", "desc"));
    const unsubscribe = onSnapshot(q, snapshot => {
      const resMap = {};
      const histMap = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const takenAt = data.takenAt?.toDate?.() || new Date();
        if (!histMap[data.courseId]) histMap[data.courseId] = [];
        histMap[data.courseId].push({ score: data.score, date: takenAt });
        if (!resMap[data.courseId]) resMap[data.courseId] = { total: 0, count: 0 };
        resMap[data.courseId].total += data.score;
        resMap[data.courseId].count += 1;
      });
      Object.keys(resMap).forEach(id => resMap[id] = Math.round(resMap[id].total / resMap[id].count));
      setResults(resMap);
      setHistory(histMap);
    });
    return () => unsubscribe();
  }, [user]);

  // --- Fetch Messages ---
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "messages"), where("receiverId", "==", user.uid), orderBy("sentAt", "desc"));
    const unsubscribe = onSnapshot(q, snapshot => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [user]);

  // --- Dark Mode & Profile Color ---
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);
  useEffect(() => localStorage.setItem("profileColor", profileColor), [profileColor]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Sidebar */}
      <aside className={`fixed md:static top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col justify-between transition-transform duration-300 z-50 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div>
          <button className="md:hidden p-4 self-end text-xl" onClick={() => setSidebarOpen(false)}>
            <FaTimes className={darkMode ? "text-white" : ""} />
          </button>
          <h2 className="text-xl font-bold text-center py-6 border-b dark:border-gray-700 dark:text-white">
            LMS Pro <br />
            <span className="text-sm text-gray-500 dark:text-gray-300">Learner Portal</span>
          </h2>
          <nav className="mt-6 space-y-2">
            {sidebarItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => { setActivePage(item.label); navigate(item.path); setSidebarOpen(false); }}
                className={`flex items-center gap-3 w-full px-4 py-2 text-sm rounded-lg ${
                  activePage === item.label
                    ? "bg-blue-100 text-blue-600 font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t dark:border-gray-700">
          <button onClick={() => setShowLogoutPopup(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-red-500 text-white hover:bg-red-600 rounded-lg">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between mb-6">
          <button className="md:hidden p-2 bg-blue-500 text-white rounded-lg" onClick={() => setSidebarOpen(true)}>
            <FaBars />
          </button>
        </div>

        {profilePopup && <ProfilePopup user={formData} darkMode={darkMode} setDarkMode={setDarkMode} profileColor={profileColor} setProfileColor={setProfileColor} close={() => setProfilePopup(false)} />}
        {showLogoutPopup && <LogoutPopup onConfirm={handleLogout} onCancel={() => setShowLogoutPopup(false)} />}

        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-100 to-pink-100 p-6 rounded-xl shadow mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">Welcome back, {formData.fullname?.split(" ")[0] || "User"} 👋</h1>
            <p className="text-gray-500 dark:text-gray-300 mt-1">Here's your learning progress at a glance</p>
          </div>
          <button style={{ backgroundColor: profileColor }} className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" onClick={() => setProfilePopup(true)}>
            {formData.fullname?.charAt(0).toUpperCase() || "U"}
          </button>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatsCard title="Courses Enrolled" value={enrolledCourses.length} icon={<FaBook />} color="bg-blue-500" />
          <StatsCard title="Average Quiz Score" value={Object.keys(results).length ? Math.round(Object.values(results).reduce((a,b) => a+b,0)/Object.keys(results).length) : 0} icon={<FaCheckSquare />} color="bg-pink-500" />
          <StatsCard title="Quizzes Taken" value={Object.values(history).reduce((sum, arr) => sum + arr.length, 0)} icon={<FaTachometerAlt />} color="bg-green-500" />
        </section>

        {/* Courses */}
        <section className="grid md:grid-cols-2 gap-6 mb-6">
          {enrolledCourses.length === 0 && <p className="text-gray-600 dark:text-gray-300">You have not enrolled in any courses yet.</p>}
          {enrolledCourses.map(course => (
            <CourseCard key={course.id} course={course} avgScore={results[course.id] ?? 0} history={history[course.id] ?? []} expanded={expanded} onToggleExpand={id => setExpanded(prev => ({...prev, [id]: !prev[id]}))} onNavigate={navigate} />
          ))}
        </section>
      </main>
    </div>
  );
}

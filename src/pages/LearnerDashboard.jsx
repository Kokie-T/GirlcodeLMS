import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FaBook, FaCheckSquare, FaTachometerAlt, FaBars } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import LearnerSidebar from "../components/LearnerSidebar";

// ---------- Stats Card ----------
const StatsCard = ({ title, value, icon, color }) => (
  <div className="flex items-center p-4 rounded-xl shadow hover:shadow-xl bg-white dark:bg-gray-800">
    <div className={`p-3 rounded-full ${color} text-white mr-4 text-xl`}>{icon}</div>
    <div>
      <h4 className="text-gray-500 dark:text-gray-300 text-sm">{title}</h4>
      <p className="text-gray-800 dark:text-white font-semibold text-lg">{value}</p>
    </div>
  </div>
);

// ---------- Course Card ----------
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
        <div
          className="absolute left-0 top-0 h-4 bg-blue-400 transition-all duration-700 ease-out"
          style={{ width: `${contentWidth}%` }}
        />
        <div
          className="absolute left-0 top-0 h-4 bg-pink-400 opacity-70 transition-all duration-700 ease-out"
          style={{ width: `${quizWidth}%` }}
        />
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-300 mb-3">
        Content: {contentProgress}%, Quiz Avg: {avgScore}%
      </p>

      <div className="flex flex-wrap gap-2 mb-2">
        <button
          onClick={() => onNavigate(`/quiz/${course.id}`)}
          className="px-3 py-1 bg-gradient-to-r from-blue-400 to-pink-400 text-white rounded-lg text-sm hover:opacity-90 hover:scale-105 transition transform duration-200"
        >
          Take Quiz
        </button>
        <button
          onClick={() => onNavigate(`/course-materials/${course.id}`)}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-105 transition transform duration-200"
        >
          Materials
        </button>
      </div>

      {isExpanded && history.length > 0 && (
        <div className="mt-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
          <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">Past Quiz Attempts</h4>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
            {history.map((attempt, idx) => (
              <li key={idx} className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                <span>Attempt {history.length - idx}</span>
                <span>
                  {attempt.score}% - {attempt.date.toLocaleDateString()}{" "}
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

// ---------- Profile Popup ----------
const ProfilePopup = ({ formData, setFormData, darkMode, setDarkMode, profileColor, setProfileColor, userId, close }) => {
  const handleSave = async () => {
    await updateDoc(doc(db, "users", userId), {
      fullname: formData.fullname,
      darkMode,
      profileColor,
    });
    close();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 relative" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-2 right-2 text-gray-500 dark:text-gray-200" onClick={close}>×</button>
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Update Profile</h2>
        <label className="block mb-2 dark:text-white">Full Name</label>
        <input
          type="text"
          value={formData.fullname}
          onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
          className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white"
        />
        <label className="flex items-center gap-2 mb-4 dark:text-white">
          <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} /> Dark Mode
        </label>
        <label className="flex items-center gap-2 mb-4 dark:text-white">
          Avatar Color: <input type="color" value={profileColor} onChange={(e) => setProfileColor(e.target.value)} />
        </label>
        <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded hover:opacity-90">Save</button>
      </div>
    </div>
  );
};

// ---------- Learner Dashboard ----------
export default function LearnerDashboard() {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");
  const [formData, setFormData] = useState({ fullname: "", email: "", avatar: "" });
  const [enrolledCourses, setEnrolledCourses] = useState(null); // null = fetching
  const [results, setResults] = useState({});
  const [history, setHistory] = useState({});
  const [expanded, setExpanded] = useState({});
  const [profilePopup, setProfilePopup] = useState(false);
  const [darkMode, setDarkMode] = useState(JSON.parse(localStorage.getItem("darkMode")) || false);
  const [profileColor, setProfileColor] = useState(localStorage.getItem("profileColor") || "#e546c5ff");
  const [events, setEvents] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Fetch user data
  useEffect(() => {
    if (!user) return;
    const fetchUser = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setFormData({
          fullname: data.fullname || "",
          email: data.email || user.email,
          avatar: data.avatar || "",
        });
      }
    };
    fetchUser();
  }, [user]);

  // Dark mode
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);
  useEffect(() => localStorage.setItem("profileColor", profileColor), [profileColor]);

  // Fetch enrolled courses
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "enrollments"), where("studentId", "==", user.uid));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        setEnrolledCourses([]); // truly no courses
        return;
      }

      const courses = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const courseRef = await getDoc(doc(db, "courses", data.courseId));
          return {
            id: courseRef.id,
            title: courseRef.exists() ? courseRef.data().title : "Untitled",
            progress: data.progress || 0,
          };
        })
      );

      setEnrolledCourses(courses);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) return null;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <LearnerSidebar
        activePage={activePage}
        setActivePage={setActivePage}
        darkMode={darkMode}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <main className={`flex-1 p-6 overflow-y-auto transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"} md:ml-64`}>
        {/* Mobile toggle */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <button className="p-2 bg-blue-500 text-white rounded-lg" onClick={() => setSidebarOpen(true)}>
            <FaBars />
          </button>
        </div>

        {/* Profile Popup */}
        {profilePopup && (
          <ProfilePopup
            formData={formData}
            setFormData={setFormData}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            profileColor={profileColor}
            setProfileColor={setProfileColor}
            userId={user.uid}
            close={() => setProfilePopup(false)}
          />
        )}

        {/* Dashboard Header */}
        {activePage !== "Calendar" && (
          <div className="bg-gradient-to-r from-blue-100 to-pink-100 p-6 rounded-xl shadow mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                Welcome back, {formData.fullname?.split(" ")[0] || "User"} 👋
              </h1>
              <p className="text-gray-500 dark:text-gray-300 mt-1">Here's your learning progress at a glance</p>
            </div>
            <button
              onClick={() => setProfilePopup(true)}
              className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: profileColor }}
            >
              {formData.avatar ? (
                <img src={formData.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-lg">{formData.fullname?.charAt(0) || "U"}</span>
              )}
            </button>
          </div>
        )}

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatsCard title="Courses Enrolled" value={enrolledCourses?.length || 0} icon={<FaBook />} color="bg-blue-500" />
          <StatsCard
            title="Average Quiz Score"
            value={Object.keys(results).length ? Math.round(Object.values(results).reduce((a, b) => a + b, 0) / Object.keys(results).length) : 0}
            icon={<FaCheckSquare />}
            color="bg-pink-500"
          />
          <StatsCard
            title="Quizzes Taken"
            value={Object.values(history).reduce((sum, arr) => sum + arr.length, 0)}
            icon={<FaTachometerAlt />}
            color="bg-green-500"
          />
        </section>

        {/* Courses */}
        <section className="grid md:grid-cols-2 gap-6 mb-6">
          {enrolledCourses?.length === 0 && (
            <p className="text-gray-600 dark:text-gray-300">You have not enrolled in any courses yet.</p>
          )}

          {enrolledCourses?.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              avgScore={results[course.id] ?? 0}
              history={history[course.id] ?? []}
              expanded={expanded}
              onToggleExpand={id => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))}
              onNavigate={navigate}
            />
          ))}
        </section>

        {/* Calendar */}
        {activePage === "Calendar" && (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 dark:text-white text-center">📅 My Calendar</h1>
            <Calendar
              value={calendarDate}
              onChange={setCalendarDate}
              className="rounded-lg shadow-lg w-full"
              tileClassName={({ date, view }) =>
                view === "month" && events.map((ev) => ev.start.toDateString()).includes(date.toDateString())
                  ? "bg-blue-500 text-white rounded-full"
                  : null
              }
            />
            <div className="mt-4 space-y-2">
              {events.filter((ev) => ev.start.toDateString() === calendarDate.toDateString()).map((ev, idx) => (
                <div key={idx} className="p-3 rounded bg-blue-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                  <p className="font-medium">{ev.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{ev.type}</p>
                </div>
              ))}
              {events.filter((ev) => ev.start.toDateString() === calendarDate.toDateString()).length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 italic">No events</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

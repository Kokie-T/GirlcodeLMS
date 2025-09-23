import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
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

export default function LearnerDashboard() {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");
  const [formData, setFormData] = useState({ fullname: "", email: "", avatar: "" });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [results, setResults] = useState({});
  const [history, setHistory] = useState({});
  const [expandedCourses, setExpandedCourses] = useState({});
  const [expandedModules, setExpandedModules] = useState({});
  const [darkMode, setDarkMode] = useState(JSON.parse(localStorage.getItem("darkMode")) || false);
  const [profileColor, setProfileColor] = useState(localStorage.getItem("profileColor") || "#e546c5ff");
  const [courseModules, setCourseModules] = useState({});

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
        setEnrolledCourses([]);
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

      // Fetch modules & content for each course
      courses.forEach(async (course) => {
        const modulesSnap = await getDocs(collection(db, "courses", course.id, "modules"));
        const modulesData = await Promise.all(
          modulesSnap.docs.map(async (modDoc) => {
            const modData = modDoc.data();

            // Content
            const contentSnap = await getDocs(
              collection(db, "courses", course.id, "modules", modDoc.id, "content")
            );
            const contentData = contentSnap.docs.map((c) => ({ id: c.id, ...c.data() }));

            // Quizzes from questionLibraries
            const quizSnap = await getDocs(
              query(
                collection(db, "questionLibraries"),
                where("courseId", "==", course.id),
                where("moduleId", "==", modDoc.id)
              )
            );
            const quizzes = quizSnap.docs.map((q) => ({ id: q.id, ...q.data() }));

            return {
              id: modDoc.id,
              title: modData.title,
              content: contentData,
              quizzes,
            };
          })
        );
        setCourseModules((prev) => ({ ...prev, [course.id]: modulesData }));
      });
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) return null;

  return (
    <div className="flex h-screen">
      <LearnerSidebar
        activePage={activePage}
        setActivePage={setActivePage}
        darkMode={darkMode}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <main
        className={`flex-1 p-6 overflow-y-auto transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        } md:ml-64`}
      >
        {/* Mobile toggle */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <button
            className="p-2 bg-blue-500 text-white rounded-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <FaBars />
          </button>
        </div>

        {/* Dashboard Header */}
        {activePage !== "Calendar" && (
          <div className="bg-gradient-to-r from-blue-100 to-pink-100 p-6 rounded-xl shadow mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                Welcome back, {formData.fullname?.split(" ")[0] || "User"} 👋
              </h1>
              <p className="text-gray-500 dark:text-gray-300 mt-1">
                Here's your learning progress at a glance
              </p>
            </div>
            <button
              className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: profileColor }}
            >
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {formData.fullname?.charAt(0) || "U"}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatsCard
            title="Courses Enrolled"
            value={enrolledCourses?.length || 0}
            icon={<FaBook />}
            color="bg-blue-500"
          />
          <StatsCard
            title="Average Quiz Score"
            value={
              Object.keys(results).length
                ? Math.round(
                    Object.values(results).reduce((a, b) => a + b, 0) /
                      Object.keys(results).length
                  )
                : 0
            }
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

        {/* Courses & Modules */}
        <section className="grid md:grid-cols-2 gap-6">
          {enrolledCourses.length === 0 && <p className="text-gray-600 dark:text-gray-300">You have not enrolled in any courses yet.</p>}

          {enrolledCourses.map((course) => (
            <div key={course.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-xl flex flex-col gap-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-gray-800 dark:text-white font-medium">{course.title}</h3>
                <button
                  className="text-blue-500 text-sm"
                  onClick={() =>
                    setExpandedCourses((prev) => ({ ...prev, [course.id]: !prev[course.id] }))
                  }
                >
                  {expandedCourses[course.id] ? "Hide Modules" : "View Modules"}
                </button>
              </div>

              {/* Modules */}
              {expandedCourses[course.id] &&
                courseModules[course.id]?.map((mod) => {
                  const totalItems = (mod.content?.length || 0) + (mod.quizzes?.length || 0);
                  const completedContent = mod.content?.filter((c) => history[c.id]?.completed).length || 0;
                  const completedQuizzes = mod.quizzes?.filter((q) => history[q.id]?.completed).length || 0;
                  const completedItems = completedContent + completedQuizzes;
                  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

                  return (
                    <div key={mod.id} className="border rounded p-3 bg-gray-50 dark:bg-gray-900 mb-2">
                      <div className="flex justify-between items-center cursor-pointer">
                        <h4 className="font-semibold">{mod.title}</h4>
                        <button
                          className="text-blue-400 text-sm"
                          onClick={() =>
                            setExpandedModules((prev) => ({ ...prev, [mod.id]: !prev[mod.id] }))
                          }
                        >
                          {expandedModules[mod.id] ? "Hide" : "Show"}
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{progress}% completed</p>

                      {/* Module Content */}
                      {expandedModules[mod.id] && (
                        <div className="mt-2">
                          {mod.content?.map((c) => (
                            <div key={c.id} className="mb-1 flex justify-between items-center">
                              <span>{c.title}</span>
                              {c.type === "text" && (
                                <button
                                  className="text-blue-500"
                                  onClick={() => {
                                    const blob = new Blob([c.text], { type: "text/plain" });
                                    const url = URL.createObjectURL(blob);
                                    window.open(url, "_blank");
                                    URL.revokeObjectURL(url);
                                  }}
                                >
                                  View
                                </button>
                              )}
                              {c.type === "file" && c.fileURL && (
                                <a href={c.fileURL} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                  Download
                                </a>
                              )}
                            </div>
                          ))}

                          {/* Quizzes */}
                          {mod.quizzes?.length > 0 && (
                            <div className="mt-2">
                              <h5 className="font-semibold text-gray-700 dark:text-gray-300">Quizzes</h5>
                              <ul className="list-disc list-inside ml-4">
                                {mod.quizzes.map((q) => (
                                  <li key={q.id}>
                                    <button
                                      onClick={() => navigate(`/quiz/${course.id}/${q.id}`)}
                                      className="text-pink-500 hover:underline"
                                    >
                                      {q.target} ({q.type})
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          ))}
        </section>

        {/* Calendar */}
        {activePage === "Calendar" && (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 dark:text-white text-center">
              📅 My Calendar
            </h1>
            <Calendar className="rounded-lg shadow-lg w-full" />
          </div>
        )}
      </main>
    </div>
  );
}

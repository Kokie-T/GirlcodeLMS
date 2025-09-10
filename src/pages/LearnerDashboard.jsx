import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { HiOutlineHome, HiOutlineBookOpen, HiOutlineUser, HiOutlineLogout, HiMenu, HiX, HiBell, HiChatAlt2 } from "react-icons/hi";

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
  const [msgOpen, setMsgOpen] = useState(false);
  const [notifSeen, setNotifSeen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loading, setLoading] = useState(true);

  const notifRef = useRef(null);
  const msgRef = useRef(null);
  const avatarInputRef = useRef(null);

  const notifications = [
    "New lesson added to UI/UX Design Principles",
    "Your assignment for Data Analysis is due tomorrow",
  ];

  const messages = [
    { from: "Instructor Jane", text: "Don't forget the webinar tomorrow!" },
    { from: "Admin", text: "Your profile has been updated." },
  ];

  const menuItems = [
    { name: "Dashboard", icon: <HiOutlineHome />, path: "/learner-dashboard" },
    { name: "My Courses", icon: <HiOutlineBookOpen />, path: "/courses" },
    { name: "Settings", icon: <HiOutlineUser />, path: "/learner-settings" },
    { name: "Logout", icon: <HiOutlineLogout />, action: () => setShowLogoutConfirm(true) },
  ];

  // Fetch learner data from Firestore
  useEffect(() => {
    if (!user) return;

    const fetchLearnerData = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setFormData({ fullname: data.fullname || "", email: data.email || user.email });
          setAvatar(data.avatar || null);
          setEnrolledCourses(data.courses || []);
        } else {
          // Create default document if none exists
          await setDoc(userRef, {
            fullname: user.displayName || "",
            email: user.email,
            avatar: "",
            courses: [],
          });
        }

        // Fetch quiz results
        const qResults = query(
          collection(db, "results"),
          where("userId", "==", user.uid),
          orderBy("takenAt", "desc")
        );
        const resultSnap = await getDocs(qResults);

        let resMap = {};
        let historyMap = {};
        resultSnap.forEach((doc) => {
          const data = doc.data();
          if (!historyMap[data.courseId]) historyMap[data.courseId] = [];
          historyMap[data.courseId].push({ score: data.score, date: data.takenAt?.toDate?.() || new Date() });

          if (!resMap[data.courseId]) resMap[data.courseId] = { total: 0, count: 0 };
          resMap[data.courseId].total += data.score;
          resMap[data.courseId].count += 1;
        });

        Object.keys(resMap).forEach((courseId) => {
          resMap[courseId] = Math.round(resMap[courseId].total / resMap[courseId].count);
        });

        setResults(resMap);
        setHistory(historyMap);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching learner data:", err);
        setLoading(false);
      }
    };

    fetchLearnerData();
  }, [user]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      setAvatar(base64String);

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { avatar: base64String });
    };
    reader.readAsDataURL(file);
  };

  const handleProfileUpdate = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { fullname: formData.fullname });
    alert("Profile updated successfully!");
  };

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


  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-blue-100 to-pink-100 shadow-lg p-5 transform transition-transform duration-300 z-50 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">My LMS</h2>
        <nav className="space-y-3">
          {menuItems.map((item, idx) => (
            <button key={idx} onClick={() => { item.action ? item.action() : navigate(item.path); setSidebarOpen(false); }} className="flex items-center gap-3 w-full p-2 rounded-lg text-gray-700 hover:bg-white hover:shadow transition">
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Menu */}
      <button className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <HiX size={20} /> : <HiMenu size={20} />}
      </button>

      {/* Dashboard Content */}
      <div className="flex-1 p-6 md:ml-64">
        <header className="bg-gradient-to-r from-blue-100 to-pink-100 p-6 rounded-xl mb-8 shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Welcome back, {formData.fullname || "Learner"} 👋</h1>
            <p className="text-gray-600 mt-1">Here’s your learning progress at a glance</p>
          </div>

          <div className="flex items-center space-x-5 relative">
            {/* Avatar */}
            <div onClick={() => avatarInputRef.current && avatarInputRef.current.click()}>
              {avatar ? <img src={avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover cursor-pointer border-2 border-white shadow" /> : <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-xl cursor-pointer border-2 border-white shadow">{formData.fullname?.charAt(0).toUpperCase() || "L"}</div>}
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>
        </header>

        {/* Courses Grid */}
        <section className="grid md:grid-cols-2 gap-6">
          {enrolledCourses.length === 0 && <p>You have not enrolled in any courses yet.</p>}
          {enrolledCourses.map((courses) => {
            const avgScore = results[courses.id] ?? 0;
            const courseHistory = history[courses.id] ?? [];
            const isExpanded = expanded[courses.id];
            const contentProgress = courses.progress || 0;
            const totalWidth = Math.min(contentProgress + avgScore, 100);
            const contentWidth = Math.min(contentProgress, totalWidth);
            const quizWidth = Math.min(avgScore, totalWidth - contentWidth);

            return (
              <div key={course.id} className="bg-white p-5 rounded-lg shadow hover:shadow-md transition">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-gray-800 font-medium">{courses.title}</h3>
                  <button onClick={() => setExpanded(prev => ({ ...prev, [courses.id]: !prev[courses.id] }))} className="text-blue-500 text-sm">{isExpanded ? "Hide History" : "Show History"}</button>
                </div>

                <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden relative mb-2">
                  <div className="absolute left-0 top-0 h-4 bg-blue-400 transition-all duration-700 ease-out" style={{ width: `${contentWidth}%` }} />
                  <div className="absolute left-0 top-0 h-4 bg-pink-400 transition-all duration-700 ease-out opacity-70" style={{ width: `${quizWidth}%` }} />
                </div>
                <p className="text-sm text-gray-500 mb-3">Content: {contentProgress}%, Quiz Avg: {avgScore}%</p>

                <button onClick={() => navigate(`/quiz/${courses.id}`)} className="w-full bg-gradient-to-r from-blue-400 to-pink-400 text-white py-2 rounded-lg hover:opacity-90 transition mb-2">Take Quiz</button>

                {isExpanded && courseHistory.length > 0 && (
                  <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold mb-2">Past Quiz Attempts</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      {courseHistory.map((attempt, idx) => (
                        <li key={idx} className="flex justify-between border-b border-gray-200 pb-1">
                          <span>Attempt {courseHistory.length - idx}</span>
                          <span>{attempt.score}% - {attempt.date.toLocaleDateString()} {attempt.date.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {isExpanded && courseHistory.length === 0 && <p className="mt-2 text-gray-500 text-sm">No quiz attempts yet.</p>}
              </div>
            );
          })}
        </section>
      </div>

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition">Cancel</button>
              <button onClick={confirmLogout} className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition">Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

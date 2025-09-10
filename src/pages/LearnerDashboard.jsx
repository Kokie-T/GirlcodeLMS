import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import {
  HiOutlineHome,
  HiOutlineBookOpen,
  HiOutlineUser,
  HiOutlineLogout,
  HiMenu,
  HiX,
  HiBell,
  HiChatAlt2,
} from "react-icons/hi";

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
  const [notifications, setNotifications] = useState([]);
  const [facilitators, setFacilitators] = useState([]);
  const [selectedFacilitator, setSelectedFacilitator] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const avatarInputRef = useRef(null);

  // --- Fetch notifications ---
  useEffect(() => {
    if (!user) return;

    const notifQ = query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("createdAt", "desc")
    );
    const unsubNotif = onSnapshot(notifQ, (snap) => {
      setNotifications(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubNotif();
  }, [user]);

  // --- Fetch enrolled courses, results, history, and facilitators ---
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Learner profile
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setFormData({ fullname: data.fullname || "", email: data.email || user.email });
          setAvatar(data.avatar || null);
          setEnrolledCourses(data.courses || []);
        }

        // Quiz results
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

        // Fetch facilitators
        const facQ = query(collection(db, "users"), where("role", "==", "facilitator"));
        const facSnap = await getDocs(facQ);
        const facList = facSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFacilitators(facList);

      } catch (err) {
        console.error("Error fetching learner data:", err);
      }
    };

    fetchData();
  }, [user]);

  // --- Fetch chat messages for selected facilitator ---
  useEffect(() => {
    if (!selectedFacilitator || !user) return;

    const chatQ = query(
      collection(db, "users", selectedFacilitator.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(chatQ, (snap) => {
      const msgs = snap.docs
        .filter(doc => doc.data().fromId === user.uid || doc.data().fromId === selectedFacilitator.id)
        .map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsub();
  }, [selectedFacilitator, user]);

  // --- Send message ---
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedFacilitator) return;

    try {
      await addDoc(
        collection(db, "users", selectedFacilitator.id, "messages"),
        {
          from: formData.fullname,
          fromId: user.uid,
          text: newMessage,
          createdAt: serverTimestamp(),
          seen: false,
        }
      );
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

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

  const confirmLogout = async () => {
    await signOut(auth);
    localStorage.clear();
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", icon: <HiOutlineHome />, path: "/learner-dashboard" },
    { name: "My Courses", icon: <HiOutlineBookOpen />, path: "/courses" },
    { name: "Settings", icon: <HiOutlineUser />, path: "/learner-settings" },
    { name: "Logout", icon: <HiOutlineLogout />, action: () => confirmLogout() },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-blue-100 to-pink-100 shadow-lg p-5 transform transition-transform duration-300 z-50 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">My LMS</h2>
        <nav className="space-y-3">
          {menuItems.map((item, idx) => (
            <button key={idx} onClick={() => item.action ? item.action() : navigate(item.path)} className="flex items-center gap-3 w-full p-2 rounded-lg text-gray-700 hover:bg-white hover:shadow transition">
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

      {/* Main Content */}
      <div className="flex-1 p-6 md:ml-64">
        <header className="bg-gradient-to-r from-blue-100 to-pink-100 p-6 rounded-xl mb-8 shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Welcome back, {formData.fullname} 👋</h1>
            <p className="text-gray-600 mt-1">Here’s your learning progress at a glance</p>
          </div>

          <div className="flex items-center space-x-4 relative">
            {/* Notifications */}
            <div className="relative">
              <button onClick={() => { setNotifOpen(!notifOpen); setMsgOpen(false); }} className="relative p-2 rounded-full hover:bg-gray-200 transition">
                <HiBell size={24} className="text-gray-700" />
                {notifications.some(n => !n.seen) && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{notifications.filter(n => !n.seen).length}</span>
                )}
              </button>
            </div>

            {/* Messages */}
            <div className="relative">
              <button onClick={() => { setMsgOpen(!msgOpen); setNotifOpen(false); }} className="relative p-2 rounded-full hover:bg-gray-200 transition">
                <HiChatAlt2 size={24} className="text-gray-700" />
                {messages.some(m => !m.seen) && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs px-1.5 py-0.5 rounded-full">{messages.filter(m => !m.seen).length}</span>
                )}
              </button>

              {msgOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg p-3 z-50 flex">
                  {/* Facilitators List */}
                  <div className="w-1/3 border-r border-gray-200 pr-2 overflow-y-auto max-h-80">
                    <h4 className="font-semibold mb-2">Facilitators</h4>
                    <ul>
                      {facilitators.length > 0 ? (
                        facilitators.map(f => (
                          <li
                            key={f.id}
                            onClick={() => setSelectedFacilitator(f)}
                            className={`cursor-pointer p-1 rounded ${selectedFacilitator?.id === f.id ? "bg-blue-100" : ""}`}
                          >
                            {f.fullname}
                          </li>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No facilitators available</p>
                      )}
                    </ul>
                  </div>

                  {/* Chat */}
                  <div className="w-2/3 pl-2 flex flex-col">
                    {selectedFacilitator ? (
                      <>
                        <div className="flex-1 overflow-y-auto max-h-72">
                          {messages.map(msg => (
                            <p key={msg.id} className={msg.fromId === user.uid ? "text-right text-blue-600" : "text-left text-gray-800"}>
                              <strong>{msg.from}: </strong>{msg.text}
                            </p>
                          ))}
                        </div>
                        <div className="flex mt-2">
                          <input
                            type="text"
                            className="flex-1 border rounded p-1"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                          />
                          <button className="ml-1 px-2 bg-blue-500 text-white rounded" onClick={sendMessage}>Send</button>
                        </div>
                      </>
                    ) : (
                      <p>Select a facilitator to start chatting</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="relative cursor-pointer" onClick={() => navigate("/learner-settings")}>
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-xl border-2 border-white shadow">
                  {formData.fullname?.charAt(0).toUpperCase() || "L"}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Courses Grid */}
        <section className="grid md:grid-cols-2 gap-6">
          {enrolledCourses.length === 0 && <p>You have not enrolled in any courses yet.</p>}
          {enrolledCourses.map((course) => {
            const avgScore = results[course.id] ?? 0;
            const courseHistory = history[course.id] ?? [];
            const isExpanded = expanded[course.id];
            const contentProgress = course.progress || 0;
            const totalWidth = Math.min(contentProgress + avgScore, 100);
            const contentWidth = Math.min(contentProgress, totalWidth);
            const quizWidth = Math.min(avgScore, totalWidth - contentWidth);

            return (
              <div key={course.id} className="bg-white p-5 rounded-lg shadow hover:shadow-md transition">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-gray-800 font-medium">{course.title}</h3>
                  <button onClick={() => setExpanded(prev => ({ ...prev, [course.id]: !prev[course.id] }))} className="text-blue-500 text-sm">{isExpanded ? "Hide History" : "Show History"}</button>
                </div>

                <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden relative mb-2">
                  <div className="absolute left-0 top-0 h-4 bg-blue-400 transition-all duration-700 ease-out" style={{ width: `${contentWidth}%` }} />
                  <div className="absolute left-0 top-0 h-4 bg-pink-400 transition-all duration-700 ease-out opacity-70" style={{ width: `${quizWidth}%` }} />
                </div>
                <p className="text-sm text-gray-500 mb-3">Content: {contentProgress}%, Quiz Avg: {avgScore}%</p>
                <button onClick={() => navigate(`/quiz/${course.id}`)} className="w-full bg-gradient-to-r from-blue-400 to-pink-400 text-white py-2 rounded-lg hover:opacity-90 transition mb-2">Take Quiz</button>

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
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
